import { NextRequest, NextResponse } from "next/server"
import { addPaymentRecord } from "../history/route"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 }
      )
    }

    // Direct Paystack API call
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Paystack verify failed: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const amountInCedis = result.data.amount / 100
      
      // Get metadata - use type assertion for additional metadata fields
      const metadata = result.data.metadata as any
      const studentId = metadata?.student_id
      const feeId = metadata?.fee_id
      const schoolId = metadata?.school_id || "default"
      const studentName = result.data.metadata?.custom_fields?.find(
        (f: any) => f.variable_name === "student_name"
      )?.value || result.data.customer?.first_name || ""

      // NEW: Record payment in Django backend and update fee assignment
      try {
        // Get auth token from headers if available
        const authHeader = request.headers.get("Authorization")
        
        // Prepare the payment data for Django API
        const paymentData = {
          student_id: parseInt(studentId) || 0,
          fee_assignment_id: feeId ? parseInt(feeId) : null,
          amount: amountInCedis,
          reference: result.data.reference,
          transaction_id: String(result.data.id),
          channel: result.data.channel,
          status: "success",
          notes: `Paid via Paystack - ${result.data.channel}`,
          school_id: schoolId,
          student_name: studentName,
        }

        // Call Django API to record the online payment
        const djangoResponse = await axios.post(
          `${API_URL}/billing/online-payments/`,
          paymentData,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authHeader ? { Authorization: authHeader } : {}),
            },
          }
        )

        console.log("Online payment recorded in Django:", djangoResponse.data)
      } catch (djangoErr: any) {
        // Log the error but don't fail the whole request
        console.error("Failed to record payment in Django backend:", djangoErr.response?.data || djangoErr.message)
      }

      return NextResponse.json({
        status: true,
        message: "Payment verified successfully",
        data: {
          reference: result.data.reference,
          amount: amountInCedis,
          status: result.data.status,
          channel: result.data.channel,
          paid_at: result.data.paid_at,
          customer: result.data.customer,
          metadata: result.data.metadata,
        },
      })
    } else {
      return NextResponse.json({
        status: false,
        message: `Payment ${result.data.status}`,
        data: {
          reference: result.data.reference,
          status: result.data.status,
          gateway_response: result.data.gateway_response,
        },
      })
    }
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    )
  }
}

