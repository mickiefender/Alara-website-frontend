"use client"

import { ProtectedRoute } from '@/lib/protected-route'
import { useState, useEffect } from 'react'
import { usersAPI, promotionAPI, schoolsAPI } from '@/lib/api'
import { DashboardStats } from '@/components/dashboard-stats'
import { FeesChart } from '@/components/fees-chart'
import { BestPerformingClass } from '@/components/best-performing-class'
import { CalendarDays } from 'lucide-react'

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
        const [studentsRes, teachersRes, parentsRes, yearsRes, dashboardStatsRes] = await Promise.all([
          usersAPI.students(undefined, { apiCache: true }),
          usersAPI.teachers(undefined, { apiCache: true }),
          usersAPI.parents(undefined, { apiCache: true }).catch(() => null),
          promotionAPI.academicYears(undefined, { apiCache: true }).catch(() => null),
          schoolsAPI.getDashboardStats(),
        ])

        const years = yearsRes?.data?.results || yearsRes?.data || []
        setCurrentYear(years.find((y: AcademicYearInfo) => y.is_current) || null)
        const dashboardStats = dashboardStatsRes.data?.data || dashboardStatsRes.data

        setStats({
          students: studentsRes?.data?.results?.length || studentsRes?.data?.length || 0,
          teachers: teachersRes?.data?.results?.length || 0,
          parents: parentsRes?.data?.results?.length || parentsRes?.data?.length || 0,
          earnings: Number(dashboardStats?.earnings ?? 0),
          loading: false,
        })
      } catch (error) {
        console.error("Failed to load school dashboard statistics:", error)
        setStats((prev: StatsType) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="school-admin-dashboard space-y-8 p-4 md:p-6 lg:p-8">
        {currentYear && (
          <div className="animate-glass-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-black dark:text-black">
              <CalendarDays className="h-4 w-4" />
              Academic Year: {currentYear.name}
            </span>
          </div>
        )}

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Fee Collection Overview
            </h2>
            <FeesChart />
          </div>

          <div className="glass-card p-6">
            <BestPerformingClass />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
