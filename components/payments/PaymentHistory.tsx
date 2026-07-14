"use client"

import { useState, useEffect } from "react"
import { PaymentRecord } from "@/types/payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import { billingAPI } from "@/lib/api"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

interface PaymentHistoryProps {
  studentId?: string
  schoolId?: string
  showStudentColumn?: boolean
}

export default function PaymentHistory({ studentId, schoolId, showStudentColumn = false }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchPayments()
  }, [studentId, schoolId, filter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      let manualPayments: any[] = []
      let onlinePayments: any[] = []

      if (studentId) {
        const numericStudentId = Number(studentId)
        if (!Number.isFinite(numericStudentId) || numericStudentId <= 0) {
          if (process.env.NODE_ENV === 'development') { console.warn("Skipping payment fetch due to invalid studentId:", studentId) }
          setPayments([])
          return
        }

        const [manualRes, onlineRes] = await Promise.all([
          billingAPI.manualPaymentsByStudent(numericStudentId),
          billingAPI.onlinePaymentsByStudent(numericStudentId),
        ])
        manualPayments = manualRes.data?.results || manualRes.data || []
        onlinePayments = onlineRes.data?.results || onlineRes.data || []
      } else if (schoolId) {
        const [manualRes, onlineRes] = await Promise.all([
          billingAPI.manualPaymentsBySchool(),
          billingAPI.onlinePaymentsBySchool(),
        ])
        manualPayments = manualRes.data?.results || manualRes.data || []
        onlinePayments = onlineRes.data?.results || onlineRes.data || []
      }

      const normalizedManual = (Array.isArray(manualPayments) ? manualPayments : []).map((p: any, idx: number) => ({
        id: p.id || `manual_${idx}_${p.reference || p.receipt_number || Date.now()}`,
        student_id: String(p.student_id || p.student || studentId || ""),
        student_name: p.student_name || p.student_full_name || p.student?.name || "",
        email: p.email || p.student_email || "",
        amount: Number(p.amount || 0),
        fee_type: p.fee_type || p.fee_name || "Fee Payment",
        reference: p.reference || p.receipt_number || "",
        status: p.status || "success",
        payment_channel: p.payment_channel || p.payment_method || p.channel || "manual",
        paid_at: p.paid_at || p.payment_date || p.created_at || "",
        created_at: p.created_at || p.payment_date || p.paid_at || new Date().toISOString(),
        updated_at: p.updated_at || p.created_at || new Date().toISOString(),
        academic_year: p.academic_year || "",
        term: p.term || "",
      }))

      const normalizedOnline = (Array.isArray(onlinePayments) ? onlinePayments : []).map((p: any, idx: number) => ({
        id: p.id || `online_${idx}_${p.reference || Date.now()}`,
        student_id: String(p.student_id || p.student || studentId || ""),
        student_name: p.student_name || p.student_full_name || p.student?.name || "",
        email: p.email || p.student_email || "",
        amount: Number(p.amount || 0),
        fee_type: p.fee_type || p.fee_name || "Fee Payment",
        reference: p.reference || p.transaction_reference || "",
        status: p.status || "success",
        payment_channel: p.payment_channel || p.channel || "online",
        paid_at: p.paid_at || p.payment_date || p.created_at || "",
        created_at: p.created_at || p.payment_date || p.paid_at || new Date().toISOString(),
        updated_at: p.updated_at || p.created_at || new Date().toISOString(),
        academic_year: p.academic_year || "",
        term: p.term || "",
      }))

      let apiPayments: PaymentRecord[] = [...normalizedManual, ...normalizedOnline]

      const dedupMap = new Map<string, PaymentRecord>()
      apiPayments.forEach((p) => {
        const key = `${p.reference || ""}_${p.id}_${p.amount}_${p.paid_at || p.created_at}`
        if (!dedupMap.has(key)) {
          dedupMap.set(key, p)
        }
      })
      apiPayments = Array.from(dedupMap.values())

      if (studentId && apiPayments.length === 0 && typeof window !== "undefined") {
        try {
          const historyKey = `payment_history_${studentId}`
          const localPayments = JSON.parse(localStorage.getItem(historyKey) || "[]")

          const mergedLocal = (Array.isArray(localPayments) ? localPayments : []).map((lp: any, idx: number) => ({
            id: `local_${idx}`,
            student_id: studentId,
            student_name: "",
            email: "",
            amount: Number(lp.amount || 0),
            fee_type: lp.fee_type || "Payment",
            reference: lp.reference || "",
            status: lp.status || "success",
            payment_channel: lp.channel || "",
            paid_at: lp.paid_at || "",
            created_at: lp.paid_at || new Date().toISOString(),
            updated_at: lp.paid_at || new Date().toISOString(),
            academic_year: "",
            term: "",
          })) as PaymentRecord[]

          apiPayments = mergedLocal
        } catch {
          // ignore local fallback failures
        }
      }

      apiPayments.sort(
        (a: any, b: any) =>
          new Date(b.created_at || b.paid_at).getTime() - new Date(a.created_at || a.paid_at).getTime()
      )

      if (filter !== "all") {
        apiPayments = apiPayments.filter((p: any) => p.status === filter)
      }

      setPayments(apiPayments)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error("Failed to fetch payments:", error) }
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "excel") => {
    if (payments.length === 0) return
    const headers = [
      "Date",
      "Reference",
      ...(showStudentColumn ? ["Student"] : []),
      "Fee Type",
      "Amount (GHS)",
      "Channel",
      "Status",
      "Academic Year",
      "Term",
    ]
    const rows = payments.map((p) => [
      new Date(p.paid_at || p.created_at).toLocaleDateString(),
      p.reference || "",
      ...(showStudentColumn ? [p.student_name || "N/A"] : []),
      p.fee_type || "",
      Number(p.amount).toFixed(2),
      p.payment_channel || "",
      p.status || "",
      p.academic_year || "",
      p.term || "",
    ])
    const date = new Date().toISOString().slice(0, 10)
    if (format === "csv") {
      exportToCSV(`payment-history-${date}.csv`, headers, rows)
    } else {
      await exportToExcel(`payment-history-${date}.xlsx`, "Payment History", headers, rows)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      abandoned: "bg-gray-100 text-gray-800",
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <CardTitle>Payment History</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Payments</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={loading || payments.length === 0}>
                  <Download size={15} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payment records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Reference</th>
                  {showStudentColumn && (
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold">Fee Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Channel</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-800 text-xs">
                      {payment.reference}
                    </td>
                    {showStudentColumn && (
                      <td className="py-3 px-4 text-gray-600">
                        {payment.student_name || "N/A"}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-600">
                      {payment.fee_type}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      GH¢{Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {payment.payment_channel || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
