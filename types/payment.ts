export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: {
      student_id: string
      fee_type: string
      academic_year: string
      term: string
      custom_fields: Array<{
        display_name: string
        variable_name: string
        value: string
      }>
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
    }
  }
}

// Enhanced PaymentRecord for Receipts - supports manual + online
export interface PaymentRecord {
  id: string
  receipt_id?: string
  student_id: string
  student_name: string
  email?: string
  student_email?: string
  school_id?: string
  school_name?: string
  amount: number
  amount_paid?: number
  balance?: number
  fee_type: string
  fee_name?: string
  reference?: string
  receipt_number?: string
  status: "pending" | "success" | "failed" | "abandoned" | "partial"
  payment_channel?: string
  payment_method?: string
  payment_method_display?: string
  payment_source?: "manual" | "online"
  paid_at?: string
  created_at: string
  updated_at?: string
  transaction_reference?: string
  paystack_reference?: string
  academic_year?: string
  term?: string
  fee_assignment_id?: string | number
  notes?: string
}

export interface FeeStructure {
  id: string
  name: string
  amount: number
  academic_year: string
  term: string
  class_level: string
  description?: string
  is_mandatory: boolean
}

export interface PaymentInitData {
  email: string
  amount: number
  student_id: string
  student_name: string
  fee_type: string
  academic_year: string
  term: string
  fee_id?: number | string
  school_id?: string
  school_email?: string
  callback_url?: string
}

export interface WebhookEvent {
  event: string
  data: PaystackVerifyResponse["data"]
}

// New interfaces for receipts
export interface ReceiptsSummary {
  school_id: number
  school_name: string
  total_receipts: number
  successful_payments: number
  online_payments: number
  manual_payments: number
  total_collected: number
  total_online: number
  total_manual: number
  cash_payments: number
  bank_payments: number
  mobile_payments: number
  payments_last_30d: number
}

export interface ReceiptExportRow {
  receipt_id: string
  receipt_number: string
  student_name: string
  fee_type: string
  amount: number
  payment_method: string
  paid_at: string
  payment_source: string
  status: string
}

