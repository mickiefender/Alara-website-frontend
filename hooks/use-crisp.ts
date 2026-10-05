"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ensureCrispLoaded,
  openCrispChat,
  subscribeUnreadCount,
} from "@/lib/crisp/crisp-service"

export interface UseCrispResult {
  /** True when a Crisp website id is available and the widget should load. */
  isEnabled: boolean
  /** Number of unread messages received from the Alara Help team. */
  unreadCount: number
  /** Opens the Crisp chat widget and clears the unread badge. */
  openChat: () => void
}

/**
 * Loads the Crisp widget for the supplied website id and exposes its unread
 * state plus an open action. When `websiteId` is undefined the widget is never
 * loaded (e.g. for non school-admin users) and the hook stays inert.
 */
export function useCrisp(websiteId: string | undefined): UseCrispResult {
  const isEnabled = Boolean(websiteId)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isEnabled || !websiteId) return

    ensureCrispLoaded(websiteId)
    const unsubscribe = subscribeUnreadCount(setUnreadCount)
    return unsubscribe
  }, [isEnabled, websiteId])

  const openChat = useCallback(() => {
    openCrispChat()
  }, [])

  return { isEnabled, unreadCount, openChat }
}
