"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const POSITION_STORAGE_KEY = "alara-help-button-position"
const EDGE_PADDING = 8

interface ButtonPosition {
  left: number
  top: number
}

interface ChatwootHelpButtonProps {
  onClick: () => void
  unreadCount: number
  label?: string
}

export function ChatwootHelpButton({
  onClick,
  unreadCount,
  label = "Alara Help",
}: ChatwootHelpButtonProps) {
  const hasUnread = unreadCount > 0
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
    startX: number
    startY: number
    moved: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)
  const positionRef = useRef<ButtonPosition | null>(null)
  const [position, setPosition] = useState<ButtonPosition | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const clampPosition = useCallback((left: number, top: number): ButtonPosition => {
    const button = buttonRef.current
    const maxLeft = Math.max(EDGE_PADDING, window.innerWidth - (button?.offsetWidth ?? 0) - EDGE_PADDING)
    const maxTop = Math.max(EDGE_PADDING, window.innerHeight - (button?.offsetHeight ?? 0) - EDGE_PADDING)
    return {
      left: Math.min(Math.max(EDGE_PADDING, left), maxLeft),
      top: Math.min(Math.max(EDGE_PADDING, top), maxTop),
    }
  }, [])

  useEffect(() => {
    try {
      const savedPosition = window.localStorage.getItem(POSITION_STORAGE_KEY)
      if (savedPosition) {
        const parsed: unknown = JSON.parse(savedPosition)
        if (
          parsed !== null &&
          typeof parsed === "object" &&
          "left" in parsed &&
          "top" in parsed &&
          typeof parsed.left === "number" &&
          typeof parsed.top === "number" &&
          Number.isFinite(parsed.left) &&
          Number.isFinite(parsed.top)
        ) {
          const clamped = clampPosition(parsed.left, parsed.top)
          positionRef.current = clamped
          setPosition(clamped)
        }
      }
    } catch (error) {
      console.warn("Could not restore Alara Help button position:", error)
    }

    const handleResize = () => {
      const currentPosition = positionRef.current
      if (!currentPosition) return
      const clamped = clampPosition(currentPosition.left, currentPosition.top)
      positionRef.current = clamped
      setPosition(clamped)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [clampPosition])

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return

    const bounds = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return

    drag.moved = true
    suppressClickRef.current = true
    setIsDragging(true)
    const nextPosition = clampPosition(
      event.clientX - drag.offsetX,
      event.clientY - drag.offsetY,
    )
    positionRef.current = nextPosition
    setPosition(nextPosition)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.moved && positionRef.current) {
      try {
        window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positionRef.current))
      } catch (error) {
        console.warn("Could not save Alara Help button position:", error)
      }
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
    dragRef.current = null
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40 print:hidden",
        position ? "" : "bottom-4 right-4 sm:bottom-6 sm:right-6",
      )}
      style={position ? { left: position.left, top: position.top } : undefined}
    >
      <div className="pointer-events-auto relative">
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-primary/40 animate-ping motion-reduce:animate-none"
          />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false
              return
            }
            onClick()
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          title="Drag to move Alara Help"
          aria-label={
            hasUnread
              ? `${label} - ${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
              : label
          }
          className={cn(
            "group relative flex items-center justify-center rounded-full",
            "h-12 w-12 gap-0 px-0 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3.5",
            "bg-[#123A73] text-white",
            "border border-white/25",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_10px_30px_-8px_rgba(0,0,0,0.45)]",
            "transition-all duration-200 ease-out",
            "hover:-translate-y-0.5 hover:brightness-110",
            "active:translate-y-0 active:scale-[0.97]",
            "touch-none select-none",
            isDragging ? "cursor-grabbing transition-none" : "cursor-grab",
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
