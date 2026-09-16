export type UserLike = {
  role?: string
  school_status?: string | null
  compliance_status?: string | null
  school_id?: number | null
}

export type SchoolLike = {
  status?: string | null
  compliance_status?: string | null
}

export function resolvePostLoginRoute(user: UserLike | null, school?: SchoolLike | null): string {
  if (!user) return "/auth/login"

  if (user.role === "platform_staff") return "/dashboard/super-admin"

  const adminStaffRoles = ["academic_admin", "exam_officer", "finance_officer", "ct_admin_support"]
  if (user.role && adminStaffRoles.includes(user.role)) return "/dashboard/admin-staff"

  if (user.role === "school_admin") {
    const schoolStatus = school?.status ?? user.school_status ?? "pending_compliance"
    const complianceStatus = school?.compliance_status ?? user.compliance_status
    if (schoolStatus === "pending_compliance") return "/dashboard/compliance"
    if (schoolStatus === "rejected") return "/dashboard/compliance/rejected"
    if (complianceStatus !== "approved") {
      return complianceStatus === "requires_resubmission" ? "/dashboard/compliance/rejected" : "/dashboard/compliance"
    }
    return "/dashboard/school-admin"
  }

  const roleRoutes: Record<string, string> = {
    super_admin: "/dashboard/super-admin",
    school_admin: "/dashboard/school-admin",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    parent: "/dashboard/parent",
  }

  return roleRoutes[user.role ?? ""] || "/dashboard"
}
