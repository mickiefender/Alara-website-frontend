"use client"

import { useEffect, useState } from "react"
import Loader from "@/components/ui/loader-11"

const MIN_DISPLAY_MS = 500

export function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const start = Date.now()

    const hide = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0)
      window.setTimeout(() => setVisible(false), remaining)
    }

    if (document.readyState === "complete") {
      hide()
      return
    }

    window.addEventListener("load", hide)
    return () => window.removeEventListener("load", hide)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <Loader />
    </div>
  )
}
