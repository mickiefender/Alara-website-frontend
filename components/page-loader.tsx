"use client"

import { useGlobalLoadingState } from "@/lib/loading-manager"
import { BootSplash } from "@/components/boot-splash"
import { TopProgressBar } from "@/components/top-progress-bar"

/**
 * Global loading mount point (single component rendered in the root layout).
 *
 * It composes two context-aware loaders — never an opaque takeover of the
 * whole screen:
 *
 *  - `holds > 0`  → BootSplash: branded full-screen splash shown ONLY while
 *    the session is booting (auth token validation on first load / refresh).
 *  - `pending > 0` → TopProgressBar: slim branded bar at the top of the
 *    viewport while data (GET) requests are in flight. The user stays on
 *    their page while content loads in place.
 */
export function PageLoader() {
  const { pending, holds } = useGlobalLoadingState()

  return (
    <>
      <TopProgressBar />
      <BootSplash />
    </>
  )
}
