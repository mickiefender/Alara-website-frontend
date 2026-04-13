"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { gradesAPI, usersAPI, academicsAPI } from "@/lib/api"
import { useAuthContext as useAuth } from "@/lib/auth-context"
import { 
  Lock, 
  Unlock, 
  Save, 
  Plus, 
  Search,
  FileText,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Calculator
} from "lucide-react"

interface Grade {
  id: number
  student: number
  subject: number
  student_name?: string
  subject_name?: string
  assessment_type: string
  score: number
  max_score: number
  percentage: number
  grade: string
  academic_session?: number
  is_locked: boolean
  locked_by?: string
  locked_at?: string
  recorded_date: string
}

interface ClassAssignment {
  id: number
  class_obj: number
  class_name?: string
  class_data?: { id: number; name: string }
  subject?: number | null
  subject_name?: string
  teacher: number
}

interface GradingPolicy {
  id: number
  academic_session: number
  name: string
  assessment_type: string
  assessment_type_display?: string
  weightage: number
  is_active: boolean
}

export function TeacherGrading() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [classes, setClasses] = useState<ClassAssignment[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [gradingPolicies, setGradingPolicies] = useState<GradingPolicy[]>([])
  const [filterStudent, setFilterStudent] = useState("")
  const [filterSession, setFilterSession] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkData, setBulkData] = useState<{studentId: string, score: string}[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkAssessmentType, setBulkAssessmentType] = useState('exam')
const [bulkMaxScore, setBulkMaxScore] = useState('100')
  const [bulkSubjectId, setBulkSubjectId] = useState('')
  const [bulkStudentsWithPhotos, setBulkStudentsWithPhotos] = useState<any[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("")
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [newGrade, setNewGrade] = useState({
    student: "",
    subject: "",
    assessment_type: "exam",
    score: "",
    max_score: "100",
  })

  const DEFAULT_MAX_SCORES: Record<string, number> = {
    exam: 100,
    test: 20,
    quiz: 10,
    assignment: 20,
    continuous: 10,
  }

  const handleAssessmentTypeChange = (value: string) => {
    const defaultMax = DEFAULT_MAX_SCORES[value] || 100
    setNewGrade(prev => ({
      ...prev,
      assessment_type: value,
      max_score: defaultMax.toString(),
    }))
  }

  useEffect(() => {
    const defaultMax = DEFAULT_MAX_SCORES[bulkAssessmentType] || 100
    setBulkMaxScore(defaultMax.toString())
  }, [bulkAssessmentType])

  const getClassId = (assignment: ClassAssignment) => {
    return assignment.class_obj || assignment.class_data?.id
  }

  const getSubjectId = (assignment: ClassAssignment) => {
    return assignment.subject
  }

  useEffect(() => {
    fetchTeacherData()
    fetchSessions()
  }, [user])

  useEffect(() => {
    if (selectedAssignmentId) {
      const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
      if (assignment) {
        const classId = getClassId(assignment)
        if (classId) fetchClassData(classId)
      }
    }
  }, [selectedAssignmentId, classes])

  useEffect(() => {
    if (selectedAssignmentId && filterSession && students.length > 0) {
      const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
      if (assignment) {
        const classId = getClassId(assignment)
        const subjectId = getSubjectId(assignment)
        const params = {
          class_id: classId,
          ...(subjectId && { subject_id: subjectId }),
          academic_session: parseInt(filterSession),
          teacher_id: user?.id
        }
        fetchGrades(params)
      }
    }
  }, [selectedAssignmentId, filterSession, students.length, classes, user?.id])

  useEffect(() => {
    if (filterSession) {
      fetchGrades({ academic_session: filterSession })
      fetchGradingPolicies(filterSession)
    }
  }, [filterSession])

  useEffect(() => {
    if (showForm && selectedAssignmentId) {
      const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
      if (assignment) {
        const subjectId = getSubjectId(assignment)
        setNewGrade((prev) => ({
          ...prev,
          student: "",
          subject: subjectId !== undefined && subjectId !== null ? subjectId.toString() : "",
        }))
      }
    }
  }, [showForm, selectedAssignmentId, classes])

  const fetchSessions = async () => {
    try {
      const res = await academicsAPI.academicSessions()
      const sessionsData = res.data.results || res.data || []
      setSessions(sessionsData)
      const currentSession = sessionsData.find((s: any) => s.is_current)
      if (currentSession) {
        setFilterSession(currentSession.id.toString())
      }
    } catch (error) {
      console.error("[TeacherGrading] Failed to fetch sessions:", error)
    }
  }

  const fetchTeacherData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [teacherClassesRes, classTeachersRes] = await Promise.all([
        academicsAPI.classSubjectTeachers(),
        academicsAPI.classTeachers(),
      ])
      
      let classesData = teacherClassesRes.data.results || teacherClassesRes.data || []

      if (Array.isArray(classesData)) {
        classesData = classesData.filter((c: any) => {
          const tId = c.teacher ?? c.teacher_id ?? c.teacher_obj
          return tId ? Number(tId) === Number(user.id) : true
        })
      }

      if (!classesData || classesData.length === 0) {
        const classTeacherData = classTeachersRes.data.results || classTeachersRes.data || []
        const teacherOnlyClassTeacherData = (Array.isArray(classTeacherData) ? classTeacherData : []).filter((ct: any) => {
          const tId = ct.teacher ?? ct.teacher_id ?? ct.teacher_obj
          return tId ? Number(tId) === Number(user.id) : true
        })

        classesData = teacherOnlyClassTeacherData.map((ct: any) => ({
          id: ct.id,
          class_obj: ct.class_obj,
          class_name: ct.class_name,
          class_data: { id: ct.class_obj, name: ct.class_name },
          subject: null,
          subject_name: "Form Tutor (All Subjects)",
          teacher: ct.teacher,
        }))
      }
      
      setClasses(Array.isArray(classesData) ? classesData : [])
    } catch (error) {
      console.error("[TeacherGrading] Failed to fetch teacher data:", error)
    } finally {
      setLoading(false)
    }
  }

      const fetchGradeEntryData = async (classId: number | string) => {
        if (!user) return
        try {
          const classIdNum = typeof classId === 'string' ? parseInt(classId) : classId
          const res = await gradesAPI.gradeEntryData(classIdNum)
          const data = res.data
          
          if (!data.students || !data.subjects) {
            console.warn("[TeacherGrading] Invalid grade_entry_data response:", data)
            return
          }

          setStudents(data.students.map((s: any) => ({
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            user_id: s.id,
            user: { first_name: s.first_name, last_name: s.last_name }
          })))
          
          setSubjects(data.subjects.map((s: any) => ({
            id: s.id,
            subject: s.id,
            name: s.name,
            code: s.code,
            subject_name: s.name
          })))

          // Handle form tutor mode
          if (data.is_form_tutor) {
            console.log(`[TeacherGrading] Form Tutor mode: ${data.subjects.length} class subjects for class ${classIdNum}`)
          } else {
            console.log(`[TeacherGrading] Subject Teacher: ${data.subjects.length} subjects for class ${classIdNum}`)
          }
          
        } catch (error: any) {
          console.error("[TeacherGrading] Failed to fetch grade_entry_data:", error)
          let errorMsg = "Failed to load class data"
          if (error.response?.status === 403) {
            errorMsg = error.response?.data?.error || "You are not assigned to any subject in this class. Contact admin to set ClassSubject/ClassTeacher records."
          } else if (error.response?.status === 404) {
            errorMsg = "Class not found"
          }
          alert(errorMsg)
        }
      }

  const fetchClassData = fetchGradeEntryData // Alias for compatibility

  const fetchGrades = async (params = {}) => {
    try {
      const gradesRes = await gradesAPI.list(params)
      const allGrades = gradesRes.data.results || gradesRes.data || []
      setGrades(allGrades)
    } catch (error) {
      console.error("[TeacherGrading] Failed to fetch grades:", error)
    }
  }

  const fetchGradingPolicies = async (sessionId: string) => {
    try {
      const res = await academicsAPI.gradingPoliciesBySession(parseInt(sessionId))
      const policiesData = res.data?.results || res.data || []
      const safePolicies = Array.isArray(policiesData) ? policiesData : []
      setGradingPolicies(safePolicies.filter((p: any) => p?.is_active))
    } catch (error) {
      console.error("[TeacherGrading] Failed to fetch grading policies:", error)
      setGradingPolicies([])
    }
  }

  const addGrade = async () => {
    if (!newGrade.student || (!newGrade.subject && newGrade.subject !== "0") || !newGrade.score) {
      alert("Please fill all required fields")
      return
    }

    try {
      // Pre-validate access
      const validateRes = await gradesAPI.validateGradeAccess({
        student_id: Number.parseInt(newGrade.student),
        subject_id: Number.parseInt(newGrade.subject)
      })
      
      const validation = validateRes.data
      if (!validation.valid) {
        alert(`Cannot grade: ${validation.reason}\nStudent classes: ${validation.student_classes.join(', ')}\nYour assignments: ${validation.teacher_assignments.slice(0,5).map(a => a.join(' - ')).join(', ')}`)
        return
      }

      console.log('[TeacherGrading] Validation passed:', validation.reason)
      
      setSaving(true)
      const data = {
        student: Number.parseInt(newGrade.student),  // Serializer normalizes subject_id
        subject_id: Number.parseInt(newGrade.subject),  // Key for validation
        assessment_type: newGrade.assessment_type,
        score: Number.parseFloat(newGrade.score),
        max_score: Number.parseFloat(newGrade.max_score),
        academic_session: filterSession ? parseInt(filterSession) : null,
      }

      await gradesAPI.create(data)
      setNewGrade({ student: "", subject: "", assessment_type: "exam", score: "", max_score: "100" })
      setShowForm(false)
      const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
      if (assignment) {
        const classId = getClassId(assignment)
        const subjectId = getSubjectId(assignment)
        await fetchGrades({ 
          class_id: classId, 
          ...(subjectId && { subject_id: subjectId }), 
          academic_session: filterSession 
        })
      } else {
        await fetchGrades()
      }
    } catch (error: any) {
      console.error("[TeacherGrading] Failed to create grade:", error)
      const detail = error?.response?.data?.subject_id || error?.response?.data?.error || error?.response?.data?.detail || error?.message || "Failed to create grade"
      alert(`Error: ${detail}`)
    } finally {
      setSaving(false)
    }
  }

  const handleLockGrades = async () => {
    if (!selectedAssignmentId || !filterSession) {
      alert("Please select a class & subject first")
      return
    }

    const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
    if (!assignment) return

    const classId = getClassId(assignment)
    const subjectId = getSubjectId(assignment)

    try {
      setSaving(true)
      await gradesAPI.lock_by_class({
        class_id: classId,
        subject_id: subjectId,
        academic_session_id: filterSession,
      })
      alert("Grades locked successfully!")
      await fetchGrades({
        class_id: classId,
        ...(subjectId && { subject_id: subjectId }),
        academic_session: parseInt(filterSession)
      })
    } catch (error: any) {
      console.error("[TeacherGrading] Failed to lock grades:", error)
      alert(`Error: ${error?.response?.data?.error || "Failed to lock grades"}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUnlockGrades = async () => {
    if (!selectedAssignmentId || !filterSession) {
      alert("Please select a class & subject first")
      return
    }

    const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
    if (!assignment) return

    const classId = getClassId(assignment)
    const subjectId = getSubjectId(assignment)

    try {
      setSaving(true)
      await gradesAPI.unlock_by_class({
        class_id: classId,
        subject_id: subjectId,
        academic_session_id: filterSession,
      })
      alert("Grades unlocked successfully!")
      await fetchGrades({
        class_id: classId,
        ...(subjectId && { subject_id: subjectId }),
        academic_session: parseInt(filterSession)
      })
    } catch (error: any) {
      console.error("[TeacherGrading] Failed to unlock grades:", error)
      alert(`Error: ${error?.response?.data?.error || "Failed to unlock grades"}`)
    } finally {
      setSaving(false)
    }
  }

  const getStudentName = (id: number, grade?: Grade) => {
    if (grade?.student_name) {
      return grade.student_name
    }
    
    const studentIdForGrade = (s: any) => s.user_id ?? s.user?.id ?? s.id
    const student = students.find((s) => studentIdForGrade(s) === id)
    return student?.user?.first_name ? `${student.user.first_name} ${student.user.last_name}` : `Student ${id}`
  }

  const getSubjectName = (id: number, grade?: Grade) => {
    if (grade?.subject_name) {
      return grade.subject_name
    }
    
    const subject = subjects.find((s) => Number(s.subject) === Number(id))
    if (subject) return subject.subject_name || subject.name
    const assignment = classes.find((c) => getSubjectId(c) === id)
    return assignment?.subject_name || `Subject ${id}`
  }

  const getAssignmentName = (id: string) => {
    const c = classes.find((item) => item.id.toString() === id)
    if (!c) return ""
    return `${c.class_name || c.class_data?.name || "Class"} - ${c.subject_name || "All Subjects"}`
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "B": return "bg-blue-100 text-blue-700 border-blue-200"
      case "C": return "bg-amber-100 text-amber-700 border-amber-200"
      case "D": return "bg-orange-100 text-orange-700 border-orange-200"
      case "F": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case "exam": return <FileText className="w-3 h-3" />
      case "test": return <FileText className="w-3 h-3" />
      case "quiz": return <Calculator className="w-3 h-3" />
      case "assignment": return <BookOpen className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const filteredGrades = grades.filter((grade) => {
    if (selectedAssignmentId) {
      const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
      if (!assignment) return false
      
      const subjectId = getSubjectId(assignment)
      if (subjectId && grade.subject !== subjectId) return false

      if (students.length === 0) return false
      const studentIdForGrade = (s: any) => s.user_id ?? s.user?.id ?? s.id
      const studentIds = students.map(s => studentIdForGrade(s))
      if (!studentIds.includes(grade.student)) return false
    }
    if (filterStudent && grade.student !== Number.parseInt(filterStudent)) return false
    if (searchQuery) {
      const studentName = getStudentName(grade.student, grade).toLowerCase()
      if (!studentName.includes(searchQuery.toLowerCase())) return false
    }
    return true
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAssignmentId, filterSession, filterStudent, searchQuery])

  const gradeDistribution = {
    a: filteredGrades.filter(g => g.grade === "A").length,
    b: filteredGrades.filter(g => g.grade === "B").length,
    c: filteredGrades.filter(g => g.grade === "C").length,
    d: filteredGrades.filter(g => g.grade === "D").length,
    e: filteredGrades.filter(g => g.grade === "E").length,
    f: filteredGrades.filter(g => g.grade === "F").length,
  }

  const policyWeightMap = gradingPolicies.reduce<Record<string, number>>((acc, policy) => {
    acc[policy.assessment_type] = policy.weightage
    return acc
  }, {})

  const studentWeightedResults = (() => {
    const byStudent = new Map<number, Grade[]>()
    filteredGrades.forEach((g) => {
      const list = byStudent.get(g.student) || []
      list.push(g)
      byStudent.set(g.student, list)
    })

    const results = new Map<number, { total: number; byType: Record<string, { raw: number; weight: number; contribution: number }> }>()
    byStudent.forEach((studentGrades, studentId) => {
      const typeAgg = new Map<string, { score: number; max: number }>()
      studentGrades.forEach((g) => {
        const curr = typeAgg.get(g.assessment_type) || { score: 0, max: 0 }
        curr.score += Number(g.score) || 0
        curr.max += Number(g.max_score) || 0
        typeAgg.set(g.assessment_type, curr)
      })

      let weightedTotal = 0
      const breakdown: Record<string, { raw: number; weight: number; contribution: number }> = {}

      typeAgg.forEach((agg, type) => {
        const raw = agg.max > 0 ? (agg.score / agg.max) * 100 : 0
        const weight = policyWeightMap[type] ?? 0
        const contribution = (raw / 100) * weight
        weightedTotal += contribution
        breakdown[type] = { raw, weight, contribution }
      })

      results.set(studentId, {
        total: Math.max(0, Math.min(100, weightedTotal)),
        byType: breakdown,
      })
    })

    return results
  })()

  const weightedAverage =
    studentWeightedResults.size > 0
      ? Array.from(studentWeightedResults.values()).reduce((sum, r) => sum + r.total, 0) / studentWeightedResults.size
      : 0

  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedGrades = filteredGrades.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )

  const stats = {
    total: filteredGrades.length,
    average: weightedAverage,
    locked: filteredGrades.filter(g => g.is_locked).length,
    students: students.length,
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading grading system...</p>
          </div>

          {filteredGrades.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
              <div className="text-sm text-slate-600">
                Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, filteredGrades.length)} of {filteredGrades.length}
              </div>
              <div className="flex items-center gap-2">
                <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1}>Previous</Button>
                <span className="text-sm px-2">Page {safeCurrentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-secondary text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total Grades</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Class Average</p>
                <p className="text-3xl font-bold">{stats.average.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Locked Grades</p>
                <p className="text-3xl font-bold">{stats.locked}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Students</p>
                <p className="text-3xl font-bold">{stats.students}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-csecondary" />
                Grade Management
              </CardTitle>
              <CardDescription>Record and manage student grades</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLockGrades}
                disabled={saving || !selectedAssignmentId}
              >
                <Lock className="w-4 h-4 mr-1" />
                Lock All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUnlockGrades}
                disabled={saving || !selectedAssignmentId}
              >
                <Unlock className="w-4 h-4 mr-1" />
                Unlock
              </Button>
              <Button 
                size="sm"
                onClick={async () => {
                  if (!selectedAssignmentId) {
                    alert("Please select a Class & Subject first")
                    return
                  }
                  // Fetch students with profile photos
                  try {
                    const res = await usersAPI.students({ class_id: getClassId(classes.find(c => c.id.toString() === selectedAssignmentId)!), teacher_id: user?.id })
                    setBulkStudentsWithPhotos(res.data.results || res.data || [])
                  } catch (error) {
                    console.error('[BulkGrade] Failed to fetch students with photos:', error)
                  }
                  
// Initialize bulk data with current students
  const studentData = students.map((s: any) => {
    const sid = s.user_id ?? s.user?.id ?? s.id
    return { studentId: sid.toString(), score: '' }
  })
  setBulkData(studentData)
  const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)!
  setBulkSubjectId(assignment.subject ? assignment.subject.toString() : '')
  setShowBulkForm(true)
}}
                className="bg-secondary hover:bg-primary"
              >
                <Users className="w-4 h-4 mr-1" />
                Bulk Grade Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Academic Session</Label>
              <Select value={filterSession} onValueChange={setFilterSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} {s.is_current ? '(Current)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Class & Subject</Label>
              <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class & Subject" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="none" disabled>No classes assigned</SelectItem>
                  ) : (
                    classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span>{c.class_name || c.class_data?.name || "Class"} - {c.subject_name || "All Subjects"}</span>
{c.subject_name === "Form Tutor (All Subjects)" && (
                            <span className="text-xs text-muted-foreground mt-0.5">Form Tutor - All Subjects</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Filter Student</Label>
              <Select value={filterStudent} onValueChange={setFilterStudent} disabled={!selectedAssignmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((s) => {
                    const sid = s.user_id ?? s.user?.id ?? s.id
                    const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.first_name || `Student ${sid}`
                    const profilePic = s.profile_picture?.storage_url || (s.user?.profile_picture?.storage_url)
                    return (
                      <SelectItem key={s.id} value={sid.toString()}>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {profilePic ? (
                              <img 
                                src={profilePic} 
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-500">P</span>
                            )}
                          </div>
                          <span className="truncate max-w-[150px]">{name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search student..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {selectedAssignmentId && filteredGrades.some(g => g.is_locked) && (
            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">Some grades are locked</p>
                <p className="text-amber-700 text-sm">Locked grades cannot be edited. Unlock them first to make changes.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              { label: 'A', count: gradeDistribution.a, color: 'bg-emerald-500' },
              { label: 'B', count: gradeDistribution.b, color: 'bg-blue-500' },
              { label: 'C', count: gradeDistribution.c, color: 'bg-amber-500' },
              { label: 'D', count: gradeDistribution.d, color: 'bg-orange-500' },
              { label: 'F', count: gradeDistribution.f, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-slate-50 rounded-lg">
                <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center mx-auto mb-1`}>
                  <span className="text-white font-bold text-sm">{item.label}</span>
                </div>
                <p className="text-lg font-bold">{item.count}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Percentage</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Weighted Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-slate-300" />
                          <p>No grades found</p>
                          <p className="text-sm">Select a class and subject to view grades</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedGrades.map((grade) => (
                      <tr key={grade.id} className="border-b hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium">{getStudentName(grade.student, grade)}</td>
                        <td className="py-3 px-4 text-slate-600">{getSubjectName(grade.subject, grade)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {getAssessmentTypeIcon(grade.assessment_type)}
                            <span className="capitalize">{grade.assessment_type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{grade.score}</span>
                          <span className="text-slate-400">/{grade.max_score}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  grade.percentage >= 80 ? 'bg-emerald-500' :
                                  grade.percentage >= 60 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(grade.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{grade.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {grade.is_locked ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Editable
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">{grade.recorded_date}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {(() => {
                            const studentResult = studentWeightedResults.get(grade.student)
                            if (!studentResult) return "-"
                            const entries = Object.entries(studentResult.byType)
                            if (entries.length === 0) return "-"
                            return (
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-700">
                                  Total: {studentResult.total.toFixed(1)}%
                                </div>
                                {entries.map(([type, v]) => (
                                  <div key={type} className="whitespace-nowrap">
                                    <span className="capitalize">{type}</span>: {v.raw.toFixed(1)}% × {v.weight}% = {v.contribution.toFixed(1)}
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Grade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium">{getAssignmentName(selectedAssignmentId)}</p>
              {students.length === 0 && selectedAssignmentId && (
                <Badge variant="secondary" className="text-xs">
                  No Data - Check Assignments
                </Badge>
              )}
            </div>
            {students.length === 0 && selectedAssignmentId && (
              <p className="text-xs text-muted-foreground">No students or subjects available. Verify ClassSubject/ClassTeacher records.</p>
            )}
          </div>
            
            <div className="space-y-2">
              <Label>Student</Label>
              <Select 
                value={newGrade.student} 
                onValueChange={(v) => setNewGrade({ ...newGrade, student: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => {
                    const sid = s.user_id ?? s.user?.id ?? s.id
                    const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.first_name || `Student ${sid}`
                    const profilePic = s.profile_picture?.storage_url || (s.user?.profile_picture?.storage_url)
                    return (
                      <SelectItem key={s.id} value={sid.toString()}>
                        <div className="flex items-center gap-2 p-1">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {profilePic ? (
                              <img 
                                src={profilePic} 
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-500">P</span>
                            )}
                          </div>
                          <span className="truncate max-w-[150px]">{name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assessment Type</Label>
              <Select 
                value={newGrade.assessment_type} 
                onValueChange={handleAssessmentTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="continuous">Continuous Assessment</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score</Label>
                <Input
                  type="number"
                  placeholder="Score"
                  value={newGrade.score}
                  onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Score</Label>
                <Input
                  type="number"
                  placeholder="Max Score"
                  value={newGrade.max_score}
                  onChange={(e) => setNewGrade({ ...newGrade, max_score: e.target.value })}
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={addGrade} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 mr-1" />
              {saving ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Grade Entry Modal */}
      <Dialog open={showBulkForm} onOpenChange={setShowBulkForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Grade Entry - {getAssignmentName(selectedAssignmentId)}
            </DialogTitle>
          </DialogHeader>
          
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={bulkSubjectId} onValueChange={setBulkSubjectId} disabled={subjects.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.subject_name || s.name || s.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assessment Type</Label>
              <Select value={bulkAssessmentType} onValueChange={setBulkAssessmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="continuous">Continuous Assessment</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Score ({DEFAULT_MAX_SCORES[bulkAssessmentType] || 100})</Label>
              <Input
                type="number"
                value={bulkMaxScore}
                onChange={(e) => setBulkMaxScore(e.target.value)}
                placeholder={DEFAULT_MAX_SCORES[bulkAssessmentType]?.toString() || '100'}
                step="0.01"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bulkData.map((row, index) => {
                    const baseStudent = students.find((s: any) => {
                      const sid = s.user_id ?? s.user?.id ?? s.id
                      return sid.toString() === row.studentId
                    })
                    const photoStudent = bulkStudentsWithPhotos.find((s: any) => {
                      const sid = s.user_id ?? s.user?.id ?? s.id
                      return sid.toString() === row.studentId
                    })
                    
                    // Use photoStudent first for full data
                    const finalStudent = photoStudent || baseStudent
                    const studentName = finalStudent?.first_name && finalStudent?.last_name 
                      ? `${finalStudent.first_name} ${finalStudent.last_name}` 
                      : finalStudent?.first_name || finalStudent?.student_id || finalStudent?.user_id || `Student ${row.studentId}`
                    
                    const profilePic = finalStudent?.profile_picture_url || finalStudent?.profile_picture?.storage_url || finalStudent?.user?.profile_picture?.storage_url
                    
                    return (
                      <tr key={row.studentId} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                              {profilePic ? (
                                <img 
                                  src={profilePic} 
                                  alt={studentName}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement
                                    img.style.display = 'none'
                                    const fallback = img.nextSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }} 
                                />
                              ) : null}
                              <div className="text-slate-400 text-xs font-medium">PIC</div>
                            </div>
                            <div className="font-medium text-slate-900 min-w-0 truncate">
                              {studentName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="number"
                            value={row.score}
                            onChange={(e) => {
                              const newData = [...bulkData]
                              newData[index].score = e.target.value
                              setBulkData(newData)
                            }}
                            placeholder="0"
                            className="w-24"
                            step="0.01"
                            min="0"
                            max={parseFloat(bulkMaxScore) || 100}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowBulkForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const validGrades = bulkData.filter(row => row.score && parseFloat(row.score) > 0)
                if (validGrades.length === 0) {
                  alert('Please enter at least one score')
                  return
                }
                
                setBulkSaving(true)
                try {
                  const promises = validGrades.map(async (row) => {
                    const data = {
                      student: parseInt(row.studentId),
                      subject: bulkSubjectId ? parseInt(bulkSubjectId) : getSubjectId(classes.find((c) => c.id.toString() === selectedAssignmentId)!),
                      assessment_type: bulkAssessmentType,
                      score: parseFloat(row.score),
                      max_score: parseFloat(bulkMaxScore),
                      academic_session: filterSession ? parseInt(filterSession) : null,
                    }
                    return gradesAPI.create(data)
                  })
                  
                  await Promise.all(promises)
                  alert(`${validGrades.length} grades saved successfully!`)
                  setShowBulkForm(false)
                  setBulkData([])
                  const assignment = classes.find((c) => c.id.toString() === selectedAssignmentId)
                  if (assignment) {
                    const classId = getClassId(assignment)
                    const subjectId = getSubjectId(assignment)
                    await fetchGrades({ 
                      class_id: classId, 
                      ...(subjectId && { subject_id: subjectId }), 
                      academic_session: filterSession 
                    })
                  } else {
                    await fetchGrades()
                  }
                } catch (error: any) {
                  console.error('Bulk save error:', error)
                  alert(`Error: ${error?.response?.data?.error || 'Failed to save grades'}`)
                } finally {
                  setBulkSaving(false)
                }
              }} 
              disabled={bulkSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {bulkSaving ? 'Saving...' : `Save ${bulkData.filter(row => row.score).length} Grades`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

