"use client"

import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react"
import { useAuthContext } from "@/lib/auth-context"

type SubscriptionDetails = {
  plan?: { name?: string } | null
  status: "active" | "expiring_soon" | "expired" | "none"
  end_date?: string | null
  days_remaining?: number | null
}

function formatPlanName(name?: string) {
  if (!name) return "No subscription"
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function SubscriptionBadge() {
  const { school, loading } = useAuthContext()
  const subscription: SubscriptionDetails | null = school?.subscription_details ?? null

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Subscription
      </span>
    )
  }

  const isWarning = subscription?.status === "expiring_soon"
  const isExpired = subscription?.status === "expired"
  const isNoSubscription = !subscription || subscription.status === "none"
  const daysRemaining = subscription?.days_remaining ?? 0

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold ${
        isWarning || isExpired || isNoSubscription
          ? "rounded-full border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
          : "text-black dark:text-black"
      } ${isWarning ? "animate-pulse" : ""}`}
      title={
        subscription?.end_date
          ? `Subscription ends ${new Date(subscription.end_date).toLocaleDateString()}`
          : "No active subscription"
      }
    >
      {isWarning || isExpired || isNoSubscription ? <AlertTriangle className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
      {formatPlanName(subscription?.plan?.name)}
      {isWarning && ` · ${daysRemaining}d left`}
      {isExpired && " · Expired"}
    </span>
  )
}
