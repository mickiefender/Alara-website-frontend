"use client"

import type { ReactNode } from "react"
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Clock3,
  FileText,
  Flag,
  History,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage, feedSupervisorAPI } from "@/lib/api"
import { useFetch } from "@/components/super-admin/use-fetch"
import type { CreatorDetailData } from "./types"
import { StateBadge } from "./state-badge"

const METRICS = [
  { key: "total_posts", label: "Total posts", icon: FileText, tone: "text-foreground" },
  { key: "published", label: "Published", icon: CircleCheck, tone: "text-emerald-600" },
  { key: "pending_review", label: "Pending review", icon: Clock3, tone: "text-amber-600" },
  { key: "hidden", label: "Hidden", icon: ShieldCheck, tone: "text-slate-600" },
  { key: "removed", label: "Removed", icon: CircleX, tone: "text-red-600" },
  { key: "reports_received", label: "Reports received", icon: Flag, tone: "text-orange-600" },
] as const

function getInitials(name?: string) {
  return name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CR"
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

export function CreatorDetailDialog({
  teacherId,
  open,
  onOpenChange,
}: {
  teacherId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detail = useFetch<CreatorDetailData>(
    () => feedSupervisorAPI.creatorDetail(teacherId).then((r) => r.data),
    [teacherId],
  )

  const data = detail.data
  const teacher = data?.teacher

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl flex-col gap-0 overflow-hidden !bg-background p-0 supports-[backdrop-filter]:!bg-background !backdrop-blur-none sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b border-border bg-muted/30 px-6 py-5 pr-12 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-primary">
              {teacher ? getInitials(teacher.name) : <UserRound className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="truncate text-xl font-semibold tracking-tight">
                  {teacher?.name || "Creator details"}
                </DialogTitle>
                {teacher?.restricted ? (
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700">
                    Restricted
                  </Badge>
                ) : teacher ? (
                  <Badge
                    variant="outline"
                    className={teacher.is_active
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      : "border-slate-500/30 bg-slate-500/10 text-slate-600"}
                  >
                    {teacher.is_active ? "Active" : "Inactive"}
                  </Badge>
                ) : null}
              </div>
              <DialogDescription className="mt-1 flex min-w-0 items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{teacher?.email || "Creator profile and moderation activity"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {detail.loading && !data && (
            <div className="space-y-5" aria-label="Loading creator details">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          )}

          {detail.error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(detail.error, "Unable to load creator details.")}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <section aria-label="Creator post statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {METRICS.map(({ key, label, icon: Icon, tone }) => (
                  <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">{label}</p>
                      <Icon className={`h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
                    </div>
                    <p className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight ${tone}`}>
                      {data.stats[key].toLocaleString()}
                    </p>
                  </div>
                ))}
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">Warnings</h3>
                      <p className="text-xs text-muted-foreground">Notes recorded for this creator</p>
                    </div>
                  </div>
                  {data.warnings.length === 0 ? (
                    <EmptyState>No warnings on record.</EmptyState>
                  ) : (
                    <ul className="space-y-3">
                      {data.warnings.map((warning, index) => (
                        <li key={`${warning.at}-${index}`} className="rounded-lg bg-muted/40 p-3">
                          <p className="text-sm leading-relaxed">{warning.note || "No note provided."}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(warning.at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-primary">
                      <History className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">Moderation history</h3>
                      <p className="text-xs text-muted-foreground">Previous actions and decisions</p>
                    </div>
                  </div>
                  {data.moderation_history.length === 0 ? (
                    <EmptyState>No moderation history.</EmptyState>
                  ) : (
                    <ul className="space-y-3">
                      {data.moderation_history.map((entry, index) => (
                        <li key={`${entry.at}-${index}`} className="border-l-2 border-primary/20 pl-3">
                          <p className="text-sm font-medium capitalize">
                            {entry.action.replace(/^feed\./, "").replace(/_/g, " ")}
                            <span className="font-normal text-muted-foreground"> · {entry.target}</span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entry.by} · {new Date(entry.at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">Recent posts</h3>
                      <p className="text-xs text-muted-foreground">Latest content from this creator</p>
                    </div>
                  </div>
                  {data.recent_posts.length === 0 ? (
                    <EmptyState>No posts yet.</EmptyState>
                  ) : (
                    <ul className="divide-y divide-border">
                      {data.recent_posts.map((post) => (
                        <li key={post.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <span className="min-w-0 truncate text-sm font-medium">{post.title}</span>
                          <StateBadge state={post.content_state} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-orange-700">
                      <Flag className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">Recent reports</h3>
                      <p className="text-xs text-muted-foreground">Reports submitted about this creator</p>
                    </div>
                  </div>
                  {data.recent_reports.length === 0 ? (
                    <EmptyState>No reports against this creator.</EmptyState>
                  ) : (
                    <ul className="space-y-3">
                      {data.recent_reports.map((report) => (
                        <li key={report.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium capitalize">{report.reason.replace(/_/g, " ")}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 capitalize">
                            {report.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
