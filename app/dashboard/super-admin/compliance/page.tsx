"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  Pencil,
  ShieldAlert,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatCard, StatCardGrid } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { useFetch } from "@/components/super-admin/use-fetch"
import type { AnyObj } from "@/components/super-admin/types"
import { complianceAPI, getErrorMessage } from "@/lib/api"

function statusLabel(school: AnyObj) {
  if (school.school_status === "active" && school.approval_method === "approved_with_overrides") {
    return "approved_with_overrides"
  }
  if (school.school_status === "active") return "approved"
  return school.compliance_status || school.status || "not_started"
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

export default function CompliancePage() {
  const queue = useFetch<AnyObj[]>(
    () => complianceAPI.adminQueue().then((response) => response.data || []),
    [],
  )
  const allSchools = useFetch<AnyObj[]>(
    () => complianceAPI.adminDocuments().then((response) => response.data || []),
    [],
  )
  const [agreement, setAgreement] = useState({ title: "Alara School Agreement", summary: "", body: "", version: "1.0" })
  const [agreementDraft, setAgreementDraft] = useState(agreement)
  const [agreementEditorOpen, setAgreementEditorOpen] = useState(false)
  const [agreementLoading, setAgreementLoading] = useState(true)
  const [agreementLoadError, setAgreementLoadError] = useState("")
  const [agreementMessage, setAgreementMessage] = useState("")
  const [savingAgreement, setSavingAgreement] = useState(false)
  const [reviewSchool, setReviewSchool] = useState<AnyObj | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({})
  const [reviewingRequirement, setReviewingRequirement] = useState<number | null>(null)
  const [approvingAccount, setApprovingAccount] = useState(false)

  useEffect(() => {
    complianceAPI.agreement()
      .then((response) => {
        setAgreement(response.data)
        setAgreementDraft(response.data)
        setAgreementLoadError("")
      })
      .catch((err) => {
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof err.response === "object" &&
          err.response !== null &&
          "status" in err.response &&
          err.response.status === 404
        ) {
          setAgreementLoadError("")
          return
        }
        setAgreementLoadError(getErrorMessage(err, "Unable to load the school agreement."))
      })
      .finally(() => setAgreementLoading(false))
  }, [])

  async function saveAgreement() {
    setSavingAgreement(true)
    setAgreementMessage("")
    try {
      const response = await complianceAPI.saveAgreement(agreementDraft)
      setAgreement(response.data)
      setAgreementDraft(response.data)
      setAgreementMessage("Agreement published. School admins will see this version immediately.")
      setAgreementEditorOpen(false)
    } catch (err) {
      setAgreementMessage(getErrorMessage(err, "Unable to publish the agreement."))
    } finally {
      setSavingAgreement(false)
    }
  }

  async function openReview(school: AnyObj) {
    setReviewLoading(true)
    setReviewError("")
    try {
      const response = await complianceAPI.adminReview(school.school_id)
      setReviewSchool({
        ...response.data,
        school_id: school.school_id,
        school_name: school.school_name,
        school_email: school.school_email,
        school_status: school.school_status,
      })
    } catch (err) {
      setReviewError(getErrorMessage(err, "Unable to load this school's compliance."))
    } finally {
      setReviewLoading(false)
    }
  }

  async function reviewRequirement(requirementId: number, decision: "approve" | "reject") {
    if (!reviewSchool) return
    setReviewingRequirement(requirementId)
    setReviewError("")
    try {
      const response = await complianceAPI.reviewRequirement(
        reviewSchool.school_id,
        requirementId,
        decision,
        reviewNotes[requirementId] || "",
      )
      const updated = { ...reviewSchool, ...response.data }
      setReviewSchool(updated)
      queue.setData((current) => (current || []).map((school) => (
        school.school_id === updated.school_id
          ? { ...school, ...updated }
          : school
      )))
      allSchools.setData((current) => (current || []).map((school) => (
        school.school_id === updated.school_id
          ? { ...school, ...updated }
          : school
      )))
    } catch (err) {
      setReviewError(getErrorMessage(err, "Unable to save the review decision."))
    } finally {
      setReviewingRequirement(null)
    }
  }

  async function approveAccount() {
    if (!reviewSchool) return
    setApprovingAccount(true)
    setReviewError("")
    try {
      const response = await complianceAPI.approveAccount(reviewSchool.school_id)
      const updated = { ...reviewSchool, ...response.data }
      setReviewSchool(updated)
      queue.setData((current) => (current || []).map((school) => (
        school.school_id === updated.school_id
          ? { ...school, ...updated }
          : school
      )))
      allSchools.setData((current) => (current || []).map((school) => (
        school.school_id === updated.school_id
          ? { ...school, ...updated }
          : school
      )))
    } catch (err) {
      setReviewError(getErrorMessage(err, "Unable to approve this school account."))
    } finally {
      setApprovingAccount(false)
    }
  }

  const rows = useMemo(() => {
    return (queue.data || []).filter((school) => {
      const status = school.status
      return status !== "approved" && status !== "approved_with_overrides"
    }).map((profile) => ({
      ...profile,
      id: profile.school_id,
      name: profile.school_name,
      email: profile.school_email,
      status: profile.status,
      compliance_status: profile.status,
    }))
  }, [queue.data])

  const counts = useMemo(() => {
    const all = allSchools.data || []
    return {
      pending: all.filter((school) => ["pending", "in_progress"].includes(school.status)).length,
      submitted: all.filter((school) => ["submitted", "under_review"].includes(school.status)).length,
      rejected: all.filter((school) => ["rejected", "requires_resubmission"].includes(school.status)).length,
      approved: all.filter((school) => school.status === "approved").length,
    }
  }, [allSchools.data])

  const statsLoading = allSchools.loading ? "—" : undefined
  const reviewRequirements = (reviewSchool?.requirements || []) as AnyObj[]
  const documentRequirements = reviewRequirements.filter(
    (item) => item.requirement_type === "document" && item.is_applicable !== false,
  )
  const otherRequirements = reviewRequirements.filter((item) => item.requirement_type !== "document")

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="School Compliance"
        description="Monitor verification progress and identify schools that need review or resubmission."
      />

      {queue.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {getErrorMessage(queue.error, "Unable to load compliance queue.")}
        </div>
      )}
      {allSchools.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {getErrorMessage(allSchools.error, "Unable to load compliance statistics.")}
        </div>
      )}

      <StatCardGrid>
        <StatCard label="Needs completion" value={statsLoading ?? counts.pending} icon={Clock3} tone="warning" />
        <StatCard label="Awaiting review" value={statsLoading ?? counts.submitted} icon={ClipboardCheck} tone="warning" />
        <StatCard label="Requires resubmission" value={statsLoading ?? counts.rejected} icon={ShieldAlert} tone="danger" />
        <StatCard label="Approved schools" value={statsLoading ?? counts.approved} icon={FileCheck2} tone="success" />
      </StatCardGrid>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Alara School Agreement</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit and publish the agreement shown to school admins when they select Review &amp; accept.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{agreement.title}</p>
            <p className="text-sm text-muted-foreground">Version {agreement.version}</p>
            {agreementLoadError && <p className="mt-1 text-sm text-red-600">{agreementLoadError}</p>}
            {agreementMessage && <p className="mt-1 text-sm text-muted-foreground">{agreementMessage}</p>}
          </div>
          <button
            type="button"
            disabled={agreementLoading || !!agreementLoadError}
            onClick={() => {
              setAgreementDraft({ ...agreement })
              setAgreementMessage("")
              setAgreementEditorOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit school agreement
          </button>
        </div>
      </section>

      {agreementEditorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true" aria-labelledby="agreement-editor-title">
          <header className="flex items-center justify-between gap-4 border-b px-5 py-4 md:px-8">
            <div className="min-w-0">
              <h2 id="agreement-editor-title" className="truncate text-lg font-semibold">Edit school agreement</h2>
              <p className="text-sm text-muted-foreground">Changes take effect when you publish this agreement.</p>
            </div>
            <button
              type="button"
              onClick={() => setAgreementEditorOpen(false)}
              className="rounded-md border p-2 text-muted-foreground hover:bg-muted"
              aria-label="Close agreement editor"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="grid min-h-0 flex-1 grid-rows-[auto_auto_1fr] gap-4 overflow-y-auto p-5 md:px-8 md:py-6">
            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <label className="space-y-1.5 text-sm font-medium">
                Agreement title
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 font-normal"
                  value={agreementDraft.title}
                  onChange={(event) => setAgreementDraft({ ...agreementDraft, title: event.target.value })}
                  placeholder="Agreement title"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Version
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 font-normal"
                  value={agreementDraft.version}
                  onChange={(event) => setAgreementDraft({ ...agreementDraft, version: event.target.value })}
                  placeholder="Version"
                />
              </label>
            </div>
            <label className="space-y-1.5 text-sm font-medium">
              Summary
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-normal"
                value={agreementDraft.summary}
                onChange={(event) => setAgreementDraft({ ...agreementDraft, summary: event.target.value })}
                placeholder="Short summary"
              />
            </label>
            <label className="flex min-h-64 flex-col space-y-1.5 text-sm font-medium">
              Agreement text
              <textarea
                className="min-h-64 flex-1 resize-y rounded-md border bg-background px-3 py-3 font-normal leading-6"
                value={agreementDraft.body}
                onChange={(event) => setAgreementDraft({ ...agreementDraft, body: event.target.value })}
                placeholder="Write the agreement text here..."
              />
            </label>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 md:px-8">
            <p className="text-sm text-red-600" aria-live="polite">{agreementMessage}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={savingAgreement}
                onClick={() => setAgreementEditorOpen(false)}
                className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingAgreement || !agreementDraft.body.trim()}
                onClick={saveAgreement}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {savingAgreement && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                {savingAgreement ? "Publishing..." : "Publish agreement"}
              </button>
            </div>
          </footer>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border">
        <div className="border-b bg-muted/20 px-5 py-4">
          <h2 className="font-semibold">Compliance review queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Schools remain here until all required compliance is approved or explicitly bypassed.
          </p>
        </div>
        <div className="divide-y">
          {queue.loading && <p className="p-5 text-sm text-muted-foreground">Loading compliance records...</p>}
          {!queue.loading && !rows.length && (
            <p className="p-5 text-sm text-muted-foreground">No schools currently require compliance action.</p>
          )}
          {!queue.loading && rows.map((school) => (
            <div key={school.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{school.name}</p>
                <p className="text-sm text-muted-foreground">{school.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={statusLabel(school)} />
                <button
                  onClick={() => openReview(school)}
                  disabled={reviewLoading}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Review school
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {(reviewLoading || reviewSchool) && (
        <div className="fixed inset-0 z-50 bg-slate-100 text-slate-900">
          <div className="flex h-full flex-col">
            <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:px-8">
              <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
                <button
                  type="button"
                  onClick={() => setReviewSchool(null)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to review queue</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <span className="h-5 w-px bg-slate-200" />
                <h2 className="text-base font-semibold tracking-tight md:text-lg">Compliance review</h2>
                <button
                  type="button"
                  onClick={() => setReviewSchool(null)}
                  className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close compliance review"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {reviewLoading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-slate-600" aria-live="polite" aria-busy="true">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                Loading submitted compliance...
              </div>
            )}

            {reviewError && <div className="mx-auto mt-4 w-full max-w-7xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{reviewError}</div>}

            {reviewSchool && !reviewLoading && (
              <main className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-8 md:py-7">
                  <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{reviewSchool.school_name}</h1>
                        <StatusBadge status={statusLabel(reviewSchool)} />
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">
                        School account: <span className="font-medium capitalize text-slate-700">{String(reviewSchool.school_status || "unknown").replaceAll("_", " ")}</span>
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                        {reviewSchool.school_email && <span>{reviewSchool.school_email}</span>}
                        {reviewSchool.submitted_at && <span>Submitted {new Date(reviewSchool.submitted_at).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {(() => {
                      const submitted = documentRequirements.filter((item) => !!item.document).length
                      const verified = documentRequirements.filter((item) => ["approved", "bypassed"].includes(item.status)).length
                      const progress = documentRequirements.length ? Math.round((verified / documentRequirements.length) * 100) : 0
                      return (
                        <div className="space-y-4">
                          <div>
                            <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600">
                              <span>Documents verified</span>
                              <span>{verified}/{documentRequirements.length}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600">
                              <span>Documents submitted</span>
                              <span>{submitted}/{documentRequirements.length}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${documentRequirements.length ? (submitted / documentRequirements.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </section>

                  {reviewSchool.requirements?.some((item: AnyObj) => item.requirement_type === "information") && (
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Declared business information</h2>
                      <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                        {reviewSchool.requirements
                          .filter((item: AnyObj) => item.requirement_type === "information")
                          .flatMap((item: AnyObj) => {
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
                                {field.value == null || field.value === "" ? "—" : typeof field.value === "object" ? JSON.stringify(field.value) : String(field.value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-2 px-1">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Submitted documents</h2>
                        <p className="mt-1 text-xs text-slate-500">Review each document, add a note if needed, then approve or reject.</p>
                      </div>
                      {reviewSchool.status !== "approved" && (
                        <button
                          type="button"
                          onClick={approveAccount}
                          disabled={approvingAccount || reviewingRequirement !== null}
                          className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {approvingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {approvingAccount ? "Approving account..." : "Approve school account"}
                        </button>
                      )}
                    </div>

                    {!documentRequirements.length && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        No document requirements are assigned to this school.
                      </div>
                    )}
                    {documentRequirements.map((item) => {
                      const document = item.document as AnyObj | null
                      const previewType = document ? documentPreviewType(document) : "other"
                      const isResolved = ["approved", "bypassed"].includes(item.status)
                      return (
                        <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                {item.is_mandatory && <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Required</span>}
                                {!item.is_applicable && <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Not applicable</span>}
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
                                  {document.file_size > 0 && <span className="text-xs text-slate-500">{formatFileSize(Number(document.file_size))}</span>}
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
                                    <a href={document.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                                      <ExternalLink className="h-3.5 w-3.5" /> Open
                                    </a>
                                    <a href={document.file_url} download={document.file_name || true} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
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

                            {item.reason && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">Previous review: {item.reason}</p>}
                            {item.requirement_type === "document" && (
                              <div className="mt-4 border-t border-slate-100 pt-4">
                                <label className="block text-xs font-semibold text-slate-600" htmlFor={`review-note-${item.id}`}>Reviewer note</label>
                                <textarea
                                  id={`review-note-${item.id}`}
                                  rows={2}
                                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                  placeholder="Add feedback for the school, especially if rejecting this document."
                                  value={reviewNotes[item.id] || ""}
                                  onChange={(event) => setReviewNotes({ ...reviewNotes, [item.id]: event.target.value })}
                                />
                                <div className="mt-3 flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={reviewingRequirement !== null || isResolved || !document}
                                    onClick={() => reviewRequirement(item.id, "reject")}
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                                  >
                                    {reviewingRequirement === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Reject document
                                  </button>
                                  <button
                                    type="button"
                                    disabled={reviewingRequirement !== null || isResolved || !document}
                                    onClick={() => reviewRequirement(item.id, "approve")}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
                                  >
                                    {reviewingRequirement === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Verify document
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </section>

                  {!!otherRequirements.length && (
                    <section className="space-y-3">
                      <div className="px-1">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Other compliance requirements</h2>
                        <p className="mt-1 text-xs text-slate-500">Review submitted information and agreement acceptance.</p>
                      </div>
                      {otherRequirements.map((item) => {
                        const isResolved = ["approved", "bypassed"].includes(item.status)
                        return (
                          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                              </div>
                              <StatusBadge status={item.status || "pending"} />
                            </div>
                            {item.requirement_type === "agreement" && item.agreement && (
                              <div className="mt-3 rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">{item.agreement.title} · Version {item.agreement.version}</p>
                                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.agreement.body}</p>
                              </div>
                            )}
                            {item.reason && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">Previous review: {item.reason}</p>}
                            <label className="mt-4 block text-xs font-semibold text-slate-600" htmlFor={`review-note-${item.id}`}>Reviewer note</label>
                            <textarea
                              id={`review-note-${item.id}`}
                              rows={2}
                              className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              placeholder="Add feedback for the school."
                              value={reviewNotes[item.id] || ""}
                              onChange={(event) => setReviewNotes({ ...reviewNotes, [item.id]: event.target.value })}
                            />
                            <div className="mt-3 flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                disabled={reviewingRequirement !== null || isResolved}
                                onClick={() => reviewRequirement(item.id, "reject")}
                                className="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={reviewingRequirement !== null || isResolved}
                                onClick={() => reviewRequirement(item.id, "approve")}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </button>
                            </div>
                          </article>
                        )
                      })}
                    </section>
                  )}
                </div>
              </main>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
