"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { messagingAPI, schoolsAPI, getErrorMessage } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { PageHeader } from "@/components/super-admin/page-header"
import { StatCard, StatCardGrid } from "@/components/super-admin/stat-card"
import { ProtectedRoute } from "@/lib/protected-route"

type Dashboard = {
  total_sent: number
  total_credits_used: number
  total_failed: number
  pending_approvals: number
  schools: AnyObj[]
}

export default function SuperAdminSmsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [schools, setSchools] = useState<AnyObj[]>([])
  const [audience, setAudience] = useState("all_school_admins")
  const [schoolId, setSchoolId] = useState("")
  const [phones, setPhones] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResponse, schoolsResponse] = await Promise.all([
          messagingAPI.adminSmsDashboard(),
          schoolsAPI.list(),
        ])
        setDashboard(dashboardResponse.data)
        setSchools(schoolsResponse.data?.results || schoolsResponse.data || [])
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load SMS administration data."))
      }
    }
    load()
  }, [])

  async function approveSender(school: AnyObj) {
    if (!school.configuration_id) return
    setError("")
    setStatus("")
    try {
      await messagingAPI.approveSmsSender(school.configuration_id)
      const refreshed = await messagingAPI.adminSmsDashboard()
      setDashboard(refreshed.data)
      setStatus(`${school.school} Sender ID approved and enabled.`)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to approve Sender ID."))
    }
  }

  async function addCredits(school: AnyObj) {
    const value = window.prompt(`How many SMS credits should be added to ${school.school}?`, "1000")
    if (!value) return
    const amount = Number(value)
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Credits must be a positive whole number.")
      return
    }
    setError("")
    setStatus("")
    try {
      await messagingAPI.addSmsCredits(school.school_id, amount)
      const refreshed = await messagingAPI.adminSmsDashboard()
      setDashboard(refreshed.data)
      setStatus(`${amount} SMS credits added to ${school.school}.`)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add SMS credits."))
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setStatus("")
    if (!message.trim()) {
      setError("Enter a message before sending.")
      return
    }
    if (audience !== "all_school_admins" && !schoolId) {
      setError("Select a school for this audience.")
      return
    }
    if (audience === "custom" && !phones.trim()) {
      setError("Enter at least one phone number.")
      return
    }
    if (!window.confirm("Send this SMS using the selected schools' approved Sender IDs?")) return

    setBusy(true)
    try {
      const response = await messagingAPI.adminSendSms({
        school_id: schoolId ? Number(schoolId) : undefined,
        audience,
        custom_phone_numbers:
          audience === "custom"
            ? phones.split(/[\n,]+/).map((phone) => phone.trim()).filter(Boolean)
            : undefined,
        message: message.trim(),
      })
      const jobs = response.data?.jobs || []
      const failures = response.data?.failures || []
      setStatus(
        `${jobs.length} SMS job${jobs.length === 1 ? "" : "s"} queued` +
          (failures.length ? `; ${failures.length} school${failures.length === 1 ? "" : "s"} could not be sent.` : "."),
      )
      if (!failures.length) setMessage("")
      const refreshed = await messagingAPI.adminSmsDashboard()
      setDashboard(refreshed.data)
    } catch (err) {
      const responseData = (err as { response?: { data?: { failures?: Array<{ school: string; detail: string }> } } }).response?.data
      const failures = responseData?.failures || []
      const failureSummary = failures
        .slice(0, 5)
        .map((failure) => `${failure.school}: ${failure.detail}`)
        .join("; ")
      setError(failureSummary || getErrorMessage(err, "Unable to send SMS."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="SMS Messaging"
          description="Send platform messages to school administrators and users. Each school uses its own approved Sender ID and SMS balance."
        />

        <StatCardGrid>
          <StatCard label="Messages Sent" value={dashboard?.total_sent ?? 0} icon={MessageSquare} />
          <StatCard label="Credits Used" value={dashboard?.total_credits_used ?? 0} icon={Send} />
          <StatCard label="Failed Messages" value={dashboard?.total_failed ?? 0} icon={MessageSquare} tone="danger" />
          <StatCard label="Pending Sender IDs" value={dashboard?.pending_approvals ?? 0} icon={MessageSquare} tone="warning" />
        </StatCardGrid>

        {(error || status) && (
          <div className={`rounded-xl p-3 text-sm ${error ? "glass-red text-red-200" : "glass-card text-emerald-300"}`}>
            {error || status}
          </div>
        )}

        <form onSubmit={submit} className="glass-card max-w-3xl space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Audience
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="all_school_admins">School administrators in all active schools</option>
                <option value="all_users">All users in a school</option>
                <option value="all_parents">Parents in a school</option>
                <option value="all_teachers">Teachers in a school</option>
                <option value="all_students">Students in a school</option>
                <option value="custom">Custom phone numbers</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              School
              <select
                value={schoolId}
                onChange={(event) => setSchoolId(event.target.value)}
                disabled={audience === "all_school_admins"}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 disabled:opacity-60"
              >
                <option value="">
                  {audience === "all_school_admins" ? "All active schools" : "Select a school"}
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </label>
          </div>

          {audience === "custom" && (
            <label className="block text-sm font-medium">
              Phone numbers
              <textarea
                value={phones}
                onChange={(event) => setPhones(event.target.value)}
                placeholder="One number per line or separated by commas"
                className="mt-1 min-h-24 w-full rounded-md border bg-background p-3"
              />
            </label>
          )}

          <label className="block text-sm font-medium">
            Message
            <textarea
              required
              maxLength={5000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type the SMS message..."
              className="mt-1 min-h-36 w-full rounded-md border bg-background p-3"
            />
            <span className="mt-1 block text-xs text-muted-foreground">{message.length}/5000 characters</span>
          </label>

          <p className="text-xs text-muted-foreground">
            Schools without an approved and enabled Sender ID, or without enough SMS credits, are reported as failures and are not charged.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {busy ? "Queueing..." : "Send SMS"}
          </button>
        </form>

        <div className="glass-card overflow-x-auto p-5">
          <h2 className="mb-3 font-semibold">School SMS status</h2>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-2">School</th>
                <th className="p-2">Sender ID</th>
                <th className="p-2">Status</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Sent</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.schools || []).map((school) => (
                <tr key={school.school_id} className="border-b border-border last:border-0">
                  <td className="p-2">{school.school}</td>
                  <td className="p-2">{school.sender_id || "Not configured"}</td>
                  <td className="p-2 capitalize">{school.sender_id_status}</td>
                  <td className="p-2">{school.balance}</td>
                  <td className="p-2">{school.sent}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      {school.sender_id_status === "pending" && school.sender_id && (
                        <button
                          type="button"
                          onClick={() => approveSender(school)}
                          className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-400"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => addCredits(school)}
                        className="rounded border border-primary/40 px-2 py-1 text-xs text-primary"
                      >
                        Add credits
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  )
}
