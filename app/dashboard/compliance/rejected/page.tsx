"use client"

import { ProtectedRoute } from "@/lib/protected-route"

export default function RejectedCompliancePage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">School verification</p>
          <h1 className="mt-3 text-3xl font-bold text-red-900">Action required</h1>
          <p className="mt-4 text-red-800">
            Your compliance submission was rejected and needs to be updated before your school can be fully approved.
          </p>
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-slate-700">
            Please review the required documents and information, make the required changes, and submit again for Super Admin review.
          </div>
          <a
            href="/dashboard/compliance"
            className="mt-6 inline-flex rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Update compliance details
          </a>
        </div>
      </div>
    </ProtectedRoute>
  )
}
