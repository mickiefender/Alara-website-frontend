"use client"

import { useEffect } from "react"
import { identifyChatwootUser, setChatwootContext } from "@/lib/chatwoot/chatwoot-service"
import type { ChatwootIdentity, ChatwootPageContext } from "@/lib/chatwoot/types"

export function useChatwootIdentity(
  enabled: boolean,
  identity: ChatwootIdentity | null,
  context: ChatwootPageContext | null,
): void {
  useEffect(() => {
    if (!enabled || !identity) return
    identifyChatwootUser(identity)
  }, [enabled, identity])

  useEffect(() => {
    if (!enabled || !context) return
    setChatwootContext(context)
  }, [enabled, context])
}
