"use client"

import { useAuthContext } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { resolvePostLoginRoute } from "@/lib/compliance-routing"

export default function DashboardPage() {
  const { user, school, loading } = useAuthContext()

  if (!user) {
    redirect("/auth/login")
  }

  const route = resolvePostLoginRoute(user, school)
  if (route) {
    redirect(route)
  }

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}