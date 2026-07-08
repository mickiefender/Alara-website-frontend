"use client"

import { useAuthContext } from '@/lib/auth-context'
import { NAV_LINK_PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, LayoutDashboard, Users, BookOpen, DollarSign } from 'lucide-react'
import { CountUp } from '@/components/ui/count-up'
import Link from 'next/link'
import { useEffect, useState } from 'react'



export default function AdminStaffDashboard() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ tasks: 0, notifications: 0, approvals: 0 })

  const userPerms = user?.permissions || []
  const rolePerms = NAV_LINK_PERMISSIONS.filter(p => userPerms.includes(p.id))
  const roleCategoryCounts = rolePerms.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    // Fetch staff-specific stats
    setTimeout(() => {
      setStats({ tasks: 5, notifications: 2, approvals: 3 })
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="animate-glass-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.first_name}</h1>
          <p className="text-muted-foreground">Manage your administrative tasks efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/admin-staff/profile">
              View Profile
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin-staff/permissions">
              My Permissions ({userPerms.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stagger grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.tasks} /></div>
            <CardDescription>Review and approve pending items</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.notifications} /></div>
            <CardDescription>New updates and alerts</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums"><CountUp value={stats.approvals} /></div>
            <CardDescription>Pending approvals assigned to you</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Permission Access Tiles */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access - Your Permissions</CardTitle>
          <CardDescription>Navigate to sections you have access to</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolePerms.slice(0, 6).map((perm) => (
            <Button key={perm.id} variant="outline" asChild className="h-auto p-4 justify-start">
              <Link href={perm.href}>
                <Shield className="w-5 h-5 mr-3" />
                {perm.label}
              </Link>
            </Button>
          ))}
          {rolePerms.length > 6 && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard/admin-staff/permissions">
                View All ({rolePerms.length}) Permissions
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Role Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Role: {user?.role?.replace('_', ' ').toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You have access to {Object.keys(roleCategoryCounts).join(', ')} categories.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(roleCategoryCounts).map(([category, count]) => (
              <div key={category} className="text-xs bg-accent/60 backdrop-blur-sm border border-white/30 dark:border-white/10 p-2 rounded-lg text-center transition-transform duration-200 hover:scale-[1.03]">
                <div className="font-medium">{category}</div>
                <div className="text-muted-foreground">{count} permissions</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
