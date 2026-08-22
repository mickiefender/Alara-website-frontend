"use client"

import { useAuthContext } from '@/lib/auth-context'
import { NAV_LINK_PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  LayoutDashboard,
  Users,
  ClipboardList,
  Bell,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import { CountUp } from '@/components/ui/count-up'
import { bgFetch } from '@/lib/api'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PermissionsCategoryChart } from '@/components/admin-staff/permissions-category-chart'
import { WeeklyActivityChart } from '@/components/admin-staff/weekly-activity-chart'

interface ActivityDay {
  day: string
  tasks: number
  approvals: number
}

interface RecentActivityItem {
  id: number
  title: string
  action_type: 'task' | 'approval'
  created_at: string
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

export default function AdminStaffDashboard() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ tasks: 0, notifications: 0, approvals: 0 })
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityDay[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])

  const userPerms = user?.permissions || []
  const rolePerms = NAV_LINK_PERMISSIONS.filter(p => userPerms.includes(p.id))
  const roleCategoryCounts = rolePerms.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(roleCategoryCounts).map(([category, count]) => ({
    category,
    count,
  }))

  useEffect(() => {
    // Fetch staff-specific stats + real recorded activity for the charts.
    let cancelled = false

    const fetchDashboardData = async () => {
      try {
        const res = await bgFetch.get('/core/staff-activity/weekly/')
        if (cancelled) return
        setWeeklyActivity(res.data.weekly || [])
        setRecentActivity(res.data.recent || [])
        setStats((prev) => ({
          ...prev,
          tasks: res.data.totals?.tasks ?? prev.tasks,
          approvals: res.data.totals?.approvals ?? prev.approvals,
        }))
      } catch {
        // Endpoint unavailable or no activity yet — charts show empty state.
        if (!cancelled) {
          setWeeklyActivity([])
          setRecentActivity([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDashboardData()
    return () => {
      cancelled = true
    }
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="animate-glass-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name}
          </h1>
          <p className="text-muted-foreground">Here's what's happening in your workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold ring-1 ring-primary/20">
            <Shield className="w-3.5 h-3.5" />
            {user?.role?.replace('_', ' ').toUpperCase()}
          </span>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin-staff/permissions">
              My Permissions ({userPerms.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.tasks} /></div>
            <CardDescription>Items awaiting your action</CardDescription>
          </CardContent>
        </Card>
        <Card className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.approvals} /></div>
            <CardDescription>Pending approvals assigned to you</CardDescription>
          </CardContent>
        </Card>
        <Card className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.notifications} /></div>
            <CardDescription>New updates and alerts</CardDescription>
          </CardContent>
        </Card>
        <Card className="glass-card glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={userPerms.length} /></div>
            <CardDescription>Across {categoryData.length} categories</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <div className="stagger grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Permissions by Category
            </CardTitle>
            <CardDescription>How your access is distributed across modules</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <PermissionsCategoryChart data={categoryData} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                No permissions assigned yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              This Week's Activity
            </CardTitle>
            <CardDescription>Tasks handled vs. approvals processed per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                Loading activity…
              </div>
            ) : (
              <WeeklyActivityChart data={weeklyActivity} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick access + recent activity ─────────────────────── */}
      <div className="stagger grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump straight into the sections you manage</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {rolePerms.slice(0, 6).map((perm) => (
              <Link
                key={perm.id}
                href={perm.href}
                className="group flex items-center gap-3 rounded-xl border bg-background/60 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:-translate-y-0.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{perm.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{perm.category}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {rolePerms.length > 6 && (
              <Button variant="ghost" asChild className="col-span-full justify-start">
                <Link href="/dashboard/admin-staff/permissions">
                  View all {rolePerms.length} permissions
                </Link>
              </Button>
            )}
            {rolePerms.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No quick-access links yet — contact your school administrator.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest recorded actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading activity…</p>
            ) : recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity recorded yet — actions you take will appear here.
              </p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      item.action_type === 'approval'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {item.action_type === 'approval' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <ClipboardList className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
