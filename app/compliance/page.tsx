"use client"

import { redirect } from "next/navigation"

export default function ComplianceRedirectPage() {
  redirect("/dashboard/compliance")
  return null
}
