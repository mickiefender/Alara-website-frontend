"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { academicsAPI, authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Download, Sparkles, FolderOpen, ArrowRight, Zap, MessageSquare, BookOpen } from "lucide-react"
import { CircularLoader } from "@/components/circular-loader"
import TeacherFileExplorer from "@/components/teacher-file-explorer"
import Link from "next/link"

interface Document {
  id: number
  title: string
  document_type: string
  file: string
  uploaded_by_name: string
  created_at: string
}

export default function TeacherDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    document_type: "notes",
    description: "",
    related_subject: "",
    related_class: "",
    file: null as File | null,
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const userRes = await authAPI.me()
        if (userRes.data) sessionStorage.setItem("user", JSON.stringify(userRes.data))
      } catch {}
      const [docsRes, subjectsRes, classesRes] = await Promise.all([
        academicsAPI.documents(),
        academicsAPI.subjects(),
        academicsAPI.classes(),
      ])
      setDocuments(docsRes.data.results || docsRes.data || [])
      setSubjects(subjectsRes.data.results || subjectsRes.data || [])
      setClasses(classesRes.data.results || classesRes.data || [])
    } catch (err: any) {
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.file) { setError("Please fill in required fields and select a file"); return }
    try {
      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("document_type", formData.document_type)
      fd.append("description", formData.description)
      if (formData.related_subject) fd.append("related_subject", formData.related_subject)
      if (formData.related_class) fd.append("related_class", formData.related_class)
      if (formData.file) fd.append("file", formData.file)
      await academicsAPI.uploadDocument(fd)
      setIsOpen(false)
      setFormData({ title: "", document_type: "notes", description: "", related_subject: "", related_class: "", file: null })
      if (fileInputRef.current) fileInputRef.current.value = ""
      setError(null)
      fetchData()
    } catch (err: any) {
      const ed = err?.response?.data
      let msg = "Failed to upload document"
      if (ed?.school?.[0]?.includes("required") || ed?.school?.[0]?.includes("null")) {
        msg = "Your account is not associated with a school. Please contact an administrator."
      } else if (ed) {
        const k = Object.keys(ed)[0]; const v = ed[k]
        msg = `${k}: ${Array.isArray(v) ? v[0] : v}`
      } else { msg = err?.message || msg }
      setError(msg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return
    try { await academicsAPI.deleteDocument(id); fetchData() }
    catch { setError("Failed to delete document.") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-50">
        <CircularLoader size="md" color="#41e0e0" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Learning Materials</h1>
          <p className="text-gray-600 mt-2">Manage your teaching materials and use AI to generate exam questions</p>
        </div>
      </div>

      <Tabs defaultValue="file-manager" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary">
          <TabsTrigger value="file-manager" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> File Manager
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* ── File Manager Tab ── */}
        <TabsContent value="file-manager" className="mt-6">
          <TeacherFileExplorer
            onGenerateQuestions={(docId) => {
              // Navigate to AI assistant with doc context via URL
              window.location.href = `/dashboard/teacher/ai-assistant?docId=${docId}`
            }}
          />
        </TabsContent>

        {/* ── AI Assistant Tab ── */}
        <TabsContent value="ai-assistant" className="mt-6">
          <div className="space-y-6">

            {/* ── AI Promo Card ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#2d3452] text-white p-6 sm:p-8 shadow-xl">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">AI Powered</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to AI Chat</h2>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg">
                    Get started by selecting a document or entering a topic. The AI will generate questions, answers and summaries for you automatically.
                  </p>
                </div>
                <Link href="/dashboard/teacher/ai-assistant" className="flex-shrink-0">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Open AI Chat <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Feature chips */}
              <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                {[
                  { icon: <Zap size={12} />, label: "Generate Questions" },
                  { icon: <MessageSquare size={12} />, label: "Topic Mode" },
                  { icon: <BookOpen size={12} />, label: "Answer Keys" },
                  { icon: <Sparkles size={12} />, label: "Summaries" },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium"
                  >
                    {chip.icon} {chip.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Upload + Materials list ── */}
            <div className="flex gap-2 flex-wrap">
              <Link href="/dashboard/teacher/ai-assistant">
                <Button className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:shadow-lg transition-shadow">
                  <Sparkles className="w-5 h-5 mr-2" /> Generate from Topic
                </Button>
              </Link>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-5 h-5 mr-2" /> Quick Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Quick Upload Material</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                    <div>
                      <Label>Material Title *</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Chapter 5 Notes" />
                    </div>
                    <div>
                      <Label>Material Type</Label>
                      <select value={formData.document_type} onChange={(e) => setFormData({ ...formData, document_type: e.target.value })} className="w-full border rounded px-3 py-2">
                        <option value="notes">Notes</option>
                        <option value="assignment">Assignment</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." rows={3} />
                    </div>
                    <div>
                      <Label>Subject (Optional)</Label>
                      <select value={formData.related_subject} onChange={(e) => setFormData({ ...formData, related_subject: e.target.value })} className="w-full border rounded px-3 py-2">
                        <option value="">Select Subject</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Class (Optional)</Label>
                      <select value={formData.related_class} onChange={(e) => setFormData({ ...formData, related_class: e.target.value })} className="w-full border rounded px-3 py-2">
                        <option value="">Select Class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Upload File *</Label>
                      <Input ref={fileInputRef} type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })} />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600">Upload Material</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

            <Card>
              <CardHeader><CardTitle>Recent Materials</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-semibold truncate">{doc.title}</h3>
                        <p className="text-xs text-gray-500">{doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/dashboard/teacher/ai-assistant?docId=${doc.id}`}>
                          <Button
                            size="sm" variant="outline"
                            className="flex items-center gap-1 bg-secondary text-cyan-700 hover:bg-cyan-100"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">Generate</span>
                          </Button>
                        </Link>
                        <a href={doc.file} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No materials uploaded yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
