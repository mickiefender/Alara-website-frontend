import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import { PaymentRecord } from '@/types/payment'
import { billingAPI } from '@/lib/api'

interface UseReceiptsProps {
  schoolId: number | string | undefined
  filters?: {
    status?: string
    source?: string
    search?: string
  }
}

function mapToPaymentRecord(backendPayment: any): PaymentRecord {
  const payment_source = backendPayment.payment_source || (backendPayment.channel?.includes('paystack') ? 'online' : 'manual');
  const status = backendPayment.status || 'success';
  const paid_at = backendPayment.paid_at || backendPayment.created_at || backendPayment.payment_date || new Date().toISOString();

  return {
    id: backendPayment.id || backendPayment.receipt_id || backendPayment.reference,
    receipt_number: backendPayment.receipt_number || backendPayment.reference || backendPayment.transaction_reference || '',
    student_id: backendPayment.student_id || backendPayment.student?.id,
    student_name: backendPayment.student_name || backendPayment.student?.name || `${backendPayment.student?.first_name || ''} ${backendPayment.student?.last_name || ''}`.trim() || 'Unknown',
    email: backendPayment.email || backendPayment.student_email || backendPayment.student?.email,
    school_id: backendPayment.school_id || backendPayment.school?.id,
    school_name: backendPayment.school_name || backendPayment.school?.name || '',
    amount: Number(backendPayment.amount || backendPayment.amount_paid || 0),
    fee_type: backendPayment.fee_type || backendPayment.fee?.name || 'Fee Payment',
    reference: backendPayment.reference || backendPayment.transaction_id || backendPayment.transaction_reference || '',
    status,
    payment_channel: backendPayment.payment_channel || backendPayment.channel,
    payment_method: backendPayment.payment_method,
    payment_method_display: backendPayment.payment_method_display || backendPayment.payment_method || backendPayment.channel || '',
    payment_source,
    paid_at,
    created_at: backendPayment.created_at || paid_at,
    updated_at: backendPayment.updated_at || paid_at,
    academic_year: backendPayment.academic_year,
    term: backendPayment.term,
    fee_assignment_id: backendPayment.fee_assignment_id || backendPayment.fee_assignment?.id,
    notes: backendPayment.notes || '',
  };
}

export function useReceipts({ schoolId, filters }: UseReceiptsProps) {
  const { isAuthenticated, loading: authLoading } = useAuthContext()
  const [receipts, setReceipts] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (authLoading || !isAuthenticated || !schoolId) {
    return { receipts: [], loading: true, error: null, refetch: () => {} }
  }

  const fetchReceipts = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReceipts([])
    try {
      const [manualRes, onlineRes] = await Promise.all([
        billingAPI.manualPaymentsBySchool(),
        billingAPI.onlinePaymentsBySchool()
      ])

      const manualPayments: any[] = manualRes.data?.results || manualRes.data || []
      const onlinePayments: any[] = onlineRes.data?.results || onlineRes.data || []

      let receipts: any[] = [...manualPayments, ...onlinePayments]

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        receipts = receipts.filter((p: any) => p.status === filters.status)
      }
      if (filters?.source && filters.source !== 'all') {
        receipts = receipts.filter((p: any) => {
          const source = p.payment_source || (p.channel?.includes('paystack') ? 'online' : 'manual')
          return source === filters.source
        })
      }
      if (filters?.search) {
        receipts = receipts.filter((p: any) =>
          p.student_name?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.fee_type?.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }

      // Map to PaymentRecord format
      const mappedReceipts = receipts.map(mapToPaymentRecord)
      
      // Sort by date desc
      mappedReceipts.sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
      
      setReceipts(mappedReceipts)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch receipts (check auth/network)'
      setError(errMsg)
      console.error('Fetch receipts error:', { schoolId, err, filters })
    } finally {
      setLoading(false)
    }
  }, [schoolId, filters])

  useEffect(() => {
    fetchReceipts()
  }, [schoolId, filters])









  return { receipts, loading, error, refetch: fetchReceipts }
}

