"use client"

import type { ElementType, ReactNode } from "react"
import { AlertTriangle, Inbox, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shared data-state components.
 *
 * Every list/table/dashboard widget in the app renders one of three
 * states while fetching: a loading indicator, an error panel with retry,
 * or an empty state. These components keep that experience consistent
 * and, crucially, mean the empty state is only ever shown AFTER loading
 * has finished and no error occurred — no more flashing "No data" while
 * the request is still in flight.
 */

/* ── Inline loading ──────────────────────────────────────────────────── */

interface DataStateLoadingProps {
  message?: string
  className?: string
}

export function DataStateLoading({ message = "Loading…", className = "" }: DataStateLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}
      role="status"
      aria-label={message}
    >
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/* ── Inline error with retry ─────────────────────────────────────────── */

interface DataStateErrorProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function DataStateError({ message, onRetry, className = "" }: DataStateErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center ${className}`}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-semibold text-foreground">Something went wrong</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-1 gap-2" onClick={onRetry}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────── */

interface DataStateEmptyProps {
  title: string
  description?: string
  icon?: ElementType
  action?: ReactNode
  className?: string
}

export function DataStateEmpty({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}: DataStateEmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}

/* ── Table row variant ───────────────────────────────────────────────── */

interface DataStateTableRowProps {
  colSpan: number
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onRetry?: () => void
}

/**
 * Drop-in row for tables: renders a spinner row while `loading`, an error
 * row (with retry) when `error` is set, and the empty message only when
 * loading is done and no error occurred.
 */
export function DataStateTableRow({
  colSpan,
  loading = false,
  error,
  emptyMessage = "No data found",
  onRetry,
}: DataStateTableRowProps) {
  if (loading) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center">
          <div className="flex flex-col items-center justify-center gap-2" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        </td>
      </tr>
    )
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-6" role="alert">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            {onRetry && (
              <Button size="sm" variant="outline" className="mt-1 gap-2" onClick={onRetry}>
                <RefreshCcw className="h-3.5 w-3.5" />
                Try Again
              </Button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-muted-foreground">
        {emptyMessage}
      </td>
    </tr>
  )
}
