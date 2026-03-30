"use client"

import { useSchoolExpenses } from '@/hooks/useSchoolExpenses'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { useAuthContext } from '@/lib/auth-context'

export function RecentExpenses() {
  const { user } = useAuthContext()
  const schoolId = user?.school_id?.toString()
  const { expenses, loading } = useSchoolExpenses({ 
    schoolId, 
    enabled: !!schoolId 
  })

  if (loading || !expenses.length) {
    return null
  }

  const recentExpenses = expenses.slice(0, 5)
  const totalRecent = recentExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-xl">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Recent Expenses</h3>
            <p className="text-sm text-muted-foreground">Last 5 expenses</p>
          </div>
        </div>

        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-10 bg-gradient-to-b from-red-400 to-red-600 rounded-full flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{expense.category_display}</div>
                  <div className="text-xs text-muted-foreground truncate">{expense.expense_number}</div>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="font-bold text-destructive">
                  - GH¢{Number(expense.amount).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border bg-destructive/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-destructive">
              Total Recent: GH¢{totalRecent.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {recentExpenses.length} expenses
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

