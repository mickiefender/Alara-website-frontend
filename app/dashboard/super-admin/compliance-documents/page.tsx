"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { useFetch } from "@/components/super-admin/use-fetch"
import type { AnyObj } from "@/components/super-admin/types"
import { complianceAPI, getErrorMessage } from "@/lib/api"

function schoolStatus(school: AnyObj) {
  if (school.school_status === "active" && school.approval_method === "approved_with_overrides") {
    return "approved_with_overrides"
  }
  if (school.school_status === "active") return "approved"
  return school.status || school.compliance_status || "not_started"
}

function formatFileSize(size: number) {
  if (!size) return ""
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function documentPreviewType(document: AnyObj) {
  const mimeType = String(document.mime_type || "").toLowerCase()
  const fileName = String(document.file_name || "").toLowerCase()
  if (mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(fileName)) return "image"
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) return "pdf"
  return "other"
}

export default function ComplianceDocumentsPage() {
  const router = useRouter()
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

  const selectedRequirements = (selected?.requirements || []) as AnyObj[]
  const documentRequirements = selectedRequirements.filter(
    (item) => item.requirement_type === "document" && item.is_applicable !== false,
  )
  const otherRequirements = selectedRequirements.filter((item) => item.requirement_type !== "document")
  const submittedCount = documentRequirements.filter((item) => !!item.document).length
  const verifiedCount = documentRequirements.filter((item) => ["approved", "bypassed"].includes(item.status)).length
  const documentPercent = documentRequirements.length
    ? Math.round((verifiedCount / documentRequirements.length) * 100)
    : 0
  const submittedPercent = documentRequirements.length
    ? Math.round((submittedCount / documentRequirements.length) * 100)
    : 0
  const totalSubmittedDocuments = (archive.data || []).reduce(
    (total, school) =>
      total + ((school.requirements || []) as AnyObj[]).filter(
        (item) => item.requirement_type === "document" && !!item.document,
      ).length,
    0,
  )

  if (selected) {
    return (
      <div className="fixed inset-0 z-30 bg-slate-100 text-slate-900 lg:left-64">
        <div className="flex h-full flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:px-8">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelected(null)
                  router.push("/dashboard/super-admin/compliance-documents")
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to compliance documents</span>
                <span className="sm:hidden">Back</span>
              </button>
              <span className="h-5 w-px bg-slate-200" />
              <h1 className="text-base font-semibold tracking-tight md:text-lg">Compliance records</h1>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close compliance records"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-8 md:py-7">
              <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{selected.school_name}</h2>
                    <StatusBadge status={schoolStatus(selected)} />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">
                    School account:{" "}
                    <span className="font-medium capitalize text-slate-700">
                      {String(selected.school_status || "unknown").replaceAll("_", " ")}
                    </span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    {selected.school_email && <span>{selected.school_email}</span>}
                    {selected.submitted_at && <span>Submitted {new Date(selected.submitted_at).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600">
                      <span>Documents verified</span>
                      <span>{verifiedCount}/{documentRequirements.length}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${documentPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600">
                      <span>Documents submitted</span>
                      <span>{submittedCount}/{documentRequirements.length}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${submittedPercent}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              {selectedRequirements.some((item) => item.requirement_type === "information") && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Declared business information</h2>
                  <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                    {selectedRequirements
                      .filter((item) => item.requirement_type === "information")
                      .flatMap((item) => {
                        const fields = Array.isArray(item.information_schema) ? item.information_schema : []
                        return fields.map((field: AnyObj) => ({
                          key: `${item.id}-${field.key}`,
                          label: field.label || field.key,
                          value: item.information?.[field.key],
                        }))
                      })
                      .map((field: { key: string; label: string; value: unknown }) => (
                        <div key={field.key} className="flex min-w-0 items-start justify-between gap-4 border-b border-slate-100 py-3 text-sm">
                          <span className="text-slate-500">{field.label}</span>
                          <span className="break-all text-right font-semibold text-slate-700">
                            {field.value == null || field.value === ""
                              ? "—"
                              : typeof field.value === "object"
                                ? JSON.stringify(field.value)
                                : String(field.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <div className="px-1">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Submitted documents</h2>
                  <p className="mt-1 text-xs text-slate-500">Documents are displayed here for viewing and download.</p>
                </div>

                {!documentRequirements.length && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    No document requirements are assigned to this school.
                  </div>
                )}
                {documentRequirements.map((item) => {
                  const document = item.document as AnyObj | null
                  const previewType = document ? documentPreviewType(document) : "other"
                  return (
                    <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            {item.is_mandatory && (
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                Required
                              </span>
                            )}
                            {!item.is_applicable && (
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                                Not applicable
                              </span>
                            )}
                          </div>
                          {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                        </div>
                        <StatusBadge status={item.status || "pending"} />
                      </div>

                      <div className="p-4 md:p-5">
                        {document ? (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <a
                                href={document.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                              >
                                <FileText className="h-4 w-4 shrink-0" />
                                <span className="truncate">{document.file_name || "Uploaded document"}</span>
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </a>
                              {document.file_size > 0 && (
                                <span className="text-xs text-slate-500">{formatFileSize(Number(document.file_size))}</span>
                              )}
                            </div>

                            <div className="mt-3 flex min-h-56 items-center justify-center overflow-hidden rounded-lg bg-slate-900 md:min-h-[420px]">
                              {previewType === "pdf" ? (
                                <iframe
                                  title={`Preview: ${document.file_name || item.name}`}
                                  src={document.file_url}
                                  className="h-[55vh] min-h-56 w-full bg-white md:h-[65vh] md:max-h-[680px]"
                                />
                              ) : previewType === "image" ? (
                                <img
                                  src={document.file_url}
                                  alt={`Preview: ${document.file_name || item.name}`}
                                  className="max-h-[65vh] w-full object-contain"
                                />
                              ) : (
                                <div className="p-8 text-center text-sm text-slate-300">
                                  <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                                  Preview is unavailable for this file type. Open or download it to review.
                                </div>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-b-lg border border-t-0 border-slate-200 bg-slate-50 px-3 py-2">
                              <span className="min-w-0 truncate text-xs text-slate-600">
                                {document.document_number ? `Reference ${document.document_number}` : document.file_name}
                                {document.expiry_date ? ` · Expires ${new Date(document.expiry_date).toLocaleDateString()}` : ""}
                              </span>
                              <div className="flex shrink-0 gap-2">
                                <a
                                  href={document.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Open
                                </a>
                                <a
                                  href={document.file_url}
                                  download={document.file_name || true}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                >
                                  <Download className="h-3.5 w-3.5" /> Download
                                </a>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                            No document has been submitted for this requirement yet.
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </section>

              {!!otherRequirements.length && (
                <section className="space-y-3">
                  <div className="px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Other compliance records</h2>
                    <p className="mt-1 text-xs text-slate-500">Submitted information and agreement records.</p>
                  </div>
                  {otherRequirements.map((item) => (
                    <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status || "pending"} />
                          {item.status === "approved" && <FileCheck2 className="h-4 w-4 text-emerald-600" />}
                        </div>
                      </div>

                      {item.requirement_type === "information" && (
                        <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
                          {(Array.isArray(item.information_schema) ? item.information_schema : []).map((field: AnyObj) => (
                            <div key={field.key} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm">
                              <span className="text-slate-500">{field.label || field.key}</span>
                              <span className="break-all text-right font-medium text-slate-700">
                                {item.information?.[field.key] == null || item.information?.[field.key] === ""
                                  ? "—"
                                  : String(item.information[field.key])}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.requirement_type === "agreement" && item.agreement && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">
                            {item.agreement.title} · Version {item.agreement.version}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.agreement.body}</p>
                        </div>
                      )}
                      {item.reason && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">{item.reason}</p>}
                    </article>
                  ))}
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Compliance Documents"
        description="Browse school compliance records and preview submitted documents without leaving the page."
      />

      {archive.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {getErrorMessage(archive.error, "Unable to load compliance documents.")}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schools on record</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{archive.loading ? "—" : archive.data?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted documents</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{archive.loading ? "—" : totalSubmittedDocuments}</p>
        </div>
      </section>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Search school name or email..."
          aria-label="Search schools by name or email"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b bg-muted/20 px-5 py-4">
          <h2 className="font-semibold">Schools</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a school to view its records and preview uploaded documents.</p>
        </div>
        <div className="divide-y divide-border">
          {archive.loading && (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading compliance documents...
            </div>
          )}
          {!archive.loading && !schools.length && <p className="p-6 text-sm text-muted-foreground">No schools found.</p>}
          {!archive.loading && schools.map((school) => {
            const requirements = (school.requirements || []) as AnyObj[]
            const submitted = requirements.filter((item) => item.requirement_type === "document" && !!item.document).length
            const total = requirements.filter((item) => item.requirement_type === "document" && item.is_applicable !== false).length
            return (
              <button
                key={school.school_id}
                type="button"
                onClick={() => setSelected(school)}
                className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{school.school_name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{school.school_email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-muted-foreground">{submitted}/{total} documents submitted</span>
                  <StatusBadge status={schoolStatus(school)} />
                  <span className="text-sm font-medium text-primary">View records</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
