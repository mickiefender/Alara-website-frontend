"use client"

import { CountUp } from "@/components/ui/count-up"

export default function SuperAdminCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="glass-card glass-hover p-5">
      <div className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold tracking-tight mt-1 tabular-nums">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </div>
    </div>
  )
}
