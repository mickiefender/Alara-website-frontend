"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { academicsAPI, authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Sparkles,
  Zap,
  Copy,
  Printer,
  BookOpen,
  ChevronLeft,
  FileText,
  MessageSquare,
  Settings2,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Code,
  BookOpenCheck,
} from "lucide-react"
import Image from "next/image"
import { CircularLoader } from "@/components/circular-loader"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

/* ─────────────────────────────────────────────────────────── */
/*  Types & helpers (identical to materials/page.tsx logic)    */
/* ─────────────────────────────────────────────────────────── */

interface Document {
  id: number
  title: string
  document_type: string
  file: string
  uploaded_by_name: string
  created_at: string
}

interface AnyQuestion {
  id?: number
  question: string
  options?: string[]
  correct_answer?: string
  explanation?: string
  model_answer?: string
  marking_points?: string[]
  max_marks?: number
  key_points?: string[]
  rubric?: Record<string, string>
}

interface NormalizedQuestions {
  aiName: string
  questionType: string
  count: number
  questions: AnyQuestion[]
  documentTitle?: string
}

interface NormalizedSummary {
  aiName: string
  summary: string
  documentTitle?: string
  wordCount: number
}

type NormalizedResponse = NormalizedQuestions | NormalizedSummary

function normalizeResponse(data: any, questionType: string): NormalizedResponse {
  if (questionType === "summary" && data.summary) {
    return {
      aiName: data.ai_name || "ALARA AI",
      summary: data.summary,
      documentTitle: data.document_title,
      wordCount: data.word_count || 0,
    }
  }
  if (data?.questions?.questions && Array.isArray(data.questions.questions)) {
    return {
      aiName: data.ai_name || "ALARA AI",
      questionType,
      count: data.count ?? data.questions.questions.length,
      questions: data.questions.questions,
      documentTitle: data.document_title,
    }
  }
  if (Array.isArray(data?.questions)) {
    return {
      aiName: data.ai_name || "ALARA AI",
      questionType,
      count: data.questions.length,
      questions: data.questions,
      documentTitle: data.document_title,
    }
  }
  return { aiName: data?.ai_name || "ALARA AI", questionType, count: 0, questions: [], documentTitle: data?.document_title }
}

function printQuestions(norm: NormalizedQuestions, mode: "questions" | "answers") {
  const { questions, questionType, documentTitle, aiName } = norm
  const baseTitle = documentTitle ? `Questions — ${documentTitle}` : "Generated Questions"
  const heading = mode === "answers" ? `${baseTitle} (Answer Key)` : baseTitle

  let body = ""
  questions.forEach((q, idx) => {
    body += `<div style="margin-bottom:24px;page-break-inside:avoid;">`
    body += `<p style="font-weight:bold;margin-bottom:8px;line-height:1.5;"><strong>Q${idx + 1}.</strong> ${q.question}</p>`
    if (questionType === "multiple_choice" && q.options?.length) {
      body += `<ol type="A" style="margin-left:24px;margin-bottom:8px;">`
      q.options.forEach((opt) => { body += `<li style="margin-bottom:4px;">${opt}</li>` })
      body += `</ol>`
      if (mode === "answers") {
        body += `<p style="color:#1a5276;margin-top:8px;"><strong>Answer:</strong> ${q.correct_answer ?? "—"}</p>`
        if (q.explanation) body += `<p style="font-style:italic;color:#555;margin-top:4px;font-size:10pt;"><em>Explanation:</em> ${q.explanation}</p>`
      }
    }
    if (questionType === "short_answer") {
      if (mode === "answers") {
        if (q.model_answer) body += `<p style="color:#1a5276;margin-top:8px;"><strong>Model Answer:</strong> ${q.model_answer}</p>`
        if (q.marking_points?.length) {
          body += `<p style="color:#1a5276;margin-top:8px;"><strong>Marking Points:</strong></p><ul style="margin-left:24px;">`
          q.marking_points.forEach((pt) => { body += `<li>${pt}</li>` })
          body += `</ul>`
        }
        if (q.max_marks) body += `<p style="color:#888;font-size:10pt;">[${q.max_marks} marks]</p>`
      } else {
        body += `<div style="border-bottom:1px solid #aaa;margin-top:8px;height:60px;"></div>`
      }
    }
    if (questionType === "essay") {
      if (mode === "answers") {
        if (q.key_points?.length) {
          body += `<p style="color:#1a5276;margin-top:8px;"><strong>Key Points:</strong></p><ul style="margin-left:24px;">`
          q.key_points.forEach((pt) => { body += `<li>${pt}</li>` })
          body += `</ul>`
        }
        if (q.rubric) {
          body += `<p style="color:#1a5276;margin-top:8px;"><strong>Rubric:</strong></p><ul style="margin-left:24px;">`
          Object.entries(q.rubric).forEach(([k, v]) => { body += `<li><strong>${k}:</strong> ${v}</li>` })
          body += `</ul>`
        }
        if (q.max_marks) body += `<p style="color:#888;font-size:10pt;">[${q.max_marks} marks]</p>`
      } else {
        body += `<div style="border-bottom:1px solid #aaa;margin-top:8px;height:120px;"></div>`
      }
    }
    body += `</div>`
  })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${heading}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Times New Roman',serif;font-size:12pt;color:#000;padding:20mm}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #000;padding-bottom:12px}.header h1{font-size:16pt;font-weight:bold}.header p{font-size:10pt;color:#555;margin-top:4px}ul li{margin-bottom:4px;line-height:1.5}</style>
</head><body>
<div class="header"><h1>${heading}</h1><p>Generated by ${aiName} &nbsp;|&nbsp; ${questions.length} question${questions.length !== 1 ? "s" : ""}</p></div>
${body}
<script>window.onload=function(){window.print()}</script>
</body></html>`
  const win = window.open("", "_blank", "width=900,height=700")
  if (win) { win.document.write(html); win.document.close() }
}

/* ─────────────────────────────────────────────────────────── */
/*  Sidebar quick-action cards (like the image's action grid)  */
/* ─────────────────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  { label: "Write copy", icon: <FileText size={18} />, color: "from-amber-400 to-orange-400" },
  { label: "Image generation", icon: <ImageIcon size={18} />, color: "from-purple-400 to-pink-400" },
  { label: "Create avatar", icon: <Code size={18} />, color: "from-green-400 to-teal-400" },
  { label: "Write code", icon: <BookOpenCheck size={18} />, color: "from-rose-400 to-red-400" },
]

/* ─────────────────────────────────────────────────────────── */
/*  Main Page Component                                         */
/* ─────────────────────────────────────────────────────────── */

function AIAssistantInner() {
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState<Document[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [normalized, setNormalized] = useState<NormalizedResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState<"document" | "topic">("document")
  const [aiTopic, setAiTopic] = useState("")
  const [aiSubject, setAiSubject] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [showSettings, setShowSettings] = useState(false)


  const [aiSettings, setAiSettings] = useState({
    num_questions: 5,
    question_type: "multiple_choice" as "multiple_choice" | "short_answer" | "essay" | "summary",
    difficulty: "medium",
    max_words: 300,
  })

  /* ── fetch data ── */
  useEffect(() => {
    ;(async () => {
      try {
        try { const r = await authAPI.me(); if (r.data) sessionStorage.setItem("user", JSON.stringify(r.data)) } catch {}
        const [docsRes, subjectsRes] = await Promise.all([academicsAPI.documents(), academicsAPI.subjects()])
        const docs = docsRes.data.results || docsRes.data || []
        setDocuments(docs)
        setSubjects(subjectsRes.data.results || subjectsRes.data || [])
        // Pre-select document from URL param
        const docIdParam = searchParams?.get("docId")
        if (docIdParam) {
          const id = parseInt(docIdParam)
          if (!isNaN(id)) {
            setSelectedDocId(id)
            setAiMode("document")
          }
        }
      } catch {}
      finally { setPageLoading(false) }
    })()
  }, [searchParams])

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ── generate ── */
  const handleGenerate = async (overrideDocId?: number) => {
    const docId = overrideDocId ?? selectedDocId
    if (aiMode === "document" && !docId) { setAiError("Select a document from the left panel first."); return }
    if (aiMode === "topic" && !aiTopic.trim()) { setAiError("Please enter a topic."); return }
    try {
      setAiLoading(true); setAiError(null); setNormalized(null)
      let data: any
      if (aiMode === "document") {
        const res = await academicsAPI.generateQuestionsFromDocument(docId!, aiSettings)
        data = res.data
      } else {
        const payload: any = { topic: aiTopic, ...aiSettings }
        if (aiSubject.trim()) payload.subject = aiSubject
        const res = await academicsAPI.generateQuestionsFromTopic(payload)
        data = res.data
      }
      const norm = normalizeResponse(data, aiSettings.question_type)
      if ("count" in norm && norm.count === 0) {
        setAiError("The AI returned 0 questions. Try a different document or topic.")
      } else {
        setNormalized(norm)
      }
    } catch (err: any) {
      setAiError(err?.response?.data?.error || err?.response?.data?.detail || err?.message || "Generation failed.")
    } finally {
      setAiLoading(false)
    }
  }

  /* ── quick send via chat bar ── */
  const handleChatSend = () => {
    if (!chatInput.trim()) return
    setAiTopic(chatInput)
    setAiMode("topic")
    setChatInput("")
    handleGenerate()
  }

  /* ── loading state ── */
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <CircularLoader size="md" color="#41e0e0" />
      </div>
    )
  }

  const recentProjects = documents.slice(0, 7)

  return (
    <div className="flex h-screen bg-[#f0f2f8] overflow-hidden">



      {/* ════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile back */}
            <Link href="/dashboard/teacher/materials" className="md:hidden">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Alara Ai</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition ${showSettings ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100 text-gray-500"}`}
              title="Settings"
            >
              <Settings2 size={18} />
            </button>
            <Image
              src="/Featured-section/Ai.png"
              alt="Alara AI Assistant"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"
              priority
            />
          </div>
        </header>

        {/* ── Body: Two-column on desktop, stacked on mobile ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ─── LEFT SETTINGS PANEL (collapsible) ─── */}
          {showSettings && (
            <aside className="w-full sm:w-80 xl:w-96 bg-white border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0 absolute sm:relative z-20 h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Mode */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["document", "topic"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => { setAiMode(m); setNormalized(null); setAiError(null) }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition capitalize ${
                          aiMode === m
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        {m === "document" ? "From Document" : "From Topic"}
                      </button>
                    ))}
                  </div>
                  {aiMode === "document" && selectedDocId && (
                    <p className="text-xs text-indigo-700 mt-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                      📄 {documents.find((d) => d.id === selectedDocId)?.title ?? `Doc #${selectedDocId}`}
                    </p>
                  )}
                  {aiMode === "document" && !selectedDocId && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                      ← Select a document from the project list
                    </p>
                  )}
                </div>

                {/* Topic input */}
                {aiMode === "topic" && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Topic</Label>
                    <Textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Enter topic or concept..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                    <div>
                      <Label className="text-xs text-gray-500 block mb-1">Subject (optional)</Label>
                      <select
                        value={aiSubject}
                        onChange={(e) => setAiSubject(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => <option key={s.id} value={s.name || s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Question count */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Number of Questions
                  </Label>
                  <Input
                    type="number" min="1" max="20"
                    value={aiSettings.num_questions}
                    onChange={(e) => setAiSettings({ ...aiSettings, num_questions: parseInt(e.target.value) || 5 })}
                    className="text-sm"
                  />
                </div>

                {/* Content type */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Content Type
                  </Label>
                  <select
                    value={aiSettings.question_type}
                    onChange={(e) => setAiSettings({ ...aiSettings, question_type: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="summary">Summary</option>
                  </select>
                  {aiSettings.question_type === "summary" && (
                    <div className="mt-3">
                      <Label className="text-xs text-gray-500 block mb-1">Max Words</Label>
                      <Input
                        type="number" min="50" max="1000" step="50"
                        value={aiSettings.max_words}
                        onChange={(e) => setAiSettings({ ...aiSettings, max_words: parseInt(e.target.value) || 300 })}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Difficulty
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setAiSettings({ ...aiSettings, difficulty: d })}
                        className={`py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                          aiSettings.difficulty === d
                            ? d === "easy" ? "bg-green-500 text-white border-green-500"
                              : d === "medium" ? "bg-amber-500 text-white border-amber-500"
                              : "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={() => handleGenerate()}
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 shadow-md transition"
                >
                  {aiLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                    : <><Zap className="w-4 h-4 mr-2" /> Generate</>
                  }
                </Button>
              </div>
            </aside>
          )}

          {/* ─── CENTRE: Welcome / Results ─── */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Scroll area */}
            <div className="flex-1 overflow-y-auto">
              {!normalized && !aiLoading && !aiError ? (
                /* ── Welcome / Empty State (mirrors the image) ── */
                <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
                  <div className="text-center max-w-xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                      Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600">Alara Ai Chat</span>
                    </h2>
                    <p className="text-gray-500 text-base sm:text-lg mb-10">
                      Get started by selecting a document or entering a topic. The AI will generate questions, answers and summaries for you.
                    </p>

                    {/* Quick-action cards */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                      {[
                        { label: "Generate from Document", desc: "Select a document from the project list", icon: <FileText size={20} />, color: "from-amber-400 to-orange-500", action: () => { setAiMode("document"); setShowSettings(true) } },
                        { label: "Generate from Topic", desc: "Type any topic or concept", icon: <MessageSquare size={20} />, color: "from-purple-400 to-pink-500", action: () => { setAiMode("topic"); setShowSettings(true) } },
                        { label: "Multiple Choice", desc: "Classic MCQ format", icon: <CheckCircle size={20} />, color: "from-green-400 to-teal-500", action: () => { setAiSettings(s => ({ ...s, question_type: "multiple_choice" })); setShowSettings(true) } },
                        { label: "Summary", desc: "Summarise any material", icon: <BookOpenCheck size={20} />, color: "from-rose-400 to-red-500", action: () => { setAiSettings(s => ({ ...s, question_type: "summary" })); setShowSettings(true) } },
                      ].map((card) => (
                        <button
                          key={card.label}
                          onClick={card.action}
                          className="group flex flex-col items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                            {card.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Results Area ── */
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                  {/* Loading */}
                  {aiLoading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg animate-pulse">
                        <Sparkles size={28} className="text-white" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium animate-pulse">AI is generating your content…</p>
                    </div>
                  )}

                  {/* Error */}
                  {aiError && !aiLoading && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
                      <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Generation failed</p>
                        <p className="text-red-700 text-sm mt-1">{aiError}</p>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {normalized && !aiLoading && (
                    <>
                      {/* Success Banner */}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200 rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {"summary" in normalized ? "Summary Generated" : "Questions Generated"} Successfully
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {"summary" in normalized
                              ? `${(normalized as NormalizedSummary).wordCount} words`
                              : `${(normalized as NormalizedQuestions).count} questions`}{" "}
                            {normalized.documentTitle ? `from "${normalized.documentTitle}"` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      {"summary" in normalized && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                            {(normalized as NormalizedSummary).summary}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {"questions" in normalized && (
                        <>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => printQuestions(normalized as NormalizedQuestions, "questions")}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 rounded-xl"
                            >
                              <Printer size={14} /> Print Questions
                            </Button>
                            <Button
                              onClick={() => printQuestions(normalized as NormalizedQuestions, "answers")}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl"
                            >
                              <BookOpen size={14} /> Print Answer Key
                            </Button>
                            <Button
                              onClick={() => {
                                if (!("questions" in normalized)) return
                                const norm = normalized as NormalizedQuestions
                                const text = norm.questions
                                  .map((q, i) => {
                                    let s = `Q${i + 1}. ${q.question}\n`
                                    if (norm.questionType === "multiple_choice" && q.options?.length) {
                                      q.options.forEach((opt, j) => { s += `  ${String.fromCharCode(65 + j)}. ${opt}\n` })
                                      s += `Answer: ${q.correct_answer ?? ""}\n`
                                    } else if (norm.questionType === "short_answer" && q.model_answer) {
                                      s += `Answer: ${q.model_answer}\n`
                                    }
                                    return s
                                  })
                                  .join("\n")
                                navigator.clipboard.writeText(text)
                              }}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 rounded-xl"
                            >
                              <Copy size={14} /> Copy All
                            </Button>
                          </div>

                          {/* Questions List */}
                          <div className="space-y-4">
                            {(normalized as NormalizedQuestions).questions.map((q, idx) => (
                              <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 leading-relaxed">{q.question}</p>

                                    {/* Multiple Choice */}
                                    {(normalized as NormalizedQuestions).questionType === "multiple_choice" && q.options?.length && (
                                      <div className="mt-3 space-y-2">
                                        {q.options.map((opt, optIdx) => {
                                          const letter = String.fromCharCode(65 + optIdx)
                                          const isCorrect =
                                            q.correct_answer === opt ||
                                            q.correct_answer === letter ||
                                            (q.correct_answer?.startsWith(letter + ".") ?? false)
                                          return (
                                            <div
                                              key={optIdx}
                                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition ${
                                                isCorrect
                                                  ? "bg-green-50 border border-green-200 text-green-800"
                                                  : "bg-gray-50 border border-gray-100 text-gray-700"
                                              }`}
                                            >
                                              <span className="font-semibold w-5 flex-shrink-0 text-gray-400">{letter}</span>
                                              <span className="flex-1">{opt}</span>
                                              {isCorrect && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                                            </div>
                                          )
                                        })}
                                        {q.explanation && (
                                          <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                                            <span className="font-semibold">Explanation: </span>{q.explanation}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Short Answer */}
                                    {(normalized as NormalizedQuestions).questionType === "short_answer" && (
                                      <div className="mt-3 space-y-2">
                                        {q.model_answer && (
                                          <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
                                            <span className="font-semibold">Model Answer: </span>{q.model_answer}
                                          </div>
                                        )}
                                        {q.marking_points?.length && (
                                          <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                                            <p className="font-semibold mb-1">Marking Points:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {q.marking_points.map((pt, i) => <li key={i}>{pt}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        {q.max_marks && <span className="text-xs text-gray-400 font-medium">[{q.max_marks} marks]</span>}
                                      </div>
                                    )}

                                    {/* Essay */}
                                    {(normalized as NormalizedQuestions).questionType === "essay" && (
                                      <div className="mt-3 space-y-2">
                                        {q.key_points?.length && (
                                          <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
                                            <p className="font-semibold mb-1">Key Points:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {q.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        {q.rubric && Object.keys(q.rubric).length > 0 && (
                                          <div className="px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-sm text-purple-800">
                                            <p className="font-semibold mb-1">Rubric:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {Object.entries(q.rubric).map(([k, v]) => <li key={k}><strong>{k}:</strong> {String(v)}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        {q.max_marks && <span className="text-xs text-gray-400 font-medium">[{q.max_marks} marks]</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Bottom Chat Bar (like Script's input) ── */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-indigo-300 focus-within:shadow-indigo-100 focus-within:shadow-md transition-all">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                    placeholder="Summarize the latest… or type any topic"
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400 max-h-40 leading-relaxed"
                    style={{ minHeight: "24px" }}
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={aiLoading || !chatInput.trim()}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {aiLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    }
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex gap-4 text-xs text-gray-400">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="hover:text-indigo-600 transition flex items-center gap-1"
                    >
                      <Settings2 size={12} /> Settings
                    </button>
                    <button
                      onClick={() => handleGenerate()}
                      disabled={aiLoading}
                      className="hover:text-indigo-600 transition flex items-center gap-1"
                    >
                      <Zap size={12} /> Generate Now
                    </button>
                    <Link href="/dashboard/teacher/materials" className="hover:text-indigo-600 transition flex items-center gap-1">
                      <FileText size={12} /> Browse Materials
                    </Link>
                  </div>
                  <span className="text-xs text-gray-300">
                    {chatInput.length} / 3,000
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* ── RIGHT: Document List Panel (desktop) ── */}
          <aside className="hidden xl:flex flex-col w-72 bg-white border-l border-gray-100 flex-shrink-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Documents</h3>
              <p className="text-xs text-gray-400 mt-0.5">Select to generate from</p>
            </div>
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search materials…"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-300"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDocId(doc.id); setAiMode("document"); setNormalized(null); setAiError(null) }}
                  className={`w-full text-left px-4 py-3 transition group ${
                    selectedDocId === doc.id
                      ? "bg-indigo-50 border-r-2 border-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedDocId === doc.id ? "bg-indigo-100" : "bg-gray-100"
                    }`}>
                      <FileText size={14} className={selectedDocId === doc.id ? "text-indigo-600" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${selectedDocId === doc.id ? "text-indigo-900" : "text-gray-900"}`}>
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize truncate">{doc.document_type}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="px-4 py-8 text-center">
                  <FileText size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {searchQuery ? "No matching documents" : "No documents yet"}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <CircularLoader size="md" color="#41e0e0" />
      </div>
    }>
      <AIAssistantInner />
    </Suspense>
  )
}
