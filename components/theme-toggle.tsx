"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative p-2 rounded-lg transition-all duration-300 ease-in-out
        bg-accent text-primary hover:bg-primary/15
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun Icon - visible in dark mode */}
      <Sun 
        className={`
          h-5 w-5 absolute inset-2 transition-all duration-300
          ${isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}
        `} 
      />
      {/* Moon Icon - visible in light mode */}
      <Moon 
        className={`
          h-5 w-5 transition-all duration-300
          ${isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}
        `} 
      />
    </button>
  )
}

