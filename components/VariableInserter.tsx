"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, User, Award, Users, Calendar, CheckCircle, Image } from "lucide-react"
import { useQuillEditor } from "./QuillEditorContext"

const VARIABLES = [
  { key: "{{student_name}}", label: "Student Name", icon: User },
  { key: "{{student_id}}", label: "Student ID", icon: User },
  { key: "{{class_name}}", label: "Class", icon: Users },
  { key: "{{school_name}}", label: "School Name", icon: Users },
  { key: "{{school_logo}}", label: "School Logo", icon: Image },
  { key: "{{session_name}}", label: "Session/Term", icon: Calendar },
  { key: "{{total_marks}}", label: "Total Marks", icon: Award },
  { key: "{{average_marks}}", label: "Average %", icon: Award },
  { key: "{{position}}", label: "Position", icon: Award },
  { key: "{{total_students}}", label: "Class Size", icon: Users },
  { key: "{{grade}}", label: "Overall Grade", icon: CheckCircle },
  { key: "{{attendance_percentage}}", label: "Attendance %", icon: Calendar },
  { key: "{{subjects_table}}", label: "Subjects Table", icon: FileText },
  { key: "{{form_teacher_remarks}}", label: "Teacher Remarks", icon: FileText },
  { key: "{{principal_remarks}}", label: "Principal Remarks", icon: FileText },
] as const

interface VariableInserterProps {
  className?: string
}

export function VariableInserter({ className }: VariableInserterProps) {
  const { getEditor } = useQuillEditor()

  const insertVariable = (variable: string) => {
    const quill = getEditor()
    if (!quill) return
    
    const range = quill.getSelection(true)
    quill.insertText(range.index || 0, variable)
    quill.setSelection((range.index || 0) + variable.length, 0)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <FileText className="w-4 h-4 mr-1" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {VARIABLES.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="ghost"
              className="h-auto p-2 justify-start text-left hover:bg-muted"
              onClick={() => insertVariable(key)}
            >
              <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{key}</div>
                <div className="text-xs">{label}</div>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

