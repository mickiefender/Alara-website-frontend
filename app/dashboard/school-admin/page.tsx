"use client"

import dynamic from 'next/dynamic'
import { ProtectedRoute } from '@/lib/protected-route'
import { useState, useEffect } from 'react'
import { usersAPI, promotionAPI } from '@/lib/api'
import { DashboardStats } from '@/components/dashboard-stats'
import { FeesChart } from '@/components/fees-chart'
import { BestPerformingClass } from '@/components/best-performing-class'
import { LayoutDashboard, Users, DollarSign, CalendarDays, KeyRound, ShieldCheck } from 'lucide-react'
import { SubscriptionBadge } from '@/components/subscription-badge'

// Lazy-load account management panels so their API calls only fire when opened.
const StudentsManagement = dynamic(
  () => import('@/components/students-management').then(m => m.StudentsManagement),
  { ssr: false }
)
const TeachersManagement = dynamic(
  () => import('@/components/teachers-management').then(m => m.TeachersManagement),
  { ssr: false }
)

interface StatsType {
  students: number
  teachers: number
  parents: number
  earnings: number
  loading: boolean
}

interface AcademicYearInfo {
  id: number
  name: string
  is_current: boolean
  status: string
}

export default function SchoolAdminPage() {
  const [activeTab, setActiveTab ] = useState('dashboard')
  const [stats, setStats] = useState<StatsType>({
    students: 0,
    teachers: 0,
    parents: 0,
    earnings: 0,
    loading: true,
  })
  const [currentYear, setCurrentYear] = useState<AcademicYearInfo | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, parentsRes, yearsRes] = await Promise.all([
          usersAPI.students(),
          usersAPI.teachers(),
          usersAPI.parents().catch(() => null),
          promotionAPI.academicYears().catch(() => null),
        ])

        const years = yearsRes?.data?.results || yearsRes?.data || []
        setCurrentYear(years.find((y: AcademicYearInfo) => y.is_current) || null)

        setStats({
          students: studentsRes?.data?.results?.length || studentsRes?.data?.length || 0,
          teachers: teachersRes?.data?.results?.length || 0,
          parents: parentsRes?.data?.results?.length || parentsRes?.data?.length || 0,
          earnings: 0,
          loading: false,
        })
      } catch (error) {
        setStats((prev: StatsType) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="school-admin-dashboard space-y-8 p-4 md:p-6 lg:p-8">
        <div className="animate-glass-in flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
              School Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-base md:text-lg">
              {currentYear && (
                <span className="inline-flex items-center gap-1.5 ml-3 align-middle px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CalendarDays className="w-4 h-4" />
                  Academic Year: {currentYear.name}
                </span>
              )}
              <span className="inline-flex items-center ml-3 align-middle">
                <SubscriptionBadge />
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border
                ${activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary'
                  : 'glass hover:bg-secondary/10 text-foreground hover:-translate-y-px'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('password-reset')}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border
                ${activeTab === 'password-reset'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary'
                  : 'glass hover:bg-secondary/10 text-foreground hover:-translate-y-px'
                }`}
            >
              <KeyRound className="w-5 h-5" />
              Password Reset
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Fee Collection Overview
                </h2>
                <FeesChart />
              </div>

              <div className="glass-card p-6">
                <BestPerformingClass />
              </div>
            </div>
          </>
        )}

        {activeTab === 'password-reset' && (
          <div className="space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account security</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Password Reset Center</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Securely reset passwords for students and teachers. Choose an account below and set a new password immediately.
                      </p>
                    </div>
                  </div>
                  <div className="hidden rounded-xl border border-primary/15 bg-background/70 px-4 py-3 text-right sm:block">
                    <KeyRound className="ml-auto h-5 w-5 text-primary" />
                    <p className="mt-1 text-xs font-medium text-muted-foreground">Minimum length</p>
                    <p className="text-sm font-bold text-foreground">8 characters</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stagger grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Student Passwords</h2>
              <p className="mb-6 text-sm text-muted-foreground">Find a student account and reset its login password.</p>
              <StudentsManagement />
            </div>
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Teacher Passwords</h2>
              <p className="mb-6 text-sm text-muted-foreground">Find a teacher account and reset its login password.</p>
              <TeachersManagement />
            </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
