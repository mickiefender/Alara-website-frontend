"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/lib/protected-route"
import { academicsAPI, usersAPI, gradesAPI, fetchAllGrades, getErrorMessage } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DataStateLoading } from "@/components/data-state"
import {
  ClipboardEdit,
  Lock,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  GraduationCap,
  Info,
} from "lucide-react"

interface StudentRow {
  id: number
  name: string
  rollNumber: string
}

interface SubjectCol {
  id: number
  name: string
  code?: string
}

interface GradeRecord {
  id: number
  student: number
  subject: number
  assessment_type: string
  score: number
  max_score: number
  percentage: number
  grade: string
  is_locked?: boolean
}

/** Assessment types teachers use for continuous assessment (everything except the exam). */
const CA_TYPES = ["test", "quiz", "assignment", "continuous", "class_exercise", "project"]

export default function ExaminationPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <ExaminationContent />
    </ProtectedRoute>
  )
}

function ExaminationContent() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [subjects, setSubjects] = useState<SubjectCol[]>([])
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locking, setLocking] = useState(false)

  const [filterSession, setFilterSession] = useState("")
  const [filterClass, setFilterClass] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Local editable exam scores keyed by `${studentId}:${subjectId}`
  const [examScores, setExamScores] = useState<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsRes, classesRes, classSubjectsRes] = await Promise.all([
        academicsAPI.academicSessions(),
        academicsAPI.classes(),
        academicsAPI.classSubjects(),
      ])

      const sessionList = sessionsRes.data?.results || sessionsRes.data || []
      setSessions(sessionList)
      setClasses(classesRes.data?.results || classesRes.data || [])
      setSubjects(
        (classSubjectsRes.data?.results || classSubjectsRes.data || []).map((cs: any) => ({
          id: cs.subject,
          name: cs.subject_name || cs.subject?.name || `Subject ${cs.subject}`,
          code: cs.subject_code || cs.subject?.code,
          class_obj: cs.class_obj,
        })),
      )

      const current = sessionList.find((s: any) => s.is_current)
      if (current) setFilterSession(current.id.toString())
    } catch (err) {
      console.error("Failed to load examination data:", err)
      toast({
        title: "Load failed",
        description: getErrorMessage(err, "Could not load classes, subjects or sessions."),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Load students + grades whenever class/session changes
  useEffect(() => {
    if (!filterClass || !filterSession) {
      setStudents([])
      setGrades([])
      setExamScores({})
      return
    }
    let cancelled = false

    const loadClassData = async () => {
      try {
        setLoading(true)
        const [studentsRes, classGrades] = await Promise.all([
          usersAPI.students({ class_id: filterClass }),
          fetchAllGrades<GradeRecord>({ class_obj: filterClass, academic_session: filterSession }),
        ])
        if (cancelled) return

        const studentList = (studentsRes.data?.results || studentsRes.data || []).map((s: any) => ({
          id: s.user_id || s.user?.id || s.id,
          name:
            s.user_name ||
            [s.first_name || s.user?.first_name || s.user_data?.first_name, s.last_name || s.user?.last_name || s.user_data?.last_name]
              .filter(Boolean)
              .join(" ") ||
            s.username ||
            `Student ${s.id}`,
          rollNumber: s.roll_number || s.student_id || "",
        }))
        setStudents(studentList)
        setGrades(classGrades)
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load class data:", err)
          toast({
            title: "Load failed",
            description: getErrorMessage(err, "Could not load students or grades for this class."),
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClassData()
    return () => {
      cancelled = true
    }
  }, [filterClass, filterSession, toast])

  // Seed the editable exam-score inputs from existing exam-type grades
  useEffect(() => {
    const seeded: Record<string, string> = {}
    for (const g of grades) {
      if (g.assessment_type === "exam") {
        seeded[`${g.student}:${g.subject}`] = String(g.score ?? "")
      }
    }
    setExamScores(seeded)
  }, [grades])

  /** Teachers' continuous-assessment total (sum of weighted percentages) per student/subject. */
  const caTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const g of grades) {
      if (!CA_TYPES.includes(g.assessment_type)) continue
      const key = `${g.student}:${g.subject}`
      totals[key] = (totals[key] || 0) + (g.percentage || 0)
    }
    return totals
  }, [grades])

  const examGradeByCell = useMemo(() => {
    const map = new Map<string, GradeRecord>()
    for (const g of grades) {
      if (g.assessment_type === "exam") map.set(`${g.student}:${g.subject}`, g)
    }
    return map
  }, [grades])

  const classSubjects = useMemo(
    () => subjects.filter((s: any) => !s.class_obj || s.class_obj.toString() === filterClass),
    [subjects, filterClass],
  )

  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [students, searchTerm],
  )

  const setScore = (studentId: number, subjectId: number, value: string) => {
    const key = `${studentId}:${subjectId}`
    setExamScores((prev) => ({ ...prev, [key]: value }))
  }

  const buildSavePayload = () => {
    const entries: Array<{ studentId: number; subjectId: number; score: number; gradeId?: number }> = []
    for (const [key, raw] of Object.entries(examScores)) {
      if (raw === "" || raw === undefined) continue
      const score = parseFloat(raw)
      if (Number.isNaN(score) || score < 0 || score > 100) continue
      const [studentId, subjectId] = key.split(":").map(Number)
      const existing = examGradeByCell.get(key)
      // Skip unchanged locked/unchanged cells
      if (existing && existing.score === score) continue
      entries.push({ studentId, subjectId, score, gradeId: existing?.id })
    }
    return entries
  }

  const pendingCount = buildSavePayload().length

  const handleSaveAll = async (lockAfter: boolean) => {
    const entries = buildSavePayload()
    if (entries.length === 0 && !lockAfter) {
      toast({ title: "Nothing to save", description: "No score changes detected." })
      return
    }

    try {
      if (lockAfter) setLocking(true)
      else setSaving(true)

      const session = parseInt(filterSession)
      let saved = 0
      const errors: string[] = []

      for (const entry of entries) {
        const payload = {
          student: entry.studentId,
          subject: entry.subjectId,
          assessment_type: "exam",
          score: entry.score,
          max_score: 100,
          academic_session: session,
        }
        try {
          if (entry.gradeId) {
            await gradesAPI.update(entry.gradeId, payload)
          } else {
            await gradesAPI.create(payload)
          }
          saved++
        } catch (err: any) {
          errors.push(getErrorMessage(err, `Failed for student ${entry.studentId}`))
        }
      }

      // Lock every grade for this class/session so the terminal-report
      // generator (which only counts locked grades) includes them.
      if (lockAfter) {
        try {
          await gradesAPI.lock_by_class({
            class_id: parseInt(filterClass),
            academic_session_id: session,
          })
        } catch (lockErr) {
          console.error("Lock by class failed:", lockErr)
        }
      }

      if (errors.length > 0) {
        toast({
          title: `Saved ${saved} score(s) with errors`,
          description: errors.slice(0, 3).join("; "),
          variant: "destructive",
        })
      } else {
        toast({
          title: lockAfter ? "Saved & locked" : "Saved",
          description: `${saved || "No"} exam score(s) ${lockAfter ? "saved and locked for report generation" : "saved"}.`,
        })
      }

      // Reload to reflect server state
      if (filterClass && filterSession) {
        const classGrades = await fetchAllGrades<GradeRecord>({
          class_obj: filterClass,
          academic_session: filterSession,
        })
        setGrades(classGrades)
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description: getErrorMessage(err, "Could not save exam scores."),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setLocking(false)
    }
  }

  const selectedClassName = classes.find((c) => c.id.toString() === filterClass)?.name
  const selectedSessionName = sessions.find((s) => s.id.toString() === filterSession)?.name

  const gradeTone = (pct: number) =>
    pct >= 80
      ? "bg-emerald-100 text-emerald-800"
      : pct >= 60
        ? "bg-sky-100 text-sky-800"
        : pct >= 40
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800"

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Examination</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Enter end-of-term exam scores. Continuous assessment entered by teachers is shown for reference.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 pt-5">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            Exam scores entered here are the official end-of-term marks used to prepare terminal reports.
            Continuous assessment (tests, quizzes, assignments) marked by teachers is displayed in the
            <span className="font-semibold text-foreground"> CA (50%) </span>
            column and combined with your exam score to produce each subject total. Use
            <span className="font-semibold text-foreground"> Save & Lock </span>
            when scores are final — locked grades feed the terminal report generator.
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Select the class and session to enter exam scores for</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Academic Session</label>
            <Select value={filterSession || "none"} onValueChange={(v) => setFilterSession(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select session</SelectItem>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name} {s.is_current && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Class</label>
            <Select value={filterClass || "none"} onValueChange={(v) => setFilterClass(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select class</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <label className="text-sm font-medium mb-1.5 block">Search student</label>
            <Search className="absolute left-3 top-[2.35rem] -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"} ·{" "}
              {classSubjects.length} subject{classSubjects.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score entry grid */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardEdit className="w-5 h-5 text-primary" />
              Exam Score Entry
              {selectedClassName && (
                <Badge variant="secondary">{selectedClassName} · {selectedSessionName}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Enter each student's exam score out of 100. CA totals come from teachers' marks.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleSaveAll(false)}
              disabled={saving || locking || !filterClass || !filterSession || pendingCount === 0}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save {pendingCount > 0 ? `(${pendingCount})` : ""}
            </Button>
            <Button
              onClick={() => handleSaveAll(true)}
              disabled={saving || locking || !filterClass || !filterSession}
            >
              {locking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              Save & Lock for Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <DataStateLoading message="Loading class, students and grades..." />
          ) : !filterClass || !filterSession ? (
            <div className="text-center py-16">
              <GraduationCap className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a class and session</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose an academic session and a class above to load the score-entry grid.
              </p>
            </div>
          ) : filteredStudents.length === 0 || classSubjects.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nothing to grade</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {filteredStudents.length === 0
                  ? "No students are assigned to this class yet."
                  : "No subjects are assigned to this class yet. Add subjects under Academics → Subject."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/60">
                    <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-muted/60 z-10 min-w-[220px]">
                      Student
                    </th>
                    {classSubjects.map((subject) => (
                      <th key={subject.id} className="text-center py-3 px-3 font-semibold min-w-[150px]">
                        <div className="truncate" title={subject.name}>{subject.name}</div>
                        <div className="text-[10px] font-normal text-muted-foreground uppercase tracking-wide">
                          CA · Exam /100
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/30">
                      <td className="py-2.5 px-4 sticky left-0 bg-card z-10">
                        <div className="font-medium">{student.name}</div>
                        {student.rollNumber && (
                          <div className="text-xs text-muted-foreground">Roll: {student.rollNumber}</div>
                        )}
                      </td>
                      {classSubjects.map((subject) => {
                        const key = `${student.id}:${subject.id}`
                        const ca = caTotals[key] || 0
                        const existing = examGradeByCell.get(key)
                        const value = examScores[key] ?? ""
                        const total = ca + (parseFloat(value) || 0)
                        return (
                          <td key={subject.id} className="py-2 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeTone(ca)}`}
                                title="Continuous assessment total from teachers' marks"
                              >
                                {ca > 0 ? ca.toFixed(0) : "–"}
                              </span>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={value}
                                onChange={(e) => setScore(student.id, subject.id, e.target.value)}
                                placeholder="–"
                                className="w-16 h-8 text-center px-1"
                                disabled={existing?.is_locked}
                              />
                              {(ca > 0 || value !== "") && (
                                <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                                  {total.toFixed(0)}
                                </span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
