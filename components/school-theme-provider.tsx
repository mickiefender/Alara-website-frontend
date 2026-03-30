"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { schoolsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

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

export function SchoolThemeProvider({ children, schoolId }: SchoolThemeProviderProps) {
  const [schoolTheme, setSchoolTheme] = useState<SchoolTheme | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSchoolTheme = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await schoolsAPI.list()
      if (response.data.results && response.data.results.length > 0) {
        const schoolData = response.data.results[0]
        const theme: SchoolTheme = {
          primary_color: schoolData.primary_color || '#008484',
          secondary_color: schoolData.secondary_color || '#f1f5f9',
          sidebar_color: schoolData.sidebar_color || '#1e293b',
        }
        setSchoolTheme(theme)
        
        // Apply CSS custom properties immediately
        const root = document.documentElement
        
        // Helper functions for luminance
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
          return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        }
        const luminance = (rgb: any) => {
          const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            const srgb = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
            return srgb
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        
        root.style.setProperty('--school-primary', theme.primary_color)
        root.style.setProperty('--school-secondary', theme.secondary_color)
        root.style.setProperty('--school-sidebar', theme.sidebar_color || '#1e293b')
        
        // Compute dynamic sidebar foreground based on sidebar lightness
        try {
          const sidebarRgb = hexToRgb(theme.sidebar_color!)
          const lum = luminance(sidebarRgb)
          const fgColor = lum > 0.5 ? '#0a0a0a' : '#fafafa'  // Dark text on light bg, light on dark
          root.style.setProperty('--sidebar-foreground-computed', fgColor)
          console.log('[SchoolTheme] Sidebar luminance:', lum.toFixed(3), '→ FG:', fgColor)
        } catch {
          // Fallback
          root.style.setProperty('--sidebar-foreground-computed', '#0a0a0a')
        }
        
        console.log('[SchoolTheme] Applied:', theme)
      }
    } catch (err: any) {
      console.error('[SchoolTheme] Fetch error:', err)
      setError('Failed to load school theme')
      toast({
        title: 'Theme Error',
        description: 'Could not load school colors',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSchoolTheme()
    
    // Listen for theme update events
    const handleThemeUpdate = () => {
      fetchSchoolTheme()
    }
    
    window.addEventListener('schoolThemeUpdated', handleThemeUpdate)
    return () => window.removeEventListener('schoolThemeUpdated', handleThemeUpdate)
  }, [fetchSchoolTheme])

  const refetch = useCallback(async () => {
    await fetchSchoolTheme()
  }, [fetchSchoolTheme])

  return (
    <SchoolThemeContext.Provider value={{ schoolTheme, isLoading, error, refetch }}>
      {children}
    </SchoolThemeContext.Provider>
  )
}
