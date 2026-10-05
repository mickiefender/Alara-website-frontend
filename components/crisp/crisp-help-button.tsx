"use client"

import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CrispHelpButtonProps {
  onClick: () => void
  unreadCount: number
  label?: string
}

/**
 * Floating "Alara Help" launcher, fixed to the bottom-right of the School Admin
 * dashboard. Purely presentational - the parent wires it to the Crisp widget.
 *
 * - Stays put while navigating (the dashboard layout never unmounts it).
 * - Collapses to an icon-only circle on very small screens.
 * - Shows an unread badge when the Alara Help team has replied.
 */
export function CrispHelpButton({
  onClick,
  unreadCount,
  label = "Alara Help",
}: CrispHelpButtonProps) {
  const hasUnread = unreadCount > 0
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 print:hidden">
      <div className="pointer-events-auto relative">
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-primary/40 animate-ping motion-reduce:animate-none"
          />
        )}

        <button
          type="button"
          onClick={onClick}
          aria-label={
            hasUnread
              ? `${label} - ${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
              : label
          }
          className={cn(
            "group relative flex items-center justify-center rounded-full",
            "h-12 w-12 gap-0 px-0 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3.5",
            "bg-primary text-primary-foreground",
            "border border-white/25",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_10px_30px_-8px_rgba(0,0,0,0.45)]",
            "transition-all duration-200 ease-out",
            "hover:-translate-y-0.5 hover:brightness-110",
            "active:translate-y-0 active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none"
          )}
        >
          <MessageCircle
            className="h-5 w-5 shrink-0 sm:h-[18px] sm:w-[18px]"
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span className="hidden text-sm font-semibold leading-none tracking-tight sm:inline">
            {label}
          </span>

          {hasUnread && (
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold leading-none text-destructive-foreground ring-2 ring-background"
              aria-hidden="true"
            >
              {badgeText}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
