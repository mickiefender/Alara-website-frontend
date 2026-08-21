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
import { ReportTemplateEditor, renderTemplateLocally, type TemplateEditorRef } from '@/components/ReportTemplateEditor'
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { school } = useAuthContext();
  const [editingTemplate, setEditingTemplate] = useState<TemplateState | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
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

  // When the editor is open it takes over the whole content area (sidebar stays visible)
  if (editingTemplate) {
    return (
      <div className="h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-4rem)] flex flex-col overflow-hidden">
        <header className="shrink-0 border-b bg-card px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight truncate">
              {editingTemplate.id ? 'Edit' : 'Create'} Report Template
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Build a clean, school-branded template with sections and rich content.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="hidden md:inline-flex bg-primary/10 text-primary border border-primary/20">School Theme</Badge>
            <Button variant="outline" size="sm" onClick={() => setEditingTemplate(null)}>
              Close
            </Button>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12">
          <aside className="xl:col-span-3 2xl:col-span-2 border-b xl:border-b-0 xl:border-r bg-muted/30 min-h-0 overflow-y-auto max-h-[38vh] xl:max-h-none">
            <div className="p-4 lg:p-6 space-y-5">
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

              <Button
                onClick={() => {
                  if (!editorRef.current) return;
                  const html = editorRef.current.getHTML();
                  if (!html.trim()) {
                    toast({ title: 'Nothing to preview', description: 'Add template content first.', variant: 'destructive' });
                    return;
                  }
                  setPreviewHtml(renderTemplateLocally(html));
                  setShowPreview(true);
                }}
                className="w-full h-10"
              >
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

          <section className="xl:col-span-9 2xl:col-span-10 min-h-0 overflow-y-auto">
            <div className="p-4 lg:p-6">
              <ReportTemplateEditor
                ref={editorRef}
                templateId={editingTemplate?.id || 0}
                initialHTML={editingTemplate.htmlContent || ''}
                onSave={() => {}}
              />
            </div>
          </section>
        </div>

        {/* Full Report Preview Dialog */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="!flex !flex-col !gap-0 w-[96vw] max-w-[900px] h-[94vh] p-0 overflow-hidden rounded-2xl shadow-2xl border sm:max-w-[900px]">
              <DialogHeader className="px-5 py-3.5 lg:px-7 border-b bg-gradient-to-r from-primary/5 to-secondary/10 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <DialogTitle className="text-lg lg:text-xl font-bold">Full Report Preview</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Rendered from your template with sample data.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Download className="w-4 h-4 mr-1.5" />
                      Print / PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>Close</Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-y-auto bg-muted/40 p-4 lg:p-6">
                <div
                  className="mx-auto w-full max-w-[820px] rounded-md bg-white text-black shadow-xl ring-1 ring-black/10 p-5 sm:p-8"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

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
                      Sections: {(Array.isArray(template.structure) ? template.structure : []).length}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
