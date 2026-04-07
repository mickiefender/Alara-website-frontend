"use client"

import { useState } from "react"
import { SchoolExpense } from "@/types/expense"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Printer } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import html2pdf from 'html2pdf.js'

interface ExpensesTableProps {
  expenses: SchoolExpense[]
  loading?: boolean
  schoolId?: string
  showTotals?: boolean
  enablePrint?: boolean
}

export default function ExpensesTable({ 
  expenses, 
  loading = false, 
  schoolId, 
  showTotals = false, 
  enablePrint = false 
}: ExpensesTableProps) {
  const [filter, setFilter] = useState<'all' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'transport' | 'marketing' | 'events' | 'other'>("all")

  const filteredExpenses = filter !== "all" 
    ? expenses.filter(e => e.category === filter)
    : expenses

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const expenseCount = filteredExpenses.length

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      utilities: "bg-blue-100 text-blue-800",
      salaries: "bg-red-100 text-red-800",
      supplies: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      transport: "bg-purple-100 text-purple-800",
      marketing: "bg-orange-100 text-orange-800",
      events: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800"
    }
    return colors[category] || colors.other
  }

  const printExpenses = () => {
    if (!enablePrint || filteredExpenses.length === 0) return
    
    const printContent = document.getElementById('expenses-printable')
    if (printContent) {
      html2pdf(printContent, {
        margin: 1,
        filename: `school-expenses-${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'Expense #', 'Category', 'Amount (GH¢)', 'Description', 'Recorded By']
    const csvRows = filteredExpenses.map(e => [
      e.expense_date,
      e.expense_number,
      e.category_display,
      Number(e.amount).toFixed(2),
      e.description || '',
      e.recorded_by_name
    ])
    
    const csv = [headers, ...csvRows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `expenses-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading expenses...</p>
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
              School Expenses ({expenseCount})
            </CardTitle>
            <CardDescription>
              Track daily operational expenses
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({expenses.length})</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salaries">Salaries</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {enablePrint && (
              <Button variant="outline" onClick={printExpenses} className="gap-2">
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
        {expenses.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h2v6l5.5-3-5.5-3v6H9v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
            <p className="text-gray-500">School expenses will appear here once recorded.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 ${getCategoryColor(expense.category)}`}>
                          {expense.category_display}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900">{expense.expense_number}</p>
                          <p className="text-sm text-gray-500">{expense.expense_date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          GH¢{Number(expense.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{expense.description || 'No description'}</p>
                      </div>
                      <div className="text-sm text-gray-500 text-right sm:text-left">
                        <p>{expense.recorded_by_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showTotals && filteredExpenses.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Expenses ({filteredExpenses.length}):</span>
              <span className="text-2xl font-bold text-gray-900">
                GH¢{totalSpent.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
