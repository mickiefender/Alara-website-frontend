"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/lib/protected-route"
import { useAuthContext } from "@/lib/auth-context"
import { complianceAPI, getErrorMessage } from "@/lib/api"

type Requirement = {
  id: number
  name: string
  description?: string
  requirement_type: "document" | "information" | "agreement"
  status: string
  information: Record<string, unknown>
  document?: { file_name: string; file_url: string } | null
  reason?: string
  agreement?: { title: string; version: string; summary: string; body: string } | null
}

type Profile = {
  status: string
  total_requirements: number
  resolved_count: number
  progress_percent: number
  requirements: Requirement[]
  rejection_reason?: string
}

export default function CompliancePage() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [agreementItem, setAgreementItem] = useState<Requirement | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadProfile() {
    try {
      const response = await complianceAPI.profile()
      setProfile(response.data)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your compliance checklist."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function upload(requirementId: number, file?: File) {
    if (!file) return
    setError("")
    setActionLoading(`upload-${requirementId}`)
    try {
      const response = await complianceAPI.uploadDocument(requirementId, file)
      setProfile(response.data)
      setMessage("Document saved. It is now visible to the Super Admin for review.")
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upload this document."))
    } finally {
      setActionLoading(null)
    }
  }

  async function updateInformation(requirement: Requirement) {
    if (requirement.requirement_type === "agreement") {
      setAgreementItem(requirement)
      return
    }
    const value = window.prompt(`Enter information for ${requirement.name}`, String(requirement.information?.value || ""))
    if (value === null) return
    setActionLoading(`information-${requirement.id}`)
    try {
      const response = await complianceAPI.updateRequirement(requirement.id, { value })
      setProfile(response.data)
      setMessage("Information saved.")
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save this information."))
    } finally {
      setActionLoading(null)
    }
  }

  async function submit() {
    setError("")
    setActionLoading("submit")
    try {
      const response = await complianceAPI.submit()
      setProfile(response.data)
      setMessage("Compliance submitted for Super Admin review.")
    } catch (err) {
      setError(getErrorMessage(err, "Complete all required items before submitting."))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Welcome to Alara</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Complete Your School Verification</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Your school account has been created successfully. Your submitted information will be reviewed by Alara&apos;s Super Admin before your school is fully approved.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-2.5 rounded-full bg-emerald-600" style={{ width: `${profile?.progress_percent || 0}%` }} />
            </div>
            <span className="min-w-[72px] text-right text-sm font-semibold text-slate-700">{profile?.progress_percent || 0}%</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {profile ? `${profile.resolved_count} of ${profile.total_requirements} completed` : "Loading compliance progress..."}
          </p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-4">
            {loading && (
              <div className="space-y-4" aria-live="polite" aria-busy="true">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
                    <div className="mt-4 h-9 w-full rounded bg-slate-100" />
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your compliance checklist...
                </div>
              </div>
            )}
            {!loading && profile?.requirements.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{index + 1}. Requirement</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{item.name}</h2>
                    {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
                    {item.reason && <p className="mt-2 text-sm text-red-700">{item.reason}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">
                      {item.status.replaceAll("_", " ")}
                    </span>
                    {item.requirement_type === "document" ? (
                      <label className="cursor-pointer rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                        {item.document ? "Replace document" : "Upload document"}
                        <input type="file" className="hidden" disabled={actionLoading !== null} onChange={(event) => upload(item.id, event.target.files?.[0])} />
                      </label>
                    ) : (
                      <button disabled={actionLoading !== null} onClick={() => updateInformation(item)} className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                        {actionLoading === `information-${item.id}` && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                        {item.requirement_type === "agreement" ? "Review & accept" : "Provide information"}
                      </button>
                    )}
                  </div>
                  {agreementItem?.agreement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
                        <div className="border-b p-6">
                          <h2 className="text-2xl font-bold text-slate-900">{agreementItem.agreement.title}</h2>
                          <p className="mt-1 text-sm text-slate-500">Version {agreementItem.agreement.version}</p>
                          {agreementItem.agreement.summary && <p className="mt-3 text-sm text-slate-600">{agreementItem.agreement.summary}</p>}
                        </div>
                        <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-6 text-sm leading-7 text-slate-700">
                          {agreementItem.agreement.body}
                        </div>
                        <div className="flex justify-end gap-3 border-t p-6">
                          <button disabled={actionLoading !== null} onClick={() => setAgreementItem(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                            Close
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={async () => {
                              setActionLoading("agreement-reject")
                              try {
                                const response = await complianceAPI.decideAgreement("reject")
                                setProfile(response.data)
                                setAgreementItem(null)
                                setMessage("Agreement rejected. You can review it again before submitting.")
                              } catch (err) { setError(getErrorMessage(err, "Unable to reject the agreement.")) }
                              finally { setActionLoading(null) }
                            }}
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                          >
                            {actionLoading === "agreement-reject" && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                            Reject
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={async () => {
                              setActionLoading("agreement-accept")
                              try {
                                const response = await complianceAPI.decideAgreement("accept")
                                setProfile(response.data)
                                setAgreementItem(null)
                                setMessage("Agreement accepted and saved.")
                              } catch (err) { setError(getErrorMessage(err, "Unable to accept the agreement.")) }
                              finally { setActionLoading(null) }
                            }}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {actionLoading === "agreement-accept" && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Before you submit</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Please confirm that the information and documents you have provided are accurate and belong to your institution. You can submit your completed items now and return later to provide anything outstanding.
            </p>
            <button onClick={submit} disabled={!profile || actionLoading !== null || profile.status === "submitted" || profile.status === "under_review"} className="mt-5 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {actionLoading === "submit" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {profile?.status === "submitted" || profile?.status === "under_review" ? "Submitted for review" : actionLoading === "submit" ? "Submitting..." : "Submit Compliance for Review"}
            </button>
            <p className="mt-3 text-xs text-slate-500">Signed in as {user?.email}</p>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  )
}
