"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { academicsAPI } from "@/lib/api"
import {
  Bot,
  Send,
  Paperclip,
  Mic,
  BookOpen,
  FileText,
  ImageIcon,
  Code2,
  Sparkles,
  Plus,
  ChevronRight,
  X,
  User,
  MessageSquare,
  Loader2,
  Download,
  ExternalLink,
  Clock,
  Search,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Document[]
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-action prompt tiles (mirrors the image's starter cards)
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: FileText,
    label: "Write copy",
    color: "bg-amber-100 text-amber-600",
    prompt: "Help me write a study note or summary for one of my documents.",
  },
  {
    icon: ImageIcon,
    label: "Image generation",
    color: "bg-blue-100 text-blue-600",
    prompt: "Describe a diagram or visual concept from my study material.",
  },
  {
    icon: User,
    label: "Create avatar",
    color: "bg-emerald-100 text-emerald-600",
    prompt: "Suggest a creative study persona or study plan for me.",
  },
  {
    icon: Code2,
    label: "Write code",
    color: "bg-pink-100 text-pink-600",
    prompt: "Help me write or debug code related to my coursework.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Simulated AI response (replace with real API when available)
// ─────────────────────────────────────────────────────────────────────────────
function buildAIResponse(userMessage: string, documents: Document[]): { content: string; sources: Document[] } {
  const lower = userMessage.toLowerCase()
  const relevantDocs = documents.filter((doc) => {
    const haystack = `${doc.title} ${doc.description ?? ""} ${doc.subject_name ?? ""} ${doc.document_type}`.toLowerCase()
    return lower.split(" ").some((word) => word.length > 3 && haystack.includes(word))
  })

  const topDocs = relevantDocs.slice(0, 3)

  let content = ""

  if (topDocs.length > 0) {
    content = `Based on your uploaded documents, here is what I found:\n\n`
    topDocs.forEach((doc) => {
      content += `**${doc.title}** (${doc.subject_name || doc.document_type})\n`
      if (doc.description) content += `${doc.description}\n`
      content += `\n`
    })
    content += `\nI've referenced the documents above. Would you like me to dive deeper into any specific topic or document?`
  } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    content = `Hello! 👋 I'm your AI Study Assistant. I can help you:\n\n• **Summarise** your uploaded documents\n• **Explain** complex topics from your materials\n• **Generate** study notes and summaries\n• **Answer questions** based on your course content\n\nYou currently have **${documents.length}** document${documents.length !== 1 ? "s" : ""} available. What would you like to explore?`
  } else if (lower.includes("summarize") || lower.includes("summary") || lower.includes("summarise")) {
    if (documents.length === 0) {
      content = `There are no documents available yet. Once your teachers upload materials, I'll be able to summarise them for you.`
    } else {
      content = `Here's a quick overview of your available documents:\n\n`
      documents.slice(0, 5).forEach((doc) => {
        content += `• **${doc.title}** — ${doc.subject_name || doc.document_type}${doc.uploaded_by_name ? ` (by ${doc.uploaded_by_name})` : ""}\n`
      })
      if (documents.length > 5) {
        content += `\n_...and ${documents.length - 5} more documents._`
      }
      content += `\n\nAsk me about any specific document or topic and I'll give you a detailed summary!`
    }
  } else if (lower.includes("document") || lower.includes("material") || lower.includes("file")) {
    if (documents.length === 0) {
      content = `Your teachers haven't uploaded any documents yet. Once they do, I'll be able to help you study and understand the materials.`
    } else {
      content = `You have **${documents.length}** document${documents.length !== 1 ? "s" : ""} available from your teachers:\n\n`
      const grouped: Record<string, Document[]> = {}
      documents.forEach((doc) => {
        const key = doc.subject_name || doc.document_type || "General"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(doc)
      })
      Object.entries(grouped).forEach(([subject, docs]) => {
        content += `**${subject}** (${docs.length})\n`
        docs.slice(0, 3).forEach((d) => content += `  • ${d.title}\n`)
        if (docs.length > 3) content += `  • _+${docs.length - 3} more_\n`
        content += `\n`
      })
    }
  } else {
    content = `I understand you're asking about: "${userMessage}"\n\n`
    if (documents.length > 0) {
      content += `I searched through your **${documents.length}** available document${documents.length !== 1 ? "s" : ""} but didn't find an exact match.\n\n`
      content += `You can try:\n• Being more specific about the topic\n• Mentioning the subject name (e.g., "Mathematics", "Science")\n• Asking me to list all your documents\n\nOr I can answer general questions about any academic topic!`
    } else {
      content = `I'm your AI Study Assistant! I can help with academic topics, explain concepts, and assist with your studies. Your teachers haven't uploaded any documents yet, but feel free to ask me anything!\n\nWhat would you like to learn about?`
    }
  }

  return { content, sources: topDocs }
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown-style renderer (lightweight, no external lib needed)
// ─────────────────────────────────────────────────────────────────────────────
function RenderMessage({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />
        // Bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          // Italic _text_
          const italicParts = part.split(/(_[^_]+_)/)
          return italicParts.map((p, k) => {
            if (p.startsWith("_") && p.endsWith("_")) {
              return <em key={k} className="text-gray-500">{p.slice(1, -1)}</em>
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

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string = input) => {
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

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const updated: ChatSession = {
          ...s,
          messages: [...s.messages, userMsg],
          title: s.messages.length === 0 ? trimmed.slice(0, 40) : s.title,
        }
        return updated
      })
    )
    setInput("")
    setIsTyping(true)

    // Simulate AI latency
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 800))

    const { content, sources } = buildAIResponse(trimmed, documents)
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      timestamp: new Date(),
      sources,
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, aiMsg] } : s
      )
    )
    setIsTyping(false)
  }, [activeSessionId, input, isTyping, documents])

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
    <div className="flex h-full bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden">
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
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
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
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
          >
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
                  ${activeSessionId === session.id
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
                      {session.messages[session.messages.length - 1].content.slice(0, 35)}…
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
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
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900 dark:text-white text-base">AI Chat</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setDocsPanelOpen(!docsPanelOpen)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${docsPanelOpen
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }
            `}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Documents</span>
            <Badge className="bg-blue-600 text-white border-0 text-xs px-1.5 py-0 ml-0.5">
              {documents.length}
            </Badge>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Chat area ────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages / Welcome */}
            <ScrollArea className="flex-1 px-4 py-4 md:px-6 lg:px-8">
              {showWelcome ? (
                /* ── Welcome screen ────────────────────────────────────────── */
                <div className="flex flex-col items-center justify-center min-h-full py-12 text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-gray-500 dark:text-slate-400 mb-10 text-sm sm:text-base">
                    Get started by asking a question and the AI can do the rest.{" "}
                    <span className="text-gray-400">Not sure where to start?</span>
                  </p>

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
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
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
                        Your teacher's documents · {documents.length} available
                      </p>
                      <div className="space-y-2">
                        {documents.slice(0, 3).map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => sendMessage(`Tell me about the document: ${doc.title}`)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-700 transition-colors text-left group"
                          >
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{doc.title}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {doc.subject_name || doc.document_type} · {doc.uploaded_by_name}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
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
                </div>
              ) : (
                /* ── Message thread ────────────────────────────────────────── */
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                  {activeSession?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`
                            rounded-2xl px-4 py-3 text-sm leading-relaxed
                            ${msg.role === "user"
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm"
                            }
                          `}
                        >
                          {msg.role === "assistant" ? (
                            <RenderMessage content={msg.content} />
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>

                        {/* Source documents */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="space-y-1.5 w-full">
                            <p className="text-xs text-gray-400 font-medium">Referenced documents:</p>
                            {msg.sources.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-300 flex-1 truncate">
                                  {doc.title}
                                </span>
                                <a
                                  href={doc.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 transition-colors"
                                  title="Open document"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

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

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
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
                    placeholder="Summarise the latest…"
                    rows={1}
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 min-h-[24px] max-h-40 py-0 px-0"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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
                  <span className="ml-auto text-xs text-gray-300 dark:text-slate-600">
                    {input.length} / 3,000
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-300 dark:text-slate-600 mt-2">
                AI may generate inaccurate information about people, places, or facts. Model: AI v1.3
              </p>
            </div>
          </div>

          {/* ── Documents side panel ──────────────────────────────────────────── */}
          {docsPanelOpen && (
            <aside className="w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Teacher Documents
                  </h3>
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
                        className="group p-3 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
                        onClick={() => {
                          sendMessage(`Tell me about the document: ${doc.title}`)
                          setDocsPanelOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                              {doc.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <Badge
                                className={`text-xs px-1.5 py-0 border-0 ${docTypeColor[doc.document_type] ?? "bg-gray-100 text-gray-600"}`}
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
                              sendMessage(`Summarise the document: ${doc.title}`)
                              setDocsPanelOpen(false)
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Ask AI
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
