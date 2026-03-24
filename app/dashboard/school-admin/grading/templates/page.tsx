"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FileText, LayoutList, Eye, Save, Trash2, Copy, Download, Plus } from 'lucide-react'
import { academicsAPI } from '@/lib/api'
import Loader from '@/components/loader'

interface TemplateSection {
  id: string
  type: 'header' | 'student_info' | 'subjects_table' | 'summary' | 'attendance' | 'remarks' | 'custom_field' | 'footer'
  title: string
  visible: boolean
  config?: any
  order: number
}

interface TerminalReportTemplate {
  id: number
  name: string
  description: string
  structure: TemplateSection[]
  is_active: boolean
  is_default: boolean
  academic_session?: number | null
  session_name?: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TerminalReportTemplate[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<TerminalReportTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSession, setSelectedSession] = useState('')

  const defaultTemplateStructure: TemplateSection[] = [
    { id: '1', type: 'header', title: 'School Header', visible: true, order: 0 },
    { id: '2', type: 'student_info', title: 'Student Information', visible: true, order: 1 },
    { id: '3', type: 'subjects_table', title: 'Subject Scores', visible: true, order: 2 },
    { id: '4', type: 'summary', title: 'Performance Summary', visible: true, order: 3 },
    { id: '5', type: 'attendance', title: 'Attendance Record', visible: true, order: 4 },
    { id: '6', type: 'remarks', title: 'Teacher Remarks', visible: true, order: 5 },
    { id: '7', type: 'footer', title: 'School Footer', visible: true, order: 6 },
  ]

  useEffect(() => {
    fetchTemplates()
    fetchSessions()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await academicsAPI.terminalReportTemplates()
      setTemplates(res.data.results || res.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await academicsAPI.academicSessions()
      setSessions(res.data.results || res.data || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const handleCreateTemplate = async () => {
    if (!editingTemplate) return
    
    try {
      const res = await academicsAPI.createTerminalReportTemplate({
        name: editingTemplate.name,
        description: editingTemplate.description,
        structure: editingTemplate.structure,
        academic_session: selectedSession ? parseInt(selectedSession) : null,
        is_active: editingTemplate.is_active,
        is_default: editingTemplate.is_default,
      })
      
      setTemplates([...templates, res.data])
      setEditingTemplate(null)
      setSelectedSession('')
    } catch (error: any) {
      console.error('Failed to save template:', error)
      alert(error?.response?.data?.error || 'Failed to save template')
    }
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return
    
    try {
      const res = await academicsAPI.updateTerminalReportTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        structure: editingTemplate.structure,
        is_active: editingTemplate.is_active,
        is_default: editingTemplate.is_default,
      })
      
      setTemplates(templates.map(t => t.id === editingTemplate.id ? res.data : t))
      setEditingTemplate(null)
    } catch (error: any) {
      console.error('Failed to update template:', error)
      alert(error?.response?.data?.error || 'Failed to update template')
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Delete this template?')) return
    
    try {
      await academicsAPI.deleteTerminalReportTemplate(id)
      setTemplates(templates.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Failed to delete template')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await academicsAPI.setTemplateDefault(id)
      setTemplates(templates.map(t => ({ ...t, is_default: t.id === id })))
    } catch (error) {
      console.error('Failed to set default:', error)
      alert('Failed to set default template')
    }
  }

  const addSection = (type: TemplateSection['type']) => {
    if (!editingTemplate) return
    
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      type,
      title: getSectionTitle(type),
      visible: true,
      order: editingTemplate.structure.length,
      config: getSectionConfig(type)
    }
    
    setEditingTemplate({
      ...editingTemplate,
      structure: [...editingTemplate.structure, newSection]
    })
  }

  const getSectionTitle = (type: TemplateSection['type']) => {
    const titles = {
      header: 'School Header',
      student_info: 'Student Information',
      subjects_table: 'Subject Scores',
      summary: 'Performance Summary',
      attendance: 'Attendance Record',
      remarks: 'Teacher Remarks',
      custom_field: 'Custom Field',
      footer: 'School Footer',
    }
    return titles[type] || 'Custom Section'
  }

  const getSectionConfig = (type: TemplateSection['type']) => {
    if (type === 'custom_field') {
      return { field: 'conduct', label: 'Conduct Grade', type: 'text' }
    }
    return {}
  }

  const updateSectionConfig = (sectionId: string, config: any) => {
    if (!editingTemplate) return
    
    setEditingTemplate({
      ...editingTemplate,
      structure: editingTemplate.structure.map(s => 
        s.id === sectionId ? { ...s, config } : s
      )
    })
  }

  const toggleSectionVisible = (sectionId: string) => {
    if (!editingTemplate) return
    
    setEditingTemplate({
      ...editingTemplate,
      structure: editingTemplate.structure.map(s => 
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      )
    })
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!editingTemplate) return
    
    const index = editingTemplate.structure.findIndex(s => s.id === sectionId)
    if (index === -1) return
    
    const newStructure = [...editingTemplate.structure]
    const temp = newStructure[index]
    if (direction === 'up' && index > 0) {
      [newStructure[index - 1], newStructure[index]] = [newStructure[index], newStructure[index - 1]]
    } else if (direction === 'down' && index < newStructure.length - 1) {
      [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]]
    }
    
    // Update orders
    newStructure.forEach((s, i) => s.order = i)
    
    setEditingTemplate({
      ...editingTemplate,
      structure: newStructure
    })
  }

  const deleteSection = (sectionId: string) => {
    if (!editingTemplate) return
    
    setEditingTemplate({
      ...editingTemplate,
      structure: editingTemplate.structure.filter(s => s.id !== sectionId)
    })
  }

  const generatePreviewData = () => {
    return {
      school: { name: 'Sample School', logo: '/placeholder.svg' },
      student: {
        first_name: 'John',
        last_name: 'Doe',
        student_id: 'STD001',
        class_name: 'Class 5A',
        session_name: '2024 First Term'
      },
      subjects_scores: [
        { subject_name: 'Mathematics', score: 85, grade: 'A' },
        { subject_name: 'English', score: 78, grade: 'B' },
        { subject_name: 'Science', score: 92, grade: 'A' },
      ],
      summary: { total_marks: 255, average: 85, position: 3, total_students: 40, grade: 'A' },
      attendance: { days_present: 95, total_days: 100, percentage: 95 },
      remarks: { teacher: 'Excellent student', principal: 'Keep up the good work' },
      custom_fields: { conduct: 'Excellent', sports: 'Good' }
    }
  }

  const renderPreview = () => {
    const previewData = generatePreviewData()
    
    return (
      <div className="bg-white shadow-lg rounded-xl p-8 border max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          {editingTemplate?.structure.map((section) => (
            section.visible && (
              <div key={section.id} className="border-b pb-6 last:border-b-0">
                <h3 className="font-semibold text-lg mb-3 bg-gray-50 p-3 rounded">{section.title}</h3>
                {renderSectionPreview(section, previewData)}
              </div>
            )
          ))}
        </div>
      </div>
    )
  }

  const renderSectionPreview = (section: TemplateSection, data: any) => {
    switch (section.type) {
      case 'header':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              School Logo
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{data.school.name}</h1>
              <p className="text-gray-600">Terminal Report {data.student.session_name}</p>
            </div>
          </div>
        )
      case 'student_info':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="font-semibold">{`${data.student.first_name} ${data.student.last_name}`}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">ID:</span>
              <p className="font-semibold">{data.student.student_id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Class:</span>
              <p className="font-semibold">{data.student.class_name}</p>
            </div>
          </div>
        )
      case 'subjects_table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Subject</th>
                  <th className="border p-3 text-left">Score</th>
                  <th className="border p-3 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects_scores.map((score: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{score.subject_name}</td>
                    <td className="p-3 font-semibold">{score.score}%</td>
                    <td className="p-3">
                      <Badge>{score.grade}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'summary':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-green-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-500 block">Average</span>
              <span className="text-xl sm:text-2xl font-bold">{data.summary.average}%</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Position</span>
              <span className="text-xl sm:text-2xl font-bold">{data.summary.position}/{data.summary.total_students}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Overall Grade</span>
              <Badge variant="destructive" className="text-base sm:text-lg px-3 sm:px-4 py-2">{data.summary.grade}</Badge>
            </div>
          </div>
        )
      case 'attendance':
        return (
          <div className="p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Attendance</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{data.attendance.percentage}%</div>
              <div>
                <p>{data.attendance.days_present}/{data.attendance.total_days} days</p>
              </div>
            </div>
          </div>
        )
      case 'remarks':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Form Teacher Remarks</h4>
              <p className="italic bg-yellow-50 p-4 rounded">{data.remarks.teacher}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Principal Remarks</h4>
              <p className="italic bg-indigo-50 p-4 rounded">{data.remarks.principal}</p>
            </div>
          </div>
        )
      case 'custom_field':
        return (
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold mb-2">{section.config?.label || 'Custom Field'}</h4>
            <p className="text-lg font-semibold">{data.custom_fields[section.config?.field || 'unknown']}</p>
          </div>
        )
      case 'footer':
        return (
          <div className="text-center text-sm text-gray-500 mt-8 pt-8 border-t">
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <p>Principal Signature ________________</p>
            <p>Parent Signature ________________</p>
          </div>
        )
      default:
        return <div>Section not implemented</div>
    }
  }

  if (loading) return <Loader size="lg" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            <FileText className="inline mr-2 h-8 w-8 text-blue-600" />
            Terminal Report Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            Design customizable templates for student terminal reports. Teachers will use these templates automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingTemplate({
              id: 0 as any,
              name: 'New Template',
              description: '',
              structure: [...defaultTemplateStructure],
              is_active: true,
              is_default: false,
            })
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group p-4 sm:p-6" onClick={() => setEditingTemplate(template)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                <div className="flex gap-1">
                  {template.is_default && <Badge variant="secondary">Default</Badge>}
                  {template.is_active && <Badge variant="default">Active</Badge>}
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {template.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LayoutList className="w-3 h-3" />
                {template.structure.length} sections
              </div>
              {template.academic_session && (
                <div className="text-xs text-muted-foreground mt-1">
                  Session: {template.session_name}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)} className="max-w-md sm:max-w-3xl lg:max-w-6xl h-[95vh] overflow-hidden">
          <DialogContent className="flex flex-col h-full max-h-[95vh] p-0">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="flex items-center gap-3">
                {editingTemplate.id ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
              <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 p-4 lg:p-6 overflow-y-auto flex-shrink-0 order-2 lg:order-1">
                {/* Template Settings */}
                <div className="space-y-4 mb-8">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingTemplate.description}
                      onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      rows={3}
                      className="w-full resize-vertical"
                    />
                  </div>
                  <div>
                    <Label>Session</Label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All sessions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sessions</SelectItem>
                        {sessions.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm">Active</Label>
                    <Switch 
                      checked={editingTemplate.is_active}
                      onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, is_active: !!checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <Label className="text-sm font-medium">Set as Default</Label>
                    <Switch 
                      checked={editingTemplate.is_default}
                      onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, is_default: !!checked})}
                    />
                  </div>
                </div>

                {/* Section Library */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <LayoutList className="w-4 h-4" />
                    Add Section
                  </h4>
                  {[
                    'header',
                    'student_info',
                    'subjects_table',
                    'summary',
                    'attendance',
                    'remarks',
                    'custom_field',
                    'footer'
                  ].map((type) => (
                    <Button
                      key={type}
                      variant="ghost"
                      className="w-full justify-start h-14 sm:h-12 mb-2 text-left"
                      onClick={() => addSection(type as any)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">{(type as string).slice(0,2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{getSectionTitle(type as any)}</div>
                          <div className="text-xs text-muted-foreground">{getSectionDescription(type as any)}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto order-1 lg:order-2">
                {/* Sections List */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Report Structure ({editingTemplate.structure.filter(s => s.visible).length} visible sections)
                  </h3>
                  <div className="space-y-3">
                    {editingTemplate.structure.map((section) => (
                      section.visible && (
                        <div key={section.id} className="group border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-all">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3 sm:gap-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">{section.type.slice(0,2).toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold truncate">{section.title}</h4>
                                <span className="text-xs text-muted-foreground capitalize">{section.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveSection(section.id, 'up')
                                }}
                                disabled={editingTemplate.structure.findIndex(s => s.id === section.id) === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveSection(section.id, 'down')
                                }}
                                disabled={editingTemplate.structure.findIndex(s => s.id === section.id) === editingTemplate.structure.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSectionVisible(section.id)
                                }}
                              >
                                {section.visible ? 'Hide' : 'Show'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSection(section.id)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Section Config */}
                          {section.type === 'custom_field' && (
                            <div className="ml-0 sm:ml-13 p-3 bg-gray-100 rounded space-y-2">
                              <Label className="text-xs font-medium">Custom Field</Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Field Name</Label>
                                  <Input
                                    value={section.config?.field || ''}
                                    onChange={(e) => updateSectionConfig(section.id, { ...section.config, field: e.target.value })}
                                    className="text-xs h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Label</Label>
                                  <Input
                                    value={section.config?.label || ''}
                                    onChange={(e) => updateSectionConfig(section.id, { ...section.config, label: e.target.value })}
                                    className="text-xs h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Preview Button */}
                <Button onClick={() => setShowPreview(true)} className="w-full mb-4 h-12">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Report
                </Button>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => setEditingTemplate(null)} className="flex-1 h-12">
                    Cancel
                  </Button>
                  <Button onClick={editingTemplate.id ? handleUpdateTemplate : handleCreateTemplate} className="flex-1 h-12">
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplate.id ? 'Update' : 'Create'} Template
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg sm:max-w-3xl lg:max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div className="p-4 lg:p-6 overflow-y-auto max-h-[60vh] pb-20 sm:pb-6">
            {renderPreview()}
          </div>
          <DialogFooter className="border-t p-4">
            <Button onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getSectionDescription(type: string): string {
  const descriptions = {
    header: 'School logo and title',
    student_info: 'Student name, ID, class',
    subjects_table: 'Subject-wise scores and grades',
    summary: 'Overall performance metrics',
    attendance: 'Attendance percentage',
    remarks: 'Teacher and principal comments',
    custom_field: 'Custom data fields (conduct, sports, etc.)',
    footer: 'Signatures and generation date',
  }
  return descriptions[type as keyof typeof descriptions] || 'Custom section'
}

