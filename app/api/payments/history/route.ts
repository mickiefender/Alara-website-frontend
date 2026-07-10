import { NextRequest, NextResponse } from "next/server"
import axios from "axios"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

async function fetchBackendPayments(url: string, headers: HeadersInit, params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const fullUrl = `${API_BASE_URL}${url}${query ? `?${query}` : ''}`;
  console.log(`[PAYMENTS] Fetching: ${fullUrl}`);
  console.log(`[PAYMENTS] Headers:`, headers);

  const response = await fetch(fullUrl, {
    headers,
  });

  console.log(`[PAYMENTS] Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[PAYMENTS] Error body: ${errorText}`);
    throw new Error(`Backend API error: ${response.status} ${response.statusText} - URL: ${fullUrl}`);
  }

  const data = await response.json();
  // Handle DRF paginated response
  return data.results || data || [];
}

export function mapToPaymentRecord(backendPayment: any): any {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("school_id");
    const status = searchParams.get("status") || "all";
    const source = searchParams.get("source") || "all";
    const search = searchParams.get("search") || "";

    if (!schoolId) {
      return NextResponse.json({ error: "school_id is required" }, { status: 400 });
    }

    // Forward auth header to backend
    const authHeader = request.headers.get("Authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Fetch manual and online payments
    const [manualPaymentsRaw, onlinePaymentsRaw] = await Promise.all([
      fetchBackendPayments("/billing/manual-payments/by_school/", headers, { school_id: schoolId }),
      fetchBackendPayments("/billing/online-payments/by_school/", headers, { school_id: schoolId }),
    ]);

    // Combine and map to PaymentRecord
    let payments = [
      ...manualPaymentsRaw.map((p: any) => mapToPaymentRecord({ ...p, payment_source: 'manual' })),
      ...onlinePaymentsRaw.map((p: any) => mapToPaymentRecord({ ...p, payment_source: 'online' })),
    ];

    // Apply filters
    if (status !== "all") {
      payments = payments.filter((p: any) => p.status === status);
    }
    if (source !== "all") {
      payments = payments.filter((p: any) => p.payment_source === source);
    }
    if (search) {
      payments = payments.filter((p: any) =>
        p.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.fee_type?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by date desc
    payments.sort((a: any, b: any) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime());

    return NextResponse.json({
      status: true,
      payments,
      total: payments.length,
    });
  } catch (error: any) {
    console.error("Payment history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment history from backend" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Forward to backend payment creation endpoint
    return NextResponse.json({
      status: true,
      message: "Payment record saved to backend (integration pending)",
    });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save payment record" },
      { status: 500 }
    );
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function addPaymentRecord(paymentData: any, authHeader?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(`${API_URL}/billing/online-payments/`, {
      method: "POST",
      headers,
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return mapToPaymentRecord({ ...paymentData, ...data });
  } catch (error: any) {
    console.error("addPaymentRecord error:", error);
    throw error;
  }
}

