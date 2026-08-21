"use client"

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye as PreviewIcon, Download, Save, LayoutTemplate } from "lucide-react"
import { VariableInserter } from './VariableInserter'
import { academicsAPI } from '@/lib/api'
import { useSchoolTheme } from '@/components/school-theme-provider'
import { toast } from 'sonner'
import { QuillEditorProvider } from './QuillEditorContext'

/* ------------------------------------------------------------------ */
/*  Shared style helpers used by the preset + local renderer           */
/* ------------------------------------------------------------------ */

const GREEN = '#1a7a4a'
const CELL = `border:1px solid #94a3b8; padding:4px 6px;`

/** Maps a total score to the Ghanaian proficiency grade + remark. */
export function gradeRemark(total: number): [string, string] {
  if (total >= 80) return ['HP', 'Highly Proficient']
  if (total >= 68) return ['P', 'Proficient']
  if (total >= 54) return ['AP', 'Approaching Proficiency']
  if (total >= 40) return ['D', 'Developing']
  return ['E', 'Emerging']
}

const th = (label: string) =>
  `<th style="${CELL} background:${GREEN}; color:#ffffff; font-size:10px; font-weight:bold; text-align:center;">${label}</th>`

/* ------------------------------------------------------------------ */
/*  Ready-made Ghanaian terminal-report preset                         */
/*  (CLASS SCORE | EXAM SCORE | TOTAL | GRADE | REMARK | POSITION)     */
/*  Admins can insert it into the editor and customize every part.     */
/* ------------------------------------------------------------------ */

export const GHANA_REPORT_PRESET_HTML = `
<div style="font-family: Arial, Helvetica, sans-serif; color:#111827;">
  <div style="background:${GREEN}; color:#ffffff; padding:12px 10px;">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="width:60px; text-align:center; vertical-align:middle;">
          <img src="{{school_logo}}" alt="logo" style="width:54px; height:54px; object-fit:contain; border-radius:50%; background:#ffffff; padding:2px;" />
        </td>
        <td style="text-align:center; vertical-align:middle;">
          <div style="font-size:21px; font-weight:bold; letter-spacing:0.5px; margin:0;">{{school_name}}</div>
          <div style="font-size:10.5px; margin-top:3px;">{{school_phone}} &nbsp;|&nbsp; {{school_email}}</div>
          <div style="font-size:10.5px; margin-top:1px;">{{school_address}}</div>
          <div style="font-size:10.5px; font-style:italic; margin-top:2px;">"{{school_motto}}"</div>
        </td>
        <td style="width:60px;"></td>
      </tr>
    </table>
  </div>

  <div style="border:2px solid ${GREEN}; border-top:none; text-align:center; padding:6px;">
    <span style="font-size:14px; font-weight:bold; letter-spacing:2.5px; color:${GREEN};">STUDENT'S TERMINAL REPORT</span>
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-top:10px;">
    <tr>
      <td style="padding:3px 6px; width:34%;"><b>Name Of Learner:</b> {{student_name}}</td>
      <td style="padding:3px 6px; width:33%;"><b>Class:</b> {{class_name}}</td>
      <td style="padding:3px 6px; width:33%;"><b>Position In Class:</b> {{position_in_class}}</td>
    </tr>
    <tr>
      <td style="padding:3px 6px;"><b>Gender:</b> {{gender}}</td>
      <td style="padding:3px 6px;"><b>Academic Year:</b> {{academic_year}}</td>
      <td style="padding:3px 6px;"><b>Average Mark:</b> {{average_mark}}</td>
    </tr>
    <tr>
      <td style="padding:3px 6px;"><b>Number On Roll:</b> {{roll_number}}</td>
      <td style="padding:3px 6px;"><b>Term:</b> {{term}}</td>
      <td style="padding:3px 6px;"><b>Average Remark:</b> {{average_remark}}</td>
    </tr>
    <tr>
      <td style="padding:3px 6px;"><b>Next Term Begins:</b> {{next_term_begins}}</td>
      <td style="padding:3px 6px;"><b>Promoted To:</b> {{promoted_to}}</td>
      <td style="padding:3px 6px;"><b>Date:</b> {{date}}</td>
    </tr>
  </table>

  {{subjects_table}}

  <table style="width:100%; border-collapse:collapse; margin-top:12px;">
    <tr>
      <td style="width:57%; vertical-align:top; padding-right:12px;">
        <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
          <tr><td style="padding:3px 0;"><b>Attendance:</b> {{days_present}} Out Of {{total_days}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Conduct:</b> {{conduct}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Attitude:</b> {{attitude}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Interest:</b> {{interest}}</td></tr>
          <tr><td style="padding:12px 0 3px;"><b>Class Teacher's Name:</b> {{class_teacher_name}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Class Teacher's Remark:</b> {{class_teacher_remark}}</td></tr>
          <tr><td style="padding:12px 0 3px;"><b>Principal's Name:</b> {{principal_name}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Principal's Remark:</b> {{principal_remark}}</td></tr>
          <tr><td style="padding:3px 0;"><b>Principal's Signature:</b> {{principal_signature}}</td></tr>
        </table>
      </td>
      <td style="width:43%; vertical-align:top;">
        {{student_bill_table}}
      </td>
    </tr>
  </table>

  <div style="border:1.5px solid ${GREEN}; padding:8px 10px; font-size:10px; margin-top:14px; background:#f0faf5;">
    <b style="color:${GREEN};">GRADE INTERPRETATION</b><br/>
    80 to 100 (HP: Highly Proficient), 68 to 79 (P: Proficient), 54 to 67 (AP: Approaching Proficiency),
    40 to 53 (D: Developing), 0 to 39 (E: Emerging)
  </div>
</div>
`.trim()

/* ------------------------------------------------------------------ */
/*  Mock preview data (mirrors a real Ghanaian terminal report)        */
/* ------------------------------------------------------------------ */

export const BASE_MOCK_PREVIEW_DATA = {
  school_name: 'Rakeli International School',
  school_phone: '0543777794 / 0246855850',
  school_address: 'P. O. Box AM 335, Amasaman, Greater Accra.',
  school_email: 'rakelisgh@gmail.com',
  school_motto: 'Strive for the Crown',
  school_logo: '/api/school/logo',
  student_name: 'Kofi Mensah',
  student_id: 'STU001',
  gender: 'MALE',
  roll_number: '16',
  class_name: 'Stage 2',
  academic_year: '2023/2024',
  position_in_class: '1st',
  term: 'First Term',
  average_mark: '66.3',
  average_remark: 'Approaching Proficiency',
  next_term_begins: '8th Jan. 2024',
  promoted_to: '',
  date: '21st Dec. 2023',
  grand_total: '530.0',
  max_total: '800',
  days_present: '52',
  total_days: '54',
  conduct: 'Respectful',
  attitude: 'Hardworking',
  interest: 'Art and Craft',
  class_teacher_name: 'Mr. Adjei',
  class_teacher_remark: 'Has improved',
  principal_name: 'Mrs. G. Osei',
  principal_remark: 'Excellent! Keep up the good work',
  principal_signature: '',
  arrears: '',
  subject_scores: [
    { subject_name: 'Computing', ca_score: 45.0, exam_score: 35.0, total_score: 80.0, subject_position: '2nd' },
    { subject_name: 'Creative Arts', ca_score: 50.0, exam_score: 40.0, total_score: 90.0, subject_position: '1st' },
    { subject_name: 'English Language', ca_score: 45.0, exam_score: 25.0, total_score: 70.0, subject_position: '2nd' },
    { subject_name: 'History', ca_score: 30.0, exam_score: 35.0, total_score: 65.0, subject_position: '2nd' },
    { subject_name: 'Mathematics', ca_score: 10.0, exam_score: 10.0, total_score: 20.0, subject_position: '2nd' },
    { subject_name: 'OWOP', ca_score: 40.0, exam_score: 30.0, total_score: 70.0, subject_position: '1st' },
    { subject_name: 'RME', ca_score: 30.0, exam_score: 30.0, total_score: 60.0, subject_position: '1st' },
    { subject_name: 'Science', ca_score: 40.0, exam_score: 35.0, total_score: 75.0, subject_position: '2nd' },
  ],
  bill_items: [
    { item: 'Tuition', amount: 10 },
    { item: 'Feeding', amount: 10 },
    { item: 'Transport', amount: 10 },
    { item: 'Maintenance', amount: 0 },
  ],
}

/* ------------------------------------------------------------------ */
/*  Client-side renderer: substitutes {{ variables }} with data so a   */
/*  not-yet-saved template can be previewed without a backend call.    */
/* ------------------------------------------------------------------ */

function buildSubjectsTable(data: Record<string, any>): string {
  const subjects = (data.subject_scores || []) as Array<Record<string, any>>
  const rows = subjects.map((s, i) => {
    const total = Number(s.total_score ?? (Number(s.ca_score) || 0) + (Number(s.exam_score) || 0))
    const [autoGrade, autoRemark] = gradeRemark(total)
    const grade = s.grade ?? autoGrade
    const remark = s.remark ?? autoRemark
    return (
      `<tr>` +
      `<td style="${CELL} text-align:center;">${i + 1}</td>` +
      `<td style="${CELL}">${s.subject_name ?? ''}</td>` +
      `<td style="${CELL} text-align:center;">${s.ca_score ?? ''}</td>` +
      `<td style="${CELL} text-align:center;">${s.exam_score ?? ''}</td>` +
      `<td style="${CELL} text-align:center; font-weight:bold;">${s.total_score ?? total}</td>` +
      `<td style="${CELL} text-align:center; font-weight:bold;">${grade}</td>` +
      `<td style="${CELL}">${remark}</td>` +
      `<td style="${CELL} text-align:center;">${s.subject_position ?? ''}</td>` +
      `</tr>`
    )
  }).join('')

  const emptyRow = subjects.length === 0
    ? `<tr><td colspan="8" style="${CELL} text-align:center; padding:8px;">No subjects recorded</td></tr>`
    : ''

  const overall = `<tr style="background:#eaf5ef;">
    <td colspan="4" style="${CELL} text-align:right; font-weight:bold;">OVERALL</td>
    <td colspan="2" style="${CELL} text-align:center; font-weight:bold;">${data.grand_total ?? ''} <span style="font-weight:normal;">OUT OF</span> ${data.max_total ?? ''}</td>
    <td colspan="2" style="${CELL}"></td>
  </tr>`

  return (
    `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:8px;">
      <thead>
        <tr>
          ${th('S/N')}${th('SUBJECTS')}${th('CLASS SCORE (50%)')}${th('EXAM SCORE (50%)')}${th('TOTAL SCORE (100%)')}${th('GRADE')}${th('REMARK')}${th('POSITION IN SUBJECT')}
        </tr>
      </thead>
      <tbody>${rows}${emptyRow}${overall}</tbody>
    </table>`
  )
}

function buildBillTable(data: Record<string, any>): string {
  const billItems = (data.bill_items || []) as Array<Record<string, any>>
  const subTotal = billItems.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
  const rows = billItems.map(b =>
    `<tr><td style="${CELL}">${b.item}</td><td style="${CELL} text-align:center;">${b.amount}</td></tr>`
  ).join('')
  return (
    `<table style="width:100%; border-collapse:collapse; font-size:10.5px;">
      <thead>
        <tr>${th("STUDENT'S BILL (GH₵)")}${th('AMOUNT')}</tr>
      </thead>
      <tbody>
        ${rows}
        <tr><td style="${CELL} text-align:right; font-weight:bold;">SUB TOTAL</td><td style="${CELL} text-align:center; font-weight:bold;">${subTotal.toFixed(1)}</td></tr>
        <tr><td style="${CELL} text-align:right;">Arrears</td><td style="${CELL} text-align:center;">${data.arrears ?? ''}</td></tr>
        <tr style="background:#eaf5ef;"><td style="${CELL} text-align:right; font-weight:bold;">GRAND TOTAL</td><td style="${CELL} text-align:center; font-weight:bold;">${data.grand_total_bill ?? subTotal.toFixed(1)}</td></tr>
      </tbody>
    </table>`
  )
}

/**
 * Substitutes {{ variables }} in a template with the supplied data.
 * Exported so pages (e.g. the full-screen preview dialog) can render
 * the exact same output as the editor's live preview.
 */
export function renderTemplateLocally(
  html: string,
  data: Record<string, any> = BASE_MOCK_PREVIEW_DATA,
): string {
  const subjectsTable = buildSubjectsTable(data)
  const billTable = buildBillTable(data)

  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    if (key === 'subjects_table') return subjectsTable
    if (key === 'student_bill_table') return billTable
    const value = data[key]
    return value === undefined || value === null || value === '' ? '' : String(value)
  })
}

/* ------------------------------------------------------------------ */

export interface TemplateEditorRef {
  getHTML: () => string
  setHTML: (html: string) => void
}

interface ReportTemplateEditorProps {
  templateId?: number
  initialHTML?: string
  onSave?: (data: any) => void
  previewData?: any
  readOnly?: boolean
  className?: string
}

const ReportTemplateEditor = forwardRef<TemplateEditorRef, ReportTemplateEditorProps>(
  ({ templateId, initialHTML = '', onSave, previewData = BASE_MOCK_PREVIEW_DATA, readOnly = false, className }, ref) => {
    const { schoolTheme } = useSchoolTheme()
    const quillRef = useRef<Quill | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(false)

    useImperativeHandle(ref, () => ({
      getHTML: () => quillRef.current?.root.innerHTML || '',
      setHTML: (html: string) => {
        if (quillRef.current) quillRef.current.root.innerHTML = html
      }
    }))

    useEffect(() => {
      if (containerRef.current && !quillRef.current) {
        const quill = new Quill(containerRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              [{ size: ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{
                color: [
                  '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00',
                  '#0066cc', '#9933ff', '#ffffff',
                  schoolTheme?.primary_color || GREEN,
                  schoolTheme?.secondary_color || '#f1f5f9'
                ]
              }, {
                background: [
                  '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc',
                  '#cce0f5', '#ebd5ff',
                  schoolTheme?.primary_color || GREEN,
                  schoolTheme?.secondary_color || '#f1f5f9'
                ]
              }],
              [{ align: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              ['blockquote', 'code-block'],
              [{ script: 'sub' }, { script: 'super' }],
              ['link', 'image', 'video'],
              ['clean']
            ]
          },
          placeholder: `Design with your school colors: Primary ${schoolTheme?.primary_color || GREEN}, Secondary ${schoolTheme?.secondary_color || '#f1f5f9'}.`
        })
        quillRef.current = quill
        if (initialHTML) quill.root.innerHTML = initialHTML
      }
    }, [initialHTML, schoolTheme?.primary_color, schoolTheme?.secondary_color])

    const previewTemplate = useCallback(async () => {
      if (!quillRef.current) return
      const htmlContent = quillRef.current.root.innerHTML

      // Unsaved template: render locally with mock data.
      if (!templateId) {
        setPreviewHtml(renderTemplateLocally(htmlContent, previewData))
        setShowPreview(true)
        toast.success("Local preview (save the template to use server-side PDF generation)")
        return
      }

      setLoading(true)
      try {
        const response = await academicsAPI.templatePreview(templateId, {
          html_template: htmlContent,
          preview_data: previewData
        })
        setPreviewHtml(response.data.rendered_html)
        setShowPreview(true)
        toast.success("Preview generated with school theme!")
      } catch (error) {
        // Fall back to local rendering so the user always sees something.
        setPreviewHtml(renderTemplateLocally(htmlContent, previewData))
        setShowPreview(true)
        toast.error("Server preview failed - showing local preview instead")
        console.error('Preview error:', error)
      } finally {
        setLoading(false)
      }
    }, [templateId, previewData])

    const generatePDF = useCallback(async () => {
      if (!quillRef.current || !templateId) return
      try {
        const htmlContent = quillRef.current.root.innerHTML
        const response = await academicsAPI.templatePdf(templateId, {
          html_template: htmlContent,
          preview_data: previewData
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `preview-report-${previewData.student_name}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("PDF Downloaded!")
      } catch (error) {
        toast.error("PDF generation failed")
        console.error('PDF error:', error)
      }
    }, [templateId, previewData])

    const handleSave = useCallback(() => {
      const htmlContent = quillRef.current?.root.innerHTML || ''
      onSave?.({ html_template: htmlContent })
    }, [onSave])

    return (
      <QuillEditorProvider quillRef={quillRef}>
        <div className={`w-full ${className || ''}`}>
          <div className="w-full">
            <div className="flex gap-2.5 mb-4 flex-wrap items-center">
              <VariableInserter />
              <Button
                size="sm"
                variant="outline"
                title="Insert the full Ghanaian terminal report layout"
                onClick={() => {
                  const quill = quillRef.current
                  if (!quill) return
                  // Must go through Quill's clipboard parser — writing
                  // root.innerHTML directly is wiped by Quill's model.
                  quill.setText('\n')
                  quill.clipboard.dangerouslyPasteHTML(0, GHANA_REPORT_PRESET_HTML)
                  toast.success('Ghana report layout inserted — customize any part of it.')
                }}
              >
                <LayoutTemplate className="w-4 h-4 mr-1" />
                Use Ghana Report Layout
              </Button>
              <Button onClick={previewTemplate} disabled={loading} size="sm">
                {loading ? "..." : <PreviewIcon className="w-4 h-4 mr-1" />}
                Preview
              </Button>
              <Button onClick={generatePDF} disabled={!templateId} size="sm" variant="outline" title={templateId ? undefined : "Save the template first to generate a PDF"}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              {!readOnly && (
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-stretch min-h-[520px] h-full">
              <Card className="h-full flex flex-col border-primary/15 shadow-sm">
                <CardContent className="pt-5 px-4 lg:px-6 pb-5 flex-1 flex flex-col">
                  <Label className="mb-3 block text-sm font-semibold">Template Editor</Label>
                  <div
                    ref={containerRef}
                    className="flex-1 w-full rounded-xl border border-primary/15 bg-background [&_.ql-toolbar]:!border-0 [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-primary/15 [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:!bg-card [&_.ql-container]:!border-0 [&_.ql-editor]:!min-h-[360px] [&_.ql-editor]:lg:!min-h-[420px] [&_.ql-editor]:!p-4 lg:[&_.ql-editor]:!p-6 [&_.ql-editor]:!leading-relaxed mt-3 overflow-auto"
                  />
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col">
                <CardContent className="pt-6 px-4 lg:px-6 pb-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Label className="text-sm font-medium">Live Preview</Label>
                    <Badge variant="secondary" className="text-xs">
                      {previewData.student_name}
                    </Badge>
                  </div>
                  {showPreview ? (
                    <div className="flex-1 min-h-[500px] overflow-auto rounded-xl border bg-muted/40 p-3 lg:p-6">
                      <div
                        className="mx-auto w-full max-w-[820px] rounded-md bg-white text-black shadow-xl ring-1 ring-black/10 p-5 sm:p-8"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[500px] flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-2xl bg-gradient-to-br from-muted/30 to-background/50">
                      <div className="text-center space-y-3">
                        <PreviewIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-1">Preview Ready</h3>
                          <p className="text-sm text-muted-foreground/80">Click Preview to see the full report with school colors</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </QuillEditorProvider>
    )
  }
)

ReportTemplateEditor.displayName = 'ReportTemplateEditor'

export { ReportTemplateEditor }
export { useQuillEditor } from './QuillEditorContext'
