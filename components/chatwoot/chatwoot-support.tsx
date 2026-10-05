"use client"

import { useCallback, useMemo } from "react"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/auth-context"
import { CHATWOOT_HELP_BUTTON_LABEL, CHATWOOT_WEBSITE_TOKEN, DASHBOARD_ROUTE_PREFIX, SUPPORT_ELIGIBLE_ROLES, SUPPORT_FALLBACK_PATH } from "@/lib/chatwoot/config"
import type { ChatwootIdentity, ChatwootPageContext } from "@/lib/chatwoot/types"
import { useChatwoot } from "@/hooks/use-chatwoot"
import { useChatwootIdentity } from "@/hooks/use-chatwoot-identity"
import { ChatwootHelpButton } from "./chatwoot-help-button"

export function ChatwootSupport() {
  const { user, school } = useAuthContext()
  const pathname = usePathname() ?? ""

  const isEligibleRole = Boolean(user?.role && SUPPORT_ELIGIBLE_ROLES.has(user.role))
  const isDashboardRoute = pathname.startsWith(DASHBOARD_ROUTE_PREFIX)
  const isVisible = Boolean(user) && isEligibleRole && isDashboardRoute
  const shouldLoadChatwoot = isVisible && Boolean(CHATWOOT_WEBSITE_TOKEN)

  const identity = useMemo<ChatwootIdentity | null>(() => {
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

  const context = useMemo<ChatwootPageContext | null>(() => {
    if (!pathname) return null
    return {
      path: pathname,
      section: pathname.split("/").filter(Boolean).slice(1).join(" / ") || "dashboard",
    }
  }, [pathname])

  const { isEnabled, unreadCount, openChat } = useChatwoot(
    shouldLoadChatwoot ? CHATWOOT_WEBSITE_TOKEN : undefined,
  )
  useChatwootIdentity(isEnabled, identity, context)

  const handleOpen = useCallback(() => {
    if (shouldLoadChatwoot) {
      openChat()
      return
    }
    window.location.assign(SUPPORT_FALLBACK_PATH)
  }, [openChat, shouldLoadChatwoot])

  if (!isVisible) return null

  return (
    <ChatwootHelpButton
      onClick={handleOpen}
      unreadCount={unreadCount}
      label={CHATWOOT_HELP_BUTTON_LABEL}
    />
  )
}
