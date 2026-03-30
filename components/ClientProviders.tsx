"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SchoolThemeProvider } from "@/components/school-theme-provider"
import { AuthProvider } from "@/lib/auth-context"

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'system']}
      disableTransitionOnChange={false}
      storageKey="school-management-theme"
    >
      <SchoolThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </SchoolThemeProvider>
    </ThemeProvider>
  )
}

