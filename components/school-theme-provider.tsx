"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuthContext } from '@/lib/auth-context'

interface SchoolTheme {
  primary_color: string
  secondary_color: string
  sidebar_color?: string
}

interface SchoolThemeContextType {
  schoolTheme: SchoolTheme | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const DEFAULT_SCHOOL_THEME: SchoolTheme = {
  primary_color: '#ff0000',
  secondary_color: '#292929',
  sidebar_color: '#ffffff',
}

const SchoolThemeContext = createContext<SchoolThemeContextType | null>(null)

export const useSchoolTheme = () => {
  const context = useContext(SchoolThemeContext)
  if (!context) {
    throw new Error('useSchoolTheme must be used within SchoolThemeProvider')
  }
  return context
}

interface SchoolThemeProviderProps {
  children: ReactNode
  schoolId?: number
}

export function SchoolThemeProvider({ children }: SchoolThemeProviderProps) {
  const { isAuthenticated, school, refreshSchool } = useAuthContext()
  const [schoolTheme, setSchoolTheme] = useState<SchoolTheme | null>(DEFAULT_SCHOOL_THEME)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyTheme = (theme: SchoolTheme) => {
    const root = document.documentElement
    root.style.setProperty('--school-primary', theme.primary_color)
    root.style.setProperty('--school-secondary', theme.secondary_color)
    root.style.setProperty('--school-sidebar', theme.sidebar_color || '#1e293b')

    const hexToRgb = (hex: string) => {
      const cleanedHex = hex.trim()
      const normalizedHex = cleanedHex.startsWith('#') ? cleanedHex.slice(1) : cleanedHex
      if (normalizedHex.length !== 6) {
        throw new Error('Invalid hex color')
      }
      return {
        r: parseInt(normalizedHex.slice(0, 2), 16) / 255,
        g: parseInt(normalizedHex.slice(2, 4), 16) / 255,
        b: parseInt(normalizedHex.slice(4, 6), 16) / 255,
      }
    }

    const luminance = (rgb: { r: number; g: number; b: number }) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        const srgb = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        return srgb
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    try {
      const sidebarRgb = hexToRgb(theme.sidebar_color || '#1e293b')
      const lum = luminance(sidebarRgb)
      const fgColor = lum > 0.5 ? '#0a0a0a' : '#fafafa'
      root.style.setProperty('--sidebar-foreground-computed', fgColor)
    } catch {
      root.style.setProperty('--sidebar-foreground-computed', '#fafafa')
    }
  }

  useEffect(() => {
    const resolvedTheme: SchoolTheme = isAuthenticated && school ? {
      primary_color: school.primary_color || DEFAULT_SCHOOL_THEME.primary_color,
      secondary_color: school.secondary_color || DEFAULT_SCHOOL_THEME.secondary_color,
      sidebar_color: school.sidebar_color || DEFAULT_SCHOOL_THEME.sidebar_color,
    } : DEFAULT_SCHOOL_THEME

    setSchoolTheme(resolvedTheme)
    applyTheme(resolvedTheme)
    setError(null)
    setIsLoading(false)
  }, [
    isAuthenticated,
    school?.primary_color,
    school?.secondary_color,
    school?.sidebar_color,
  ])

  useEffect(() => {
    const handleThemeUpdate = async () => {
      setIsLoading(true)
      try {
        await refreshSchool()
        setError(null)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') { console.error('[SchoolTheme] Refresh error:', err) }
        setError('Failed to load school theme')
      } finally {
        setIsLoading(false)
      }
    }

    window.addEventListener('schoolThemeUpdated', handleThemeUpdate)
    return () => window.removeEventListener('schoolThemeUpdated', handleThemeUpdate)
  }, [refreshSchool])

  const refetch = async () => {
    setIsLoading(true)
    try {
      await refreshSchool()
      setError(null)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') { console.error('[SchoolTheme] Refresh error:', err) }
      setError('Failed to load school theme')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SchoolThemeContext.Provider value={{ schoolTheme, isLoading, error, refetch }}>
      {children}
    </SchoolThemeContext.Provider>
  )
}
