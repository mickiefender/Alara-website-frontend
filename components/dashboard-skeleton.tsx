"use client"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Dashboard in-place skeleton.
 *
 * Rendered by app/dashboard/loading.tsx during route navigation so the
 * user lands on the destination page and sees its shell immediately:
 * sidebar + topbar stay mounted (from the dashboard layout) while the
 * content area shimmers with stat cards, a chart and a table.
 *
 * No centered spinner, no blank page — just a calm skeleton that mirrors
 * the real dashboard layout.
 */
export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 p-4 md:p-6 lg:p-8 animate-glass-in" aria-busy="true" aria-label="Loading dashboard">
      {/* Page heading */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Chart + side panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card p-6 space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="glass-card p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-3.5 w-24 sm:block" />
              <Skeleton className="hidden h-3.5 w-16 md:block" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
