"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/lib/protected-route"
import { GHANA_REPORT_PRESET_HTML, renderTemplateLocally } from "@/components/ReportTemplateEditor"
import { academicsAPI, getErrorMessage, resolveImageUrl } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { DataStateLoading } from "@/components/data-state"
import { Download, Eye, FileSpreadsheet, FileText, Loader2, Award, RefreshCcw, Users, Send } from "lucide-react"

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
  student_number?: string
  gender?: string
  roll_number?: string
  class_teacher_name?: string
  days_present?: number
  total_days?: number
  attendance_percentage?: number
  promotion_status?: string
  best_subject_name?: string
  best_subject_score?: number
  school_logo?: string
  school_phone?: string
  school_email?: string
  school_address?: string
  status: string
  subject_scores?: Array<{
    id: number
    subject_name: string
    ca1_score?: number | null
    ca2_score?: number | null
    ca3_score?: number | null
    exam_score?: number | null
    total_score: number
    percentage: number
    grade: string
    subject_position?: number | null
    subject_total_students?: number
    remarks?: string
  }>
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
  const { school } = useAuthContext()
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
  const [previewReport, setPreviewReport] = useState<TerminalReportRow | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [publishingId, setPublishingId] = useState<number | null>(null)

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

      const reportRows: TerminalReportRow[] = []
      let reportPage = 1
      let responseData = reportsRes.data
      for (;;) {
        if (Array.isArray(responseData)) {
          reportRows.push(...responseData)
          break
        }
        reportRows.push(...(responseData?.results || []))
        if (!responseData?.next) break
        reportPage += 1
        const nextPage = await academicsAPI.terminalReports({ page: reportPage })
        responseData = nextPage.data
      }
      setReports(reportRows)

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
      setError(getErrorMessage(err, "Failed to load results. Please check if backend is running."))
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
  const selectedTemplateHtml = selectedTemplate?.html_template?.trim() || GHANA_REPORT_PRESET_HTML

  const handleTemplateChange = (value: string) => {
    setTemplateId(value === "none" ? "" : value)
    const firstReport = filteredReports[0]
    if (!firstReport) {
      toast({
        title: "Template selected",
        description: "Generate or load a report to preview it with this template.",
      })
      return
    }
    setPreviewReport(firstReport)
    setPreviewOpen(true)
  }

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

  const openPreview = (report: TerminalReportRow) => {
    setPreviewReport(report)
    setPreviewOpen(true)
  }

  const publishReport = async (report: TerminalReportRow) => {
    setPublishingId(report.id)
    try {
      const response = await academicsAPI.publishTerminalReport(report.id)
      const updatedReport = response.data as TerminalReportRow
      setReports((current) =>
        current.map((item) => item.id === report.id ? { ...item, ...updatedReport } : item),
      )
      toast({ title: "Report published", description: `${report.student_name}'s report is now published.` })
    } catch (err) {
      console.error("Failed to publish terminal report:", err)
      toast({
        title: "Could not publish report",
        description: getErrorMessage(err, `Could not publish ${report.student_name}'s report.`),
        variant: "destructive",
      })
    } finally {
      setPublishingId(null)
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

  const buildPreviewData = (report: TerminalReportRow) => {
    const subjectScores = report.subject_scores || []
    const getCaScore = (score: NonNullable<TerminalReportRow["subject_scores"]>[number]) => {
      const caParts = [score.ca1_score, score.ca2_score, score.ca3_score].filter(
        (part): part is number => typeof part === "number",
      )
      return caParts.length ? caParts.reduce((sum, part) => sum + part, 0) : null
    }
    const getAverageRemark = (value?: number) => {
      if (typeof value !== "number" || Number.isNaN(value)) return ""
      if (value >= 80) return "Highly Proficient"
      if (value >= 68) return "Proficient"
      if (value >= 54) return "Approaching Proficiency"
      if (value >= 40) return "Developing"
      return "Emerging"
    }
    const caTotal = subjectScores.reduce((sum, score) => sum + (getCaScore(score) ?? 0), 0)
    const grandTotal = subjectScores.reduce((sum, s) => sum + (s.total_score ?? 0), 0)
    const schoolLogo = resolveImageUrl(report.school_logo || school?.logo_url)
    const schoolMotto = (school as any)?.motto || (school as any)?.tagline || ""
    const principalName = (school as any)?.principal_name || ""

    return {
      student_name: report.student_name,
      name: report.student_name,
      student_id: report.student_number || String(report.student),
      class: report.class_name,
      class_name: report.class_name,
      school_name: school?.name || "",
      school_phone: report.school_phone || school?.phone || "",
      school_email: report.school_email || school?.email || "",
      school_address: report.school_address || school?.address || "",
      school_motto: schoolMotto,
      school_logo: schoolLogo,
      session_name: report.session_name,
      academic_year: report.session_name,
      term: report.session_name,
      gender: report.gender || "",
      roll_number: report.roll_number || "",
      position_in_class: report.position ? `${report.position}` : "N/A",
      position: report.position,
      total_students: report.total_students,
      total_marks: report.total_marks,
      average_mark: report.average_marks?.toFixed(1) ?? "0.0",
      average_marks: report.average_marks,
      average_remark: getAverageRemark(report.average_marks),
      grade: report.grade,
      overall_grade: report.grade,
      attendance: `${report.attendance_percentage?.toFixed(0) ?? 0}%`,
      attendance_percentage: report.attendance_percentage,
      days_present: report.days_present,
      total_days: report.total_days,
      conduct: "",
      attitude: "",
      interest: "",
      class_teacher_name: report.class_teacher_name || "",
      class_teacher_remark: report.form_teacher_remarks || "",
      principal_name: principalName,
      principal_remark: report.principal_remarks || "",
      principal_signature: "",
      next_term_begins: "",
      promoted_to: "",
      date: new Date().toLocaleDateString(),
      best_subject_name: report.best_subject_name || "",
      best_subject_score: report.best_subject_score ?? 0,
      promotion_status: report.promotion_status || "",
      ca_total: Number(caTotal.toFixed(1)),
      exam_total: subjectScores.reduce((sum, score) => sum + (score.exam_score ?? 0), 0),
      grand_total: Number(grandTotal.toFixed(1)),
      max_total: subjectScores.length * 100,
      bill_items: [],
      arrears: "",
      grand_total_bill: Number(grandTotal.toFixed(1)),
      subjects: subjectScores.map((s) => ({
        name: s.subject_name,
        score: s.total_score,
        percentage: s.percentage,
        ca_score: getCaScore(s),
        exam_score: s.exam_score ?? null,
        total_score: s.total_score,
        grade: s.grade,
        subject_position: s.subject_position,
        subject_total_students: s.subject_total_students,
      })),
      subject_scores: subjectScores.map((s) => ({
        subject_name: s.subject_name,
        percentage: s.percentage,
        total_score: s.total_score,
        ca_score: getCaScore(s),
        exam_score: s.exam_score ?? null,
        grade: s.grade,
        remark: s.remarks || "",
        remarks: s.remarks || "",
        subject_position: s.subject_position,
        subject_total_students: s.subject_total_students,
      })),
      summary: {
        average: report.average_marks,
        position: report.position,
        total_students: report.total_students,
        grade: report.grade,
      },
      attendance_summary: {
        percentage: report.attendance_percentage,
        days_present: report.days_present,
        total_days: report.total_days,
      },
      remarks: report.form_teacher_remarks || report.principal_remarks || "",
    }
  }

  const downloadReportPdf = async (report: TerminalReportRow) => {
    if (!selectedTemplate) return false
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      const reportElement = document.createElement("div")
      reportElement.innerHTML = renderTemplateLocally(selectedTemplateHtml, buildPreviewData(report))
      reportElement.style.cssText = [
        "position:fixed",
        "left:0",
        "top:0",
        "display:block",
        "box-sizing:border-box",
        "width:794px",
        "padding:24px",
        "overflow:visible",
        "background:#ffffff",
        "color:#000000",
        "font-family:Arial,Helvetica,sans-serif",
        "z-index:9998",
      ].join(";")

      const exportOverlay = document.createElement("div")
      exportOverlay.style.cssText =
        "position:fixed;inset:0;z-index:9999;background:#fff;display:flex;align-items:center;justify-content:center;color:#111;font:14px Arial,sans-serif;"
      exportOverlay.textContent = `Preparing ${report.student_name}'s report…`
      exportOverlay.setAttribute("role", "status")
      exportOverlay.setAttribute("aria-live", "polite")
      document.body.append(exportOverlay, reportElement)

      try {
        await Promise.all(
          Array.from(reportElement.querySelectorAll("img"), async (image) => {
            if (image.complete) return
            try {
              await image.decode()
            } catch {
              image.remove()
            }
          }),
        )
        await document.fonts?.ready
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })

        const { width, height } = reportElement.getBoundingClientRect()
        if (width === 0 || height === 0 || !reportElement.innerHTML.trim()) {
          throw new Error("The selected report template rendered no visible content.")
        }

        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: Math.max(document.documentElement.clientWidth, width),
          scrollX: 0,
          scrollY: 0,
        })
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error("The report could not be rendered for PDF export.")
        }

        const context = canvas.getContext("2d")
        const pixelStep = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / 10000)))
        let hasVisibleContent = false
        if (context) {
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
          for (let y = 0; y < canvas.height && !hasVisibleContent; y += pixelStep) {
            for (let x = 0; x < canvas.width; x += pixelStep) {
              const pixelIndex = (y * canvas.width + x) * 4
              if (
                pixels[pixelIndex + 3] > 0 &&
                (pixels[pixelIndex] < 245 || pixels[pixelIndex + 1] < 245 || pixels[pixelIndex + 2] < 245)
              ) {
                hasVisibleContent = true
                break
              }
            }
          }
        }
        if (!hasVisibleContent) {
          throw new Error("The rendered report is blank. Check the selected template and report data.")
        }

        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
        const margin = 8
        const printableWidth = pdf.internal.pageSize.getWidth() - margin * 2
        const printableHeight = pdf.internal.pageSize.getHeight() - margin * 2
        const pageCanvasHeight = Math.floor((canvas.width * printableHeight) / printableWidth)
        const pageCanvas = document.createElement("canvas")
        const pageContext = pageCanvas.getContext("2d")
        if (!pageContext) throw new Error("Could not prepare report PDF pages.")
        pageCanvas.width = canvas.width

        let offsetY = 0
        let pageNumber = 0
        while (offsetY < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offsetY)
          pageCanvas.height = sliceHeight
          pageContext.fillStyle = "#ffffff"
          pageContext.fillRect(0, 0, pageCanvas.width, sliceHeight)
          pageContext.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight,
          )
          if (pageNumber > 0) pdf.addPage()
          const pageHeightMm = (sliceHeight * printableWidth) / canvas.width
          pdf.addImage(
            pageCanvas.toDataURL("image/png"),
            "PNG",
            margin,
            margin,
            printableWidth,
            pageHeightMm,
          )
          offsetY += sliceHeight
          pageNumber++
        }
        pdf.save(`${report.student_name.replace(/\s+/g, "-")}-report.pdf`)
      } finally {
        reportElement.remove()
        exportOverlay.remove()
      }
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Export Results</h1>
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
            <Select value={templateId || "none"} onValueChange={handleTemplateChange}>
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
            <p className="mt-1.5 text-xs text-muted-foreground">
              Selecting a template opens a preview using the first result matching your filters.
            </p>
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
          {loading && <DataStateLoading message="Loading results..." />}
          {!loading && filteredReports.length === 0 ? (
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
                    <th className="text-right py-2 px-2">Actions</th>
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
                        <Badge
                          variant={report.status === "published" ? "default" : "secondary"}
                          className={
                            report.status === "draft"
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-100"
                              : report.status === "archived"
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                : ""
                          }
                        >
                          {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : "Unknown"}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openPreview(report)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                          {report.status === "draft" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => publishReport(report)}
                              disabled={publishingId === report.id}
                            >
                              {publishingId === report.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5 mr-1" />
                              )}
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSingle(report)}
                            disabled={downloadingId === report.id}
                          >
                            {downloadingId === report.id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 mr-1" />
                            )}
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="!flex !flex-col !gap-0 w-[96vw] max-w-[900px] h-[94vh] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 py-4 border-b shrink-0">
            <DialogTitle className="text-lg font-bold">
              {previewReport?.student_name || "Report"} — Report Preview
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {previewReport?.class_name} · {previewReport?.session_name} · {selectedTemplate?.name || "Standard report layout"}
            </p>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto bg-muted/40 p-4 lg:p-6">
            {previewReport && (
              <>
                {!selectedTemplate?.html_template?.trim() && (
                  <p className="mx-auto mb-4 max-w-[820px] rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    The selected template has no saved layout, so the standard report layout is shown.
                  </p>
                )}
                <div
                  className="mx-auto w-full max-w-[820px] rounded-md bg-white p-5 text-black shadow-xl ring-1 ring-black/10 sm:p-8"
                  dangerouslySetInnerHTML={{
                    __html: renderTemplateLocally(selectedTemplateHtml, buildPreviewData(previewReport)),
                  }}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
