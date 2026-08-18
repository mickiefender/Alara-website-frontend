"use client"

import React from "react"
import Loader from "@/components/ui/loader-11"

interface CircularLoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  color?: string
}

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
  xl: "h-12 w-12 border-4",
}

/**
 * Single app-wide circular loader. Every variant below renders the exact
 * same circle (ui/loader-11) so the dashboard only ever shows ONE loader
 * style, no matter which component triggered it.
 */
export function CircularLoader({ size = "md", className = "" }: CircularLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`animate-spin rounded-full border-black/10 border-t-red-600 dark:border-white/15 dark:border-t-red-500 ${sizeClasses[size]}`} />
    </div>
  )
}

/**
 * Full page overlay loader - blocks interaction while loading.
 * Same circle as everything else.
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader />
    </div>
  )
}

/**
 * Inline loader with optional message
 */
export function InlineLoader({ message = "Loading...", className = "" }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${className}`}>
      <Loader />
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

/**
 * Card loader - for loading content within cards
 */
export function CardLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader />
        <span className="text-sm text-gray-500">Loading data...</span>
      </div>
    </div>
  )
}

/**
 * Compact spinner for buttons - same circle, small size
 */
export function ButtonSpinner({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-red-600 dark:border-white/15 dark:border-t-red-500" />
    </span>
  )
}

export { PageLoader as FullScreenLoader }
export default CircularLoader
