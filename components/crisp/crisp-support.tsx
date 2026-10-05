"use client"

import { useCallback, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/auth-context"
import { useCrisp } from "@/hooks/use-crisp"
import { useCrispIdentity } from "@/hooks/use-crisp-identity"
import {
  CRISP_HELP_BUTTON_LABEL,
  CRISP_WEBSITE_ID,
  DASHBOARD_ROUTE_PREFIX,
  IS_CRISP_CONFIGURED,
  SUPPORT_ELIGIBLE_ROLES,
  SUPPORT_FALLBACK_PATH,
} from "@/lib/crisp/config"
import { deriveSectionFromPath } from "@/lib/crisp/section-label"
import type { CrispIdentity, CrispPageContext } from "@/lib/crisp/types"
import { CrispHelpButton } from "./crisp-help-button"

let warnedMissingWebsiteId = false

/**
 * Floating "Alara Help" launcher plus Crisp wiring.
 *
 * Shown to authenticated admin users (School Admin, Super Admin, platform
 * staff, admin-staff officers) anywhere in the dashboard. The Crisp widget is
 * loaded only for those users and only when NEXT_PUBLIC_CRISP_WEBSITE_ID is
 * set; otherwise the button falls back to the in-app support page so it is
 * never a dead control.
 */
export function CrispSupport() {
  const { user, school } = useAuthContext()
  const pathname = usePathname() ?? ""

  const isEligibleRole = Boolean(user?.role && SUPPORT_ELIGIBLE_ROLES.has(user.role))
  const isDashboardRoute = pathname.startsWith(DASHBOARD_ROUTE_PREFIX)
  const isVisible = Boolean(user) && isEligibleRole && isDashboardRoute

  const shouldLoadCrisp = isVisible && IS_CRISP_CONFIGURED

  useEffect(() => {
    if (!isVisible || IS_CRISP_CONFIGURED || warnedMissingWebsiteId) return
    warnedMissingWebsiteId = true
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Crisp] NEXT_PUBLIC_CRISP_WEBSITE_ID is not set - the Alara Help button " +
          "will open the support page instead of the Crisp widget. Add the variable " +
          "to .env.local and restart the dev server to enable Crisp."
      )
    }
  }, [isVisible])

  const identity = useMemo<CrispIdentity | null>(() => {
    if (!user) return null
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim()
    return {
      name: fullName || user.username || user.email,
      email: user.email,
      userId: user.id,
      schoolId: school?.id ?? user.school_id ?? null,
      schoolName: school?.name ?? null,
      role: user.role,
    }
  }, [
    user?.id,
    user?.email,
    user?.first_name,
    user?.last_name,
    user?.username,
    user?.role,
    user?.school_id,
    school?.id,
    school?.name,
  ])

  const context = useMemo<CrispPageContext | null>(() => {
    if (!pathname) return null
    return { path: pathname, section: deriveSectionFromPath(pathname) }
  }, [pathname])

  const { isEnabled, unreadCount, openChat } = useCrisp(
    shouldLoadCrisp ? CRISP_WEBSITE_ID : undefined
  )
  useCrispIdentity(isEnabled, identity, context)

  const handleOpen = useCallback(() => {
    if (IS_CRISP_CONFIGURED) {
      openChat()
      return
    }
    window.open(SUPPORT_FALLBACK_PATH, "_blank", "noopener,noreferrer")
  }, [openChat])

  if (!isVisible) return null

  return (
    <CrispHelpButton
      onClick={handleOpen}
      unreadCount={unreadCount}
      label={CRISP_HELP_BUTTON_LABEL}
    />
  )
}
