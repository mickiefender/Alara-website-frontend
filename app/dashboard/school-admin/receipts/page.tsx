"use client"

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import { PaymentRecord } from '@/types/payment'
import ReceiptsTable from '@/components/payments/ReceiptsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Loader from '@/components/loader'
import { Download, Filter, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useReceipts } from '@/hooks/useReceipts'

export default function ReceiptsPage() {
  const { user } = useAuthContext()
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'success' | 'pending' | 'failed' | 'partial',
    source: 'all' as 'all' | 'manual' | 'online'
  })

  const schoolId = user?.school_id

  const { receipts, loading, error, refetch } = useReceipts({
    schoolId,
    filters
  })

  // Debounced refetch for filter changes (status/source only)
  useEffect(() => {
    if (!schoolId) return

    const timer = setTimeout(() => {
      refetch()
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [filters.status, filters.source, schoolId, refetch])

  // Client-side filtering for search (instant)
  const filteredReceipts = receipts.filter(r => {
    if (filters.search && !r.student_name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !r.fee_type?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const handleExportCSV = () => {
    const headers = ['Date', 'Receipt#', 'Student', 'Fee Type', 'Amount', 'Method', 'Status', 'Source']
    const csvRows = filteredReceipts.map(r => [
      r.paid_at ? new Date(r.paid_at).toLocaleDateString() : new Date(r.created_at).toLocaleDateString(),
      r.receipt_number || r.reference || '',
      r.student_name || '',
      r.fee_type || '',
      `GH¢${r.amount?.toFixed(2)}`,
      r.payment_method_display || r.payment_method || r.payment_channel || '',
      r.status || '',
      r.payment_source || ''
    ])
    
    const csvContent = [headers, ...csvRows].map(row => row.map(field => `"${field}"`).join(',')).join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `school-receipts-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Receipts</h1>
          <p className="text-muted-foreground mt-1">View all manual and online fee receipts</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Filters <Filter className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Student or fee..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Source</Label>
            <Select value={filters.source} onValueChange={(v) => setFilters({ ...filters, source: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ReceiptsTable 
        payments={filteredReceipts} 
        loading={loading}
        schoolId={schoolId?.toString()}
        showStudentColumn={true}
        showTotals={true}
        enablePrint={true}
      />
    </div>
  )
}

