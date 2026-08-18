import { BrandedSplashContent } from "@/components/boot-splash"

/**
 * Root route loading UI — branded Alara splash.
 *
 * Rendered by the App Router while the requested route's server component
 * is streaming. Pairs with the global PageLoader (root layout): boot-time
 * auth validation shows the same branded splash, data fetches show the
 * slim top progress bar. No bare spinner on a blank page.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <BrandedSplashContent />
    </div>
  )
}
