"use client"

import { useMemo, useState } from "react"
import { FileCheck2, Loader2, Search, X } from "lucide-react"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { useFetch } from "@/components/super-admin/use-fetch"
import type { AnyObj } from "@/components/super-admin/types"
import { complianceAPI, getErrorMessage } from "@/lib/api"

function displayStatus(status: string) {
  return status.replaceAll("_", " ")
}

export default function ComplianceDocumentsPage() {
  const archive = useFetch<AnyObj[]>(
    () => complianceAPI.adminDocuments().then((response) => response.data || []),
    [],
  )
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<AnyObj | null>(null)

  const schools = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (archive.data || []).filter((school) =>
      !query || `${school.school_name} ${school.school_email}`.toLowerCase().includes(query),
    )
  }, [archive.data, search])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Compliance Documents"
        description="Browse compliance information and documents submitted by every school."
      />

      {archive.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {getErrorMessage(archive.error, "Unable to load compliance documents.")}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
          placeholder="Search school name or email..."
        />
      </div>

      <section className="overflow-hidden rounded-xl border">
        <div className="border-b bg-muted/20 px-5 py-4">
          <h2 className="font-semibold">Schools</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a school to view all submitted compliance records.</p>
        </div>
        <div className="divide-y">
          {archive.loading && (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading compliance documents...
            </div>
          )}
          {!archive.loading && !schools.length && <p className="p-6 text-sm text-muted-foreground">No schools found.</p>}
          {!archive.loading && schools.map((school) => (
            <button
              key={school.school_id}
              onClick={() => setSelected(school)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
            >
              <div>
                <p className="font-medium">{school.school_name}</p>
                <p className="text-sm text-muted-foreground">{school.school_email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={school.status} />
                <span className="text-sm text-primary">View records</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-semibold">{selected.school_name}</h2>
                <p className="text-sm text-muted-foreground">All compliance records provided by this school.</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md border p-2" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto p-6">
              {selected.requirements?.map((item: AnyObj) => (
                <div key={item.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="mt-2"><StatusBadge status={item.status} /></div>
                    </div>
                    {item.status === "approved" && <FileCheck2 className="h-5 w-5 text-emerald-600" />}
                  </div>
                  {item.document && (
                    <a className="mt-3 inline-block text-sm text-primary underline" href={item.document.file_url} target="_blank" rel="noreferrer">
                      View {item.document.file_name}
                    </a>
                  )}
                  {item.information && Object.keys(item.information).length > 0 && (
                    <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{JSON.stringify(item.information, null, 2)}</pre>
                  )}
                  {item.reason && <p className="mt-3 text-sm text-red-600">{item.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
