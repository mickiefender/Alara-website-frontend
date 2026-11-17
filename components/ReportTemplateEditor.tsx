"use client"

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download, LayoutTemplate, Table2, Paintbrush, Image as ImageIcon, GripVertical, Move } from "lucide-react"
import { VariableInserter } from './VariableInserter'
import { academicsAPI } from '@/lib/api'
import { useSchoolTheme } from '@/components/school-theme-provider'
import { toast } from 'sonner'
import { QuillEditorProvider } from './QuillEditorContext'
import { Input } from '@/components/ui/input'

/* ------------------------------------------------------------------ */
/*  Shared style helpers used by the preset + local renderer           */
/* ------------------------------------------------------------------ */

const GREEN = '#1a7a4a'
const CELL = `border:1px solid #94a3b8; padding:4px 6px;`
type QuillDelta = ReturnType<Quill['getContents']>
const Delta = Quill.import('delta') as new () => QuillDelta

interface StyleAttributorFormat {
  scope: number
  constructor: new (
    attrName: string,
    keyName: string,
    options: { scope: number; whitelist?: string[] },
  ) => { attrName: string }
}
const backgroundStyle = Quill.import('formats/background') as StyleAttributorFormat
const alignStyle = Quill.import('formats/align') as Pick<StyleAttributorFormat, 'scope'>
const parchment = Quill.import('parchment') as { Scope: { ANY: number } }
const SectionBackground = new backgroundStyle.constructor(
  'sectionBackground',
  'background-color',
  { scope: alignStyle.scope },
)
Quill.register('formats/sectionBackground', SectionBackground, true)
const TemplatePosition = new backgroundStyle.constructor(
  'templatePosition',
  'position',
  { scope: parchment.Scope.ANY, whitelist: ['absolute'] },
)
const TemplateLeft = new backgroundStyle.constructor(
  'templateLeft',
  'left',
  { scope: parchment.Scope.ANY },
)
const TemplateTop = new backgroundStyle.constructor(
  'templateTop',
  'top',
  { scope: parchment.Scope.ANY },
)
Quill.register('formats/templatePosition', TemplatePosition, true)
Quill.register('formats/templateLeft', TemplateLeft, true)
Quill.register('formats/templateTop', TemplateTop, true)

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
  previewData?: any
  readOnly?: boolean
  className?: string
}

type ImageResizeDirection = 'left' | 'right' | 'top' | 'bottom'

interface ImageResizeSession {
  pointerId: number
  direction: ImageResizeDirection
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  image: HTMLImageElement
  index: number
}

const ReportTemplateEditor = forwardRef<TemplateEditorRef, ReportTemplateEditorProps>(
  ({ templateId, initialHTML = '', previewData = BASE_MOCK_PREVIEW_DATA, readOnly = false, className }, ref) => {
    const { schoolTheme } = useSchoolTheme()
    const quillRef = useRef<Quill | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)
    const selectionRef = useRef<{ index: number; length: number }>({ index: 0, length: 0 })
    const draggedElementRef = useRef<HTMLElement | null>(null)
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const freePositionModeRef = useRef(false)
    const hoveredElementRef = useRef<HTMLElement | null>(null)
    const selectedImageElementRef = useRef<HTMLImageElement | null>(null)
    const imageResizeSessionRef = useRef<ImageResizeSession | null>(null)
    const [dragHandlePosition, setDragHandlePosition] = useState<{ top: number; left: number } | null>(null)
    const [imageResizeBounds, setImageResizeBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
    const [freePositionMode, setFreePositionMode] = useState(false)
    const [tableRows, setTableRows] = useState('3')
    const [tableColumns, setTableColumns] = useState('3')
    const [backgroundColor, setBackgroundColor] = useState('#fff2cc')
    const [sectionColor, setSectionColor] = useState('#eaf5ef')
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
    const [imageWidth, setImageWidth] = useState('')
    const [imageHeight, setImageHeight] = useState('')

    const updateImageResizeBounds = useCallback((image = selectedImageElementRef.current) => {
      const workspace = workspaceRef.current
      if (!image?.isConnected || !workspace || readOnly) {
        setImageResizeBounds(null)
        return
      }
      const imageRect = image.getBoundingClientRect()
      const workspaceRect = workspace.getBoundingClientRect()
      setImageResizeBounds({
        top: imageRect.top - workspaceRect.top,
        left: imageRect.left - workspaceRect.left,
        width: imageRect.width,
        height: imageRect.height,
      })
    }, [readOnly])

    const getHTML = useCallback(() => {
      const root = quillRef.current?.root
      if (!root) return ''
      const html = root.innerHTML
      if (!root.querySelector('[style*="position: absolute"]')) return html
      return `<div class="report-template-canvas" style="position:relative; min-height:${Math.max(root.scrollHeight, root.clientHeight)}px;">${html}</div>`
    }, [])

    useImperativeHandle(ref, () => ({
      getHTML,
      setHTML: (html: string) => {
        const quill = quillRef.current
        if (!quill) return
        quill.setText('', 'silent')
        if (html) {
          const parsed = document.createElement('div')
          parsed.innerHTML = html
          const canvas = parsed.firstElementChild
          const content = parsed.childElementCount === 1 && canvas?.classList.contains('report-template-canvas')
            ? canvas.innerHTML
            : html
          quill.clipboard.dangerouslyPasteHTML(0, content, 'silent')
        }
      }
    }), [getHTML])

    useEffect(() => {
      if (containerRef.current && !quillRef.current) {
        const quill = new Quill(containerRef.current, {
          theme: 'snow',
          modules: {
            table: true,
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
        if (initialHTML) {
          const parsed = document.createElement('div')
          parsed.innerHTML = initialHTML
          const canvas = parsed.firstElementChild
          const content = parsed.childElementCount === 1 && canvas?.classList.contains('report-template-canvas')
            ? canvas.innerHTML
            : initialHTML
          quill.clipboard.dangerouslyPasteHTML(0, content, 'silent')
        }
        quill.root.style.position = 'relative'
        const minimumEditorHeight = Number.parseFloat(window.getComputedStyle(quill.root).minHeight) || 420
        const syncCanvasHeight = () => {
          const rootRect = quill.root.getBoundingClientRect()
          const positionedBottom = Array.from(quill.root.querySelectorAll<HTMLElement>('*'))
            .filter((element) => window.getComputedStyle(element).position === 'absolute')
            .reduce((bottom, element) => Math.max(
              bottom,
              element.getBoundingClientRect().bottom - rootRect.top + quill.root.scrollTop,
            ), 0)
          quill.root.style.minHeight = `${Math.max(minimumEditorHeight, Math.ceil(positionedBottom + 32))}px`
        }
        syncCanvasHeight()

        const getRootBlock = (target: EventTarget | null) => {
          let element = target instanceof HTMLElement ? target : target instanceof Node ? target.parentElement : null
          while (element && element.parentElement !== quill.root) element = element.parentElement
          return element?.parentElement === quill.root ? element : null
        }

        const getMoveTarget = (target: EventTarget | null) => {
          const element = target instanceof HTMLElement ? target : target instanceof Node ? target.parentElement : null
          if (element instanceof HTMLImageElement) return element
          const listItem = element?.closest('li')
          if (listItem && quill.root.contains(listItem)) return listItem
          const line = element?.closest('p, h1, h2, h3, h4, h5, h6, blockquote, pre')
          if (line && quill.root.contains(line)) return line as HTMLElement
          let current = element
          while (current && current.parentElement !== quill.root) {
            if (
              current.tagName === 'DIV' &&
              !current.querySelector('div, p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre')
            ) return current
            current = current.parentElement
          }
          return getRootBlock(element)
        }

        const getBlotRange = (element: HTMLElement) => {
          const blot = Quill.find(element)
          if (!blot || !('length' in blot) || typeof blot.length !== 'function') return null
          return { index: quill.getIndex(blot), length: blot.length() }
        }

        const updateDragHandlePosition = (element: HTMLElement | null) => {
          if (!element || !getBlotRange(element) || !workspaceRef.current) {
            hoveredElementRef.current = null
            setDragHandlePosition(null)
            return
          }
          hoveredElementRef.current = element
          const elementRect = element.getBoundingClientRect()
          const workspaceRect = workspaceRef.current.getBoundingClientRect()
          const nextPosition = {
            top: elementRect.top - workspaceRect.top + workspaceRef.current.scrollTop,
            left: Math.max(0, elementRect.left - workspaceRect.left + workspaceRef.current.scrollLeft - 30),
          }
          setDragHandlePosition((current) => (
            current?.top === nextPosition.top && current.left === nextPosition.left
              ? current
              : nextPosition
          ))
        }

        const clearDropIndicator = () => {
          quill.root.querySelectorAll<HTMLElement>('[data-template-drop-target]').forEach((element) => {
            element.style.outline = ''
            delete element.dataset.templateDropTarget
          })
          quill.root.style.outline = ''
          delete quill.root.dataset.templateFreeDropTarget
        }

        const handleDragOver = (event: DragEvent) => {
          if (!draggedElementRef.current) return
          if (freePositionModeRef.current) {
            event.preventDefault()
            clearDropIndicator()
            quill.root.dataset.templateFreeDropTarget = 'true'
            quill.root.style.outline = '2px dashed #1a7a4a'
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
            return
          }
          const target = getMoveTarget(event.target)
          if (!target || target === draggedElementRef.current || !getBlotRange(target)) return
          event.preventDefault()
          clearDropIndicator()
          target.dataset.templateDropTarget = 'true'
          target.style.outline = '2px dashed #1a7a4a'
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
        }

        const handleDrop = (event: DragEvent) => {
          const sourceElement = draggedElementRef.current
          if (!sourceElement) return
          if (freePositionModeRef.current) {
            event.preventDefault()
            clearDropIndicator()
            const rootRect = quill.root.getBoundingClientRect()
            const sourceRange = getBlotRange(sourceElement)
            if (
              !sourceRange ||
              event.clientX < rootRect.left ||
              event.clientX > rootRect.right ||
              event.clientY < rootRect.top ||
              event.clientY > rootRect.bottom
            ) return

            const rootStyle = window.getComputedStyle(quill.root)
            const borderLeft = Number.parseFloat(rootStyle.borderLeftWidth) || 0
            const borderTop = Number.parseFloat(rootStyle.borderTopWidth) || 0
            const left = Math.max(
              0,
              Math.round(event.clientX - rootRect.left - borderLeft + quill.root.scrollLeft - dragOffsetRef.current.x),
            )
            const top = Math.max(
              0,
              Math.round(event.clientY - rootRect.top - borderTop + quill.root.scrollTop - dragOffsetRef.current.y),
            )
            const formats = {
              templatePosition: 'absolute',
              templateLeft: `${left}px`,
              templateTop: `${top}px`,
            }
            if (sourceElement instanceof HTMLImageElement) {
              quill.formatText(sourceRange.index, 1, formats, 'user')
            } else {
              quill.formatLine(sourceRange.index, Math.max(sourceRange.length, 1), formats, 'user')
            }
            syncCanvasHeight()
            quill.setSelection(Math.min(sourceRange.index, quill.getLength() - 1), 0, 'silent')
            quill.focus()
            updateDragHandlePosition(sourceElement)
            toast.success(sourceElement instanceof HTMLImageElement ? 'Image positioned.' : 'Text positioned.')
            return
          }

          const targetElement = getMoveTarget(event.target)
          if (!targetElement) return
          event.preventDefault()
          clearDropIndicator()

          const sourceRange = getBlotRange(sourceElement)
          const targetRange = getBlotRange(targetElement)
          if (!sourceRange || !targetRange || sourceElement === targetElement) return

          const targetRect = targetElement.getBoundingClientRect()
          const dropAfter = event.clientY >= targetRect.top + targetRect.height / 2
          const destination = targetRange.index + (dropAfter ? targetRange.length : 0)
          if (destination >= sourceRange.index && destination <= sourceRange.index + sourceRange.length) return

          const insertionIndex = destination > sourceRange.index ? destination - sourceRange.length : destination
          const movedContents = quill.getContents(sourceRange.index, sourceRange.length)
          const change = new Delta()
          const moveChange = sourceRange.index < destination
            ? change
              .retain(sourceRange.index)
              .delete(sourceRange.length)
              .retain(destination - sourceRange.index - sourceRange.length)
              .concat(movedContents)
            : change
              .retain(insertionIndex)
              .concat(movedContents)
              .retain(sourceRange.index - insertionIndex)
              .delete(sourceRange.length)

          quill.updateContents(moveChange, 'user')
          quill.setSelection(Math.min(insertionIndex, quill.getLength() - 1), 0, 'silent')
          quill.focus()
          draggedElementRef.current = null
          updateDragHandlePosition(targetElement)
          toast.success(sourceElement instanceof HTMLImageElement ? 'Image moved.' : 'Content block moved.')
        }

        const handleMouseMove = (event: MouseEvent) => {
          updateDragHandlePosition(getMoveTarget(event.target))
        }

        const handleScroll = () => {
          if (hoveredElementRef.current) updateDragHandlePosition(hoveredElementRef.current)
          updateImageResizeBounds()
        }

        quill.root.addEventListener('dragover', handleDragOver)
        quill.root.addEventListener('drop', handleDrop)
        quill.root.addEventListener('mousemove', handleMouseMove)
        quill.root.addEventListener('scroll', handleScroll)
        containerRef.current?.addEventListener('scroll', handleScroll)

        const handleSelectionChange = (range: { index: number; length: number } | null) => {
          if (!range) return
          selectionRef.current = range
          const imagePosition = [range.index, range.index - 1].find((index) => {
            if (index < 0) return false
            const [leaf] = quill.getLeaf(index)
            return leaf?.domNode instanceof HTMLImageElement
          })
          if (imagePosition !== undefined) {
            const [leaf] = quill.getLeaf(imagePosition)
            if (!(leaf?.domNode instanceof HTMLImageElement)) return
            const image = leaf.domNode
            selectedImageElementRef.current = image
            setSelectedImageIndex(imagePosition)
            setImageWidth(image.getAttribute('width') || String(Math.round(image.getBoundingClientRect().width || image.naturalWidth || 120)))
            setImageHeight(image.getAttribute('height') || String(Math.round(image.getBoundingClientRect().height || image.naturalHeight || 80)))
            updateImageResizeBounds(image)
          } else {
            selectedImageElementRef.current = null
            setSelectedImageIndex(null)
            setImageResizeBounds(null)
          }
        }
        quill.on('selection-change', handleSelectionChange)
      }
    }, [initialHTML, schoolTheme?.primary_color, schoolTheme?.secondary_color, readOnly, updateImageResizeBounds])

    useEffect(() => {
      if (selectedImageIndex === null) return
      const updateOnResize = () => updateImageResizeBounds()
      window.addEventListener('resize', updateOnResize)
      return () => window.removeEventListener('resize', updateOnResize)
    }, [selectedImageIndex, updateImageResizeBounds])

    const startImageResize = useCallback((
      direction: ImageResizeDirection,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      const image = selectedImageElementRef.current
      const quill = quillRef.current
      if (readOnly || !image || selectedImageIndex === null || !quill) return
      event.preventDefault()
      event.stopPropagation()
      const rect = image.getBoundingClientRect()
      imageResizeSessionRef.current = {
        pointerId: event.pointerId,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        image,
        index: selectedImageIndex,
      }
      workspaceRef.current?.setPointerCapture(event.pointerId)
    }, [readOnly, selectedImageIndex])

    const handleImageResizeMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      const session = imageResizeSessionRef.current
      if (!session || event.pointerId !== session.pointerId) return
      event.preventDefault()
      const deltaX = event.clientX - session.startX
      const deltaY = event.clientY - session.startY
      const width = Math.max(
        1,
        session.startWidth + (session.direction === 'right' ? deltaX : session.direction === 'left' ? -deltaX : 0),
      )
      const height = Math.max(
        1,
        session.startHeight + (session.direction === 'bottom' ? deltaY : session.direction === 'top' ? -deltaY : 0),
      )
      session.image.style.width = `${width}px`
      session.image.style.height = `${height}px`
      setImageWidth(String(Math.round(width)))
      setImageHeight(String(Math.round(height)))
      updateImageResizeBounds(session.image)
    }, [updateImageResizeBounds])

    const finishImageResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      const session = imageResizeSessionRef.current
      if (!session || event.pointerId !== session.pointerId) return
      event.preventDefault()
      const quill = quillRef.current
      const width = Math.max(1, Math.round(session.image.getBoundingClientRect().width))
      const height = Math.max(1, Math.round(session.image.getBoundingClientRect().height))
      if (quill) {
        quill.formatText(session.index, 1, { width: String(width), height: String(height) }, 'user')
        const [leaf] = quill.getLeaf(session.index)
        if (leaf?.domNode instanceof HTMLImageElement) {
          session.image = leaf.domNode
          selectedImageElementRef.current = leaf.domNode
        }
      }
      session.image.style.width = ''
      session.image.style.height = ''
      imageResizeSessionRef.current = null
      setImageWidth(String(width))
      setImageHeight(String(height))
      if (quill) {
        const rootRect = quill.root.getBoundingClientRect()
        const imageRect = session.image.getBoundingClientRect()
        quill.root.style.minHeight = `${Math.max(
          quill.root.clientHeight,
          imageRect.bottom - rootRect.top + quill.root.scrollTop + 32,
        )}px`
      }
      updateImageResizeBounds(session.image)
    }, [updateImageResizeBounds])

    const handleDragGripStart = useCallback((event: React.DragEvent<HTMLButtonElement>) => {
      const source = hoveredElementRef.current
      if (readOnly || !source) {
        event.preventDefault()
        return
      }
      event.stopPropagation()
      draggedElementRef.current = source
      const sourceRect = source.getBoundingClientRect()
      dragOffsetRef.current = {
        x: event.clientX - sourceRect.left,
        y: event.clientY - sourceRect.top,
      }
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', 'report-template-block')
    }, [readOnly])

    const handleDragGripEnd = useCallback(() => {
      draggedElementRef.current = null
      quillRef.current?.root.querySelectorAll<HTMLElement>('[data-template-drop-target]').forEach((element) => {
        element.style.outline = ''
        delete element.dataset.templateDropTarget
      })
      if (quillRef.current) {
        quillRef.current.root.style.outline = ''
        delete quillRef.current.root.dataset.templateFreeDropTarget
      }
    }, [])

    const toggleFreePositionMode = useCallback(() => {
      const enabled = !freePositionModeRef.current
      freePositionModeRef.current = enabled
      setFreePositionMode(enabled)
      toast.success(enabled ? 'Free placement enabled. Drop items anywhere in the editor.' : 'Block reordering enabled.')
    }, [])

    const restoreSelection = useCallback((quill: Quill) => {
      const { index, length } = selectionRef.current
      const safeIndex = Math.min(index, Math.max(quill.getLength() - 1, 0))
      quill.focus()
      quill.setSelection(safeIndex, Math.min(length, quill.getLength() - safeIndex - 1), 'silent')
      return { index: safeIndex, length: Math.min(length, quill.getLength() - safeIndex - 1) }
    }, [])

    const insertTable = useCallback(() => {
      const rows = Number(tableRows)
      const columns = Number(tableColumns)
      if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1 || rows > 20 || columns > 12) {
        toast.error('Choose 1–20 rows and 1–12 columns for the table.')
        return
      }

      const quill = quillRef.current
      if (!quill) return
      const tableModule = quill.getModule('table') as { insertTable: (rows: number, columns: number) => void } | undefined
      if (!tableModule || typeof tableModule.insertTable !== 'function') {
        toast.error('Table insertion is unavailable. Please reload the editor and try again.')
        return
      }
      restoreSelection(quill)
      tableModule.insertTable(rows, columns)
      toast.success('Table inserted.')
    }, [tableRows, tableColumns, restoreSelection])

    const applyTextBackground = useCallback(() => {
      const quill = quillRef.current
      if (!quill) return
      const range = restoreSelection(quill)
      if (range.length > 0) {
        quill.formatText(range.index, range.length, 'background', backgroundColor, 'user')
      } else {
        quill.format('background', backgroundColor, 'user')
      }
    }, [backgroundColor, restoreSelection])

    const applySectionBackground = useCallback(() => {
      const quill = quillRef.current
      if (!quill) return
      const range = restoreSelection(quill)
      quill.formatLine(range.index, Math.max(range.length, 1), 'sectionBackground', sectionColor, 'user')
    }, [sectionColor, restoreSelection])

    const clearBackgrounds = useCallback(() => {
      const quill = quillRef.current
      if (!quill) return
      const range = restoreSelection(quill)
      quill.formatLine(range.index, Math.max(range.length, 1), 'sectionBackground', false, 'user')
      if (range.length > 0) {
        quill.formatText(range.index, range.length, 'background', false, 'user')
      } else {
        quill.format('background', false, 'user')
      }
    }, [restoreSelection])

    const applyImageSize = useCallback(() => {
      const quill = quillRef.current
      const width = Number(imageWidth)
      const height = Number(imageHeight)
      if (!quill || selectedImageIndex === null) return
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        toast.error('Enter a positive image width and height in pixels.')
        return
      }
      quill.formatText(selectedImageIndex, 1, { width: String(width), height: String(height) }, 'user')
      const [leaf] = quill.getLeaf(selectedImageIndex)
      if (leaf?.domNode instanceof HTMLImageElement) {
        selectedImageElementRef.current = leaf.domNode
        updateImageResizeBounds(leaf.domNode)
      }
      toast.success('Image size updated.')
    }, [imageWidth, imageHeight, selectedImageIndex, updateImageResizeBounds])

    const generatePDF = useCallback(async () => {
      if (!quillRef.current || !templateId) return
      try {
        const htmlContent = getHTML()
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
    }, [templateId, previewData, getHTML])

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
              <Button onClick={generatePDF} disabled={!templateId} size="sm" variant="outline" title={templateId ? undefined : "Save the template first to generate a PDF"}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>

            <div className="min-h-[520px] h-full">
              <Card className="h-full w-full flex flex-col border-primary/15 shadow-sm">
                <CardContent className="pt-5 px-4 lg:px-6 pb-5 flex-1 flex flex-col">
                  <Label className="mb-3 block text-sm font-semibold">Template Editor</Label>
                  {!readOnly && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      Drag the grip beside an item to move it. Enable free placement to position text and images anywhere on the page.
                    </p>
                  )}
                  {!readOnly && (
                    <div className="mb-3 flex flex-wrap items-end gap-3 rounded-lg border border-primary/15 bg-muted/20 p-3" role="toolbar" aria-label="Template layout tools">
                      <Button
                        type="button"
                        size="sm"
                        variant={freePositionMode ? "default" : "outline"}
                        aria-pressed={freePositionMode}
                        onClick={toggleFreePositionMode}
                        className="h-8"
                      >
                        <Move className="mr-1.5 h-4 w-4" />
                        Free placement {freePositionMode ? "On" : "Off"}
                      </Button>
                      <div className="flex items-end gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="table-rows" className="text-xs">Rows</Label>
                          <Input id="table-rows" type="number" min={1} max={20} value={tableRows} onChange={(event) => setTableRows(event.target.value)} className="h-8 w-16" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="table-columns" className="text-xs">Columns</Label>
                          <Input id="table-columns" type="number" min={1} max={12} value={tableColumns} onChange={(event) => setTableColumns(event.target.value)} className="h-8 w-20" />
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={insertTable} className="h-8">
                          <Table2 className="mr-1.5 h-4 w-4" /> Insert table
                        </Button>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="template-background-color" className="text-xs">Text background</Label>
                          <Input id="template-background-color" aria-label="Text background color" type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-8 w-12 cursor-pointer p-1" />
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={applyTextBackground} className="h-8">
                          <Paintbrush className="mr-1.5 h-4 w-4" /> Apply to text
                        </Button>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="template-section-color" className="text-xs">Section color</Label>
                          <Input id="template-section-color" aria-label="Section background color" type="color" value={sectionColor} onChange={(event) => setSectionColor(event.target.value)} className="h-8 w-12 cursor-pointer p-1" />
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={applySectionBackground} className="h-8">
                          <Paintbrush className="mr-1.5 h-4 w-4" /> Apply to section
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={clearBackgrounds} className="h-8">Clear colors</Button>
                      </div>

                      {selectedImageIndex !== null && (
                        <div className="flex items-end gap-2 border-l pl-3">
                          <ImageIcon className="mb-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <div className="space-y-1">
                            <Label htmlFor="image-width" className="text-xs">Image width (px)</Label>
                            <Input id="image-width" type="number" min={0.1} step="any" value={imageWidth} onChange={(event) => setImageWidth(event.target.value)} className="h-8 w-24" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="image-height" className="text-xs">Image height (px)</Label>
                            <Input id="image-height" type="number" min={0.1} step="any" value={imageHeight} onChange={(event) => setImageHeight(event.target.value)} className="h-8 w-24" />
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={applyImageSize} className="h-8">Apply size</Button>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    ref={workspaceRef}
                    className="relative min-h-[420px] flex-1"
                    onPointerMove={handleImageResizeMove}
                    onPointerUp={finishImageResize}
                    onPointerCancel={finishImageResize}
                  >
                    <div
                      ref={containerRef}
                      className="h-full w-full rounded-xl border border-primary/15 bg-background [&_.ql-toolbar]:!border-0 [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-primary/15 [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:!bg-card [&_.ql-container]:!border-0 [&_.ql-editor]:!min-h-[360px] [&_.ql-editor]:lg:!min-h-[420px] [&_.ql-editor]:!p-4 lg:[&_.ql-editor]:!p-6 [&_.ql-editor]:!leading-relaxed mt-3 overflow-auto"
                    />
                    {!readOnly && imageResizeBounds && selectedImageIndex !== null && (
                      <div
                        aria-label="Image resize controls"
                        data-image-resize-overlay
                        className="pointer-events-none absolute z-30 border border-primary"
                        style={{
                          top: imageResizeBounds.top,
                          left: imageResizeBounds.left,
                          width: imageResizeBounds.width,
                          height: imageResizeBounds.height,
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Resize image width from left edge"
                          onPointerDown={(event) => startImageResize('left', event)}
                          className="pointer-events-auto absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 touch-none rounded-full border border-primary bg-background shadow-sm cursor-ew-resize"
                        />
                        <button
                          type="button"
                          aria-label="Resize image width from right edge"
                          onPointerDown={(event) => startImageResize('right', event)}
                          className="pointer-events-auto absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 touch-none rounded-full border border-primary bg-background shadow-sm cursor-ew-resize"
                        />
                        <button
                          type="button"
                          aria-label="Resize image height from top edge"
                          onPointerDown={(event) => startImageResize('top', event)}
                          className="pointer-events-auto absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 touch-none rounded-full border border-primary bg-background shadow-sm cursor-ns-resize"
                        />
                        <button
                          type="button"
                          aria-label="Resize image height from bottom edge"
                          onPointerDown={(event) => startImageResize('bottom', event)}
                          className="pointer-events-auto absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 touch-none rounded-full border border-primary bg-background shadow-sm cursor-ns-resize"
                        />
                      </div>
                    )}
                    {!readOnly && dragHandlePosition && (
                      <Button
                        type="button"
                        draggable
                        size="icon-sm"
                        variant="outline"
                        aria-label="Drag content block to move it"
                        title={freePositionMode ? "Drag and drop anywhere in the editor to position this item" : "Drag this handle to reorder the block"}
                        onDragStart={handleDragGripStart}
                        onDragEnd={handleDragGripEnd}
                        className="absolute z-20 cursor-grab active:cursor-grabbing shadow-md"
                        style={{ top: dragHandlePosition.top, left: dragHandlePosition.left }}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
