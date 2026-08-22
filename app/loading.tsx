import { CircularLoader } from "@/components/circular-loader"

/**
 * Root route loading UI — neutral spinner, no branding.
 *
 * Rendered by the App Router while the requested route's server component
 * is streaming. Pairs with the global PageLoader (root layout): data
 * fetches show the slim top progress bar, route transitions show this
 * centered spinner. No bare blank page.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <CircularLoader size="lg" />
    </div>
  )
}
