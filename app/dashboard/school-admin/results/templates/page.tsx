"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
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
import { FileText, LayoutList, Eye, Save, Trash2, Copy, Download, Plus, Edit3 } from 'lucide-react'
import { academicsAPI } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthContext } from '@/lib/auth-context'
import { ReportTemplateEditor, type TemplateEditorRef } from '@/components/ReportTemplateEditor'
import { VariableInserter } from '@/components/VariableInserter'
import { useToast } from '@/hooks/use-toast'

interface TemplateSection {
  id: string;
  type: 'header' | 'student_info' | 'subjects_table' | 'summary' | 'attendance' | 'remarks' | 'custom_field' | 'footer';
  visible: boolean;
  config?: Record<string, any>;
  content?: string;
}

interface BackendTemplate {
  id: number;
  name: string;
  html_template: string;
  structure: any[]; // JSON structure from backend
  is_active: boolean;
  is_default: boolean;
  school: number;
  school_name?: string;
  created_at: string;
}

interface TemplateState {
  id?: number;
  name: string;
  structure: TemplateSection[];
  htmlContent: string;
}

interface MockStudentData {
  name: string;
  class: string;
  subjects: Array<{name: string; score: number; grade: string}>;
  summary: {average: number; position: number; total_students: number; grade: string};
  attendance: {percentage: number; days_present: number; total_days: number};
  remarks: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { school } = useAuthContext();
  const [editingTemplate, setEditingTemplate] = useState<TemplateState | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<MockStudentData | null>(null);
  const editorRef = useRef<TemplateEditorRef>(null);
  const { toast } = useToast();

  const safeStructure = editingTemplate?.structure?.filter((s): s is TemplateSection => Boolean(s && typeof s === 'object')) || [];

  useEffect(() => {
    if (editingTemplate && !Array.isArray(editingTemplate.structure)) {
      console.warn('Invalid structure format:', editingTemplate.structure);
      toast({
        title: 'Structure Warning', 
        description: 'Template structure corrupted. Reset to empty.', 
        variant: 'destructive'
      });
      setEditingTemplate(prev => prev ? { ...prev, structure: [] } : null);
    }
  }, [editingTemplate?.structure, toast]);

  // Mock data for preview
  const mockStudentData: MockStudentData = {
    name: 'John Doe',
    class: 'Form 1A',
    subjects: [
      {name: 'Mathematics', score: 85, grade: 'A'},
      {name: 'English', score: 78, grade: 'B+'},
      {name: 'Science', score: 92, grade: 'A+'},
    ],
    summary: {average: 85, position: 3, total_students: 45, grade: 'A'},
    attendance: {percentage: 95, days_present: 180, total_days: 190},
    remarks: 'Excellent performance with consistent improvement across all subjects.',
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await academicsAPI.terminalReportTemplates();
      setTemplates(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (err: any) {
      console.error('Templates fetch error:', err);
      setError('Failed to load templates. Please check if backend is running.');
      toast({ 
        title: 'Connection Error', 
        description: `Failed to fetch templates: ${err.response?.status || 'Unknown error'}`, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreateTemplate = useCallback(async () => {
    if (!editorRef.current || !editingTemplate?.name) return;
    const htmlContent = editorRef.current.getHTML();
    if (!htmlContent.trim()) {
      toast({ title: 'Error', description: 'Template content is required', variant: 'destructive' });
      return;
    }

    try {
      await academicsAPI.createTerminalReportTemplate({
        name: editingTemplate.name,
        html_template: htmlContent,
        structure: JSON.stringify(editingTemplate.structure),
        is_active: true,
        school: school?.id,
      });
      toast({ title: 'Success', description: 'Template created successfully!' });
      setEditingTemplate(null);
      if (editorRef.current) editorRef.current.setHTML('');
      fetchTemplates();
    } catch (err: any) {
      toast({ 
        title: 'Create Failed', 
        description: err.response?.data?.detail || 'Failed to create template', 
        variant: 'destructive' 
      });
    }
  }, [editingTemplate, toast, fetchTemplates, school]);

  const handleUpdateTemplate = useCallback(async () => {
    if (!editorRef.current || !editingTemplate?.id) return;
    const htmlContent = editorRef.current.getHTML();

    try {
      await academicsAPI.updateTerminalReportTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        html_template: htmlContent,
        structure: JSON.stringify(editingTemplate.structure),
        is_active: true,
      });
      toast({ title: 'Success', description: 'Template updated successfully!' });
      setEditingTemplate(null);
      if (editorRef.current) editorRef.current.setHTML('');
      fetchTemplates();
    } catch (err: any) {
      toast({ 
        title: 'Update Failed', 
        description: err.response?.data?.detail || 'Failed to update template', 
        variant: 'destructive' 
      });
    }
  }, [editingTemplate, toast, fetchTemplates]);

  const handleDeleteTemplate = useCallback(async (id: number) => {
    try {
      await academicsAPI.deleteTerminalReportTemplate(id);
      setTemplates(t => t.filter(t => t.id !== id));
      toast({ title: 'Success', description: 'Template deleted successfully!' });
    } catch (err: any) {
      toast({ 
        title: 'Delete Failed', 
        description: err.response?.data?.detail || 'Failed to delete template', 
        variant: 'destructive' 
      });
    }
  }, [toast]);

  const addSection = (type: TemplateSection['type']) => {
    if (editingTemplate) {
      const newSection: TemplateSection = {
        id: Date.now().toString(),
        type,
        visible: true,
      };
      setEditingTemplate({
        ...editingTemplate,
        structure: [...editingTemplate.structure, newSection],
      });
    }
  };

  const toggleSection = (id: string) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        structure: editingTemplate.structure.map(s => 
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      });
    }
  };

  const updateSectionConfig = (id: string, config: Record<string, any>) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        structure: editingTemplate.structure.map(s => 
          s.id === id ? { ...s, config } : s
        ),
      });
    }
  };

  const renderSectionPreview = (section: TemplateSection, data: MockStudentData) => {
    switch (section.type) {
      case 'header':
        return (
          <div className="text-center py-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Terminal Report</h1>
            <p className="text-lg md:text-xl opacity-90">Academic Year 2023/2024</p>
          </div>
        );
      case 'student_info':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted to-background rounded-xl border">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Student Name</span>
              <span className="text-xl md:text-2xl font-bold">{data.name}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Class</span>
              <span className="text-xl md:text-2xl font-semibold bg-primary/10 px-3 py-1 rounded-full">{data.class}</span>
            </div>
            <div className="md:col-span-1 lg:col-span-1">
              <span className="text-sm text-muted-foreground block mb-1">Report Period</span>
              <span className="text-lg font-medium">Full Term</span>
            </div>
          </div>
        );
      case 'subjects_table':
        return (
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
              <CardTitle className="text-lg md:text-xl">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-4 font-semibold">Subject</th>
                      <th className="text-right p-4 font-semibold">Score</th>
                      <th className="text-right p-4 font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subjects.map((subject, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{subject.name}</td>
                        <td className="p-4 text-right font-bold text-lg">{subject.score}%</td>
                        <td className="p-4 text-right">
                          <Badge variant={subject.grade.includes('A') ? 'default' : 'secondary'} className="px-3 py-1">
                            {subject.grade}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      case 'summary':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200">
            <div className="text-center">
              <span className="text-sm text-emerald-600 block mb-2">Average Score</span>
              <span className="text-3xl md:text-4xl lg:text-5xl font-black text-emerald-700">{data.summary.average}%</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-emerald-600 block mb-2">Class Position</span>
              <span className="text-3xl md:text-4xl font-black">{data.summary.position}<sup className="text-xl">/{data.summary.total_students}</sup></span>
            </div>
            <div className="text-center">
              <span className="text-sm text-emerald-600 block mb-2">Overall Grade</span>
              <Badge className="text-xl md:text-2xl px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg">
                {data.summary.grade}
              </Badge>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-4">
                {data.attendance.percentage}%
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p>{data.attendance.days_present} / {data.attendance.total_days} days</p>
                <p className="text-sm opacity-75">Excellent attendance record</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'remarks':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Teacher\'s Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{data.remarks}</p>
            </CardContent>
          </Card>
        );
      case 'custom_field':
        return (
          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-lg mb-3 text-purple-800">Custom Section</h4>
            <p className="text-muted-foreground italic">Custom field content preview</p>
          </div>
        );
      case 'footer':
        return (
          <div className="pt-12 pb-8 mt-auto text-center text-sm text-muted-foreground border-t border-border/50">
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <p className="mt-1">School Management System © 2024</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFullPreview = () => {
    if (!editingTemplate || !previewData || safeStructure.length === 0) return <div className="p-8 text-center text-muted-foreground">No sections defined yet. Add sections in the editor.</div>;
    return (
      <div className="max-w-4xl mx-auto p-8 bg-background min-h-[80vh] shadow-2xl border rounded-3xl">
        <div className="space-y-8">
          {safeStructure
            .filter(s => s.visible)
            .map(section => (
              <div key={section.id} className="print:break-inside-avoid">
                {renderSectionPreview(section, previewData)}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Report Templates</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage customizable terminal report templates</p>
        </div>
  <Button onClick={() => setEditingTemplate({ name: '', structure: [], htmlContent: '' })} size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90">
          <Plus className="w-5 h-5 mr-2" />
          New Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-6">Create your first report template to get started.</p>
              <Button onClick={() => setEditingTemplate({ name: '', structure: [], htmlContent: '' })}>
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {templates.map((template) => (
                <Card key={template.id} className="group hover:shadow-xl transition-all cursor-pointer border hover:border-primary/50 p-6 hover:bg-muted/20" onClick={() => {
                  let parsedStructure = [];
                  try {
                    if (typeof template.structure === 'string') {
                      parsedStructure = JSON.parse(template.structure);
                    } else if (Array.isArray(template.structure)) {
                      parsedStructure = template.structure;
                    }
                  } catch (e) {
                    console.warn('Invalid template structure:', e);
                  }
                  setEditingTemplate({ 
                    id: template.id, 
                    name: template.name, 
                    structure: parsedStructure, 
                    htmlContent: template.html_template || '' 
                  });
                }}>

                  <CardHeader className="pb-3 pt-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg leading-tight font-bold">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={template.is_default ? 'default' : 'secondary'} className="text-xs">
                            {template.is_default ? 'Default' : template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.html_template ? template.html_template.substring(0, 100) + '...' : 'No content preview'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <LayoutList className="w-3 h-3" />
                      Sections: {JSON.parse(template.structure || '[]').length || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Professional Responsive */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="w-[96vw] max-w-[1400px] h-[92vh] p-0 bg-card rounded-2xl shadow-2xl border md:w-[94vw] lg:w-[92vw]">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-secondary/70" />
            <DialogHeader className="px-5 py-4 lg:px-8 lg:py-5 border-b bg-gradient-to-r from-primary/5 to-secondary/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-xl lg:text-2xl font-bold tracking-tight">
                    {editingTemplate.id ? 'Edit' : 'Create'} Report Template
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Build a clean, school-branded template with sections and rich content.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border border-primary/20">School Theme</Badge>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)} className="h-9 px-4">
                    Close
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 xl:grid-cols-12 h-[calc(92vh-92px)] min-h-0">
              <aside className="xl:col-span-4 2xl:col-span-3 border-b xl:border-b-0 xl:border-r bg-muted/30 min-h-0 overflow-y-auto">
                <div className="p-5 lg:p-6 space-y-6">
                  <div className="rounded-xl border border-primary/15 bg-background p-4">
                    <Label className="text-sm font-semibold mb-2 block text-foreground">Template Name</Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate(t => t ? { ...t, name: e.target.value } : null)}
                      placeholder="Enter template name"
                      className="h-10"
                    />
                  </div>

                  <div className="rounded-xl border border-primary/15 bg-background p-4">
                    <p className="text-sm font-semibold mb-3">Quick Add Sections</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2.5">
                      <Button size="sm" onClick={() => addSection('header')} className="justify-start">
                        <Plus className="w-4 h-4 mr-2" /> Header
                      </Button>
                      <Button size="sm" onClick={() => addSection('student_info')} variant="outline" className="justify-start">
                        <LayoutList className="w-4 h-4 mr-2" /> Student Info
                      </Button>
                      <Button size="sm" onClick={() => addSection('subjects_table')} variant="outline" className="justify-start">
                        <FileText className="w-4 h-4 mr-2" /> Subjects
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/15 bg-background p-4">
                    <p className="text-sm font-semibold mb-3">Template Sections</p>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {safeStructure.filter((section) => section.visible).map((section) => (
                        <div key={section.id} className="group border rounded-lg p-3 hover:border-primary/40 transition-all bg-card">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Switch
                                id={`section-${section.id}`}
                                checked={section.visible}
                                onCheckedChange={() => toggleSection(section.id)}
                                className="data-[state=checked]:bg-primary"
                              />
                              <Label htmlFor={`section-${section.id}`} className="font-medium cursor-pointer text-sm">
                                {section.type.replace('_', ' ').toUpperCase()}
                              </Label>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 px-2 opacity-60 group-hover:opacity-100">
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          {section.type === 'custom_field' && (
                            <div className="mt-3 pl-7 space-y-2">
                              <Input placeholder="Field label" defaultValue={section.config?.label} />
                              <Textarea placeholder="Custom content" rows={2} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => { setPreviewData(mockStudentData); setShowPreview(true); }} className="w-full h-10">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Full Report
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Button variant="outline" onClick={() => setEditingTemplate(null)} className="h-10">Cancel</Button>
                    <Button onClick={editingTemplate.id ? handleUpdateTemplate : handleCreateTemplate} className="h-10 bg-primary hover:bg-primary/90">
                      <Save className="w-4 h-4 mr-2" />
                      {editingTemplate.id ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </aside>

              <section className="xl:col-span-8 2xl:col-span-9 min-h-0 overflow-y-auto">
                <div className="p-4 lg:p-6">
                  <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 p-3 lg:p-4">
                    <ReportTemplateEditor
                      ref={editorRef}
                      templateId={editingTemplate?.id || 0}
                      initialHTML={editingTemplate.htmlContent || ''}
                      onSave={() => {}}
                    />
                  </div>
                </div>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog - Professional Responsive */}
      {showPreview && previewData && editingTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="w-[96vw] max-w-6xl h-[92vh] p-0 bg-white shadow-2xl border rounded-2xl print:max-w-none print:shadow-none print:border-none md:w-[94vw]">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-secondary/70 print:hidden" />
            <DialogHeader className="px-5 py-4 lg:px-7 lg:py-5 border-b print:border-none bg-gradient-to-r from-primary/5 to-secondary/10 print:bg-transparent">
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold mb-1">Report Preview</h2>
                <p className="text-sm text-muted-foreground">Print-ready view with your school styling.</p>
              </div>
              <div className="flex gap-2 justify-center mt-4 print:hidden">
                <Button variant="outline" onClick={() => setShowPreview(false)}>Close Preview</Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="overflow-y-auto h-[calc(92vh-120px)] p-4 lg:p-6 print:h-auto print:p-0">
              {renderFullPreview()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center py-12">
            <FileText className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-destructive">{error}</h3>
            <Button onClick={fetchTemplates} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getSectionDescription(type: string): string {
  const descriptions: Record<string, string> = {
    header: 'Report header with school details',
    student_info: 'Student personal information',
    subjects_table: 'Subject scores and grades table',
    summary: 'Performance summary and overall grade',
    attendance: 'Attendance record',
    remarks: 'Teacher comments and remarks',
    custom_field: 'Custom configurable section',
    footer: 'Report footer with generation info',
  };
  return descriptions[type] || 'Section';
}
