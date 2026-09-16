"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardCheck, Clock3, FileCheck2, Loader2, ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatCard, StatCardGrid } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { useFetch } from "@/components/super-admin/use-fetch"
import type { AnyObj } from "@/components/super-admin/types"
import { complianceAPI, getErrorMessage } from "@/lib/api"

function statusLabel(school: AnyObj) {
  if (school.status === "active" && school.approval_method === "approved_with_overrides") {
    return "approved_with_overrides"
  }
  if (school.status === "active") return "approved"
  return school.compliance_status || school.status || "not_started"
}

export default function CompliancePage() {
  const queue = useFetch<AnyObj[]>(
    () => complianceAPI.adminQueue().then((response) => response.data || []),
    [],
  )
  const [agreement, setAgreement] = useState({ title: "Alara School Agreement", summary: "", body: "", version: "1.0" })
  const [agreementMessage, setAgreementMessage] = useState("")
  const [savingAgreement, setSavingAgreement] = useState(false)
  const [reviewSchool, setReviewSchool] = useState<AnyObj | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({})
  const [reviewingRequirement, setReviewingRequirement] = useState<number | null>(null)
  const [approvingAccount, setApprovingAccount] = useState(false)

  useEffect(() => {
    complianceAPI.agreement().then((response) => setAgreement(response.data)).catch(() => undefined)
  }, [])

  async function saveAgreement() {
    setSavingAgreement(true)
    setAgreementMessage("")
    try {
      const response = await complianceAPI.saveAgreement(agreement)
      setAgreement(response.data)
      setAgreementMessage("Agreement published. School admins will see this version immediately.")
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
      setReviewSchool({ ...response.data, school_id: school.school_id, school_name: school.school_name })
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
    const all = queue.data || []
    return {
      pending: all.filter((school) => ["pending", "in_progress"].includes(school.status)).length,
      submitted: all.filter((school) => ["submitted", "under_review"].includes(school.status)).length,
      rejected: all.filter((school) => ["rejected", "requires_resubmission"].includes(school.status)).length,
      approved: all.filter((school) => school.status === "approved").length,
    }
  }, [queue.data])

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

      <StatCardGrid>
        <StatCard label="Needs completion" value={counts.pending} icon={Clock3} tone="warning" />
        <StatCard label="Awaiting review" value={counts.submitted} icon={ClipboardCheck} tone="warning" />
        <StatCard label="Requires resubmission" value={counts.rejected} icon={ShieldAlert} tone="danger" />
        <StatCard label="Approved schools" value={counts.approved} icon={FileCheck2} tone="success" />
      </StatCardGrid>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold">Alara School Agreement</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Write and publish the agreement shown to school admins when they select Review &amp; accept.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_120px]">
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={agreement.title} onChange={(event) => setAgreement({ ...agreement, title: event.target.value })} placeholder="Agreement title" />
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={agreement.version} onChange={(event) => setAgreement({ ...agreement, version: event.target.value })} placeholder="Version" />
        </div>
        <input className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm" value={agreement.summary} onChange={(event) => setAgreement({ ...agreement, summary: event.target.value })} placeholder="Short summary" />
        <textarea className="mt-4 min-h-56 w-full rounded-md border bg-background px-3 py-3 text-sm" value={agreement.body} onChange={(event) => setAgreement({ ...agreement, body: event.target.value })} placeholder="Write the agreement text here..." />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{agreementMessage}</p>
          <button disabled={savingAgreement || !agreement.body.trim()} onClick={saveAgreement} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {savingAgreement ? "Publishing..." : "Publish agreement"}
          </button>
        </div>
      </section>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-semibold">{reviewSchool?.school_name || "Loading compliance review..."}</h2>
                <p className="text-sm text-muted-foreground">Review submitted documents and information.</p>
              </div>
              <button onClick={() => setReviewSchool(null)} className="rounded-md border px-3 py-2 text-sm">Close</button>
            </div>
            {reviewLoading && (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-sm text-muted-foreground" aria-live="polite" aria-busy="true">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                Loading submitted compliance...
              </div>
            )}
            {reviewError && <div className="mx-6 mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">{reviewError}</div>}
            {reviewSchool && !reviewLoading && (
              <div className="space-y-4 overflow-y-auto p-6">
                <div className={`rounded-xl border p-4 ${
                  reviewSchool.status === "approved"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-muted bg-muted/30"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Overall compliance status</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        School account: {reviewSchool.school_status || "unknown"}
                      </p>
                    </div>
                    <StatusBadge status={reviewSchool.status || "pending"} />
                  </div>
                  {reviewSchool.status === "approved" && (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      All applicable compliance requirements are approved. This school now has full access.
                    </p>
                  )}
                  {reviewSchool.status !== "approved" && (
                    <button
                      type="button"
                      onClick={approveAccount}
                      disabled={approvingAccount || reviewingRequirement !== null}
                      className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {approvingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {approvingAccount ? "Approving account..." : "Mark account as approved"}
                    </button>
                  )}
                </div>
                {reviewSchool.requirements?.map((item: AnyObj) => (
                  <div key={item.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={item.status} />
                          {item.status === "approved" && (
                            <span className="text-xs font-medium text-emerald-600">Approved by Super Admin</span>
                          )}
                          {item.status === "rejected" && (
                            <span className="text-xs font-medium text-red-600">Rejected - resubmission required</span>
                          )}
                        </div>
                        {item.reason && (
                          <p className="mt-2 rounded-md bg-red-500/10 p-2 text-xs text-red-700">
                            Rejection reason: {item.reason}
                          </p>
                        )}
                        {item.document && (
                          <a className="mt-3 inline-block text-sm text-primary underline" href={item.document.file_url} target="_blank" rel="noreferrer">
                            View {item.document.file_name}
                          </a>
                        )}
                        {item.information && Object.keys(item.information).length > 0 && (
                          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{JSON.stringify(item.information, null, 2)}</pre>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          disabled={reviewingRequirement !== null || ["approved", "bypassed"].includes(item.status)}
                          onClick={() => reviewRequirement(item.id, "approve")}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {reviewingRequirement === item.id && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                          {reviewingRequirement === item.id ? "Saving..." : "Approve"}
                        </button>
                        <button
                          disabled={reviewingRequirement !== null || ["approved", "bypassed"].includes(item.status)}
                          onClick={() => reviewRequirement(item.id, "reject")}
                          className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {reviewingRequirement === item.id && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                          {reviewingRequirement === item.id ? "Saving..." : "Reject"}
                        </button>
                      </div>
                    </div>
                    <input
                      className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-xs"
                      placeholder="Review notes (required for useful rejection feedback)"
                      value={reviewNotes[item.id] || ""}
                      onChange={(event) => setReviewNotes({ ...reviewNotes, [item.id]: event.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
