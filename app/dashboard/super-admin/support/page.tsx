"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, ChevronRight, LifeBuoy, Loader2, RefreshCw, RotateCcw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage, platformAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { PageHeader } from "@/components/super-admin/page-header"

const REFRESH_INTERVAL_MS = 15000

function getList(value: any): AnyObj[] {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.payload)) return value.payload
  if (Array.isArray(value?.data?.payload)) return value.data.payload
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data?.results)) return value.data.results
  return []
}

function getConversationContact(conversation: AnyObj): AnyObj {
  return conversation.meta?.sender ?? conversation.contact ?? conversation.sender ?? {}
}

function getSchoolName(conversation: AnyObj): string {
  const contact = getConversationContact(conversation)
  const attributes = contact.custom_attributes ?? contact.customAttributes ?? {}
  return String(
    attributes.school_name ??
      attributes.schoolName ??
      conversation.custom_attributes?.school_name ??
      conversation.school_name ??
      "",
  )
}

function getAdminName(conversation: AnyObj): string {
  const contact = getConversationContact(conversation)
  return String(contact.name ?? contact.email ?? "School administrator")
}

function getContactRole(conversation: AnyObj): string {
  const contact = getConversationContact(conversation)
  const attributes = contact.custom_attributes ?? contact.customAttributes ?? {}
  return String(attributes.role ?? "School Admin").replace(/_/g, " ")
}

function getLastMessage(conversation: AnyObj): string {
  const message =
    conversation.last_non_activity_message ??
    conversation.last_non_activity_message_content ??
    conversation.messages?.[conversation.messages.length - 1]
  if (typeof message === "string") return message
  return String(message?.content ?? conversation.last_message ?? "No messages yet")
}

function getMessageTime(message: AnyObj): string | null {
  const timestamp = message.created_at ?? message.updated_at
  if (!timestamp) return null
  const parsed = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString()
}

function isOutgoing(message: AnyObj): boolean {
  return message.message_type === 1 || message.sender_type === "User" || message.sender?.type === "user"
}

function isResolved(conversation: AnyObj): boolean {
  return ["resolved", "closed"].includes(String(conversation.status).toLowerCase())
}

export default function SupportCenterPage() {
  const [conversations, setConversations] = useState<AnyObj[]>([])
  const [messages, setMessages] = useState<AnyObj[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState("")

  const selected = useMemo(
    () => conversations.find((conversation) => Number(conversation.id) === selectedId) ?? null,
    [conversations, selectedId],
  )

  const loadConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const response = await platformAPI.chatwootConversations({ page, status: statusFilter })
      const nextConversations = getList(response.data)
      setConversations(nextConversations)
      setHasMore(nextConversations.length >= 25)
      setSelectedId((current) =>
        current && nextConversations.some((conversation) => Number(conversation.id) === current)
          ? current
          : null,
      )
      setError("")
    } catch (err) {
      setError(getErrorMessage(err, "Could not load Alara Help conversations."))
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [page, statusFilter])

  const loadMessages = useCallback(async (conversationId: number, showLoading = true) => {
    if (showLoading) setMessagesLoading(true)
    try {
      const response = await platformAPI.chatwootMessages(conversationId)
      setMessages(getList(response.data))
      setError("")
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this conversation."))
    } finally {
      if (showLoading) setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadConversations(false)
      if (selectedId !== null) void loadMessages(selectedId, false)
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [loadConversations, loadMessages, selectedId])

  useEffect(() => {
    if (selectedId === null) {
      setMessages([])
      return
    }
    void loadMessages(selectedId)
  }, [selectedId, loadMessages])

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) => {
      const contact = getConversationContact(conversation)
      return [
        getSchoolName(conversation),
        getAdminName(conversation),
        contact.email,
        getLastMessage(conversation),
        conversation.id,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    })
  }, [conversations, search])

  async function sendReply() {
    if (selectedId === null || !reply.trim() || busy) return
    setBusy(true)
    setError("")
    try {
      await platformAPI.replyToChatwootConversation(selectedId, reply.trim())
      setReply("")
      await Promise.all([loadMessages(selectedId, false), loadConversations(false)])
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the reply."))
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus() {
    if (selectedId === null || !selected || busy) return
    setBusy(true)
    setError("")
    try {
      await platformAPI.updateChatwootConversationStatus(
        selectedId,
        isResolved(selected) ? "open" : "resolved",
      )
      await loadConversations(false)
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the conversation status."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <PageHeader
        title="Alara Help"
        description="School support chats from the Alara Help website inbox. Select a conversation to read and reply."
      />

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(280px,360px)_1fr]">
        <aside className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">School conversations</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Refresh conversations"
                disabled={loading}
                onClick={() => void loadConversations()}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search school, admin, message..."
              aria-label="Search Alara Help conversations"
            />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              aria-label="Filter conversation status"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="min-h-[280px] flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading conversations…
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <LifeBuoy className="mx-auto mb-2 h-6 w-6" />
                No school conversations found.
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const conversationId = Number(conversation.id)
                const active = conversationId === selectedId
                const unreadCount = Number(conversation.unread_count ?? conversation.meta?.unread_count ?? 0)
                const schoolName = getSchoolName(conversation)
                return (
                  <button
                    key={conversationId}
                    type="button"
                    onClick={() => setSelectedId(conversationId)}
                    className={`w-full border-b p-4 text-left transition hover:bg-muted/60 ${
                      active ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {schoolName || "School name not provided"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="min-w-5 rounded-full bg-[#123A73] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {getAdminName(conversation)} · {getContactRole(conversation)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{getLastMessage(conversation)}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="capitalize">{String(conversation.status ?? "open")}</span>
                      <span>{getMessageTime(conversation.last_activity_at ? { created_at: conversation.last_activity_at } : conversation.last_non_activity_message) ?? ""}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t p-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        <div className="flex min-h-[480px] min-w-0 flex-col">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <LifeBuoy className="h-9 w-9" />
              <p className="font-medium">Choose a school chat</p>
              <p className="text-sm">Messages and replies for the selected school will appear here.</p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{getSchoolName(selected) || "School name not provided"}</h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {getAdminName(selected)}
                    {getConversationContact(selected).email ? ` · ${getConversationContact(selected).email}` : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void updateStatus()}>
                  {isResolved(selected) ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {isResolved(selected) ? "Reopen" : "Resolve"}
                </Button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No messages in this conversation yet.</p>
                ) : (
                  messages.map((message) => {
                    const outgoing = isOutgoing(message)
                    return (
                      <article
                        key={message.id}
                        className={`max-w-[85%] rounded-xl border p-3 ${
                          outgoing ? "ml-auto border-[#123A73]/20 bg-[#123A73]/10" : "bg-card"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                          <span>{outgoing ? (message.sender?.name ?? "Alara Help Team") : (message.sender?.name ?? getAdminName(selected))}</span>
                          <time>{getMessageTime(message)}</time>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm">{message.content || "Attachment/message"}</p>
                      </article>
                    )
                  })
                )}
              </div>

              <div className="space-y-2 border-t p-4">
                {isResolved(selected) && (
                  <p className="text-xs text-muted-foreground">This conversation is resolved. Reopen it to continue replying.</p>
                )}
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Reply to the school administrator..."
                  rows={3}
                  disabled={busy || isResolved(selected)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => void sendReply()}
                    disabled={busy || !reply.trim() || isResolved(selected)}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
