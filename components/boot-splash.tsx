"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useGlobalLoadingState } from "@/lib/loading-manager"

/**
 * Presentational branded splash content — logo, pulse rings and status
 * line. Used by <BootSplash /> and the root route loading.tsx so the
 * whole app shows ONE consistent brand loader.
 */
export function BrandedSplashContent() {
  return (
    <>
      {/* Soft brand glow behind the logo */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl opacity-25"
        style={{ background: "var(--primary)" }}
      />

      {/* Logo + pulse rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0">
          <span className="alara-splash-ring alara-splash-ring--1" />
          <span className="alara-splash-ring alara-splash-ring--2" />
          <span className="alara-splash-ring alara-splash-ring--3" />
        </div>
        <div className="relative z-10 flex h-28 w-auto items-center justify-center">
          <Image
            src="/images/Alara_logo.png"
            alt="Alara"
            width={240}
            height={52}
            priority
            className="h-12 w-auto object-contain dark:hidden"
          />
          <Image
            src="/images/Alara-logo-no-bg.png"
            alt="Alara"
            width={240}
            height={52}
            priority
            className="hidden h-12 w-auto object-contain dark:block"
          />
        </div>
      </div>

      {/* Status line */}
      <p className="mt-10 flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <span className="alara-dots text-primary">
          <span />
          <span />
          <span />
        </span>
        Preparing your dashboard
      </p>
    </>
  )
}

/**
 * Branded full-screen splash shown ONLY while the session is booting
 * (auth token validation on first load / hard refresh).
 *
 * This is intentionally NOT shown for in-app data fetches or route
 * navigation — those use the slim top progress bar and in-place
 * skeletons so the user stays on their destination page.
 *
 * Fade-out is animated so the transition into the app feels polished.
 */
export function BootSplash() {
  const { holds } = useGlobalLoadingState()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  const booting = holds > 0

  useEffect(() => {
    if (booting) {
      setFading(false)
      setVisible(true)
      return
    }
    // Stop holding → fade out, then unmount after the transition.
    if (visible) {
      setFading(true)
      const timer = setTimeout(() => setVisible(false), 450)
      return () => clearTimeout(timer)
    }
  }, [booting, visible])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background transition-opacity duration-450 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading Alara"
    >
      <BrandedSplashContent />
    </div>
  )
}
