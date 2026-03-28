"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { schoolsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
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
  const { isAuthenticated, loading: authLoading, user } = useAuthContext()
  const effectiveSchoolId = schoolId || user?.school_id
  console.log('[SchoolTheme] Provider mounted - prop schoolId:', schoolId, 'user.school_id:', user?.school_id, 'effective:', effectiveSchoolId)
  const [schoolTheme, setSchoolTheme] = useState<SchoolTheme | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const STORAGE_KEY = 'schoolTheme'

  // Load cached theme on init
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const theme: SchoolTheme = JSON.parse(cached)
        setSchoolTheme(theme)
        
        // Apply cached CSS vars immediately
        const root = document.documentElement
        root.style.setProperty('--school-primary', theme.primary_color)
        root.style.setProperty('--school-secondary', theme.secondary_color)
        root.style.setProperty('--school-sidebar', theme.sidebar_color || '#1e293b')
        
        // Recompute sidebar fg
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)!
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
        try {
          const sidebarRgb = hexToRgb(theme.sidebar_color || '#1e293b')
          const lum = luminance(sidebarRgb)
          root.style.setProperty('--sidebar-foreground-computed', lum > 0.5 ? '#0a0a0a' : '#fafafa')
        } catch {
          root.style.setProperty('--sidebar-foreground-computed', '#fafafa')
        }
        console.log('[SchoolTheme] Loaded cached theme:', theme)
      }
    } catch (e) {
      console.warn('[SchoolTheme] Invalid cached theme, clearing')
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const fetchSchoolTheme = useCallback(async () => {
    if (authLoading) {
      console.log('[SchoolTheme] Skipped fetch: auth loading')
      return
    }

    if (!isAuthenticated) {
      console.log('[SchoolTheme] Skipped fetch: not authenticated')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await schoolsAPI.list()
      const schools = response.data.results || []
      console.log('[SchoolTheme] Fetched schools:', schools.length, 'effectiveSchoolId:', effectiveSchoolId, 'User school_id:', user?.school_id)
      
      let schoolData = schools[0] // fallback
      if (user?.school_id && schools.length > 0) {
        schoolData = schools.find((s: any) => s.id === effectiveSchoolId) || schools[0]
        if (!schoolData || schoolData.id !== effectiveSchoolId) {
          console.warn('[SchoolTheme] School ID not found in list, using first:', effectiveSchoolId, schoolData?.id)
        }
      }
      
      if (schoolData) {
        const theme: SchoolTheme = {
          primary_color: schoolData.primary_color || '#008484',
          secondary_color: schoolData.secondary_color || '#f1f5f9',
          sidebar_color: schoolData.sidebar_color || '#1e293b',
        }
        setSchoolTheme(theme)
        
        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
        } catch (e) {
          console.warn('[SchoolTheme] Failed to save cache')
        }
        
        // Apply CSS custom properties immediately
        const root = document.documentElement
        
        // Helper functions for luminance
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)!
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
          const sidebarRgb = hexToRgb(theme.sidebar_color || '#1e293b')
          const lum = luminance(sidebarRgb)
          const fgColor = lum > 0.5 ? '#0a0a0a' : '#fafafa'
          root.style.setProperty('--sidebar-foreground-computed', fgColor)
          console.log('[SchoolTheme] Sidebar luminance:', lum.toFixed(3), '→ FG:', fgColor)
        } catch {
          root.style.setProperty('--sidebar-foreground-computed', '#0a0a0a')
        }
        
      console.log('[SchoolTheme] ✅ Applied theme:', theme, 'School ID:', schoolData.id, 'effectiveSchoolId:', effectiveSchoolId)
      } else {
        console.warn('[SchoolTheme] No schools found')
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
  }, [isAuthenticated, authLoading, toast, user?.school_id])

  // Main fetch on auth ready + schoolId change
  useEffect(() => {
    if (isAuthenticated && !authLoading && effectiveSchoolId) {
      console.log('[SchoolTheme] Triggering fetch for schoolId:', effectiveSchoolId)
      fetchSchoolTheme()
    }
  }, [isAuthenticated, authLoading, effectiveSchoolId])

  // Listen for auth state change (post-login)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleAuthChange = () => {
      console.log('[SchoolTheme] Auth state changed, refetching')
      fetchSchoolTheme()
    }
    
    window.addEventListener('authStateChanged', handleAuthChange)
    return () => window.removeEventListener('authStateChanged', handleAuthChange)
  }, [fetchSchoolTheme])

  // Existing theme update listener
  useEffect(() => {
    if (typeof window === 'undefined') return
    
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

