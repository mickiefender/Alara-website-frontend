"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { academicsAPI } from "@/lib/api"
import Image from "next/image"
import {
  Bot,
  Send,
  Paperclip,
  Mic,
  BookOpen,
  FileText,
  Code2,
  Sparkles,
  Plus,
  ChevronRight,
  X,
  User,
  MessageSquare,
  Loader2,
  Download,
  Clock,
  Search,
  MoreHorizontal,
  Trash2,
  Zap,
  BookMarked,
  HelpCircle,
  AlignLeft,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Document {
  id: number
  title: string
  document_type: string
  description: string
  file: string
  uploaded_by_name: string
  created_at: string
  subject_name: string
  class_name: string
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

interface AIResult {
  type: "questions" | "summary"
  questionType?: string
  questions?: AnyQuestion[]
  summary?: string
  wordCount?: number
  count?: number
  documentTitle?: string
  aiName?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Document[]
  aiResult?: AIResult
  isLoading?: boolean
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize AI response (same logic as teacher materials page)
// ─────────────────────────────────────────────────────────────────────────────
function normalizeAIResponse(data: any, questionType: string): AIResult {
  // Handle summary
  if (questionType === "summary" && data.summary) {
    return {
      type: "summary",
      questionType: "summary",
      summary: data.summary,
      documentTitle: data.document_title,
      wordCount: data.word_count || 0,
      aiName: data.ai_name || "School AI",
    }
  }

  // Handle nested questions
  if (data?.questions?.questions && Array.isArray(data.questions.questions)) {
    return {
      type: "questions",
      questionType,
      count: data.count ?? data.questions.questions.length,
      questions: data.questions.questions,
      documentTitle: data.document_title,
      aiName: data.ai_name || "School AI",
    }
  }

  // Handle flat questions array
  if (Array.isArray(data?.questions)) {
    return {
      type: "questions",
      questionType,
      count: data.questions.length,
      questions: data.questions,
      documentTitle: data.document_title,
      aiName: data.ai_name || "School AI",
    }
  }

  return {
    type: "questions",
    questionType,
    count: 0,
    questions: [],
    documentTitle: data?.document_title,
    aiName: data?.ai_name || "School AI",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent detection — figures out what the student is asking for
// ─────────────────────────────────────────────────────────────────────────────
type Intent =
  | { kind: "generate_questions"; docId: number; questionType: string; numQuestions: number; difficulty: string }
  | { kind: "generate_topic_questions"; topic: string; questionType: string; numQuestions: number; difficulty: string }
  | { kind: "summarize_doc"; docId: number }
  | { kind: "summarize_topic"; topic: string }
  | { kind: "list_docs" }
  | { kind: "general"; topic: string }

function detectIntent(text: string, documents: Document[], selectedDocId: number | null): Intent {
  const lower = text.toLowerCase()

  // --- Question generation from a document ---
  const wantsQuestions =
    lower.includes("generat") ||
    lower.includes("creat") ||
    lower.includes("make") ||
    lower.includes("give me question") ||
    lower.includes("quiz") ||
    lower.includes("test me") ||
    lower.includes("practice question") ||
    lower.includes("exam question") ||
    lower.includes("multiple choice") ||
    lower.includes("mcq") ||
    lower.includes("short answer") ||
    lower.includes("essay question")

  const wantsSummary =
    lower.includes("summar") ||
    lower.includes("overview") ||
    lower.includes("brief") ||
    lower.includes("tldr") ||
    lower.includes("what is") ||
    lower.includes("explain") ||
    lower.includes("describe") ||
    lower.includes("about") ||
    lower.includes("tell me about")

  const wantsList =
    lower.includes("list") && (lower.includes("document") || lower.includes("material") || lower.includes("file")) ||
    (lower.includes("what") && lower.includes("document")) ||
    (lower.includes("show") && lower.includes("document")) ||
    (lower.includes("all") && lower.includes("document"))

  // Detect question type
  let questionType = "multiple_choice"
  if (lower.includes("short answer") || lower.includes("short-answer")) questionType = "short_answer"
  else if (lower.includes("essay")) questionType = "essay"
  else if (lower.includes("summary") || lower.includes("summarize") || lower.includes("summarise")) questionType = "summary"

  // Detect difficulty
  let difficulty = "medium"
  if (lower.includes("easy") || lower.includes("simple") || lower.includes("basic")) difficulty = "easy"
  else if (lower.includes("hard") || lower.includes("difficult") || lower.includes("advanced") || lower.includes("challenging")) difficulty = "hard"

  // Detect number of questions
  const numMatch = lower.match(/(\d+)\s*(?:question|q|quiz|mcq|item)/i)
  const numQuestions = numMatch ? Math.min(20, Math.max(1, parseInt(numMatch[1]))) : 5

  // Check if a document is mentioned or selected
  const mentionedDoc = documents.find((doc) => {
    const docTitle = doc.title.toLowerCase()
    return lower.includes(docTitle) || (docTitle.length > 4 && lower.includes(docTitle.substring(0, Math.floor(docTitle.length * 0.7))))
  })

  const targetDocId = mentionedDoc?.id ?? selectedDocId

  if (wantsList) {
    return { kind: "list_docs" }
  }

  if (wantsQuestions) {
    if (targetDocId) {
      return { kind: "generate_questions", docId: targetDocId, questionType, numQuestions, difficulty }
    }
    // Generate from topic
    return { kind: "generate_topic_questions", topic: text, questionType, numQuestions, difficulty }
  }

  if (wantsSummary && targetDocId) {
    return { kind: "summarize_doc", docId: targetDocId }
  }

  if (wantsSummary && !targetDocId) {
    return { kind: "summarize_topic", topic: text }
  }

  // Default: use AI to generate a response about the topic
  return { kind: "general", topic: text }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a user-friendly text response from an AI result
// ─────────────────────────────────────────────────────────────────────────────
function buildTextFromAIResult(result: AIResult): string {
  if (result.type === "summary" && result.summary) {
    return `**Summary${result.documentTitle ? ` — ${result.documentTitle}` : ""}**\n\n${result.summary}`
  }

  if (result.type === "questions" && result.questions && result.questions.length > 0) {
    const typeLabel =
      result.questionType === "multiple_choice"
        ? "Multiple Choice"
        : result.questionType === "short_answer"
        ? "Short Answer"
        : result.questionType === "essay"
        ? "Essay"
        : "Questions"

    let text = `**${result.count} ${typeLabel} Question${(result.count ?? 0) > 1 ? "s" : ""}${result.documentTitle ? ` from "${result.documentTitle}"` : ""}**\n\n`
    result.questions.slice(0, 3).forEach((q, i) => {
      text += `**Q${i + 1}.** ${q.question}\n`
      if (result.questionType === "multiple_choice" && q.options?.length) {
        q.options.forEach((opt, j) => {
          text += `  ${String.fromCharCode(65 + j)}. ${opt}\n`
        })
      }
      text += "\n"
    })
    if ((result.count ?? 0) > 3) {
      text += `_...and ${(result.count ?? 0) - 3} more questions shown below._`
    }
    return text
  }

  return "I wasn't able to generate a response. Please try rephrasing your question."
}

// ─────────────────────────────────────────────────────────────────────────────
// Build fallback text when no doc/topic AI is called
// ─────────────────────────────────────────────────────────────────────────────
function buildFallbackResponse(text: string, documents: Document[]): string {
  const lower = text.toLowerCase()

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `Hello! 👋 I'm your AI Study Assistant powered by real AI.\n\nI can help you:\n\n• **Generate questions** from your documents (e.g. "Give me 5 MCQs from [document name]")\n• **Summarize** documents (e.g. "Summarize [document name]")\n• **Generate questions** on any topic (e.g. "Create 3 essay questions about photosynthesis")\n• **List** your available documents\n\nYou currently have **${documents.length}** document${documents.length !== 1 ? "s" : ""} available. What would you like to explore?`
  }

  if (lower.includes("help") || lower.includes("what can you")) {
    return `Here's what I can do for you:\n\n• **"Give me 5 multiple choice questions from [document]"** — generates MCQs from a specific document\n• **"Summarize [document name]"** — creates an AI summary of a document\n• **"Create 3 essay questions about [topic]"** — generates questions on any topic\n• **"List my documents"** — shows all your available materials\n• **"Generate short answer questions about [topic]"** — topic-based questions\n\nI use real AI to generate content, so answers are accurate and educational!`
  }

  if (lower.includes("document") || lower.includes("material") || lower.includes("file")) {
    if (documents.length === 0) {
      return `Your teachers haven't uploaded any documents yet. Once they do, I'll be able to help you generate questions, summaries, and more!`
    }
    const grouped: Record<string, Document[]> = {}
    documents.forEach((doc) => {
      const key = doc.subject_name || doc.document_type || "General"
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(doc)
    })
    let content = `You have **${documents.length}** document${documents.length !== 1 ? "s" : ""} available:\n\n`
    Object.entries(grouped).forEach(([subject, docs]) => {
      content += `**${subject}** (${docs.length})\n`
      docs.slice(0, 3).forEach((d) => (content += `  • ${d.title}\n`))
      if (docs.length > 3) content += `  • _+${docs.length - 3} more_\n`
      content += "\n"
    })
    content += `\nTry asking: _"Summarize [document name]"_ or _"Give me 5 quiz questions from [document name]"_`
    return content
  }

  // Generic topic — let the user know they can ask for questions on that topic
  return `I understand you're asking about: **"${text}"**\n\nHere's how I can help:\n\n• Ask me to **generate questions** on this topic: _"Give me 5 MCQs about ${text}"_\n• Ask me to **summarize** a related document from your library\n• Or ask me to **explain** this topic: _"Create short answer questions about ${text}"_\n\nI'll use real AI to create accurate educational content!`
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-action prompt tiles
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: HelpCircle,
    label: "Quiz me",
    color: "bg-amber-100 text-amber-600",
    prompt: "Generate 5 multiple choice questions from my documents",
  },
  {
    icon: AlignLeft,
    label: "Summarize",
    color: "bg-blue-100 text-blue-600",
    prompt: "Summarize my latest document",
  },
  {
    icon: BookMarked,
    label: "Study notes",
    color: "bg-emerald-100 text-emerald-600",
    prompt: "Create 5 short answer questions to help me study",
  },
  {
    icon: Code2,
    label: "Topic questions",
    color: "bg-pink-100 text-pink-600",
    prompt: "Give me 3 essay questions about a topic of my choice",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Markdown-style renderer (lightweight)
// ─────────────────────────────────────────────────────────────────────────────
function RenderMessage({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          const italicParts = part.split(/(_[^_]+_)/)
          return italicParts.map((p, k) => {
            if (p.startsWith("_") && p.endsWith("_")) {
              return (
                <em key={k} className="text-gray-500">
                  {p.slice(1, -1)}
                </em>
              )
            }
            return <span key={k}>{p}</span>
          })
        })
        if (line.startsWith("• ") || line.startsWith("  • ")) {
          const indent = line.startsWith("  • ") ? "ml-4" : ""
          return (
            <div key={i} className={`flex gap-2 ${indent}`}>
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{rendered.flat()}</span>
            </div>
          )
        }
        return <p key={i}>{rendered.flat()}</p>
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Result Renderer — renders questions/summaries inline in chat
// ─────────────────────────────────────────────────────────────────────────────
function RenderAIResult({ result }: { result: AIResult }) {
  if (result.type === "summary" && result.summary) {
    return (
      <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
          AI Summary {result.documentTitle ? `— ${result.documentTitle}` : ""}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{result.summary}</p>
        {result.wordCount ? (
          <p className="text-xs text-gray-400 mt-2">{result.wordCount} words · Generated by {result.aiName}</p>
        ) : null}
      </div>
    )
  }

  if (result.type === "questions" && result.questions && result.questions.length > 0) {
    return (
      <div className="mt-3 space-y-3">
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
          {result.count} {result.questionType === "multiple_choice" ? "Multiple Choice" : result.questionType === "short_answer" ? "Short Answer" : result.questionType === "essay" ? "Essay" : ""} Question{(result.count ?? 0) !== 1 ? "s" : ""}
          {result.documentTitle ? ` — ${result.documentTitle}` : ""}
        </p>
        {result.questions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm leading-relaxed">{q.question}</p>

                {/* Multiple Choice Options */}
                {result.questionType === "multiple_choice" && q.options && q.options.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx)
                      const isCorrect =
                        q.correct_answer === opt ||
                        q.correct_answer === letter ||
                        (q.correct_answer?.startsWith(letter + ".") ?? false)
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                            isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                              : "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <span className="font-semibold w-5 flex-shrink-0">{letter}.</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && (
                            <span className="text-green-600 dark:text-green-400 text-xs font-semibold ml-auto">✓</span>
                          )}
                        </div>
                      )
                    })}
                    {q.explanation && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Short Answer */}
                {result.questionType === "short_answer" && (
                  <div className="mt-2 space-y-1.5">
                    {q.model_answer && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-300">
                        <span className="font-semibold">Model Answer: </span>
                        {q.model_answer}
                      </div>
                    )}
                    {q.marking_points && q.marking_points.length > 0 && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                        <p className="font-semibold mb-1">Key Points:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {q.marking_points.map((pt, ptIdx) => (
                            <li key={ptIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.max_marks && (
                      <span className="text-xs text-gray-400">[{q.max_marks} marks]</span>
                    )}
                  </div>
                )}

                {/* Essay */}
                {result.questionType === "essay" && (
                  <div className="mt-2 space-y-1.5">
                    {q.key_points && q.key_points.length > 0 && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-300">
                        <p className="font-semibold mb-1">Key Points to Cover:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {q.key_points.map((pt, ptIdx) => (
                            <li key={ptIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.max_marks && (
                      <span className="text-xs text-gray-400">[{q.max_marks} marks]</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIChatPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [docsLoading, setDocsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [docsPanelOpen, setDocsPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Load documents ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await academicsAPI.documents()
        setDocuments(res.data.results || res.data || [])
      } catch {
        // silent – documents optional
      } finally {
        setDocsLoading(false)
      }
    }
    load()
  }, [])

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, isTyping])

  // ── Current session ──────────────────────────────────────────────────────────
  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // ── Create new chat session ──────────────────────────────────────────────────
  const newSession = useCallback(() => {
    const id = crypto.randomUUID()
    const session: ChatSession = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(id)
  }, [])

  // ── Send message using real AI API ───────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string = input) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      // Ensure a session exists
      let sessionId = activeSessionId
      if (!sessionId) {
        const id = crypto.randomUUID()
        const session: ChatSession = {
          id,
          title: trimmed.slice(0, 40) || "New Chat",
          messages: [],
          createdAt: new Date(),
        }
        setSessions((prev) => [session, ...prev])
        setActiveSessionId(id)
        sessionId = id
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }

      // Add a loading placeholder for the AI reply
      const loadingMsgId = crypto.randomUUID()
      const loadingMsg: Message = {
        id: loadingMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            messages: [...s.messages, userMsg, loadingMsg],
            title: s.messages.length === 0 ? trimmed.slice(0, 40) : s.title,
          }
        })
      )
      setInput("")
      setIsTyping(true)

      // Detect intent
      const intent = detectIntent(trimmed, documents, selectedDocId)

      try {
        let aiContent = ""
        let aiResult: AIResult | undefined

        if (intent.kind === "generate_questions") {
          const res = await academicsAPI.generateQuestionsFromDocument(intent.docId, {
            question_type: intent.questionType,
            num_questions: intent.numQuestions,
            difficulty: intent.difficulty,
          })
          const normalized = normalizeAIResponse(res.data, intent.questionType)
          aiResult = normalized
          aiContent = buildTextFromAIResult(normalized)
        } else if (intent.kind === "generate_topic_questions") {
          const res = await academicsAPI.generateQuestionsFromTopic({
            topic: intent.topic,
            question_type: intent.questionType,
            num_questions: intent.numQuestions,
            difficulty: intent.difficulty,
          })
          const normalized = normalizeAIResponse(res.data, intent.questionType)
          aiResult = normalized
          aiContent = buildTextFromAIResult(normalized)
        } else if (intent.kind === "summarize_doc") {
          const res = await academicsAPI.generateSummaryFromDocument(intent.docId, {
            question_type: "summary",
            max_words: 300,
          })
          const normalized = normalizeAIResponse(res.data, "summary")
          aiResult = normalized
          aiContent = buildTextFromAIResult(normalized)
        } else if (intent.kind === "summarize_topic") {
          // For topic-based summaries, generate short answer questions as a study guide
          const res = await academicsAPI.generateQuestionsFromTopic({
            topic: intent.topic,
            question_type: "short_answer",
            num_questions: 3,
            difficulty: "medium",
          })
          const normalized = normalizeAIResponse(res.data, "short_answer")
          aiResult = normalized
          aiContent = `Here's what I found about **"${intent.topic}"**:\n\n` + buildTextFromAIResult(normalized)
        } else if (intent.kind === "list_docs") {
          aiContent = buildFallbackResponse("document list", documents)
        } else {
          // general — try generating topic questions or return helpful fallback
          try {
            const res = await academicsAPI.generateQuestionsFromTopic({
              topic: intent.topic,
              question_type: "short_answer",
              num_questions: 3,
              difficulty: "medium",
            })
            const normalized = normalizeAIResponse(res.data, "short_answer")
            if (normalized.count && normalized.count > 0) {
              aiResult = normalized
              aiContent =
                `Here's what AI generated about **"${trimmed}"**:\n\n` +
                buildTextFromAIResult(normalized)
            } else {
              aiContent = buildFallbackResponse(trimmed, documents)
            }
          } catch {
            aiContent = buildFallbackResponse(trimmed, documents)
          }
        }

        // Replace loading message with actual response
        const aiMsg: Message = {
          id: loadingMsgId,
          role: "assistant",
          content: aiContent,
          timestamp: new Date(),
          aiResult,
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.map((m) => (m.id === loadingMsgId ? aiMsg : m)) }
              : s
          )
        )
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to get AI response. Please check your connection or try again."

        const errMessage: Message = {
          id: loadingMsgId,
          role: "assistant",
          content: `❌ **Error:** ${errorMsg}`,
          timestamp: new Date(),
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.map((m) => (m.id === loadingMsgId ? errMessage : m)) }
              : s
          )
        )
      } finally {
        setIsTyping(false)
      }
    },
    [activeSessionId, input, isTyping, documents, selectedDocId]
  )

  // ── Delete session ────────────────────────────────────────────────────────────
  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) setActiveSessionId(null)
  }

  // ── Keyboard handler ──────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Filtered docs for the side panel ─────────────────────────────────────────
  const filteredDocs = documents.filter((d) =>
    `${d.title} ${d.subject_name} ${d.uploaded_by_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const docTypeColor: Record<string, string> = {
    certificate: "bg-yellow-100 text-yellow-700",
    transcript: "bg-blue-100 text-blue-700",
    syllabus: "bg-purple-100 text-purple-700",
    assignment: "bg-green-100 text-green-700",
    notes: "bg-indigo-100 text-indigo-700",
    other: "bg-gray-100 text-gray-600",
  }

  const showWelcome = !activeSession || activeSession.messages.length === 0

  return (
<div className="flex h-screen bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden min-h-screen">
      {/* ── Left sidebar – chat history ──────────────────────────────────────── */}
      <aside
        className={`
          flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800
          flex flex-col transition-all duration-300 overflow-hidden
          ${sidebarOpen ? "w-64 xl:w-72" : "w-0"}
        `}
      >
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logos/ai logo.png"
              alt="AI Study Assistant"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
              priority
            />
            <span className="font-bold text-gray-900 dark:text-white text-sm">AI Chat</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <div className="p-3 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </button>
          <button
            onClick={() => setDocsPanelOpen(!docsPanelOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Documents
            <Badge className="ml-auto text-xs bg-blue-100 text-blue-700 border-0 px-1.5 py-0">
              {documents.length}
            </Badge>
          </button>
        </div>

        {/* Projects / Chats header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Projects ({sessions.length})
          </span>
          <button
            onClick={newSession}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600"
            title="New Chat"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 pb-2">
          <button
            onClick={newSession}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Session list */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 pb-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                  ${
                    activeSessionId === session.id
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
                  }
                `}
                onClick={() => setActiveSessionId(session.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  {session.messages.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                      {session.messages
                        .filter((m) => !m.isLoading)
                        .at(-1)
                        ?.content.slice(0, 35)}
                      …
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(session.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">Student</p>
            <p className="text-xs text-gray-400 truncate">AI Learning Assistant</p>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Image
              src="/logos/ai logo.png"
              alt="AI Study Assistant"
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-cover flex-shrink-0"
              priority
            />
            <h1 className="font-bold text-gray-900 dark:text-white text-base">AI Study Assistant</h1>
          </div>

          {/* Selected document badge */}
          {selectedDocId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-lg">
              <FileText className="w-3 h-3 text-teal-600" />
              <span className="text-xs font-medium text-teal-700 dark:text-teal-300 truncate max-w-[140px]">
                {documents.find((d) => d.id === selectedDocId)?.title ?? "Document selected"}
              </span>
              <button onClick={() => setSelectedDocId(null)} className="text-teal-500 hover:text-teal-700">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex-1" />
          <button
            onClick={() => setDocsPanelOpen(!docsPanelOpen)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                docsPanelOpen
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }
            `}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Documents</span>
            <Badge className="bg-blue-600 text-white border-0 text-xs px-1.5 py-0 ml-0.5">{documents.length}</Badge>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Real AI</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Chat area ────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages / Welcome */}
            <ScrollArea className="flex-1 px-4 py-4 md:px-6 lg:px-8 h-full">


              {showWelcome ? (
                /* ── Welcome screen ────────────────────────────────────────── */
                <div className="flex flex-col items-center justify-center min-h-full py-12 text-center max-w-2xl mx-auto">
                  <Image
                    src="/logos/ai logo.png"
                    alt="AI Study Assistant"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-2xl object-cover shadow-lg flex-shrink-0 mb-4"
                    priority
                  />
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                    AI Study Assistant
                  </h2>
                  <p className="text-gray-500 dark:text-slate-400 mb-2 text-sm sm:text-base">
                    Powered by real AI — generate questions, summaries, and study materials instantly.
                  </p>
                  <div className="flex items-center gap-1.5 mb-8 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700 dark:text-teal-300">Connected to School AI</span>
                  </div>

                  {/* Quick action tiles */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.label}
                          onClick={() => {
                            setInput(action.prompt)
                            textareaRef.current?.focus()
                          }}
                          className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group text-left"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                            {action.label}
                          </span>
                          <Plus className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                        </button>
                      )
                    })}
                  </div>

                  {/* Recent documents hint */}
                  {!docsLoading && documents.length > 0 && (
                    <div className="mt-8 w-full max-w-md">
                      <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                        Your teacher's documents · {documents.length} available · click to select
                      </p>
                      <div className="space-y-2">
                        {documents.slice(0, 3).map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              setSelectedDocId(doc.id)
                              sendMessage(`Give me 5 multiple choice questions from the document: ${doc.title}`)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-700 transition-colors text-left group"
                          >
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{doc.title}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {doc.subject_name || doc.document_type} · {doc.uploaded_by_name}
                              </p>
                            </div>
                            <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Generate →
                            </span>
                          </button>
                        ))}
                        {documents.length > 3 && (
                          <p className="text-xs text-center text-gray-400 mt-1">
                            +{documents.length - 3} more — click "My Documents" to explore
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="mt-6 w-full max-w-md p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-left">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Try these prompts:</p>
                    <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      <li>• "Give me 5 MCQs from [document name]"</li>
                      <li>• "Summarize [document name]"</li>
                      <li>• "Create 3 essay questions about photosynthesis"</li>
                      <li>• "Give me short answer questions about World War 2"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* ── Message thread ────────────────────────────────────────── */
                <div className="max-w-3xl mx-auto space-y-6 pb-20">
                  {activeSession?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <Image
                          src="/logos/ai logo.png"
                          alt="AI Assistant"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                          priority
                        />
                      )}

                      <div
                        className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`
                            rounded-2xl px-4 py-3 text-sm leading-relaxed
                            ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm"
                            }
                          `}
                        >
                          {msg.isLoading ? (
                            <div className="flex gap-1 items-center py-1">
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                          ) : msg.role === "assistant" ? (
                            <>
                              <RenderMessage content={msg.content} />
                              {msg.aiResult && <RenderAIResult result={msg.aiResult} />}
                            </>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>

                        <span className="text-xs text-gray-300 dark:text-slate-600">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>



            {/* ── Input bar ──────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-4 py-3 md:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/50 transition-all">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedDocId
                        ? `Ask about "${documents.find((d) => d.id === selectedDocId)?.title ?? "selected document"}"…`
                        : "Ask me to generate questions, summarize a document, or quiz you on any topic…"
                    }
                    rows={1}
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 min-h-[24px] max-h-40 py-0 px-0"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                  >
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-2 px-1">
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Attach</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Voice Message</span>
                  </button>
                  <button
                    onClick={() => setDocsPanelOpen(!docsPanelOpen)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Browse Documents</span>
                  </button>
                  <span className="ml-auto text-xs text-gray-300 dark:text-slate-600">{input.length} / 3,000</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-300 dark:text-slate-600 mt-2">
                AI generates content using your school's AI engine. Results may vary. Always verify important information.
              </p>
            </div>
          </div>

          {/* ── Documents side panel ──────────────────────────────────────────── */}
          {docsPanelOpen && (
            <aside className="w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Teacher Documents</h3>
                  <button
                    onClick={() => setDocsPanelOpen(false)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 text-gray-700 dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {docsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <FileText className="w-10 h-10 text-gray-200 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      {searchQuery ? "No documents match your search" : "No documents yet"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {!searchQuery && "Your teachers haven't uploaded documents yet."}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedDocId === doc.id
                            ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
                            : "bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800"
                        }`}
                        onClick={() => {
                          setSelectedDocId(doc.id)
                          setDocsPanelOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedDocId === doc.id
                                ? "bg-teal-100 dark:bg-teal-900/40"
                                : "bg-blue-100 dark:bg-blue-900/40"
                            }`}
                          >
                            <FileText
                              className={`w-4 h-4 ${
                                selectedDocId === doc.id
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{doc.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <Badge
                                className={`text-xs px-1.5 py-0 border-0 ${
                                  docTypeColor[doc.document_type] ?? "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {doc.document_type}
                              </Badge>
                              {doc.subject_name && (
                                <span className="text-xs text-gray-400 truncate">· {doc.subject_name}</span>
                              )}
                            </div>
                            {doc.uploaded_by_name && (
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {doc.uploaded_by_name}
                              </p>
                            )}
                            <p className="text-xs text-gray-300 dark:text-slate-600 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocId(doc.id)
                              sendMessage(`Give me 5 multiple choice questions from the document: ${doc.title}`)
                              setDocsPanelOpen(false)
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Quiz Me
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocId(doc.id)
                              sendMessage(`Summarize the document: ${doc.title}`)
                              setDocsPanelOpen(false)
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                          >
                            Summarize
                          </button>
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-gray-600 dark:text-slate-300 transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        {selectedDocId === doc.id && (
                          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Selected — questions will use this document
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}