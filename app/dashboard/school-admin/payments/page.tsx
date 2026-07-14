"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/lib/protected-route"
import { useAuthContext } from "@/lib/auth-context"
import { billingAPI } from "@/lib/api"
import PaymentHistory from "@/components/payments/PaymentHistory"

const formatCurrency = (amount: number): string => {
  return `GH¢${Number(amount).toFixed(2)}`
}

export default function SchoolAdminPaymentsPage() {
  const { user, school } = useAuthContext()
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    total_withdrawn: 0,
    available_balance: 0,
    loading: true,
  })

  useEffect(() => {
    fetchRevenue()
  }, [user?.school_id])

  const fetchRevenue = async () => {
    try {
      // Total revenue comes from the backend's real payment records —
      // the local /api/revenue store is in-memory and resets on restart
      const [manualRes, onlineRes] = await Promise.all([
        billingAPI.manualPaymentsBySchool(),
        billingAPI.onlinePaymentsBySchool(),
      ])
      const manual = manualRes.data?.results || manualRes.data || []
      const online = onlineRes.data?.results || onlineRes.data || []

      const seen = new Set<string>()
      let totalRevenue = 0
      for (const p of [...(Array.isArray(manual) ? manual : []), ...(Array.isArray(online) ? online : [])]) {
        const status = String(p.status || "success").toLowerCase()
        if (!["success", "successful", "paid", "completed"].includes(status)) continue
        const key = `${p.reference || p.receipt_number || p.transaction_reference || ""}_${p.id ?? ""}_${p.amount}_${p.paid_at || p.payment_date || p.created_at || ""}`
        if (seen.has(key)) continue
        seen.add(key)
        totalRevenue += Number(p.amount || 0)
      }

      let totalWithdrawn = 0
      try {
        const res = await fetch(`/api/withdrawals/history?school_id=${user?.school_id || "default"}`)
        const data = await res.json()
        const withdrawals = Array.isArray(data.withdrawals) ? data.withdrawals : []
        totalWithdrawn = withdrawals
          .filter((w: any) => !["failed", "rejected", "cancelled"].includes(String(w.status || "").toLowerCase()))
          .reduce((sum: number, w: any) => sum + Math.abs(Number(w.amount || 0)), 0)
      } catch {
        // withdrawals unavailable — show revenue without deductions
      }

      setRevenueData({
        total_revenue: totalRevenue,
        total_withdrawn: totalWithdrawn,
        available_balance: totalRevenue - totalWithdrawn,
        loading: false,
      })
    } catch {
      setRevenueData((prev) => ({ ...prev, loading: false }))
    }
  }

  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Revenue</h1>
          <p className="text-gray-600 mt-1">Track all student payments and school revenue</p>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <p className="text-sm text-green-700 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-800 mt-1">
                {revenueData.loading ? "..." : formatCurrency(revenueData.total_revenue)}
              </p>
              <p className="text-xs text-green-600 mt-2">All confirmed payments</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <p className="text-sm text-orange-700 font-medium">Total Withdrawn</p>
              <p className="text-3xl font-bold text-orange-800 mt-1">
                {revenueData.loading ? "..." : formatCurrency(revenueData.total_withdrawn)}
              </p>
              <p className="text-xs text-orange-600 mt-2">Completed withdrawals</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <p className="text-sm text-blue-700 font-medium">Available Balance</p>
              <p className="text-3xl font-bold text-blue-800 mt-1">
                {revenueData.loading ? "..." : formatCurrency(revenueData.available_balance)}
              </p>
              <p className="text-xs text-blue-600 mt-2">Ready for withdrawal</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History Table */}
        <PaymentHistory
          schoolId={String(user?.school_id || "default")}
          showStudentColumn={true}
        />
      </div>
    </ProtectedRoute>
  )
}
