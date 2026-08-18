import { DashboardSkeleton } from "@/components/dashboard-skeleton"

/**
 * Dashboard route loading UI — in-place skeleton.
 *
 * Rendered by the App Router while the dashboard page is streaming. The
 * dashboard layout (sidebar + topbar + mobile nav) stays mounted around
 * this, so the user reaches their destination page and sees its shell
 * immediately — the content area shimmers in place instead of showing a
 * centered spinner on a blank screen.
 */
export default function Loading() {
  return <DashboardSkeleton />
}
