"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface AlaraLogoProps {
  width: number
  height: number
  className?: string
  priority?: boolean
  /** Force a specific variant instead of following the app theme — use this when the
   * logo sits on a surface with a fixed background (e.g. an always-dark footer) rather
   * than one that flips with light/dark mode. */
  forceVariant?: "light" | "dark"
}

export function AlaraLogo({ width, height, className, priority, forceVariant }: AlaraLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to the white-background logo until the theme is known, to avoid a flash of the wrong variant.
  const isDark = forceVariant ? forceVariant === "dark" : mounted && resolvedTheme === "dark"
  const src = isDark ? "/images/Alara-logo-no-bg.png" : "/images/Alara_logo.png"

  return (
    <Image
      src={src}
      alt="Alara Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
