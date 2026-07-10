"use client"

import { Suspense } from "react"
import PaymentVerification from "@/components/payments/PaymentVerification"
import { NotificationProvider } from "@/lib/notifications-context"

function VerifyContent() {
  // Get user ID from sessionStorage for notification context
  let userId: number | undefined
  if (typeof window !== "undefined") {
    try {
      const storedUser = sessionStorage.getItem("user")
      if (storedUser) {
        userId = JSON.parse(storedUser).id
      }
    } catch {
      // ignore
    }
  }

  return (
    <NotificationProvider userId={userId}>
      <PaymentVerification />
    </NotificationProvider>
  )
}

export default function VerifyPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <Suspense fallback={null}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
