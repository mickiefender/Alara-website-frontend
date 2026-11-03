"use client"

import { useMemo, useState } from "react"
import { Archive, Building2, CalendarDays, CheckCircle2, Inbox, Mail, MessageSquare, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getErrorMessage, platformAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"

const statuses = ["new", "read", "replied", "archived"]

export default function ContactInquiriesPage() {
  const inquiries = useFetch<AnyObj[]>(
    () => platformAPI.contactInquiries().then((response) => response.data?.results || response.data || []),
    [],
  )
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [actionError, setActionError] = useState("")
  const [search, setSearch] = useState("")
  const selected = inquiries.data?.find((item) => item.id === selectedId)
  const filteredInquiries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...(inquiries.data || [])]
      .filter((item) =>
        !query || `${item.name} ${item.email} ${item.school} ${item.inquiry_type} ${item.message}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [inquiries.data, search])
  const counts = useMemo(
    () => Object.fromEntries(statuses.map((status) => [status, inquiries.data?.filter((item) => item.status === status).length || 0])),
    [inquiries.data],
  )

  async function updateStatus(id: number, status: string) {
    setActionError("")
    try {
      await platformAPI.updateContactInquiry(id, { status })
      await inquiries.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Contact Inquiries" description="Review messages submitted through the public contact form." />
      {actionError && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600">{actionError}</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statuses.map((status) => (
          <Card key={status} className="border-border/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{status}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{counts[status]}</p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${
                status === "new" ? "bg-primary" :
                  status === "read" ? "bg-sky-500" :
                    status === "replied" ? "bg-emerald-500" : "bg-slate-400"
              }`} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="space-y-4 border-b bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-5 w-5 text-primary" />
              Inbox
              <span className="ml-auto rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {filteredInquiries.length}
              </span>
            </CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, school, email..."
                aria-label="Search contact inquiries"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[680px] overflow-y-auto p-0">
            {inquiries.loading && <p className="p-6 text-sm text-muted-foreground">Loading inquiries...</p>}
            {!inquiries.loading && !filteredInquiries.length && (
              <div className="p-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">{search ? "No matching inquiries" : "Your inbox is empty"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {search ? "Try another name, email, or school." : "New contact form messages will appear here."}
                </p>
              </div>
            )}
            {!inquiries.loading && filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                aria-pressed={selectedId === inquiry.id}
                onClick={() => {
                  setSelectedId(inquiry.id)
                  if (inquiry.status === "new") updateStatus(inquiry.id, "read")
                }}
                className={`relative flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-muted/40 ${
                  selectedId === inquiry.id ? "bg-primary/5" : "bg-card"
                }`}
              >
                {selectedId === inquiry.id && <span className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {String(inquiry.name || "?").trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${inquiry.status === "new" ? "font-bold" : "font-semibold"}`}>
                      {inquiry.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{inquiry.email}</span>
                  <span className="mt-2 block line-clamp-2 text-xs leading-5 text-foreground/80">
                    {inquiry.message || "No message provided."}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      inquiry.status === "new" ? "bg-primary/10 text-primary" :
                        inquiry.status === "replied" ? "bg-emerald-500/10 text-emerald-700" :
                          inquiry.status === "archived" ? "bg-muted text-muted-foreground" :
                            "bg-sky-500/10 text-sky-700"
                    }`}>
                      {inquiry.status}
                    </span>
                    {inquiry.inquiry_type && (
                      <span className="truncate text-[10px] text-muted-foreground">
                        {String(inquiry.inquiry_type).replaceAll("_", " ")}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm lg:sticky lg:top-20">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-primary" />
              Inquiry details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </span>
                <p className="mt-3 text-sm font-medium">Select a message</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">Choose an inquiry from your inbox to read the full message and manage its status.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {String(selected.name || "?").trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase()}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{selected.name}</h3>
                      <a className="flex items-center gap-1.5 text-sm text-primary hover:underline" href={`mailto:${selected.email}`}>
                        <Mail className="h-3.5 w-3.5" />{selected.email}
                      </a>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{selected.status}</span>
                </div>
                <dl className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">School</dt><dd className="mt-0.5 font-medium">{selected.school || "—"}</dd></div></div>
                  <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="mt-0.5 font-medium">{selected.phone || "—"}</dd></div></div>
                  <div className="flex items-start gap-2"><MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Inquiry type</dt><dd className="mt-0.5 font-medium capitalize">{String(selected.inquiry_type || "general").replaceAll("_", " ")}</dd></div></div>
                  <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Received</dt><dd className="mt-0.5 font-medium">{new Date(selected.created_at).toLocaleString()}</dd></div></div>
                </dl>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</p>
                  <p className="min-h-32 whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm leading-6">
                    {selected.message || "No message provided."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {selected.status !== "replied" && (
                    <Button onClick={() => updateStatus(selected.id, "replied")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />Mark replied
                    </Button>
                  )}
                  {selected.status !== "archived" && (
                    <Button variant="outline" onClick={() => updateStatus(selected.id, "archived")}>
                      <Archive className="mr-2 h-4 w-4" />Archive
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
