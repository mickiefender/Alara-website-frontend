"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/lib/protected-route"
import { academicsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Download, FileSpreadsheet, FileText, Loader2, Award, RefreshCcw, Users } from "lucide-react"

interface TerminalReportRow {
  id: number
  student: number
  student_name: string
  class_obj: number | { id: number; name?: string }
  class_name: string
  academic_session: number | { id: number; name?: string }
  session_name: string
  total_marks?: number
  average_marks?: number
  position?: number
  total_students?: number
  grade: string
  days_present?: number
  total_days?: number
  attendance_percentage?: number
  status: string
  subject_scores?: Array<{ id: number; subject_name: string; total_score: number; percentage: number; grade: string }>
  form_teacher_remarks?: string
  principal_remarks?: string
}

interface ReportTemplateOption {
  id: number
  name: string
  html_template: string
  is_default: boolean
}

export default function ExportResultsPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <ExportResultsContent />
    </ProtectedRoute>
  )
}

function ExportResultsContent() {
  const { toast } = useToast()
  const [reports, setReports] = useState<TerminalReportRow[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [templates, setTemplates] = useState<ReportTemplateOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filterSession, setFilterSession] = useState("")
  const [filterClass, setFilterClass] = useState("")
  const [templateId, setTemplateId] = useState("")

  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [bulkDownloading, setBulkDownloading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const [reportsRes, sessionsRes, classesRes, templatesRes] = await Promise.all([
        academicsAPI.terminalReports(),
        academicsAPI.academicSessions(),
        academicsAPI.classes(),
        academicsAPI.terminalReportTemplates(),
      ])

      setReports(reportsRes.data?.results || reportsRes.data || [])

      const sessionList = sessionsRes.data?.results || sessionsRes.data || []
      setSessions(sessionList)
      setClasses(classesRes.data?.results || classesRes.data || [])

      const templateList = templatesRes.data?.results || templatesRes.data || []
      setTemplates(templateList)

      const currentSession = sessionList.find((s: any) => s.is_current)
      if (currentSession) setFilterSession(currentSession.id.toString())

      const defaultTemplate = templateList.find((t: ReportTemplateOption) => t.is_default)
      if (defaultTemplate) setTemplateId(defaultTemplate.id.toString())
    } catch (err) {
      console.error("Failed to load export results data:", err)
      setError("Failed to load results. Please check if backend is running.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const reportSessionId = typeof r.academic_session === "object" ? r.academic_session?.id : r.academic_session
      const reportClassId = typeof r.class_obj === "object" ? r.class_obj?.id : r.class_obj
      if (filterSession && reportSessionId !== parseInt(filterSession)) return false
      if (filterClass && reportClassId !== parseInt(filterClass)) return false
      return true
    })
  }, [reports, filterSession, filterClass])

  const selectedTemplate =
    templates.find((t) => t.id.toString() === templateId) ||
    templates.find((t) => t.is_default) ||
    templates[0]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800"
      case "B": return "bg-blue-100 text-blue-800"
      case "C": return "bg-yellow-100 text-yellow-800"
      case "D": return "bg-orange-100 text-orange-800"
      case "E": return "bg-amber-100 text-amber-800"
      case "F": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleCalculatePositions = async () => {
    if (!filterClass || !filterSession) {
      toast({ title: "Select filters", description: "Choose a class and session first.", variant: "destructive" })
      return
    }
    try {
      await academicsAPI.calculatePositions({ class_id: parseInt(filterClass), session_id: parseInt(filterSession) })
      toast({ title: "Success", description: "Positions recalculated." })
      fetchData()
    } catch (err) {
      toast({ title: "Failed", description: "Could not calculate positions.", variant: "destructive" })
    }
  }

  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      toast({ title: "Nothing to export", description: "No results match the current filters.", variant: "destructive" })
      return
    }
    const headers = ["Student", "Class", "Session", "Total Marks", "Average (%)", "Position", "Grade", "Attendance (%)", "Status"]
    const rows = filteredReports.map((r) => [
      r.student_name,
      r.class_name,
      r.session_name,
      r.total_marks?.toFixed(1) ?? "",
      r.average_marks?.toFixed(1) ?? "",
      r.position ? `${r.position}/${r.total_students}` : "",
      r.grade ?? "",
      r.attendance_percentage?.toFixed(0) ?? "",
      r.status ?? "",
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `results-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported", description: `${filteredReports.length} result(s) exported to CSV.` })
  }

  const buildPreviewData = (report: TerminalReportRow) => ({
    student_name: report.student_name,
    name: report.student_name,
    class: report.class_name,
    subjects: (report.subject_scores || []).map((s) => ({ name: s.subject_name, score: s.total_score, grade: s.grade })),
    summary: {
      average: report.average_marks,
      position: report.position,
      total_students: report.total_students,
      grade: report.grade,
    },
    attendance: {
      percentage: report.attendance_percentage,
      days_present: report.days_present,
      total_days: report.total_days,
    },
    remarks: report.form_teacher_remarks || report.principal_remarks || "",
  })

  const downloadReportPdf = async (report: TerminalReportRow) => {
    if (!selectedTemplate) return false
    try {
      const response = await academicsAPI.templatePdf(selectedTemplate.id, {
        html_template: selectedTemplate.html_template,
        preview_data: buildPreviewData(report),
      })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.student_name.replace(/\s+/g, "-")}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch (err) {
      console.error("PDF export failed:", err)
      return false
    }
  }

  const handleDownloadSingle = async (report: TerminalReportRow) => {
    if (!selectedTemplate) {
      toast({ title: "No template", description: "Create a report template first.", variant: "destructive" })
      return
    }
    setDownloadingId(report.id)
    const ok = await downloadReportPdf(report)
    setDownloadingId(null)
    toast(
      ok
        ? { title: "Downloaded", description: `Report for ${report.student_name} downloaded.` }
        : { title: "Failed", description: `Could not generate PDF for ${report.student_name}.`, variant: "destructive" },
    )
  }

  const handleDownloadAll = async () => {
    if (filteredReports.length === 0) {
      toast({ title: "Nothing to export", description: "No results match the current filters.", variant: "destructive" })
      return
    }
    if (!selectedTemplate) {
      toast({ title: "No template", description: "Create a report template first.", variant: "destructive" })
      return
    }
    setBulkDownloading(true)
    let success = 0
    for (const report of filteredReports) {
      const ok = await downloadReportPdf(report)
      if (ok) success++
    }
    setBulkDownloading(false)
    toast({ title: "Bulk export complete", description: `${success} of ${filteredReports.length} PDF(s) downloaded.` })
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Export Results</h1>
          <p className="text-muted-foreground text-lg mt-2">Download student terminal reports as CSV or PDF</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Narrow down results before exporting</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Academic Session</label>
            <Select value={filterSession || "all"} onValueChange={(v) => setFilterSession(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="All Sessions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
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
            <Select value={filterClass || "all"} onValueChange={(v) => setFilterClass(v === "all" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Report Template</label>
            <Select value={templateId || "none"} onValueChange={(v) => setTemplateId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Default Template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Template</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name} {t.is_default && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {filteredReports.length} result{filteredReports.length === 1 ? "" : "s"} match the current filters
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCalculatePositions} disabled={!filterClass || !filterSession}>
              <Award className="w-4 h-4 mr-2" />
              Calculate Positions
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={filteredReports.length === 0}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleDownloadAll} disabled={filteredReports.length === 0 || bulkDownloading}>
              {bulkDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download All PDFs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Generated terminal reports ready for export</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results to export</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No terminal reports match the selected class and session yet. Once reports have been generated
                from students&apos; grades, they will show up here for export.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Student</th>
                    <th className="text-left py-2 px-2">Class</th>
                    <th className="text-left py-2 px-2">Session</th>
                    <th className="text-left py-2 px-2">Average</th>
                    <th className="text-left py-2 px-2">Position</th>
                    <th className="text-left py-2 px-2">Grade</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-right py-2 px-2">Export</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{report.student_name}</td>
                      <td className="py-2 px-2">{report.class_name}</td>
                      <td className="py-2 px-2">{report.session_name}</td>
                      <td className="py-2 px-2">{report.average_marks?.toFixed(1) ?? "-"}%</td>
                      <td className="py-2 px-2">
                        {report.position ? `${report.position}/${report.total_students}` : "-"}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(report.grade)}`}>
                          {report.grade}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant={report.status === "published" ? "default" : "secondary"}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadSingle(report)}
                          disabled={downloadingId === report.id}
                        >
                          {downloadingId === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-6 text-center py-12">
            <FileText className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-destructive">{error}</h3>
            <Button onClick={fetchData} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
