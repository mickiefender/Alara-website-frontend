"use client"

import { useEffect, useState } from "react"
import { billingAPI, superAdminAPI, usersAPI } from "@/lib/api"
import { useAuthContext } from "@/lib/auth-context"
import type { AnyObj, UserFilters } from "@/components/super-admin/types"
import KpiCards from "@/components/super-admin/kpi-cards"
import SchoolsUsageSection from "@/components/super-admin/schools-usage-section"
import GlobalUsersSection from "@/components/super-admin/global-users-section"
import BillingSection from "@/components/super-admin/billing-section"
import AnalyticsSection from "@/components/super-admin/analytics-section"

export default function SuperAdminDashboardPage() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [usage, setUsage] = useState<AnyObj[]>([])
  const [analytics, setAnalytics] = useState<AnyObj | null>(null)
  const [billingOverview, setBillingOverview] = useState<AnyObj | null>(null)
  const [billingRevenue, setBillingRevenue] = useState<AnyObj | null>(null)
  const [gatewayConfig, setGatewayConfig] = useState<AnyObj | null>(null)

  const [users, setUsers] = useState<AnyObj[]>([])
  const [userFilters, setUserFilters] = useState<UserFilters>({ school_id: "", role: "" })
  const [resetPasswordState, setResetPasswordState] = useState<{ [k: number]: string }>({})

  const isSuperAdmin = user?.role === "super_admin"

  const extractError = (err: any, fallback: string) =>
    err?.response?.data?.detail || err?.response?.data?.message || err?.message || fallback

const fetchAll = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      // Sequential fetches to avoid Turbopack race conditions
      const usageRes = await superAdminAPI.usage()
      setUsage(usageRes.data?.results || [])

      const analyticsRes = await superAdminAPI.analytics()
      setAnalytics(analyticsRes.data || null)

      const usersRes = await usersAPI.listGlobal({
        ...(userFilters.school_id ? { school_id: userFilters.school_id } : {}),
        ...(userFilters.role ? { role: userFilters.role } : {}),
      })
      setUsers(usersRes.data?.results || usersRes.data || [])

      const overviewRes = await billingAPI.superAdminOverview()
      setBillingOverview(overviewRes.data || null)

      const revenueRes = await billingAPI.superAdminRevenueAnalytics()
      setBillingRevenue(revenueRes.data || null)

      const gatewayRes = await billingAPI.superAdminGatewayConfig()
      setGatewayConfig(gatewayRes.data || null)
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to load super admin data."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin])

  const onFilterUsers = async () => {
    try {
      const res = await usersAPI.listGlobal({
        ...(userFilters.school_id ? { school_id: userFilters.school_id } : {}),
        ...(userFilters.role ? { role: userFilters.role } : {}),
      })
      setUsers(res.data?.results || res.data || [])
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to filter users."))
    }
  }

  const onBan = async (id: number) => {
    try {
      await usersAPI.banUser(id)
      await onFilterUsers()
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to ban user."))
    }
  }

  const onSuspend = async (id: number) => {
    try {
      await usersAPI.suspendUser(id)
      await onFilterUsers()
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to suspend user."))
    }
  }

  const onResetPassword = async (id: number) => {
    const password = resetPasswordState[id]
    if (!password) return
    try {
      await usersAPI.resetPassword(id, password)
      setResetPasswordState((s) => ({ ...s, [id]: "" }))
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to reset password."))
    }
  }

  const onAssignRole = async (id: number, role: string) => {
    if (!role) return
    try {
      await usersAPI.assignGlobalRole(id, role)
      await onFilterUsers()
    } catch (err: any) {
      setErrorMessage(extractError(err, "Failed to assign role."))
    }
  }

  if (!isSuperAdmin) return <div className="p-6">Unauthorized</div>
  if (loading) return <div className="p-6">Loading super admin dashboard...</div>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>

      {errorMessage ? (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <KpiCards analytics={analytics} />
      <SchoolsUsageSection usage={usage} />
      <GlobalUsersSection
        users={users}
        userFilters={userFilters}
        setUserFilters={setUserFilters}
        resetPasswordState={resetPasswordState}
        setResetPasswordState={setResetPasswordState}
        onFilterUsers={onFilterUsers}
        onBan={onBan}
        onSuspend={onSuspend}
        onResetPassword={onResetPassword}
        onAssignRole={onAssignRole}
      />
      <BillingSection
        billingOverview={billingOverview}
        billingRevenue={billingRevenue}
        gatewayConfig={gatewayConfig}
      />
      <AnalyticsSection analytics={analytics} />
    </div>
  )
}
