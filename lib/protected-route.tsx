"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthContext } from "./auth-context"
import { hasPlatformPermission } from "./platform-permissions"

const STAFF_ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard/super-admin/schools": "schools.view",
  "/dashboard/super-admin/compliance": "compliance.view",
  "/dashboard/super-admin/compliance-documents": "compliance.view",
  "/dashboard/super-admin/users": "users.view",
  "/dashboard/super-admin/roles": "platform.roles",
  "/dashboard/super-admin/admin-staff": "platform.staff",
  "/dashboard/super-admin/subscriptions": "finance.view",
  "/dashboard/super-admin/payments": "finance.view",
  "/dashboard/super-admin/analytics": "platform.analytics",
  "/dashboard/super-admin/reports": "platform.audit",
  "/dashboard/super-admin/moderation": "content.moderate",
  "/dashboard/super-admin/notifications": "platform.notifications",
  "/dashboard/super-admin/sms": "platform.notifications",
  "/dashboard/super-admin/support": "platform.support",
  "/dashboard/super-admin/contact-inquiries": "content.contact",
  "/dashboard/super-admin/faqs": "content.manage",
  "/dashboard/super-admin/blog": "content.manage",
  "/dashboard/super-admin/audit-logs": "platform.audit",
  "/dashboard/super-admin/settings": "platform.settings",
  "/dashboard/super-admin/trusted-schools": "content.manage",
  "/dashboard/super-admin/feature-flags": "platform.flags",
  "/dashboard/super-admin/storage": "platform.storage",
  "/dashboard/super-admin/security": "platform.security",
  "/dashboard/super-admin/monitoring": "platform.monitoring",
  "/dashboard/super-admin/integrations": "platform.apikeys",
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, school, loading } = useAuthContext()
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const staffRoute = user?.role === "platform_staff"
    ? Object.keys(STAFF_ROUTE_PERMISSIONS).find((route) =>
        pathname === route || pathname.startsWith(`${route}/`),
      )
    : null
  const staffCanAccess = !staffRoute || Boolean(
    hasPlatformPermission(user?.platform_permissions, STAFF_ROUTE_PERMISSIONS[staffRoute]),
  )

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (!loading && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard")
      return
    }

    if (!loading && user?.role === "platform_staff" && !staffCanAccess) {
      router.replace("/dashboard/super-admin")
    }

    if (!loading && user?.role === "school_admin") {
      const status = school?.status ?? user.school_status ?? "pending_compliance"
      const complianceStatus = school?.compliance_status ?? user.compliance_status
      const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
      const requiresCompliance = !school || status !== "active" || complianceStatus !== "approved"
      if (status === "active" && complianceStatus === "approved" && currentPath.startsWith("/dashboard/compliance")) {
        router.replace("/dashboard/school-admin")
        return
      }
      if (requiresCompliance && currentPath && !currentPath.startsWith("/dashboard/compliance")) {
        router.replace("/dashboard/compliance")
        return
      }
      if (status === "rejected" && currentPath && !currentPath.startsWith("/dashboard/compliance/rejected")) {
        router.replace("/dashboard/compliance/rejected")
      }
    }
  }, [user, school, loading, router, allowedRoles, staffCanAccess])

  if (!user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  if (user.role === "platform_staff" && !staffCanAccess) {
    return null
  }

  if (user.role === "school_admin") {
    const status = school?.status ?? user.school_status ?? "pending_compliance"
    const complianceStatus = school?.compliance_status ?? user.compliance_status
    const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
    const requiresCompliance = !school || status !== "active" || complianceStatus !== "approved"
    if (requiresCompliance && currentPath && !currentPath.startsWith("/dashboard/compliance")) {
      return null
    }
    if (status === "rejected" && currentPath && !currentPath.startsWith("/dashboard/compliance/rejected")) {
      return null
    }
  }

  return <>{children}</>
}
