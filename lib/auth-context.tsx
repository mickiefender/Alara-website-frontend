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
  role: "super_admin" | "school_admin" | "teacher" | "student"
  school_id?: number
  student_id?: string
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
    try {
      // Use list and filter since get is not available on schoolsAPI
      const response = await schoolsAPI.list()
      const schools = response.data.results || response.data
      const schoolData = Array.isArray(schools) ? schools.find((s: any) => s.id === schoolId) : null
      setSchool(schoolData)
    } catch (error: any) {
      console.error("Failed to fetch school data", error)
      // Handle 500 or network errors gracefully - set school to null
      // This prevents the app from crashing when backend is unavailable
      if (error.response?.status === 500) {
        console.warn("Backend server error - school data unavailable")
      }
      setSchool(null)
    }
  }

  const validateToken = async () => {
    const token = sessionStorage.getItem("authToken")
    const storedUser = sessionStorage.getItem("user")
    if (!token || !storedUser) return false

    try {
      const parsedUser: User = JSON.parse(storedUser)
      // Test token validity
      await authAPI.me()
      setUser(parsedUser)
      if (parsedUser.school_id) {
        await fetchSchool(parsedUser.school_id)
      }
      setIsAuthenticated(!!parsedUser.school_id)
      return true
    } catch (error: any) {
      console.warn("Invalid/expired token:", error.response?.status)
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("user")
      setUser(null)
      setSchool(null)
      setIsAuthenticated(false)
      return false
    }
  }

  useEffect(() => {
    validateToken().finally(() => setLoading(false))
  }, [])

  const login = async (credential: string, password: string, loginType: "email" | "student_id" = "email") => {
    try {
      const loginData = loginType === "email" 
        ? { email: credential, password } 
        : { student_id: credential, password }
      
      const response = await authAPI.login(loginData)
      const { access, user: userData } = response.data

      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      if (userData.school_id) {
        await fetchSchool(userData.school_id)
      }

      router.push("/dashboard")
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
    router.push("/auth/login")
  }

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data)
      const { access, user: userData } = response.data

      sessionStorage.setItem("authToken", access)
      sessionStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      router.push("/dashboard")
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
