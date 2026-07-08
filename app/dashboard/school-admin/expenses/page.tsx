"use client"

import { useState } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import { SchoolExpense, ExpenseFilters } from '@/types/expense'
import ExpensesTable from '@/components/payments/ExpensesTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter, Search, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSchoolExpenses } from '@/hooks/useSchoolExpenses'

export default function ExpensesPage() {
  const { user } = useAuthContext()
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    category: 'all'
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'other' as const,
    expense_date: new Date().toISOString().slice(0,10),
    description: ''
  })

  const schoolId = user?.school_id?.toString()

  const { expenses, loading, error, refetch, createExpense } = useSchoolExpenses({
    schoolId,
    filters,
    enabled: !!schoolId
  })

  // Client-side search filter
  const filteredExpenses = expenses.filter(e => {
    if (filters.search && !e.description?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !e.category_display?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !e.expense_number.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const handleAddExpense = async () => {
    try {
      const data = {
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        expense_date: newExpense.expense_date,
        description: newExpense.description
      }
      const result = await createExpense(data)
      if (!result.error) {
        setShowAddDialog(false)
        setNewExpense({ amount: '', category: 'other', expense_date: new Date().toISOString().slice(0,10), description: '' })
        refetch()
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to add expense')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Expense #', 'Category', 'Amount', 'Description', 'Recorded By']
    const csvRows = filteredExpenses.map(e => [
      e.expense_date,
      e.expense_number,
      e.category_display,
      e.amount.toFixed(2),
      e.description || '',
      e.recorded_by_name
    ])
    
    const csvContent = [headers, ...csvRows].map(row => row.map(field => `"${field}"`).join(',')).join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `school-expenses-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold">School Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage daily operational expenses</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new school expense</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (GH¢)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newExpense.category} onValueChange={(v) => setNewExpense({...newExpense, category: v as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="salaries">Salaries & Wages</SelectItem>
                      <SelectItem value="supplies">Supplies & Materials</SelectItem>
                      <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                      <SelectItem value="events">Events & Activities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense} disabled={!newExpense.amount || parseFloat(newExpense.amount) <= 0}>
                  Add Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Description, category, number..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category || 'all'} onValueChange={(v) => setFilters({ ...filters, category: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salaries">Salaries</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="From"
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To"
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ExpensesTable 
        expenses={filteredExpenses} 
        loading={loading}
        schoolId={schoolId}
        showTotals={true}
        enablePrint={true}
      />
    </div>
  )
}
