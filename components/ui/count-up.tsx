"use client"

import { useEffect, useRef, useState } from "react"

interface CountUpProps {
  value: number
  duration?: number
  format?: (n: number) => string
}

/**
 * Animated number counter for KPI/stat values.
 * Eases from the previously displayed value to the new one,
 * and renders instantly when the user prefers reduced motion.
 */
export function CountUp({ value, duration = 1100, format }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      fromRef.current = value
    }
  }, [value, duration])

  return <>{format ? format(Math.round(display)) : Math.round(display).toLocaleString()}</>
}
