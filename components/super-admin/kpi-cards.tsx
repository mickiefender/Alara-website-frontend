"use client"

import SuperAdminCard from "./card"
import type { AnyObj } from "./types"

export default function KpiCards({ analytics }: { analytics: AnyObj | null }) {
  return (
    <section className="stagger grid grid-cols-1 md:grid-cols-4 gap-4">
      <SuperAdminCard title="Total Schools" value={analytics?.kpis?.total_schools ?? 0} />
      <SuperAdminCard title="Total Users" value={analytics?.kpis?.total_users ?? 0} />
      <SuperAdminCard title="Revenue" value={analytics?.kpis?.revenue_total ?? 0} />
      <SuperAdminCard
        title="Active vs Inactive"
        value={`${analytics?.kpis?.active_tenants ?? 0} / ${analytics?.kpis?.inactive_tenants ?? 0}`}
      />
    </section>
  )
}
