"use client"

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Eye as PreviewIcon, Download, Save } from "lucide-react"
import { VariableInserter } from './VariableInserter'
import { academicsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Skeleton } from "@/components/ui/skeleton"
import { QuillEditorProvider } from './QuillEditorContext'
import type { ReactNode } from 'react'

// Mock preview data - replace with real student data in full page
const MOCK_PREVIEW_DATA = {
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
  ({ templateId, initialHTML = '', onSave, previewData = MOCK_PREVIEW_DATA, readOnly = false, className }, ref) => {
    const quillRef = useRef<Quill | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(false)
// toast polyfill - use sonner toast
// showToast removed - use toast directly

    // Expose editor methods
    useImperativeHandle(ref, () => ({
      getHTML: () => {
        return quillRef.current?.root.innerHTML || ''
      },
      setHTML: (html: string) => {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = html
        }
      }
    }))

    // Initialize Quill
    useEffect(() => {
      if (containerRef.current && !quillRef.current) {
        const quill = new Quill(containerRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'align': [] }],
              ['link', 'image'],
              ['clean']
            ]
          },
          placeholder: 'Start designing your report template... Use the Variable Inserter to add dynamic fields like {{student_name}}, {{subjects_table}}'
        })
        quillRef.current = quill

        // Load initial HTML
        if (initialHTML) {
          quill.root.innerHTML = initialHTML
        }
      }
    }, [])

    const previewTemplate = useCallback(async () => {
      if (!quillRef.current || !templateId) return

      setLoading(true)
      try {
        const htmlContent = quillRef.current.root.innerHTML
        const response = await academicsAPI.templatePreview(templateId, { 
          html_template: htmlContent, 
          student_data: previewData 
        })
        setPreviewHtml(response.data.rendered_html)
        setShowPreview(true)
        toast.success("Preview generated!")
      } catch (error) {
        toast.error("Preview failed")
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
          student_data: previewData 
        })
        
        // Download PDF
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
      <div className={`max-w-6xl mx-auto px-4 lg:px-6 xl:px-8 ${className || ''}`}>
        <div className="max-w-4xl mx-auto px-4 lg:px-6 mb-6">
          <div className="flex gap-3 mb-6 flex-wrap items-center">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch min-h-[600px] xl:min-h-[700px] h-fit">
            {/* Editor */}
            <Card className="h-full flex flex-col">
              <CardContent className="pt-6 px-6 lg:px-8 pb-6 flex-1 flex flex-col">
                <Label className="mb-3 block">Template Editor</Label>
                <div 
                  ref={containerRef} 
                  className="flex-1 max-w-4xl mx-auto w-full [&_.ql-toolbar]:!max-w-4xl [&_.ql-toolbar]:!mx-auto [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-primary/20 [&_.ql-container]:!max-w-4xl [&_.ql-container]:!mx-auto [&_.ql-container]:!border [&_.ql-editor]:!min-h-[450px] [&_.ql-editor]:!p-6 lg:p-8 xl:p-12 [&_.ql-editor]:!leading-relaxed mt-2 overflow-auto"
                />

              </CardContent>
            </Card>

            {/* Preview Pane */}
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
                    className="prose prose-sm max-w-none flex-1 min-h-[450px] p-6 lg:p-8 xl:p-12 border rounded-xl bg-gradient-to-br from-background to-muted overflow-auto"
                    dangerouslySetInnerHTML={{ __html: previewHtml }} 
                  />
                ) : (
                  <Skeleton className="h-[450px] w-full rounded-lg flex-1" />
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </QuillEditorProvider>
  );
});

ReportTemplateEditor.displayName = 'ReportTemplateEditor';

export { ReportTemplateEditor };
export { useQuillEditor } from './QuillEditorContext';

