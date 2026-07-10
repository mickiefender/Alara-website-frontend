export interface SchoolExpense {
  id: string
  school_id: number
  school_name?: string
  category: string
  category_display: string
  amount: number
  expense_date: string
  description: string
  expense_number: string
  recorded_by_name: string
  recorded_by_email?: string
  created_at: string
  status: 'recorded'
}

export interface ExpenseFilters {
  search?: string
  category?: 'all' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'transport' | 'marketing' | 'events' | 'other'
  date_from?: string
  date_to?: string
}

export interface RecordExpenseData {
  amount: number
  category: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'transport' | 'marketing' | 'events' | 'other'
  expense_date: string
  description?: string
}

