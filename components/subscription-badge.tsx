"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react"
import { schoolsAPI } from "@/lib/api"

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
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSubscription = async () => {
      try {
        const response = await schoolsAPI.subscriptionStatus()
        if (mounted) setSubscription(response.data)
      } catch {
        if (mounted) setSubscription(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSubscription()
    const interval = window.setInterval(loadSubscription, 60_000)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
        isWarning || isExpired || isNoSubscription
          ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
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
