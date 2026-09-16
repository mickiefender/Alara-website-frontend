"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI, schoolsAPI, authLoading } from "./api"
import { resolvePostLoginRoute } from "./compliance-routing"

interface User {
  teacher_id: any
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "platform_staff" | "school_admin" | "teacher" | "student" | "parent" | "academic_admin" | "exam_officer" | "finance_officer" | "ct_admin_support"
  school_id?: number
  school_status?: string | null
  compliance_status?: string | null
  student_id?: string
  permissions?: string[]
  platform_permissions?: string[]
}

interface School {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  logo_url: string | null
  logo_url_computed: string | null
  website: string
  status: string
  compliance_status?: string | null
  plan?: { name: string }
}

interface AuthContextType {
  user: User | null
  school: School | null
  loading: boolean
  isAuthenticated: boolean
  login: (credential: string, password: string, loginType?: "email" | "student_id") => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const fetchSchool = async (schoolId: number) => {
    if (process.env.NODE_ENV === 'development') { console.log('[Auth] fetchSchool called with schoolId:', schoolId) }
    if (!schoolId) {
      if (process.env.NODE_ENV === 'development') { console.warn('[Auth] No schoolId provided, skipping school fetch') }
      setSchool(null)
      return null
    }
    try {
      // Use list and filter since get is not available on schoolsAPI
      const response = await schoolsAPI.list()
      const schools = response.data.results || response.data
      const schoolData = Array.isArray(schools) ? schools.find((s: any) => s.id === schoolId) : null
      if (process.env.NODE_ENV === 'development') { console.log('[Auth] Fetched schools, found for id', schoolId, ':', schoolData) }
      setSchool(schoolData)
      setUser((currentUser) => currentUser ? {
        ...currentUser,
        school_status: schoolData?.status ?? currentUser.school_status ?? null,
        compliance_status: schoolData?.compliance_status ?? currentUser.compliance_status ?? null,
      } : currentUser)
      return schoolData
    } catch (error: any) {
      const status = error.response?.status
      if (status === 401) {
        if (process.env.NODE_ENV === 'development') { console.warn('[Auth] 401 on school fetch - likely public page or token issue') }
        // Don't trigger global authError, just set null
        setSchool(null)
        return null
      }
      if (process.env.NODE_ENV === 'development') { console.error("[Auth] Failed to fetch school data:", status, error.message) }
      setSchool(null)
      return null
    }
  }

  const validateToken = async () => {
    const token = sessionStorage.getItem("authToken")
    const storedUser = sessionStorage.getItem("user")
    if (process.env.NODE_ENV === 'development') { console.log('[Auth] validateToken: token exists?', !!token, 'storedUser exists?', !!storedUser) }
    if (!token || !storedUser) return false

    try {
      if (process.env.NODE_ENV === 'development') { console.log('[Auth] Calling authAPI.me() with token...') }
      const meResponse = await authAPI.me()
      const meData = meResponse.data
      if (process.env.NODE_ENV === 'development') { console.log('[Auth] meResponse:', meData) }
      const parsedUser: User = {
        ...JSON.parse(storedUser || '{}'),
        ...meData,
        school_status: meData.school_status ?? meData.school?.status ?? null,
        compliance_status: meData.compliance_status ?? null,
        permissions: meData.permissions || meData.role_permission?.permission || [],
        platform_permissions: meData.platform_permissions || [],
      }
      if (process.env.NODE_ENV === 'development') { console.log('[Auth] parsedUser school_id:', parsedUser.school_id) }
      sessionStorage.setItem("user", JSON.stringify(parsedUser))
      setUser(parsedUser)
      // Only fetch school if user has school_id and is authenticated successfully
      if (parsedUser.school_id) {
        try {
          await fetchSchool(parsedUser.school_id)
        } catch (schoolError: any) {
          console.warn('[Auth] School fetch failed (non-critical):', schoolError.response?.status, schoolError.message)
          setSchool(null)
        }
      } else {
        if (process.env.NODE_ENV === 'development') { console.log('[Auth] No school_id, skipping fetchSchool') }
        setSchool(null)
      }
      setIsAuthenticated(true)
      return true
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (process.env.NODE_ENV === 'development') { console.warn('[Auth] Token invalid/expired (401), clearing storage') }
      } else {
        if (process.env.NODE_ENV === 'development') { console.warn("Token validation error:", error.response?.status, error.message) }
      }
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("refreshToken")
      sessionStorage.removeItem("user")
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      setSchool(null)
      setIsAuthenticated(false)
      return false
    }
  }

  useEffect(() => {
    // Hold the global loader while boot-time auth state is being resolved.
    // Released after validation AND the school fetch (if applicable) settle,
    // guaranteeing the loader never finishes before onboarding data is ready.
    authLoading.hold()
    validateToken()
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        authLoading.release()
        // Notify components of auth state change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authStateChanged'))
        }
      })
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user?.school_id) return
    const interval = window.setInterval(() => {
      void fetchSchool(user.school_id!)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [isAuthenticated, user?.school_id])

  const login = async (credential: string, password: string, loginType: "email" | "student_id" = "email") => {
    try {
      const loginData = loginType === "email"
        ? { email: credential, password }
        : { student_id: credential, password }

      const response = await authAPI.login(loginData)
      const { access, refresh, user: userData } = response.data

      const fullUserData = {
        ...userData,
        school_status: userData.school_status ?? userData.school?.status ?? null,
        compliance_status: userData.compliance_status ?? null,
        permissions: userData.permissions || userData.role_permission?.permission || [],
      }
      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("refreshToken", refresh)
      localStorage.setItem("authToken", access)
      localStorage.setItem("refreshToken", refresh)
      sessionStorage.setItem("user", JSON.stringify(fullUserData))
      setUser(fullUserData)

      let resolvedSchool = null
      if (fullUserData.school_id) {
        resolvedSchool = await fetchSchool(fullUserData.school_id)
      }

      // Notify auth state change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged'))
      }

      const route = resolvePostLoginRoute(fullUserData, resolvedSchool ?? school)
      router.push(route)
      router.refresh()

    } catch (error) {
      throw new Error("Login failed")
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setSchool(null)

    // Notify auth state change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }

    router.push("/auth/login")
  }

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data)
      const { access, refresh, user: userData } = response.data

      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("refreshToken", refresh)
      localStorage.setItem("authToken", access)
      localStorage.setItem("refreshToken", refresh)
      sessionStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      // Role-based redirect
      const adminStaffRoles = ['academic_admin', 'exam_officer', 'finance_officer', 'ct_admin_support'] as const
      if (userData.role && adminStaffRoles.includes(userData.role as any)) {
        router.push("/dashboard/admin-staff")
        router.refresh()
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      throw new Error("Registration failed")
    }
  }

  return <AuthContext.Provider value={{ user, school, loading, isAuthenticated, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    if (process.env.NODE_ENV === 'development') { console.warn("useAuthContext called outside AuthProvider - using safe defaults during hydration") }
    return {
      user: null,
      school: null,
      loading: true,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
      register: async () => {}
    } as AuthContextType
  }
  return context
}
