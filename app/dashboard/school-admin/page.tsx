"use client"

import { ProtectedRoute } from '@/lib/protected-route'
import { useState, useEffect } from 'react'
import { usersAPI } from '@/lib/api'
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
import { LayoutDashboard, Users, DollarSign } from 'lucide-react'

interface StatsType {
  students: number
  teachers: number
  parents: number
  earnings: number
  loading: boolean
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([usersAPI.students(), usersAPI.teachers()])

        let totalRevenue = 0
        try {
          const revenueRes = await fetch(`/api/revenue?school_id=${studentsRes?.data?.results?.[0]?.school || "default"}`)
          const revenueData = await revenueRes.json()
          if (revenueData.status && revenueData.data?.total_revenue > 0) {
            totalRevenue = revenueData.data.total_revenue
          }
        } catch {
          // Use default if revenue API fails
        }

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
      <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-background">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent drop-shadow-lg">
              Welcome Back! 
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here's what's happening at your school today
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all border ring-1 
                ${activeTab === 'dashboard'
                  ? 'bg-secondary text-secondary-foreground shadow-xl ring-secondary/50 scale-105'
                  : 'bg-card hover:bg-secondary/5 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/20 text-foreground border-border'
                }`}
            >
              <LayoutDashboard className="w-5 h-5 group-hover:text-sidebar-primary text-sidebar-foreground-computed" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('password reset')}
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all border ring-1 
                ${activeTab === 'password reset'
                  ? 'bg-secondary text-secondary-foreground shadow-xl ring-secondary/50 scale-105'
                  : 'bg-card hover:bg-secondary/5 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/20 text-foreground border-border'
                }`}
            >
              <Users className="w-5 h-5 group-hover:text-sidebar-primary text-sidebar-foreground-computed" />
              Password Reset
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-sidebar-primary opacity-75" />
                    Fee Collection Overview
                  </h2>
                  <FeesChart />
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <BestPerformingClass />
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <RecentPayments />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <BestPerformingStudent />
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <EventCalendar />
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
                  <NoticeBoard />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
              <h2 className="text-2xl font-bold text-foreground mb-6">Students Overview</h2>
              <StudentsManagement />
            </div>
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:ring-2 ring-secondary/30 transition-all">
              <h2 className="text-2xl font-bold text-foreground mb-6">Teachers Overview</h2>
              <TeachersManagement />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

