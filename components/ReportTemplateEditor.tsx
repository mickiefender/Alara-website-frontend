"use client"

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye as PreviewIcon, Download, Save } from "lucide-react"
import { VariableInserter } from './VariableInserter'
import { academicsAPI } from '@/lib/api'
import { useSchoolTheme } from '@/components/school-theme-provider'
import { toast } from 'sonner'
import { QuillEditorProvider } from './QuillEditorContext'

const BASE_MOCK_PREVIEW_DATA = {
  student_name: "John Doe",
  student_id: "STU001",
  class_name: "SS2A",
  school_name: "Elite Academy",
  session_name: "2023/2024 Second Term",
  total_marks: 452.5,
  average_marks: 75.4,
  position: 3,
  total_students: 45,
  grade: "B",
  attendance_percentage: 94.2,
  form_teacher_remarks: "Excellent performance, continues to show great improvement.",
  principal_remarks: "Keep up the good work!",
  school_logo: '/api/school/logo',
  subject_scores: [
    { subject_name: "Mathematics", percentage: 82, grade: "B", subject_position: "2/45" },
    { subject_name: "English", percentage: 78, grade: "B", subject_position: "5/45" },
    { subject_name: "Physics", percentage: 71, grade: "C", subject_position: "8/45" },
  ]
}

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
                  schoolTheme?.primary_color || '#008484',
                  schoolTheme?.secondary_color || '#f1f5f9'
                ]
              }, {
                background: [
                  '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc',
                  '#cce0f5', '#ebd5ff',
                  schoolTheme?.primary_color || '#008484',
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
          placeholder: `Design with your school colors: Primary ${schoolTheme?.primary_color || '#008484'}, Secondary ${schoolTheme?.secondary_color || '#f1f5f9'}.`
        })
        quillRef.current = quill
        if (initialHTML) quill.root.innerHTML = initialHTML
      }
    }, [initialHTML, schoolTheme?.primary_color, schoolTheme?.secondary_color])

    const previewTemplate = useCallback(async () => {
      if (!quillRef.current || !templateId) return
      setLoading(true)
      try {
        const htmlContent = quillRef.current.root.innerHTML
        const response = await academicsAPI.templatePreview(templateId, {
          html_template: htmlContent,
          preview_data: previewData
        })
        setPreviewHtml(response.data.rendered_html)
        setShowPreview(true)
        toast.success("Preview generated with school theme!")
      } catch (error) {
        toast.error("Preview failed - check backend connection")
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
          <div className="w-full mb-4 lg:mb-6">
            <div className="flex gap-2.5 mb-4 lg:mb-5 flex-wrap items-center">
              <VariableInserter />
              <Button onClick={previewTemplate} disabled={loading || !templateId} size="sm">
                {loading ? "..." : <PreviewIcon className="w-4 h-4 mr-1" />}
                Preview
              </Button>
              <Button onClick={generatePDF} disabled={!templateId} size="sm" variant="outline">
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

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 lg:gap-6 items-stretch min-h-[520px] h-full">
              <Card className="h-full flex flex-col border-primary/15 shadow-sm">
                <CardContent className="pt-5 px-4 lg:px-6 pb-5 flex-1 flex flex-col">
                  <Label className="mb-3 block text-sm font-semibold">Template Editor</Label>
                  <div
                    ref={containerRef}
                    className="flex-1 w-full rounded-xl border border-primary/15 bg-background [&_.ql-toolbar]:!border-0 [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-primary/15 [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:!bg-card [&_.ql-container]:!border-0 [&_.ql-editor]:!min-h-[360px] [&_.ql-editor]:lg:!min-h-[420px] [&_.ql-editor]:!p-4 lg:[&_.ql-editor]:!p-6 [&_.ql-editor]:!leading-relaxed mt-3 overflow-auto"
                  />
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col xl:order-first">
                <CardContent className="pt-6 px-6 lg:px-8 pb-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Label className="text-sm font-medium">Live Preview</Label>
                    <Badge variant="secondary" className="text-xs">
                      {previewData.student_name}
                    </Badge>
                  </div>
                  {showPreview ? (
                    <div
                      className="prose prose-sm max-w-none flex-1 min-h-[500px] p-8 2xl:p-12 border rounded-2xl shadow-inner bg-gradient-to-br from-background via-card to-muted/30 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <div className="flex-1 min-h-[500px] flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-2xl bg-gradient-to-br from-muted/30 to-background/50">
                      <div className="text-center space-y-3">
                        <PreviewIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-1">Preview Ready</h3>
                          <p className="text-sm text-muted-foreground/80">Click Preview to see your template with school colors</p>
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
