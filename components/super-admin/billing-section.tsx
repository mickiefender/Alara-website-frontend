"use client"

import SuperAdminCard from "./card"
import type { AnyObj } from "./types"

type Props = {
  billingOverview: AnyObj | null
  billingRevenue: AnyObj | null
  gatewayConfig: AnyObj | null
}

export default function BillingSection({ billingOverview, billingRevenue, gatewayConfig }: Props) {
  return (
    <>
      <section id="billing" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SuperAdminCard title="Invoices" value={billingOverview?.total_invoices ?? 0} />
        <SuperAdminCard title="Payments" value={billingOverview?.total_payments ?? 0} />
        <SuperAdminCard title="Invoice Amount" value={billingOverview?.total_invoice_amount ?? 0} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Payment Gateway Integration Status</h2>
        <div className="text-sm border rounded p-3">
          <div>Stripe: {gatewayConfig?.stripe?.enabled ? "Enabled" : "Disabled"}</div>
          <div>Paystack: {gatewayConfig?.paystack?.enabled ? "Enabled" : "Disabled"}</div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Revenue Analytics (30 Days)</h2>
        <div className="text-sm border rounded p-3">
          <div>Manual: {billingRevenue?.last_30_days?.manual_payments ?? 0}</div>
          <div>Online: {billingRevenue?.last_30_days?.online_payments ?? 0}</div>
          <div>Invoice: {billingRevenue?.last_30_days?.invoice_payments ?? 0}</div>
          <div className="font-semibold">Total: {billingRevenue?.last_30_days?.total_revenue ?? 0}</div>
        </div>
      </section>
    </>
  )
}
