"use client"

import { ProtectedRoute } from '@/lib/protected-route'
import { useState, useEffect } from 'react'
import { usersAPI, promotionAPI } from '@/lib/api'
import { DashboardStats } from '@/components/dashboard-stats'
import { FeesChart } from '@/components/fees-chart'
import { BestPerformingClass } from '@/components/best-performing-class'
import { DollarSign, CalendarDays } from 'lucide-react'

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
            {currentYear && (
              <p className="text-muted-foreground mt-2 text-base md:text-lg">
                <span className="inline-flex items-center gap-1.5 ml-3 align-middle px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CalendarDays className="w-4 h-4" />
                  Academic Year: {currentYear.name}
                </span>
              </p>
            )}
          </div>
        </div>

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
      </div>
    </ProtectedRoute>
  )
}
