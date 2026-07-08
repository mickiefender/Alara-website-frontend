"use client"

import { useAuthContext } from "@/lib/auth-context"
import { ReactNode } from "react"

interface AuthBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthBoundary({
  children,
  fallback = null,
}: AuthBoundaryProps) {
  try {
    const { user } = useAuthContext()

    if (!user) {
      return <>{fallback}</>
    }

    return <>{children}</>
  } catch (error) {
    console.error("AuthBoundary error:", error)
    return null
  }
}

