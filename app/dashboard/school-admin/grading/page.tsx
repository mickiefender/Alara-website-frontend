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
import { gradesAPI, usersAPI, academicsAPI, getErrorMessage, fetchAllGrades } from "@/lib/api"
import { Search, ArrowRight, Users, TrendingUp, Award, Plus, GraduationCap } from "lucide-react"
import { DataStateTableRow } from "@/components/data-state"

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const gradeTone = (grade: string) => {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "B":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "C":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "F":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function GradingPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      // fetchAllGrades walks every paginated page — without it the summary
      // only covers grades that happened to land on the first page (20 rows),
      // so students with older grades never appear in the ranking.
      const [allGrades, studentsRes, subjectsRes, sessionsRes] = await Promise.all([
        fetchAllGrades<Grade>({ ordering: "-percentage" }),
        usersAPI.students(),
        academicsAPI.subjects(),
        academicsAPI.academicSessions(),
      ])

      setGrades(allGrades)
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
      setError(getErrorMessage(err, "Failed to load grading data. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  const studentsSummary = useMemo((): StudentSummary[] => {
    const filteredGrades = grades.filter((g) => {
      if (filterSession && filterSession !== "all" && g.academic_session?.toString() !== filterSession) return false
      return true
    })

    const studentMap = new Map<number, { grades: Grade[], name: string }>()

    filteredGrades.forEach((g) => {
      if (!studentMap.has(g.student)) {
        studentMap.set(g.student, { grades: [], name: g.student_name || "" })
      }
      studentMap.get(g.student)!.grades.push(g)
    })

    return Array.from(studentMap.values())
      .map(({ grades, name }) => {
        const avgPercentage = grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length || 0
        const overallGrade = avgPercentage >= 90 ? "A" : avgPercentage >= 80 ? "B" : avgPercentage >= 70 ? "C" : avgPercentage >= 60 ? "D" : "F"
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
        academic_session: filterSession === "all" ? "" : filterSession,
      })
      await fetchData()
    } catch (err: any) {
      console.error("Failed to save grade:", err)
      alert(err?.response?.data?.error || "Failed to save grade")
    }
  }

  const sessionAssessmentCount = grades.filter((g) => filterSession === "" || filterSession === "all" || g.academic_session?.toString() === filterSession).length

  const stats = [
    { label: "Students Graded", value: studentsSummary.length, icon: Users, iconClass: "bg-red-50 text-red-600", valueClass: "text-gray-900" },
    { label: "Total Assessments", value: sessionAssessmentCount, icon: TrendingUp, iconClass: "bg-emerald-50 text-emerald-600", valueClass: "text-gray-900" },
    { label: "A Grade Students", value: studentsSummary.filter(s => s.overallGrade === "A").length, icon: Award, iconClass: "bg-amber-50 text-amber-600", valueClass: "text-gray-900" },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-secondary/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Academic Records</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">Student Grades Overview</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View overall student performance and drill down into details
              </p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary-dark text-white shadow-sm">
                <Plus size={16} />
                Add New Grade
              </Button>
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                  Add Grade
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card glass-hover p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
              <stat.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className={`text-3xl font-bold leading-none ${stat.valueClass}`}>{stat.value}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Label>Academic Session</Label>
          <Select value={filterSession} onValueChange={setFilterSession}>
            <SelectTrigger>
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessions.map((session: any) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.name} {session.is_current ? "(Current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {studentsSummary.length > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
            <Users size={16} />
            {studentsSummary.length} student{studentsSummary.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Student Overview</TabsTrigger>
          <TabsTrigger value="policy">Grading Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Student Performance</h2>
                <p className="text-sm text-muted-foreground">
                  Ranked by average score for the selected session
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Score</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Overall Grade</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {studentsSummary.map((summary) => (
                    <tr key={summary.studentId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                            {getInitials(summary.studentName)}
                          </div>
                          <span className="font-medium text-gray-900">{summary.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {summary.subjectCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">{summary.avgPercentage.toFixed(1)}%</span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, summary.avgPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`font-bold px-3 py-1.5 border ${gradeTone(summary.overallGrade)}`}>
                          {summary.overallGrade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/school-admin/grading/${summary.studentId}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-secondary hover:bg-secondary/10 font-semibold transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {loading ? (
                    <DataStateTableRow colSpan={5} loading={loading} emptyMessage="No students with grades found" />
                  ) : studentsSummary.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        {error ? error : "No students with grades found. Add grades to see summaries here."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="policy">
          <GradingPolicyManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
