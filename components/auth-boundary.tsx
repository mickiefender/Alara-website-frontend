"use client"

import { useAuthContext } from "@/lib/auth-context"
import { CircularLoader } from "@/components/circular-loader"
import { ReactNode } from "react"

interface AuthBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function AuthBoundary({
  children,
  fallback = null,
  loadingFallback = <CircularLoader />,
}: AuthBoundaryProps) {
  try {
    const { user, loading } = useAuthContext()
    
    if (loading) {
      return <>{loadingFallback}</>
    }
    
    if (!user) {
      return <>{fallback}</>
    }
    
    return <>{children}</>
  } catch (error) {
    console.error("AuthBoundary error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <CircularLoader />
          <p className="mt-4 text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    )
  }
}

