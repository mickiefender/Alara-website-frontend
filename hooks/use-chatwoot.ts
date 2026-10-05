"use client"

import { useCallback, useEffect, useState } from "react"
import { ensureChatwootLoaded, openChatwootChat } from "@/lib/chatwoot/chatwoot-service"

export interface UseChatwootResult {
  isEnabled: boolean
  unreadCount: number
  openChat: () => void
}

export function useChatwoot(websiteToken: string | undefined): UseChatwootResult {
  const isEnabled = Boolean(websiteToken)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isEnabled || !websiteToken) return
    ensureChatwootLoaded(websiteToken)
  }, [isEnabled, websiteToken])

  const openChat = useCallback(() => {
    setUnreadCount(0)
    openChatwootChat()
  }, [])

  return { isEnabled, unreadCount, openChat }
}
