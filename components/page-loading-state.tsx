"use client"

import { Loader2 } from "lucide-react"

interface PageLoadingStateProps {
  message?: string
  rows?: number
  className?: string
}

/**
 * Consistent loading state for admin portal pages.
 * Shows a spinner with message, or optional skeleton rows for tables.
 */
export function PageLoadingState({ message = "Loading data...", className = "" }: PageLoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`} role="status" aria-label={message}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/**
 * Loading state specifically for table rows
 */
export function TableLoadingState({ colSpan, message = "Loading data..." }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-2" role="status">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </td>
    </tr>
  )
}

/**
 * Loading state for card grids
 */
export function CardGridLoadingState({ count = 3, message = "Loading..." }: { count?: number; message?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-3" />
          <div className="h-3 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}
