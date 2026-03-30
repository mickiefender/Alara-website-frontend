import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import { SchoolExpense, ExpenseFilters } from '@/types/expense'
import { apiClient } from '@/lib/api'
import { Loader } from '@/components/loader'

interface UseSchoolExpensesProps {
  schoolId?: string
  filters?: ExpenseFilters
  enabled?: boolean
}

export function useSchoolExpenses({ schoolId, filters, enabled = true }: UseSchoolExpensesProps) {
  const { user } = useAuthContext()
  const [expenses, setExpenses] = useState<SchoolExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!enabled || !user?.school_id) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.search) params.append('description__icontains', filters.search)
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters?.date_from) params.append('expense_date__gte', filters.date_from)
      if (filters?.date_to) params.append('expense_date__lte', filters.date_to)
      if (schoolId) params.append('school', schoolId)

      const response = await apiClient.get('/billing/expenses/by_school/', { params })

      const data = response.data?.results || response.data || []
      setExpenses(data)
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err)
      setError(err.response?.data?.detail || 'Failed to fetch expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [schoolId, filters, enabled, user?.school_id])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const refetch = fetchExpenses

  const createExpense = async (data: FormData | any) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/billing/expenses/', data)
      refetch()
      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create expense'
      return { data: null, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      setLoading(true)
      await apiClient.delete(`/billing/expenses/${id}/`)
      refetch()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to delete expense' }
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams({ school_id: user!.school_id!.toString() })
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)
      
      const response = await apiClient.get(`/billing/expenses/export/?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `school-expenses-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Export failed:', err)
    }
  }

  return {
    expenses,
    loading,
    error,
    refetch,
    createExpense,
    deleteExpense,
    exportCSV,
    setError,
  }
}

