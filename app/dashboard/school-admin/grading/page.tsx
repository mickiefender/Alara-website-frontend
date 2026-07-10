"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { GradingPolicyManagement } from "@/components/grading-policy-management"
import { gradesAPI, usersAPI, academicsAPI } from "@/lib/api"
import { Search, ArrowRight, Users, TrendingUp, Award } from "lucide-react"

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
  recorded_date: string
}

interface StudentSummary {
  studentId: number
  studentName: string
  subjectCount: number
  avgPercentage: number
  overallGrade: string
}

export default function GradingPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSession, setFilterSession] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    student: "",
    subject: "",
    assessment_type: "exam",
    score: "",
    max_score: "100",
    academic_session: "",
  })

  const assessmentTypes = [
    { value: "exam", label: "Exam" },
    { value: "test", label: "Test" },
    { value: "quiz", label: "Quiz" },
    { value: "assignment", label: "Assignment" },
    { value: "continuous", label: "Continuous Assessment" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [gradesRes, studentsRes, subjectsRes, sessionsRes] = await Promise.all([
        gradesAPI.list({ ordering: '-percentage' }),
        usersAPI.students(),
        academicsAPI.subjects(),
        academicsAPI.academicSessions(),
      ])

      setGrades(gradesRes.data.results || gradesRes.data || [])
      setStudents(studentsRes.data.results || studentsRes.data || [])
      setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      
      const sessionsData = sessionsRes.data.results || sessionsRes.data || []
      setSessions(sessionsData)
      
      const currentSession = sessionsData.find((s: any) => s.is_current)
      if (currentSession) {
        setFilterSession(currentSession.id.toString())
        setFormData(prev => ({ ...prev, academic_session: currentSession.id.toString() }))
      }
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  const studentsSummary = useMemo((): StudentSummary[] => {
    const filteredGrades = grades.filter((g) => {
      if (filterSession && g.academic_session?.toString() !== filterSession) return false
      return true
    })

    const studentMap = new Map<number, { grades: Grade[], name: string }>()

    filteredGrades.forEach((g) => {
      if (!studentMap.has(g.student)) {
        studentMap.set(g.student, { grades: [], name: g.student_name || '' })
      }
      studentMap.get(g.student)!.grades.push(g)
    })

    return Array.from(studentMap.values())
      .map(({ grades, name }) => {
        const avgPercentage = grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length || 0
        const overallGrade = avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'F'
        const subjectCount = new Set(grades.map((g) => g.subject)).size
        return {
          studentId: grades[0].student,
          studentName: name || `Student ${grades[0].student}`,
          subjectCount,
          avgPercentage,
          overallGrade
        }
      })
      .sort((a, b) => b.avgPercentage - a.avgPercentage)
      .filter((s) => s.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [grades, filterSession, searchTerm])

  const getStudentName = (studentId: number) => {
    const student = students.find((s) => (s.user?.id || s.id) === studentId || s.id === studentId)
    if (!student) return `Student ${studentId}`

    const firstName = student.user?.first_name || student.first_name || student.user_data?.first_name || ""
    const lastName = student.user?.last_name || student.last_name || student.user_data?.last_name || ""
    const fullName = `${firstName} ${lastName}`.trim()

    return fullName || student.student_name || student.name || `Student ${studentId}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const gradeData = {
        student: parseInt(formData.student),
        subject: parseInt(formData.subject),
        assessment_type: formData.assessment_type,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        academic_session: formData.academic_session ? parseInt(formData.academic_session) : null,
      }

      await gradesAPI.create(gradeData)

      setIsOpen(false)
      setFormData({
        student: "",
        subject: "",
        assessment_type: "exam",
        score: "",
        max_score: "100",
        academic_session: filterSession,
      })
      await fetchData()
    } catch (err: any) {
      console.error("Failed to save grade:", err)
      alert(err?.response?.data?.error || "Failed to save grade")
    }
  }

  const stats = [
    { label: 'Students Graded', value: studentsSummary.length, icon: Users, color: 'blue' },
    { label: 'Total Assessments', value: grades.filter(g => filterSession === '' || g.academic_session?.toString() === filterSession).length, icon: TrendingUp, color: 'green' },
    { label: 'A Grade Students', value: studentsSummary.filter(s => s.overallGrade === 'A').length, icon: Award, color: 'yellow' },
  ]

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Student Grades Overview</h1>
          <p className="text-gray-600 mt-1">View overall student performance and drill down into details</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-primary">+ Add New Grade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Grade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <Select value={formData.student} onValueChange={(v) => setFormData({ ...formData, student: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => {
                        const studentValue = (s.user?.id || s.id).toString()
                        const studentLabel = getStudentName(s.user?.id || s.id)
                        return (
                          <SelectItem key={s.id} value={studentValue}>
                            {studentLabel}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assessment Type</Label>
                  <Select value={formData.assessment_type} onValueChange={(v) => setFormData({ ...formData, assessment_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Academic Session</Label>
                  <Select value={formData.academic_session} onValueChange={(v) => setFormData({ ...formData, academic_session: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Score</Label>
                  <Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: e.target.value })} required />
                </div>
                <div>
                  <Label>Max Score</Label>
                  <Input type="number" value={formData.max_score} onChange={(e) => setFormData({ ...formData, max_score: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Grade</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label>Academic Session</Label>
          <Select value={filterSession} onValueChange={setFilterSession}>
            <SelectTrigger>
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
<SelectItem value="all">All Sessions</SelectItem>
              {sessions.map((session: any) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.name} {session.is_current ? '(Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Student Overview</TabsTrigger>
          <TabsTrigger value="policy">Grading Policy</TabsTrigger>
          <TabsTrigger value="templates">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Overall Grade</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentsSummary.map((summary) => (
                  <tr key={summary.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{summary.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {summary.subjectCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-emerald-600">{summary.avgPercentage.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`font-bold text-lg px-4 py-2 ${
                        summary.overallGrade === 'A' ? 'bg-green-100 text-green-800 border-green-200' :
                        summary.overallGrade === 'B' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        summary.overallGrade === 'C' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        summary.overallGrade === 'D' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {summary.overallGrade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/school-admin/grading/${summary.studentId}`}
                        className="flex items-center gap-1 text-secondary hover:text-primary font-semibold"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {studentsSummary.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No students with grades found. Add grades to see summaries here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="policy">
          <GradingPolicyManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
