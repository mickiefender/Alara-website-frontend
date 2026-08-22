"use client"

import { useGlobalLoadingState } from "@/lib/loading-manager"
import { TopProgressBar } from "@/components/top-progress-bar"

/**
 * Global loading mount point (single component rendered in the root layout).
 *
 * Shows a slim progress bar at the top of the viewport while data (GET)
 * requests are in flight. The user stays on their page while content
 * loads in place — no full-screen takeover.
 */
export function PageLoader() {
  const { pending } = useGlobalLoadingState()

  return <TopProgressBar />
}
