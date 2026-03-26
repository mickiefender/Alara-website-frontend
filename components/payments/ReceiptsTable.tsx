"use client"

import { useState, useEffect } from "react"
import { PaymentRecord } from "@/types/payment"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import html2pdf from 'html2pdf.js'

interface ReceiptsTableProps {
  payments: PaymentRecord[]
  loading?: boolean
  schoolId?: string
  showStudentColumn?: boolean
  showTotals?: boolean
  enablePrint?: boolean
}

export default function ReceiptsTable({ 
  payments, 
  loading = false, 
  schoolId, 
  showStudentColumn = false, 
  showTotals = false, 
  enablePrint = false 
}: ReceiptsTableProps) {
  const [filter, setFilter] = useState<string>("all")
  const [localPayments, setLocalPayments] = useState<PaymentRecord[]>([])

  // Merge with localStorage
  useEffect(() => {
    if (schoolId && typeof window !== "undefined") {
      try {
        const key = `school_receipts_${schoolId}`
        const local = JSON.parse(localStorage.getItem(key) || "[]") as PaymentRecord[]
        const apiIds = new Set(payments.map(p => p.id))
        const merged = [
          ...payments,
          ...local.filter(lp => !apiIds.has(lp.id))
        ].sort((a, b) => new Date(b.paid_at || b.created_at || 0).getTime() - new Date(a.paid_at || a.created_at || 0).getTime())
        
        setLocalPayments(merged)
      } catch {
        setLocalPayments(payments)
      }
    } else {
      setLocalPayments(payments)
    }
  }, [payments, schoolId])

  const filteredPayments = filter !== "all" 
    ? localPayments.filter(p => p.status === filter)
    : localPayments

  // Calculate totals
  const totalCollected = filteredPayments.reduce((sum, p) => {
    return p.status === "success" ? sum + Number(p.amount) : sum
  }, 0)

  const paymentCount = filteredPayments.length

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-green-100 hover:bg-green-200 text-green-800 border-green-200",
      pending: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 hover:bg-red-200 text-red-800 border-red-200",
      abandoned: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200",
      partial: "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200",
    }

    return (
      <Badge 
        variant="secondary" 
        className={`px-2 py-1 text-xs font-medium cursor-default ${styles[status] || styles.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    if (method?.includes('paystack') || method === 'online') return '💳'
    if (method === 'cash') return '💵'
    if (method?.includes('bank')) return '🏦'
    if (method?.includes('mobile')) return '📱'
    return '💰'
  }

  const printReceipts = () => {
    if (!enablePrint || filteredPayments.length === 0) return
    
    const printContent = document.getElementById('receipts-printable')
    if (printContent) {
      html2pdf().from(printContent).set({
        margin: 1,
        filename: `school-receipts-${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save()
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'Receipt#', ...(showStudentColumn ? ['Student'] : []), 'Fee Type', 'Amount (GH¢)', 'Method', 'Status', 'Source']
    const csvRows = filteredPayments.map(p => [
      new Date(p.paid_at || p.created_at).toLocaleDateString(),
      p.receipt_number || p.reference || '',
      ...(showStudentColumn ? [p.student_name || ''] : []),
      p.fee_type || '',
      p.amount.toFixed(2),
      p.payment_method_display || p.payment_method || p.payment_channel || '',
      p.status || '',
      p.payment_source || ''
    ])
    
    const csv = [headers, ...csvRows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `receipts-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading receipts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              All Payment Receipts ({paymentCount})
            </CardTitle>
            <CardDescription>
              Complete history of manual and online payments
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({localPayments.length})</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            {enablePrint && (
              <Button variant="outline" onClick={printReceipts} className="gap-2">
                <Printer className="h-4 w-4" />
                Print PDF
              </Button>
            )}
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {localPayments.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 mb-1">No receipts</h3>
            <p className="text-sm text-gray-500">No payment receipts found for this school</p>
          </div>
        ) : (
          <>
            {/* Print-friendly content - hidden on screen */}
            {enablePrint && (
              <div id="receipts-printable" className="hidden print:block p-8">
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold mb-4">Payment Receipts Report</h1>
                  <p className="text-xl mb-2">School ID: {schoolId || 'All Schools'}</p>
                  <p className="text-lg mb-8">Generated: {new Date().toLocaleString()}</p>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-4 text-left font-bold text-lg">Date</th>
                        <th className="border p-4 text-left font-bold text-lg">Receipt #</th>
                        {showStudentColumn && <th className="border p-4 text-left font-bold text-lg">Student</th>}
                        <th className="border p-4 text-left font-bold text-lg">Fee Type</th>
                        <th className="border p-4 text-left font-bold text-lg">Amount</th>
                        <th className="border p-4 text-left font-bold text-lg">Payment Method</th>
                        <th className="border p-4 text-left font-bold text-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="border p-4">{new Date(payment.paid_at || payment.created_at).toLocaleString()}</td>
                          <td className="border p-4 font-mono font-semibold">{payment.receipt_number || payment.reference || 'N/A'}</td>
                          {showStudentColumn && <td className="border p-4">{payment.student_name || 'N/A'}</td>}
                          <td className="border p-4">{payment.fee_type}</td>
                          <td className="border p-4 font-bold text-green-600">GH¢{Number(payment.amount).toFixed(2)}</td>
                          <td className="border p-4">{payment.payment_method_display || getPaymentMethodIcon(payment.payment_method || payment.payment_channel || '')}</td>
                          <td className="border p-4">{getStatusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                    {showTotals && filteredPayments.length > 0 && (
                      <tfoot>
                        <tr className="bg-green-100 font-bold">
                          <td colSpan={showStudentColumn ? 4 : 3} className="border p-4 text-right text-lg">GRAND TOTAL:</td>
                          <td className="border p-4 text-2xl text-green-800">GH¢{totalCollected.toFixed(2)}</td>
                          <td colSpan={2} className="border p-4 text-lg">{paymentCount} receipts</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* Screen view table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-muted/50 to-muted">
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Date</th>
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Receipt #</th>
                    {showStudentColumn && (
                      <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Student</th>
                    )}
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Fee Type</th>
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Method</th>
                    <th className="text-left py-4 px-4 font-semibold sticky top-0 z-10 bg-background">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs bg-muted/20 rounded px-2 py-1">
                        {payment.receipt_number || payment.reference || 'N/A'}
                      </td>
                      {showStudentColumn && (
                        <td className="py-3 px-4">
                          <div className="font-medium">{payment.student_name}</div>
                          {payment.email && <div className="text-xs text-muted-foreground">{payment.email}</div>}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        {payment.fee_type}
                        {payment.academic_year && (
                          <div className="text-xs text-muted-foreground">{payment.academic_year} - {payment.term}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        GH¢{Number(payment.amount).toFixed(2)}
                        {payment.balance && payment.balance > 0 && (
                          <div className="text-xs text-orange-600 line-through">
                            GH¢{Number(payment.balance).toFixed(2)} bal
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {getPaymentMethodIcon(payment.payment_method || payment.payment_channel || '')}
                          {payment.payment_method_display || payment.payment_method || payment.payment_channel || '—'}
                          {payment.payment_source && (
                            <span className={`ml-1 px-1 rounded-full text-xs ${
                              payment.payment_source === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {payment.payment_source.toUpperCase()}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Footer */}
            {showTotals && filteredPayments.length > 0 && (
              <CardFooter className="pt-6 border-t bg-muted/30">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPayments.length} of {localPayments.length} receipts
                  </div>
                  <div className="flex gap-4 font-semibold text-lg">
                    <div>Total Collected: <span className="text-green-600">GH¢{totalCollected.toFixed(2)}</span></div>
                    <div>{paymentCount} receipts</div>
                  </div>
                </div>
              </CardFooter>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

