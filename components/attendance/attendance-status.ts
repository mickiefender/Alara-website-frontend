import type { AttendanceStanding, AttendanceStatus } from "./types"

/** Percentage at or above which attendance is considered satisfactory. */
export const ATTENDANCE_THRESHOLD = 75

/** Percentage at or above which attendance is considered strong. */
export const ATTENDANCE_GOOD = 90

export function standingFor(percentage: number): AttendanceStanding {
  if (percentage >= ATTENDANCE_GOOD) return "good"
  if (percentage >= ATTENDANCE_THRESHOLD) return "satisfactory"
  return "at-risk"
}

export interface StandingMeta {
  label: string
  description: string
  pill: string
  bar: string
  accent: string
}

export const STANDING_META: Record<AttendanceStanding, StandingMeta> = {
  good: {
    label: "Good",
    description: "90% and above",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    bar: "bg-emerald-500",
    accent: "text-emerald-600",
  },
  satisfactory: {
    label: "Fair",
    description: "75% – 89%",
    pill: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    bar: "bg-amber-500",
    accent: "text-amber-600",
  },
  "at-risk": {
    label: "At risk",
    description: "Below 75%",
    pill: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    bar: "bg-rose-500",
    accent: "text-rose-600",
  },
}

export interface StatusMeta {
  label: string
  badge: string
  dot: string
}

export const STATUS_META: Record<AttendanceStatus, StatusMeta> = {
  present: {
    label: "Present",
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  absent: {
    label: "Absent",
    badge:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    dot: "bg-rose-500",
  },
  late: {
    label: "Late",
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  excused: {
    label: "Excused",
    badge:
      "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20",
    dot: "bg-slate-400",
  },
}

/** Round a percentage to one decimal place consistently across the UI. */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
