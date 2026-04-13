"use client"

import React from "react"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
}

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
}

export default function Loader({ size = "md", color = "#2563eb", className = "" }: LoaderProps) {
  return (
    <div
      className={`inline-block rounded-full border-solid border-t-transparent animate-spin ${sizeMap[size]} ${className}`}
      style={{ borderColor: color, borderTopColor: "transparent" }}
      role="status"
      aria-label="Loading"
    />
  )
}
