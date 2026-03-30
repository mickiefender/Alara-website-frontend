"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI, schoolsAPI } from "./api"

interface User {
  teacher_id: any
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "school_admin" | "teacher" | "student" | "academic_admin" | "exam_officer" | "finance_officer" | "ct_admin_support"
  school_id?: number
  student_id?: string
  permissions?: string[]
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
  plan?: { name: string }
}

interface AuthContextType {
  user: User | null
  school: School | null
  loading: boolean
  isAuthenticated: boolean
  login: (credential: string, password:string, loginType?: "email" | "student_id") => Promise<void>
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
    console.log('[Auth] fetchSchool called with schoolId:', schoolId)
    if (!schoolId) {
      console.warn('[Auth] No schoolId provided, skipping school fetch')
      setSchool(null)
      return
    }
    try {
      // Use list and filter since get is not available on schoolsAPI
      const response = await schoolsAPI.list()
      const schools = response.data.results || response.data
      const schoolData = Array.isArray(schools) ? schools.find((s: any) => s.id === schoolId) : null
      console.log('[Auth] Fetched schools, found for id', schoolId, ':', schoolData)
      setSchool(schoolData)
    } catch (error: any) {
      console.error("[Auth] Failed to fetch school data:", error.response?.status, error.message)
      // Handle all errors (401, 500, network) gracefully - set school to null
      setSchool(null)
    }
  }

  const validateToken = async () => {
    const token = sessionStorage.getItem("authToken")
    const storedUser = sessionStorage.getItem("user")
    console.log('[Auth] validateToken: token exists?', !!token, 'storedUser exists?', !!storedUser)
    if (!token || !storedUser) return false

    try {
      console.log('[Auth] Calling authAPI.me() with token...')
      const meResponse = await authAPI.me()
      const meData = meResponse.data
      console.log('[Auth] meResponse:', meData)
      const parsedUser: User = { ...JSON.parse(storedUser || '{}'), ...meData, permissions: meData.permissions || meData.role_permission?.permission || [] }
      console.log('[Auth] parsedUser school_id:', parsedUser.school_id)
      sessionStorage.setItem("user", JSON.stringify(parsedUser))
      setUser(parsedUser)
      if (parsedUser.school_id) {
        await fetchSchool(parsedUser.school_id)
      } else {
        console.log('[Auth] No school_id, skipping fetchSchool')
        setSchool(null)
      }
      setIsAuthenticated(true)
      return true
    } catch (error: any) {
      console.warn("Invalid/expired token:", error.response?.status, error.message)
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("user")
      setUser(null)
      setSchool(null)
      setIsAuthenticated(false)
      return false
    }
  }

  useEffect(() => {
    validateToken().finally(() => {
      setLoading(false)
      // Notify components of auth state change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged'))
      }
    })
  }, [])

  const login = async (credential: string, password: string, loginType: "email" | "student_id" = "email") => {
    try {
      const loginData = loginType === "email" 
        ? { email: credential, password } 
        : { student_id: credential, password }
      
      const response = await authAPI.login(loginData)
      const { access, user: userData } = response.data

      const fullUserData = { ...userData, permissions: userData.permissions || userData.role_permission?.permission || [] }
      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("user", JSON.stringify(fullUserData))
      setUser(fullUserData)

      if (fullUserData.school_id) {
        await fetchSchool(fullUserData.school_id)
      }

      // Notify auth state change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged'))
      }

      // Role-based redirect
      const adminStaffRoles = ['academic_admin', 'exam_officer', 'finance_officer', 'ct_admin_support'] as const
      if (fullUserData.role && adminStaffRoles.includes(fullUserData.role as any)) {
        router.push("/dashboard/admin-staff")
      } else {
        router.push("/dashboard")
      }

    } catch (error) {
      throw new Error("Login failed")
    }
  }

  const logout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("user")
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
      const { access, user: userData } = response.data

      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      
      // Role-based redirect
      const adminStaffRoles = ['academic_admin', 'exam_officer', 'finance_officer', 'ct_admin_support'] as const
      if (userData.role && adminStaffRoles.includes(userData.role as any)) {
        router.push("/dashboard/admin-staff")
      } else {
        router.push("/dashboard")
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
    console.warn("useAuthContext called outside AuthProvider - using safe defaults during hydration")
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
