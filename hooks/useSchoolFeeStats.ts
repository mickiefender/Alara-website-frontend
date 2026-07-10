import { useState, useEffect, useCallback } from 'react'
import { billingAPI } from '@/lib/api'
import { useReceipts } from './useReceipts'
import { useAuthContext } from '@/lib/auth-context'
import type { PaymentRecord } from '@/types/payment'

export interface SchoolFeeStats {
  totalExpected: number
  totalCollected: number
  pendingFees: number
  collectionRate: number
  loading: boolean
  error: string | null
}

export function useSchoolFeeStats() {
const [stats, setStats] = useState<Omit<SchoolFeeStats, 'refetch'>>({
    totalExpected: 0,
    totalCollected: 0,
    pendingFees: 0,
    collectionRate: 0,
    loading: true,
    error: null,
  })
  const { user } = useAuthContext()
  const schoolId = user?.school_id
  const { receipts, loading: receiptsLoading, refetch: refetchReceipts } = useReceipts({ schoolId })

  const fetchStats = useCallback(async () => {
    if (!schoolId) {
      setStats(prev => ({ ...prev, loading: false }))
      return
    }

    setStats(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Get API stats (expected fees)
      const apiStats = await billingAPI.getSchoolFeesStats()
      
      // Live total from receipts (more accurate for collected)
      const liveTotalCollected = receipts.reduce((sum: number, receipt: PaymentRecord) => {
        return sum + receipt.amount
      }, 0)

      const totalExpected = apiStats.total_expected || 0
      const collectionRate = totalExpected > 0 ? Math.round((liveTotalCollected / totalExpected) * 100) : 0

setStats({
        totalExpected,
        totalCollected: liveTotalCollected,
        pendingFees: Math.max(0, totalExpected - liveTotalCollected),
        collectionRate,
        loading: false,
        error: null,
      })
    } catch (err) {
      setStats({
        totalExpected: 0,
        totalCollected: receipts.reduce((sum: number, r: PaymentRecord) => sum + r.amount, 0),
        pendingFees: 0,
        collectionRate: 0,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch fee stats',
      })
    }
  }, [schoolId, receipts])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refetch = useCallback(() => {
    refetchReceipts()
    fetchStats()
  }, [refetchReceipts, fetchStats])

  return {
    ...stats,
    refetch,
    receiptsLoading: receiptsLoading || stats.loading,
  } as SchoolFeeStats & { refetch: () => Promise<void> }
}
