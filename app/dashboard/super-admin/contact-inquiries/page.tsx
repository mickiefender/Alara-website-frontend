"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Inbox, Mail, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  const selected = inquiries.data?.find((item) => item.id === selectedId)
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
        {statuses.map((status) => <Card key={status}><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">{status}</p><p className="mt-1 text-2xl font-bold">{counts[status]}</p></CardContent></Card>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Inbox className="h-5 w-5" /> Inbox</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inquiries.loading && <p className="text-sm text-muted-foreground">Loading inquiries...</p>}
            {!inquiries.loading && !inquiries.data?.length && <p className="text-sm text-muted-foreground">No contact inquiries yet.</p>}
            {inquiries.data?.map((inquiry) => (
              <button key={inquiry.id} onClick={() => { setSelectedId(inquiry.id); if (inquiry.status === "new") updateStatus(inquiry.id, "read") }} className={`w-full rounded-lg border p-3 text-left transition hover:border-primary ${selectedId === inquiry.id ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3"><span className="font-semibold">{inquiry.name}</span><Badge variant="outline">{inquiry.status}</Badge></div>
                <p className="mt-1 text-sm text-muted-foreground">{inquiry.email}</p>
                <p className="mt-2 line-clamp-2 text-sm">{inquiry.message || "No message"}</p>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><MessageSquare className="mr-2 inline h-5 w-5" />Inquiry details</CardTitle></CardHeader>
          <CardContent>
            {!selected ? <p className="text-sm text-muted-foreground">Select an inquiry to view its details.</p> : (
              <div className="space-y-5">
                <div><h3 className="text-xl font-bold">{selected.name}</h3><a className="flex items-center gap-2 text-sm text-primary hover:underline" href={`mailto:${selected.email}`}><Mail className="h-4 w-4" />{selected.email}</a></div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">School</dt><dd>{selected.school || "—"}</dd></div><div><dt className="text-muted-foreground">Phone</dt><dd>{selected.phone || "—"}</dd></div><div><dt className="text-muted-foreground">Inquiry type</dt><dd className="capitalize">{selected.inquiry_type}</dd></div><div><dt className="text-muted-foreground">Received</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd></div></dl>
                <p className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{selected.message || "No message provided."}</p>
                <div className="flex flex-wrap gap-2">{selected.status !== "replied" && <Button onClick={() => updateStatus(selected.id, "replied")}><CheckCircle2 className="mr-2 h-4 w-4" />Mark replied</Button>}{selected.status !== "archived" && <Button variant="outline" onClick={() => updateStatus(selected.id, "archived")}>Archive</Button>}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
