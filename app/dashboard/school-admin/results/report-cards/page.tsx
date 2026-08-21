"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProtectedRoute } from "@/lib/protected-route"
import { academicsAPI, getErrorMessage, resolveImageUrl } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { DataStateLoading } from "@/components/data-state"
import {
  ReportCardViewer,
  buildReportContext,
  type ReportCardData,
} from "@/components/report-card-viewer"
import {
  FileText,
  Printer,
  Loader2,
  RefreshCcw,
  Search,
  Users,
  Wand2,
  Eye,
} from "lucide-react"

interface TemplateOption {
  id: number
  name: string
  html_template: string
  is_default: boolean
}

/** Ordinal label for positions: 1 → "1st", 22 → "22nd". */
function ordinal(n: number): string {
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

export default function ReportCardsPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <ReportCardsContent />
    </ProtectedRoute>
  )
}

function ReportCardsContent() {
  const { toast } = useToast()
  const { school } = useAuthContext()

  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [reports, setReports] = useState<ReportCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [filterSession, setFilterSession] = useState("")
  const [filterClass, setFilterClass] = useState("")
  const [templateId, setTemplateId] = useState("")

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewReport, setPreviewReport] = useState<ReportCardData | null>(null)
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [sessionsRes, classesRes, templatesRes] = await Promise.all([
        academicsAPI.academicSessions(),
        academicsAPI.classes(),
        academicsAPI.terminalReportTemplates(),
      ])

      const sessionList = sessionsRes.data?.results || sessionsRes.data || []
      setSessions(sessionList)
      setClasses(classesRes.data?.results || classesRes.data || [])
      setTemplates(templatesRes.data?.results || templatesRes.data || [])

      const current = sessionList.find((s: any) => s.is_current)
      if (current) setFilterSession(current.id.toString())

      const templateList = templatesRes.data?.results || templatesRes.data || []
      const defaultTemplate = templateList.find((t: TemplateOption) => t.is_default) || templateList[0]
      if (defaultTemplate) setTemplateId(defaultTemplate.id.toString())
    } catch (err) {
      console.error("Failed to load report card data:", err)
      toast({
        title: "Load failed",
        description: getErrorMessage(err, "Could not load classes, sessions or templates."),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /** Load terminal reports for the selected class + session. */
  const loadReports = useCallback(async () => {
    if (!filterClass || !filterSession) {
      setReports([])
      return
    }
    try {
      setLoading(true)
      const res = await academicsAPI.classReports({
        class_id: filterClass,
        session_id: filterSession,
      })
      setReports(res.data?.results || [])
    } catch (err) {
      console.error("Failed to load class reports:", err)
      toast({
        title: "Load failed",
        description: getErrorMessage(err, "Could not load terminal reports for this class."),
        variant: "destructive",
      })
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [filterClass, filterSession, toast])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  /**
   * Generate/regenerate terminal reports for every student in the class.
   * The backend computes subject totals from LOCKED grades only, so run
   * "Save & Lock for Reports" on the Examination page first.
   */
  const handleGenerateReports = async () => {
    if (!filterClass || !filterSession) return
    try {
      setGenerating(true)
      const res = await academicsAPI.computeClassReports({
        class_id: parseInt(filterClass),
        session_id: parseInt(filterSession),
      })
      const generated = res.data?.reports_generated ?? 0
      const total = res.data?.total_students ?? 0
      const errors = res.data?.errors || []
      toast({
        title: "Reports generated",
        description:
          errors.length > 0
            ? `${generated}/${total} report(s) generated. ${errors.length} student(s) skipped — check that grades are locked.`
            : `Generated ${generated || total} report(s) for this class.`,
      })
      await loadReports()
    } catch (err) {
      console.error("Failed to generate reports:", err)
      toast({
        title: "Generation failed",
        description: getErrorMessage(err, "Could not generate terminal reports."),
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const selectedTemplate =
    templates.find((t) => t.id.toString() === templateId) ||
    templates.find((t) => t.is_default) ||
    templates[0]

  const filteredReports = useMemo(
    () =>
      reports.filter((r) =>
        r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [reports, searchTerm],
  )

  const selectedClassName = classes.find((c) => c.id.toString() === filterClass)?.name
  const selectedSessionName = sessions.find((s) => s.id.toString() === filterSession)?.name

  const openPreview = (report: ReportCardData) => {
    setPreviewReport(report)
    setPreviewOpen(true)
  }

  /**
   * Print ONLY the report card. A hidden iframe is filled with the rendered
   * template HTML plus minimal print CSS, then printed — so dashboard chrome
   * never appears on paper.
   */
  const printReport = (report: ReportCardData) => {
    if (!selectedTemplate) return
    const html = renderForPrint(report)

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><title>${report.student_name} - Terminal Report</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  img { max-width: 100%; }
</style></head><body>${html}</body></html>`)
    doc.close()

    const cleanup = () => {
      setTimeout(() => document.body.removeChild(iframe), 500)
    }
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    // Chrome fires afterprint; Safari/others may not — clean up either way.
    iframe.contentWindow?.addEventListener("afterprint", cleanup)
    setTimeout(cleanup, 60_000)
  }

  /** Render one report's template HTML with real data (for printing/PDF). */
  const renderForPrint = (report: ReportCardData): string => {
    if (!selectedTemplate) return ""
    // Reuse the same substitution engine as the on-screen preview by going
    // through buildReportContext + a tiny local replace (mirrors viewer).
    const context = buildReportContext(report, school?.name || "", resolveImageUrl(school?.logo_url))
    return substituteTemplate(selectedTemplate.html_template, context)
  }

  const downloadPdf = async (report: ReportCardData) => {
    if (!selectedTemplate) return
    try {
      setDownloadingPdfId(report.id)
      const response = await academicsAPI.templatePdf(selectedTemplate.id, {
        html_template: selectedTemplate.html_template,
        preview_data: buildReportContext(report, school?.name || "", resolveImageUrl(school?.logo_url)),
      })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.student_name.replace(/\s+/g, "-")}-terminal-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "PDF downloaded", description: `Report for ${report.student_name} saved.` })
    } catch (err) {
      console.error("PDF generation failed:", err)
      toast({
        title: "PDF failed",
        description: getErrorMessage(err, `Could not generate PDF for ${report.student_name}.`),
        variant: "destructive",
      })
    } finally {
      setDownloadingPdfId(null)
    }
  }

  const gradeTone = (grade?: string) => {
    switch (grade) {
      case "A": return "bg-emerald-100 text-emerald-800"
      case "B": return "bg-sky-100 text-sky-800"
      case "C": return "bg-amber-100 text-amber-800"
      case "D": return "bg-orange-100 text-orange-800"
      case "F": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Report Cards</h1>
          <p className="text-muted-foreground text-lg mt-2">
            View each student's terminal report card on your chosen template and print it out.
          </p>
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
          <CardDescription>Select the class and session, then pick the template to render report cards with</CardDescription>
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
          <div>
            <label className="text-sm font-medium mb-1.5 block">Report Template</label>
            <Select value={templateId || "none"} onValueChange={(v) => setTemplateId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select template</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name} {t.is_default && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <label className="text-sm font-medium mb-1.5 block">Search student</label>
            <Search className="absolute left-3 top-[2.35rem] -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions bar */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {filteredReports.length} report card{filteredReports.length === 1 ? "" : "s"}
            {selectedClassName ? ` · ${selectedClassName}` : ""}
            {selectedSessionName ? ` · ${selectedSessionName}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerateReports}
              disabled={generating || !filterClass || !filterSession}
            >
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Generate / Update Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report cards list */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Students
            {!selectedTemplate && (
              <Badge variant="destructive">No template selected</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Open a student to view their full report card rendered on the selected template, then print or download it as PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <DataStateLoading message="Loading report cards..." />
          ) : !filterClass || !filterSession ? (
            <div className="text-center py-16">
              <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a class and session</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose an academic session and class above to load students' report cards.
              </p>
            </div>
          ) : !selectedTemplate ? (
            <div className="text-center py-16">
              <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No report template available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create a template under Results → Report Templates first, then come back to render report cards.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No report cards yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click <span className="font-semibold text-foreground">Generate / Update Reports</span> above to compute
                terminal reports from locked grades. Make sure exam scores were saved with{" "}
                <span className="font-semibold text-foreground">Save & Lock for Reports</span> on the Examination page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/60">
                    <th className="text-left py-3 px-4 font-semibold">#</th>
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Average</th>
                    <th className="text-left py-3 px-4 font-semibold">Position</th>
                    <th className="text-left py-3 px-4 font-semibold">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold">Attendance</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, idx) => (
                    <tr key={report.id} className="border-b hover:bg-muted/30">
                      <td className="py-2.5 px-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <button
                          className="font-medium hover:text-primary hover:underline text-left"
                          onClick={() => openPreview(report)}
                        >
                          {report.student_name}
                        </button>
                      </td>
                      <td className="py-2.5 px-4">{(report.average_marks ?? 0).toFixed(1)}%</td>
                      <td className="py-2.5 px-4">
                        {report.position ? `${ordinal(report.position)} of ${report.total_students ?? ""}` : "–"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${gradeTone(report.grade)}`}>
                          {report.grade || "–"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">{(report.attendance_percentage ?? 0).toFixed(0)}%</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => openPreview(report)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => printReport(report)}>
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadPdf(report)}
                            disabled={downloadingPdfId === report.id}
                          >
                            {downloadingPdfId === report.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 mr-1" />
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

      {/* Full report card preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="!flex !flex-col !gap-0 w-[96vw] max-w-[900px] h-[94vh] p-0 overflow-hidden rounded-2xl shadow-2xl border sm:max-w-[900px]">
          <DialogHeader className="px-5 py-3.5 lg:px-7 border-b bg-gradient-to-r from-primary/5 to-secondary/10 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg lg:text-xl font-bold truncate">
                  {previewReport?.student_name} — Terminal Report
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rendered on “{selectedTemplate?.name}” · {selectedClassName} · {selectedSessionName}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewReport && printReport(previewReport)}
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewReport && downloadPdf(previewReport)}
                  disabled={downloadingPdfId === previewReport?.id}
                >
                  {downloadingPdfId === previewReport?.id ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-1.5" />
                  )}
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto bg-muted/40 p-4 lg:p-6">
            {previewReport && selectedTemplate && (
              <ReportCardViewer
                report={previewReport}
                templateHtml={selectedTemplate.html_template}
                schoolName={school?.name || ""}
                schoolLogoUrl={resolveImageUrl(school?.logo_url)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Minimal {{ variable }} substitution used for the print window. Mirrors
 * `renderTemplateLocally` from the template editor but without its mock-data
 * defaults, so missing values simply render blank instead of sample data.
 */
function substituteTemplate(html: string, data: Record<string, any>): string {
  const subjects = (data.subject_scores || []) as Array<Record<string, any>>
  const cell = "border:1px solid #94a3b8; padding:4px 6px;"
  const th = (label: string) =>
    `<th style="${cell} background:#1a7a4a; color:#ffffff; font-size:10px; font-weight:bold; text-align:center;">${label}</th>`

  const subjectsTable = subjects.length > 0
    ? `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
        <thead><tr>${th("S/N")}${th("SUBJECTS")}${th("CLASS SCORE (50%)")}${th("EXAM SCORE (50%)")}${th("TOTAL SCORE (100%)")}${th("GRADE")}${th("REMARK")}${th("POSITION IN SUBJECT")}</tr></thead>
        <tbody>${subjects
          .map((s, i) => {
            const total = Number(s.total_score ?? 0)
            return `<tr>` +
              `<td style="${cell} text-align:center;">${i + 1}</td>` +
              `<td style="${cell}">${s.subject_name ?? ""}</td>` +
              `<td style="${cell} text-align:center;">${s.ca_score ?? ""}</td>` +
              `<td style="${cell} text-align:center;">${s.exam_score ?? ""}</td>` +
              `<td style="${cell} text-align:center; font-weight:bold;">${total}</td>` +
              `<td style="${cell} text-align:center; font-weight:bold;">${s.grade ?? ""}</td>` +
              `<td style="${cell}">${s.remarks ?? ""}</td>` +
              `<td style="${cell} text-align:center;">${s.subject_position ? ordinal(Number(s.subject_position)) : ""}</td>` +
              `</tr>`
          })
          .join("")}</tbody>
      </table>`
    : ""

  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    if (key === "subjects_table") return subjectsTable
    if (key === "student_bill_table") return ""
    const value = data[key]
    return value === undefined || value === null || value === "" ? "" : String(value)
  })
}
