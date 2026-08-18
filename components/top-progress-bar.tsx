"use client"

import { useGlobalLoadingState } from "@/lib/loading-manager"

/**
 * Slim branded progress bar pinned to the top of the viewport.
 *
 * Shown whenever data (GET) requests are in flight — the user stays on
 * the page they are on while content loads in place. This replaces the
 * old opaque full-screen loader that blanked out the app.
 *
 * Rendered by <PageLoader /> in the root layout.
 */
export function TopProgressBar() {
  const { pending } = useGlobalLoadingState()

  if (pending === 0) return null

  return (
    <div
      className="alara-top-progress"
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="alara-top-progress__bar" />
    </div>
  )
}
