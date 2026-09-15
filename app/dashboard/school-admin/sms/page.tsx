"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  FileText,
  History as HistoryIcon,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react"
import { messagingAPI } from "@/lib/api"
import { ProtectedRoute } from "@/lib/protected-route"

type SmsTab = "overview" | "compose" | "templates" | "history" | "settings"
type SmsConfig = {
  sender_id?: string
  sender_id_status?: string
  rejection_reason?: string
  is_enabled?: boolean
}
type SmsDashboard = {
  balance: number
  sent: number
  delivered: number
  failed: number
  credits_used: number
  recent: Array<Record<string, any>>
}

const tabs: Array<{ id: SmsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "compose", label: "Compose", icon: Send },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "settings", label: "Settings", icon: Settings },
]

function getError(error: any, fallback: string) {
  return error?.response?.data?.detail || fallback
}

export default function SmsDashboardPage() {
  const [activeTab, setActiveTab] = useState<SmsTab>("overview")
  const [dashboard, setDashboard] = useState<SmsDashboard | null>(null)
  const [config, setConfig] = useState<SmsConfig>({})
  const [templates, setTemplates] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const refresh = async () => {
    setLoading(true)
    setError("")
    try {
      const [dashboardResponse, settingsResponse, templatesResponse, messagesResponse] =
        await Promise.all([
          messagingAPI.smsDashboard(),
          messagingAPI.smsSettings(),
          messagingAPI.smsTemplates(),
          messagingAPI.smsMessages(),
        ])
      setDashboard(dashboardResponse.data)
      setConfig(settingsResponse.data)
      setTemplates(templatesResponse.data?.results || templatesResponse.data || [])
      setMessages(messagesResponse.data?.results || messagesResponse.data || [])
    } catch (err) {
      setError(getError(err, "Unable to load your SMS workspace."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const status = config.sender_id_status || "pending"
  const isReady = status === "approved" && Boolean(config.is_enabled)

  return (
    <ProtectedRoute allowedRoles={["school_admin", "teacher", "academic_admin", "exam_officer", "finance_officer", "ct_admin_support"]}>
      <div className="min-h-full bg-background p-4 text-foreground md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1a3a52]">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a3a52] text-white">
                  <MessageSquare className="h-4 w-4" />
                </span>
                Communication center
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">School SMS</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Send thoughtful updates, manage reusable templates, and track delivery from one simple workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a52] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244d69]"
            >
              <Send className="h-4 w-4" /> Compose message
            </button>
          </header>

          {(error || notice) && (
            <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {error ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{error || notice}</span>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <nav className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />)}
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <Overview dashboard={dashboard} config={config} onCompose={() => setActiveTab("compose")} />
              )}
              {activeTab === "compose" && (
                <Compose
                  config={config}
                  templates={templates}
                  onComplete={async (message) => { setNotice(message); await refresh(); setActiveTab("history") }}
                />
              )}
              {activeTab === "templates" && (
                <Templates templates={templates} onRefresh={refresh} setError={setError} setNotice={setNotice} />
              )}
              {activeTab === "history" && <History messages={messages} />}
              {activeTab === "settings" && (
                <SettingsPanel config={config} onSaved={async (message) => { setNotice(message); await refresh() }} />
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

function Overview({ dashboard, config, onCompose }: { dashboard: SmsDashboard | null; config: SmsConfig; onCompose: () => void }) {
  const ready = config.sender_id_status === "approved" && config.is_enabled
  const cards = [
    ["Available credits", dashboard?.balance ?? 0, "text-[#1a3a52]"],
    ["Messages sent", dashboard?.sent ?? 0, "text-slate-900"],
    ["Delivered", dashboard?.delivered ?? 0, "text-emerald-600"],
    ["Credits used", dashboard?.credits_used ?? 0, "text-slate-900"],
  ]
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, color]) => (
          <div key={String(label)} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-3 text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm text-primary-foreground/70">Ready to communicate?</p><h2 className="mt-1 text-2xl font-bold">Reach your school community.</h2></div>
            <MessageSquare className="h-7 w-7 text-primary-foreground/70" />
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75">Send attendance reminders, fee notices, announcements, and important updates with your approved school identity.</p>
          <button type="button" onClick={onCompose} className="mt-6 rounded-xl bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary">Start composing</button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sender profile</p>
          <div className="mt-4 flex items-center justify-between"><span className="text-xl font-bold text-foreground">{config.sender_id || "Not configured"}</span><StatusPill status={config.sender_id_status || "pending"} /></div>
          <p className="mt-3 text-sm text-muted-foreground">{ready ? "Your Sender ID is approved and SMS is enabled." : "Complete Sender ID approval before sending SMS."}</p>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-foreground">Recent activity</h2><span className="text-xs text-muted-foreground">Latest messages</span></div>
        <ActivityList messages={dashboard?.recent || []} />
      </section>
    </div>
  )
}

function Compose({ config, templates, onComplete }: { config: SmsConfig; templates: any[]; onComplete: (message: string) => Promise<void> }) {
  const [audience, setAudience] = useState("all_parents")
  const [phones, setPhones] = useState("")
  const [message, setMessage] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const ready = config.sender_id_status === "approved" && config.is_enabled
  const recipientCount = audience === "custom" ? phones.split(/[\n,]+/).map((phone) => phone.trim()).filter(Boolean).length : null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!ready) { setError("Your Sender ID must be approved and SMS enabled before sending."); return }
    if (!message.trim()) { setError("Write a message before sending."); return }
    if (audience === "custom" && !recipientCount) { setError("Add at least one phone number."); return }
    if (!window.confirm("Send this SMS now?")) return
    setSending(true)
    try {
      const response = await messagingAPI.sendSms({
        audience,
        custom_phone_numbers: audience === "custom" ? phones.split(/[\n,]+/).map((phone) => phone.trim()).filter(Boolean) : undefined,
        message,
      })
      await onComplete(`SMS queued successfully for ${response.data.recipient_count} recipient${response.data.recipient_count === 1 ? "" : "s"}.`)
      setMessage("")
      setTemplateId("")
      setPhones("")
    } catch (err) {
      setError(getError(err, "Unable to queue SMS."))
    } finally { setSending(false) }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-[#1a3a52]">New message</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Compose an SMS</h2></div>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-semibold text-slate-700">Recipients<select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-[#1a3a52]"><option value="all_parents">All parents</option><option value="all_teachers">All teachers</option><option value="all_students">All students</option><option value="custom">Custom phone numbers</option></select></label>
        {audience === "custom" && <textarea value={phones} onChange={(event) => setPhones(event.target.value)} placeholder="One number per line or separated by commas" className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1a3a52]" />}
        <label className="mt-5 block text-sm font-semibold text-slate-700">Message<textarea required maxLength={5000} value={message} onChange={(event) => { setTemplateId(""); setMessage(event.target.value) }} placeholder="Write a clear, helpful update..." className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 p-3 font-normal leading-6 outline-none focus:border-[#1a3a52]" /></label>
        <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{message.length}/5000 characters</span><span>{recipientCount !== null ? `${recipientCount} recipient${recipientCount === 1 ? "" : "s"}` : "Recipient count calculated on send"}</span></div>
        <button disabled={sending} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a3a52] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />{sending ? "Queueing..." : "Send message"}</button>
      </form>
      <aside className="rounded-2xl border border-border bg-muted p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick templates</p>
        <div className="mt-4 space-y-2">{templates.length ? templates.map((template) => <button key={template.id} type="button" onClick={() => { setTemplateId(String(template.id)); setMessage(template.message) }} className={`w-full rounded-xl border bg-white p-3 text-left text-sm transition hover:border-[#1a3a52] ${templateId === String(template.id) ? "border-[#1a3a52] ring-1 ring-[#1a3a52]" : "border-slate-200"}`}><span className="font-semibold text-slate-800">{template.name}</span><span className="mt-1 block line-clamp-2 text-xs text-slate-500">{template.message}</span></button>) : <p className="text-sm text-slate-500">Create templates from the Templates tab to reuse common messages.</p>}</div>
      </aside>
    </section>
  )
}

function Templates({ templates, onRefresh, setError, setNotice }: { templates: any[]; onRefresh: () => Promise<void>; setError: (value: string) => void; setNotice: (value: string) => void }) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("")
    try { await messagingAPI.createSmsTemplate({ name, message, category: "custom" }); setName(""); setMessage(""); setNotice("Template saved."); await onRefresh() } catch (err) { setError(getError(err, "Unable to save template.")) } finally { setSaving(false) }
  }
  async function remove(id: number) {
    if (!window.confirm("Delete this template?")) return
    try { await messagingAPI.deleteSmsTemplate(id); setNotice("Template deleted."); await onRefresh() } catch (err) { setError(getError(err, "Unable to delete template.")) }
  }
  return <section className="space-y-5">  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-[#1a3a52]">Reusable content</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Message templates</h2><p className="mt-1 text-sm text-slate-500">Use variables such as {"{{parent_name}}"} and {"{{student_name}}"}.</p><form onSubmit={create} className="mt-5 grid gap-3 md:grid-cols-[1fr_2fr_auto]"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1a3a52]" /><input required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Dear {{parent_name}}, ..." className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1a3a52]" /><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a52] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Add</button></form></div><div className="grid gap-3 md:grid-cols-2">{templates.map((template) => <div key={template.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="font-semibold text-slate-900">{template.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{template.message}</p></div><button type="button" onClick={() => remove(template.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>
}

function History({ messages }: { messages: any[] }) {
  return   <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-wider text-[#1a3a52]">Delivery log</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Message history</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr>{["Date", "Recipient", "Message", "Status", "Credits"].map((heading) => <th key={heading} className="p-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{messages.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="p-3 text-slate-500">{new Date(item.created_at).toLocaleString()}</td><td className="p-3 font-medium text-slate-700">{item.recipient}</td><td className="max-w-sm truncate p-3 text-slate-500">{item.message}</td><td className="p-3"><StatusPill status={item.status} /></td><td className="p-3 text-slate-500">{item.credits_used}</td></tr>)}</tbody></table>{!messages.length && <p className="p-8 text-center text-sm text-slate-500">No SMS activity yet.</p>}</div></section>
}

function SettingsPanel({ config, onSaved }: { config: SmsConfig; onSaved: (message: string) => Promise<void> }) {
  const [sender, setSender] = useState(config.sender_id || "")
  const [enabled, setEnabled] = useState(Boolean(config.is_enabled))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  async function save(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { const response = await messagingAPI.updateSmsSettings({ sender_id: sender }); setEnabled(Boolean(response.data.is_enabled)); await onSaved("Sender ID submitted for approval.") } catch (err) { setError(getError(err, "Unable to update SMS settings.")) } finally { setSaving(false) } }
  async function toggle() { setSaving(true); setError(""); try { const response = await messagingAPI.updateSmsSettings({ is_enabled: !enabled }); setEnabled(Boolean(response.data.is_enabled)); await onSaved(enabled ? "SMS disabled." : "SMS enabled.") } catch (err) { setError(getError(err, "Unable to change SMS status.")) } finally { setSaving(false) } }
  return <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-[#1a3a52]">Sender profile</p><h2 className="mt-1 text-2xl font-bold text-slate-900">SMS settings</h2><p className="mt-1 text-sm text-slate-500">Your Sender ID is reviewed by a Super Admin before messages can be sent.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="mt-6 block text-sm font-semibold text-slate-700">Sender ID<input required minLength={2} maxLength={11} value={sender} onChange={(event) => setSender(event.target.value.toUpperCase())} placeholder="STMARYS" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#1a3a52]" /></label><div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Current status</span><StatusPill status={config.sender_id_status || "pending"} /></div>{config.rejection_reason && <p className="mt-3 text-sm text-red-600">{config.rejection_reason}</p>}<div className="mt-5 flex flex-wrap gap-3"><button disabled={saving} className="rounded-xl bg-[#1a3a52] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Submit for approval"}</button>{config.sender_id_status === "approved" && <button disabled={saving} type="button" onClick={toggle} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">{enabled ? "Disable SMS" : "Enable SMS"}</button>}</div></form><div className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><Settings className="h-6 w-6 text-[#1a3a52]" /><h3 className="mt-4 font-bold text-slate-900">Before you send</h3><ul className="mt-3 space-y-3 text-sm leading-5 text-slate-500"><li>Use the same Sender ID approved in your Arkesel account.</li><li>Your Super Admin must approve the Sender ID in Alara.</li><li>SMS credits are reserved when a message is queued.</li></ul></div></section>
}

function ActivityList({ messages }: { messages: any[] }) {
  if (!messages.length) return <p className="py-6 text-sm text-slate-500">No SMS activity yet.</p>
  return <div className="divide-y divide-slate-100">{messages.slice(0, 5).map((item) => <div key={item.id} className="flex flex-col justify-between gap-2 py-3 text-sm sm:flex-row"><span className="truncate text-slate-700">{item.recipient} · {item.message}</span><StatusPill status={item.status} /></div>)}</div>
}

function StatusPill({ status }: { status: string }) {
  const positive = ["approved", "delivered", "sent", "completed"].includes(status)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${positive ? "bg-emerald-50 text-emerald-700" : status === "failed" || status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{status}</span>
}
