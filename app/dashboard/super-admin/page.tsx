"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Activity,
  Building2,
  CircleDollarSign,
  GraduationCap,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { CountUp } from "@/components/ui/count-up"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { platformAPI } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"
import { SaAreaChart } from "@/components/super-admin/charts"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { useAuthContext } from "@/lib/auth-context"
import { hasPlatformPermission } from "@/lib/platform-permissions"

function fmtMoney(value: number) {
  return `GH₵ ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const METRIC_TONES = {
  default: { icon: "bg-slate-100 text-slate-600", value: "text-foreground" },
  primary: { icon: "bg-rose-100 text-rose-700", value: "text-primary" },
  success: { icon: "bg-emerald-100 text-emerald-700", value: "text-emerald-700" },
  warning: { icon: "bg-amber-100 text-amber-700", value: "text-amber-700" },
  danger: { icon: "bg-red-100 text-red-700", value: "text-red-700" },
} as const

function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  sub,
  tone = "default",
}: {
  label: string
  value: number | string
  icon: LucideIcon
  sub?: string
  tone?: keyof typeof METRIC_TONES
}) {
  const colors = METRIC_TONES[tone]

  return (
    <article className="group relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <div className="pointer-events-none absolute -right-6 -top-6 -z-10 h-16 w-16 rounded-full bg-primary/[0.035] transition-transform duration-300 group-hover:scale-125" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-semibold leading-none tracking-tight tabular-nums ${colors.value}`}>
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      {sub && <p className="mt-1.5 text-xs leading-4 text-muted-foreground">{sub}</p>}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </article>
  )
}

export default function SuperAdminDashboardPage() {
  const { user } = useAuthContext()
  const [activityPage, setActivityPage] = useState(1)
  const can = (permission: string) =>
    user?.role === "super_admin" || hasPlatformPermission(user?.platform_permissions, permission)
  const overview = useFetch<AnyObj>(() => platformAPI.overview().then((r) => r.data), [])
  const health = useFetch<AnyObj>(() => platformAPI.health().then((r) => r.data), [])
  const logs = useFetch<AnyObj>(() => platformAPI.auditLogs({ page_size: 10, page: activityPage }).then((r) => r.data), [activityPage])
  const activityRows = (logs.data?.results as AnyObj[]) || []

  const o = overview.data
  const loading = overview.loading

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Platform Dashboard"
        description="High-level view of schools, users, revenue and system health across the entire Alara platform."
      />

      {overview.error && (
        <div className="glass-red rounded-xl p-3 text-sm text-red-300">{overview.error}</div>
      )}

      <section
        aria-label="Platform metrics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      >
        {can("schools.view") && (
          <>
            <DashboardMetricCard label="Total schools" value={o?.schools?.total ?? 0} icon={Building2} sub={`${o?.schools?.active ?? 0} active`} tone="primary" />
            <DashboardMetricCard label="Active schools" value={o?.schools?.active ?? 0} icon={Building2} tone="success" />
            <DashboardMetricCard label="Trial schools" value={o?.schools?.trial ?? 0} icon={Activity} tone="warning" />
            <DashboardMetricCard label="Suspended schools" value={o?.schools?.suspended ?? 0} icon={ShieldAlert} tone="danger" />
          </>
        )}

        {can("users.view") && (
          <>
            <DashboardMetricCard label="Students" value={o?.users?.students ?? 0} icon={GraduationCap} />
            <DashboardMetricCard label="Teachers" value={o?.users?.teachers ?? 0} icon={Users} />
            <DashboardMetricCard
              label="Total users"
              value={o?.users?.total ?? 0}
              icon={Activity}
              sub={`${o?.users?.active_today ?? 0} active today · ${o?.users?.active_30d ?? 0} in last 30d`}
              tone="primary"
            />
          </>
        )}

        {can("finance.view") && (
          <>
            <DashboardMetricCard label="Revenue (all time)" value={fmtMoney(o?.revenue?.total ?? 0)} icon={CircleDollarSign} tone="primary" />
            <DashboardMetricCard label="Revenue this month" value={fmtMoney(o?.revenue?.this_month ?? 0)} icon={CircleDollarSign} />
            <DashboardMetricCard
              label="Subscriptions"
              value={`${o?.subscriptions?.active ?? 0} / ${o?.subscriptions?.cancelled ?? 0}`}
              icon={CircleDollarSign}
              sub="active / cancelled"
            />
          </>
        )}

      </section>

      {/* Charts row */}
      {(can("platform.analytics") || can("platform.monitoring")) && <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {can("platform.analytics") && <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Growth — schools & users (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <SaAreaChart
                data={(o?.growth as AnyObj[]) || []}
                xKey="month"
                series={[
                  { key: "schools", label: "New schools" },
                  { key: "users", label: "New users" },
                ]}
              />
            )}
          </CardContent>
        </Card>}

        {can("platform.monitoring") && <Card>
          <CardHeader>
            <CardTitle className="text-base">System health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.loading && <Skeleton className="h-24 w-full" />}
            {!health.loading &&
              ((health.data?.checks as AnyObj[]) || []).map((c) => (
                <div key={c.component} className="flex items-center justify-between gap-2 text-sm">
                  <span className="capitalize">{String(c.component).replace(/_/g, " ")}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            {!health.loading && !health.data?.checks?.length && (
              <p className="text-sm text-muted-foreground">No health data available.</p>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-sm">
              <span>Open support tickets</span>
              <Link href="/dashboard/super-admin/support" className="flex items-center gap-1.5 font-medium text-primary hover:underline">
                <Ticket className="h-4 w-4" /> {o?.support?.open_tickets ?? 0}
              </Link>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>Pending moderation</span>
              <Link href="/dashboard/super-admin/moderation" className="font-medium text-primary hover:underline">
                {o?.moderation?.pending ?? 0}
              </Link>
            </div>
          </CardContent>
        </Card>}
      </div>
      }

      {/* Recent activity */}
      {can("platform.audit") && <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent platform activity</CardTitle>
          <Link href="/dashboard/super-admin/audit-logs" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {logs.loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !activityRows.length ? (
            <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
          ) : (
            <ul className="divide-y divide-border">
              {activityRows.map((log) => (
                <li key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                  <span className="font-medium w-44 shrink-0 truncate">{log.actor_name || "System"}</span>
                  <code className="text-xs bg-muted rounded px-1.5 py-0.5 w-fit">{log.action}</code>
                  <span className="text-muted-foreground truncate">{log.target_label || log.target_type}</span>
                  <span className="sm:ml-auto text-xs text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!logs.loading && Number(logs.data?.count || 0) > 10 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>
                Showing {(activityPage - 1) * 10 + 1}–{Math.min(activityPage * 10, Number(logs.data.count))}
                {" "}of {logs.data.count}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!logs.data.previous}
                  onClick={() => setActivityPage((page) => Math.max(1, page - 1))}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span>Page {activityPage}</span>
                <button
                  type="button"
                  disabled={!logs.data.next}
                  onClick={() => setActivityPage((page) => page + 1)}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>}
    </div>
  )
}
