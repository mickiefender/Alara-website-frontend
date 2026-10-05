"use client"

import { useEffect, useRef } from "react"
import { identifyCrispUser, setCrispContext } from "@/lib/crisp/crisp-service"
import {
  buildContextKey,
  buildIdentityKey,
  type CrispIdentity,
  type CrispPageContext,
} from "@/lib/crisp/types"

/**
 * Pushes the admin identity and the current page context to Crisp, only when
 * the underlying values actually change. Uses refs (no dependency arrays) so it
 * never re-sends data on unrelated re-renders caused by the auth polling loop.
 */
export function useCrispIdentity(
  enabled: boolean,
  identity: CrispIdentity | null,
  context: CrispPageContext | null,
): void {
  const appliedIdentityKey = useRef<string | null>(null)
  const appliedContextKey = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !identity) return
    const key = buildIdentityKey(identity)
    if (appliedIdentityKey.current === key) return
    appliedIdentityKey.current = key
    identifyCrispUser(identity)
  })

  useEffect(() => {
    if (!enabled || !context) return
    const key = buildContextKey(context)
    if (appliedContextKey.current === key) return
    appliedContextKey.current = key
    setCrispContext(context)
  })
}
