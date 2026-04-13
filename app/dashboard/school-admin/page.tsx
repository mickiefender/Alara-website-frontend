"use client"

import { ProtectedRoute } from '@/lib/protected-route'
import { useState, useEffect } from 'react'
import { attendanceAPI, billingAPI, usersAPI, academicsAPI } from '@/lib/api'
import { DashboardStats } from '@/components/dashboard-stats'
import { FeesChart } from '@/components/fees-chart'
import { EventCalendar } from '@/components/event-calendar'
import { NoticeBoard } from '@/components/notice-board'
import { RecentPayments } from '@/components/recent-payments'
import { StudentsManagement } from '@/components/students-management'
import { TeachersManagement } from '@/components/teachers-management'
import { BestPerformingClass } from '@/components/best-performing-class'
import { BestPerformingStudent } from '@/components/best-performing-student'
import { FullScreenLoader } from '@/components/circular-loader'
import { LayoutDashboard, Users, DollarSign, CheckCircle2, Trophy } from 'lucide-react'

interface StatsType {
  students: number
  teachers: number
  parents: number
  earnings: number
  loading: boolean
}

interface QuickStats {
  feesExpected: number
  feesCollected: number
  feesPending: number
  collectionRate: number
  attendanceRate: number
  topStudentName: string
  topStudentScore: number
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
  const [quickStats, setQuickStats] = useState<QuickStats>({
    feesExpected: 0,
    feesCollected: 0,
    feesPending: 0,
    collectionRate: 0,
    attendanceRate: 0,
    topStudentName: "N/A",
    topStudentScore: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, feesStats, attendanceRes, terminalReportsRes, studentsListRes] = await Promise.all([
          usersAPI.students(),
          usersAPI.teachers(),
          billingAPI.getSchoolFeesStats(),
          attendanceAPI.overallReport(),
          academicsAPI.terminalReports(),
          usersAPI.students(),
        ])

        const totalRevenue = Number(feesStats?.total_collected || 0)

        const reports = terminalReportsRes?.data?.results || terminalReportsRes?.data || []
        const students = studentsListRes?.data?.results || studentsListRes?.data || []
        const sortedReports = [...reports].sort((a: any, b: any) => (b.average_marks || 0) - (a.average_marks || 0))
        const topReport = sortedReports[0]
        const topStudent = students.find((s: any) => (s.user?.id || s.id) === topReport?.student)
        const topStudentName = topStudent
          ? `${topStudent.user?.first_name || ''} ${topStudent.user?.last_name || ''}`.trim()
          : "N/A"

        setQuickStats({
          feesExpected: Number(feesStats?.total_expected || 0),
          feesCollected: Number(feesStats?.total_collected || 0),
          feesPending: Number(feesStats?.pending_fees || 0),
          collectionRate: Number(feesStats?.collection_rate || 0),
          attendanceRate: Number(attendanceRes?.data?.attendance_percentage || 0),
          topStudentName,
          topStudentScore: Number(topReport?.average_marks || 0),
        })

        setStats({
          students: studentsRes?.data?.results?.length || 0,
          teachers: teachersRes?.data?.results?.length || 0,
          parents: 0,
          earnings: totalRevenue,
          loading: false,
        })
      } catch (error) {
        setStats((prev: StatsType) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return <FullScreenLoader />
  }

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="space-y-8 p-4 md:p-6 lg:p-8 bg-background">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              School Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-base md:text-lg">
              Live overview of fees, attendance and academic performance
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border
                ${activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-lg border-primary'
                  : 'bg-card hover:bg-secondary/40 text-foreground border-border'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border
                ${activeTab === 'analytics'
                  ? 'bg-primary text-primary-foreground shadow-lg border-primary'
                  : 'bg-card hover:bg-secondary/40 text-foreground border-border'
                }`}
            >
              <Users className="w-5 h-5" />
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees Expected</p>
                <p className="text-2xl font-bold mt-1">¢{quickStats.feesExpected.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees Collected</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">¢{quickStats.feesCollected.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold mt-1">{quickStats.attendanceRate.toFixed(1)}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Student</p>
                  <p className="font-semibold truncate">{quickStats.topStudentName}</p>
                  <p className="text-sm text-muted-foreground">{quickStats.topStudentScore.toFixed(1)}%</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-500 shrink-0" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    Fee Collection Overview
                  </h2>
                  <FeesChart />
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <BestPerformingClass />
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <RecentPayments />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <BestPerformingStudent />
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <EventCalendar />
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <NoticeBoard />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Students Overview</h2>
              <StudentsManagement />
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Teachers Overview</h2>
              <TeachersManagement />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
