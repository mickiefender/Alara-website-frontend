"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/lib/auth-context"
import { billingAPI } from "@/lib/api"
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Receipt
} from "lucide-react"

interface PaymentRecord {
  id: string
  student_name: string
  amount: number
  fee_type: string
  reference: string
  status: string
  payment_channel: string
  paid_at: string
  created_at: string
}

export function RecentPayments() {
  const { user } = useAuthContext()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentPayments = async () => {
    try {
      setLoading(true)
      const schoolId = user?.school_id || "default"
      
      // Fetch using authenticated billingAPI (same endpoints as receipts page)
      const [manualRes, onlineRes] = await Promise.all([
        billingAPI.manualPaymentsBySchool(),
        billingAPI.onlinePaymentsBySchool()
      ])
      
      let apiPayments = [
        ...(manualRes.data?.results || manualRes.data || []),
        ...(onlineRes.data?.results || onlineRes.data || [])
      ].slice(0, 6)

      // Map to consistent format
      apiPayments = apiPayments.map((p: any) => ({
        id: p.id,
        student_name: p.student_name || p.student?.name || 'Student',
        amount: Number(p.amount),
        fee_type: p.fee_type || 'Fee Payment',
        reference: p.reference || p.receipt_number || '',
        status: p.status || 'success',
        payment_channel: p.payment_channel || p.channel || '',
        paid_at: p.paid_at || p.created_at,
        created_at: p.created_at || p.paid_at,
      }))

      // Also check localStorage for school payment notifications
      if (typeof window !== "undefined") {
        try {
          const notifKey = `school_payment_notifications_${schoolId}`
          const localNotifs = JSON.parse(localStorage.getItem(notifKey) || "[]")
          const apiRefs = new Set(apiPayments.map((p: any) => p.reference))

          const localPayments = localNotifs
            .filter((n: any) => !apiRefs.has(n.metadata?.reference))
            .map((n: any) => ({
              id: n.id,
              student_name: n.metadata?.student_name || "Student",
              amount: n.metadata?.amount || 0,
              fee_type: n.metadata?.fee_type || "Fee Payment",
              reference: n.metadata?.reference || "",
              status: "success",
              payment_channel: n.metadata?.channel || "",
              paid_at: n.created_at,
              created_at: n.created_at,
            }))

          const merged = [...apiPayments, ...localPayments]
            .sort((a: any, b: any) => new Date(b.created_at || b.paid_at).getTime() - new Date(a.created_at || a.paid_at).getTime())
            .slice(0, 6)

          setPayments(merged)
        } catch {
          setPayments(apiPayments)
        }
      } else {
        setPayments(apiPayments)
      }
    } catch (error) {
      console.error("Failed to fetch recent payments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentPayments()
  }, [])

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: React.ElementType, bg: string, text: string, label: string }> = {
      success: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Success" },
      pending: { icon: Clock, bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", label: "Pending" },
      failed: { icon: XCircle, bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", label: "Failed" },
    }
    return configs[status] || configs.pending
  }

  const getPaymentIcon = (channel: string) => {
    return <Wallet className="w-4 h-4" />
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Calculate summary
  const totalAmount = payments.reduce((sum, p) => sum + (p.status === "success" ? Number(p.amount) : 0), 0)
  const successCount = payments.filter(p => p.status === "success").length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-500" />
            Recent Receipts
          </h3>
        </div>
        <a
          href="/dashboard/school-admin/receipts"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View All Receipts
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Summary Cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Collected</span>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              ¢{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Successful</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {successCount} transactions
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Receipt className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">No payments recorded yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Payment transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => {
            const statusConfig = getStatusConfig(payment.status)
            const StatusIcon = statusConfig.icon
            
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bg} ${statusConfig.text}`}>
                    {getPaymentIcon(payment.payment_channel)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {payment.student_name || "Student"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {payment.fee_type} • {formatTimeAgo(payment.paid_at || payment.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +¢{Number(payment.amount).toFixed(2)}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

