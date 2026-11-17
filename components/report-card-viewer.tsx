"use client"

import { useMemo } from "react"
import { renderTemplateLocally } from "@/components/ReportTemplateEditor"

export interface ReportCardData {
  id: number
  student_id: number
  student_name: string
  profile_picture?: string | null
  school_logo?: string | null
  class_name?: string | null
  session_name?: string | null
  total_marks?: number
  average_marks?: number
  position?: number | null
  total_students?: number
  grade?: string
  total_days?: number
  days_present?: number
  attendance_percentage?: number
  promotion_status?: string
  best_subject_name?: string
  best_subject_score?: number
  form_teacher_remarks?: string
  principal_remarks?: string
  status?: string
  subject_scores: Array<{
    subject_id: number
    subject_name: string
    ca1_score?: number | null
    ca2_score?: number | null
    ca3_score?: number | null
    exam_score?: number | null
    total_score: number
    percentage: number
    grade: string
    subject_position: number | null
    subject_total_students: number
  }>
}

interface ReportCardViewerProps {
  report: ReportCardData
  templateHtml: string
  schoolName?: string
  schoolLogoUrl?: string
  /** Ordinal suffix helper output, e.g. "1st" */
  positionLabel?: string
  /** Called when Print is clicked — parent controls print isolation */
  onPrint?: () => void
  printing?: boolean
}

/**
 * Builds the template context for one student's terminal report.
 * Exported so the page can reuse it for server-side PDF generation.
 */
export function buildReportContext(
  report: ReportCardData,
  schoolName = "",
  schoolLogoUrl = "",
): Record<string, any> {
  const subjects = report.subject_scores || []
  const getComponentScore = (subject: ReportCardData["subject_scores"][number]) => {
    const storedCaScores = [subject.ca1_score, subject.ca2_score, subject.ca3_score].filter(
      (score): score is number => typeof score === "number",
    )
    const fallbackScore = Math.min(Math.max(subject.total_score ?? 0, 0), 100) * 0.5
    return {
      caScore: Math.min(
        Math.max(storedCaScores.length ? storedCaScores.reduce((sum, score) => sum + score, 0) : fallbackScore, 0),
        50,
      ),
      examScore: Math.min(
        Math.max(typeof subject.exam_score === "number" ? subject.exam_score : fallbackScore, 0),
        50,
      ),
    }
  }
  const subjectComponents = subjects.map(getComponentScore)
  const grandTotal = subjectComponents.reduce((sum, score) => sum + score.caScore + score.examScore, 0)
  const averageMarks = subjects.length ? grandTotal / subjects.length : report.average_marks ?? 0

  return {
    student_name: report.student_name,
    name: report.student_name,
    class_name: report.class_name || "",
    class: report.class_name || "",
    school_name: schoolName,
    session_name: report.session_name || "",
    academic_year: report.session_name || "",
    term: report.session_name || "",
    gender: "",
    roll_number: "",
    position_in_class: report.position ? String(report.position) : "N/A",
    position: report.position,
    total_students: report.total_students,
    average_mark: averageMarks.toFixed(1),
    average_marks: averageMarks,
    average_remark: "",
    grade: report.grade || "",
    overall_grade: report.grade || "",
    attendance: `${(report.attendance_percentage ?? 0).toFixed(0)}%`,
    attendance_percentage: report.attendance_percentage,
    days_present: report.days_present ?? 0,
    total_days: report.total_days ?? 0,
    conduct: "",
    attitude: "",
    interest: "",
    class_teacher_name: "",
    class_teacher_remark: report.form_teacher_remarks || "",
    principal_name: "",
    principal_remark: report.principal_remarks || "",
    next_term_begins: "",
    promoted_to: "",
    date: new Date().toLocaleDateString(),
    best_subject_name: report.best_subject_name || "",
    best_subject_score: report.best_subject_score ?? 0,
    promotion_status: report.promotion_status || "",
    ca_total: Number(subjectComponents.reduce((sum, score) => sum + score.caScore, 0).toFixed(1)),
    exam_total: Number(subjectComponents.reduce((sum, score) => sum + score.examScore, 0).toFixed(1)),
    grand_total: Number(grandTotal.toFixed(1)),
    max_total: subjects.length * 100,
    school_logo: schoolLogoUrl,
    subjects: subjects.map((s, index) => ({
      name: s.subject_name,
      score: subjectComponents[index].caScore + subjectComponents[index].examScore,
      percentage: subjectComponents[index].caScore + subjectComponents[index].examScore,
      ca_score: Number(subjectComponents[index].caScore.toFixed(1)),
      exam_score: Number(subjectComponents[index].examScore.toFixed(1)),
      total_score: subjectComponents[index].caScore + subjectComponents[index].examScore,
      grade: s.grade,
      subject_position: s.subject_position ? String(s.subject_position) : undefined,
      subject_total_students: s.subject_total_students,
    })),
    subject_scores: subjects.map((s, index) => ({
      subject_name: s.subject_name,
      percentage: subjectComponents[index].caScore + subjectComponents[index].examScore,
      total_score: subjectComponents[index].caScore + subjectComponents[index].examScore,
      ca_score: Number(subjectComponents[index].caScore.toFixed(1)),
      exam_score: Number(subjectComponents[index].examScore.toFixed(1)),
      grade: s.grade,
      remarks: "",
      subject_position: s.subject_position,
      subject_total_students: s.subject_total_students,
    })),
  }
}

/**
 * Renders a single student's terminal report onto a report template.
 *
 * Rendering happens client-side with the exact same `{{ variable }}`
 * substitution engine used by the template editor's live preview
 * (`renderTemplateLocally`), so what the admin sees here matches both
 * the editor preview and the printed/PDF output.
 */
export function ReportCardViewer({
  report,
  templateHtml,
  schoolName = "",
  schoolLogoUrl = "",
  printing = false,
}: ReportCardViewerProps) {
  const renderedHtml = useMemo(
    () => renderTemplateLocally(templateHtml, buildReportContext(report, schoolName, schoolLogoUrl)),
    [templateHtml, report, schoolName, schoolLogoUrl],
  )

  return (
    <div className="report-card-print-area">
      <div
        className="mx-auto w-full max-w-[820px] rounded-md bg-white text-black shadow-xl ring-1 ring-black/10 p-5 sm:p-8"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  )
}
