"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, GraduationCap, BookOpen, ClipboardList, Award } from "lucide-react"
import { academicsAPI, usersAPI, fetchAllGrades } from "@/lib/api"

interface Grade {
  id: number
  student: number
  subject: number
  subject_name?: string
  student_name?: string
  assessment_type: string
  score: number
  max_score: number
  percentage?: number
  grade: string
  recorded_date: string
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

const overallLetter = (avg: number) =>
  avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F"

const assessmentTypeLabel = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")

export default function StudentGradesDetail() {
  const params = useParams()
  const router = useRouter()
  const studentId = parseInt(params.studentId as string)

  const [grades, setGrades] = React.useState<Grade[]>([])
  const [studentName, setStudentName] = React.useState("")
  const [subjects, setSubjects] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch EVERY grade for this student (walks all paginated pages), plus
        // subjects for name lookups and the students list as a name fallback.
        const [studentGrades, studentsRes, subjectsRes] = await Promise.all([
          fetchAllGrades<Grade>({ student: studentId }),
          usersAPI.students(),
          academicsAPI.subjects(),
        ])

        setGrades(studentGrades)

        // The backend embeds the student's real full name on every grade
        // (GradeSerializer.student_name = student.get_full_name()). Prefer it
        // over the students-list lookup, which compares against the wrong ID
        // (StudentProfile.id vs the User id used in the URL).
        const embeddedName = studentGrades.find((g) => g.student_name)?.student_name
        if (embeddedName) {
          setStudentName(embeddedName)
        } else {
          const studentsList = studentsRes.data?.results || studentsRes.data || []
          const student = studentsList.find((s: any) => {
            const studentIdField = s.id || s.user?.id || s.user_data?.id
            return studentIdField === studentId
          })

          setStudentName(student
            ? `${student.first_name || student.user_data?.first_name || student.user?.first_name || ""} ${student.last_name || student.user_data?.last_name || student.user?.last_name || ""}`.trim() || `Student ${studentId}`
            : `Student ${studentId}`)
        }

        setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      } catch (error) {
        console.error("Failed to fetch student grades:", error)
        // Don't crash on error - show generic student name
        setStudentName(`Student ${studentId}`)
        setGrades([])
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: any) => s.id === subjectId)
    return subject?.name || `Subject ${subjectId}`
  }

  const avgPercentage = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.percentage || (g.score / g.max_score * 100)), 0) / grades.length
    : 0

  const subjectCount = new Set(grades.map((g) => g.subject)).size
  const overall = overallLetter(avgPercentage)
  const best = grades.length > 0
    ? Math.max(...grades.map((g) => g.percentage || (g.score / g.max_score * 100)))
    : 0

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-secondary hover:bg-secondary/10 -ml-3">
        <ArrowLeft className="w-4 h-4" />
        Back to Grades
      </Button>

      {/* ── Student Header Card ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-secondary/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground text-xl font-bold shadow-md">
              {getInitials(studentName)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Student Academic Record</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">{studentName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={`gap-1.5 font-bold px-3 py-1.5 border ${gradeTone(overall)}`}>
                  <Award size={14} />
                  Overall: {avgPercentage.toFixed(1)}%
                </Badge>
                <Badge variant="secondary" className="gap-1.5 font-semibold px-3 py-1.5">
                  <ClipboardList size={14} />
                  {grades.length} Assessment{grades.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
          </div>
          {overall && (
            <div className="flex items-center justify-center gap-3">
              <div className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 ${gradeTone(overall)}`}>
                <span className="text-3xl font-black leading-none">{overall}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">Grade</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Award size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none text-gray-900">{avgPercentage.toFixed(1)}%</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Average Score</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none text-gray-900">{subjectCount}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Subjects</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none text-gray-900">{best.toFixed(1)}%</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Best Score</p>
          </div>
        </div>
      </div>

      {/* ── Grades Table ───────────────────────────────────── */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <GraduationCap size={18} className="text-primary" />
            Detailed Grades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No grades recorded for this student yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Subject</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Score</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Percentage</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Grade</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {grades.map((grade) => {
                    const pct = grade.percentage || (grade.score / grade.max_score * 100)
                    return (
                      <tr key={grade.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">{grade.subject_name || getSubjectName(grade.subject)}</td>
                        <td className="py-4 px-4 capitalize text-muted-foreground">{assessmentTypeLabel(grade.assessment_type)}</td>
                        <td className="py-4 px-4 font-mono text-gray-700">{grade.score}/{grade.max_score}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{pct.toFixed(1)}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`font-bold border ${gradeTone(grade.grade)}`}>
                            {grade.grade}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                          {new Date(grade.recorded_date).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
