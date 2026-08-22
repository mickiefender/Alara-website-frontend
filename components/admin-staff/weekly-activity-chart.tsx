"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface ActivityDay {
  day: string
  tasks: number
  approvals: number
}

/**
 * Grouped bar chart of the staff member's weekly activity — tasks handled
 * vs. approvals processed per day.
 */
export function WeeklyActivityChart({ data }: { data: ActivityDay[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
          <defs>
            <linearGradient id="tasksBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="approvalsBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "rgba(239, 68, 68, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 12,
              boxShadow: "0 8px 24px -12px rgba(0,0,0,0.25)",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
          />
          <Bar
            dataKey="tasks"
            name="Tasks handled"
            fill="url(#tasksBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="approvals"
            name="Approvals processed"
            fill="url(#approvalsBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
