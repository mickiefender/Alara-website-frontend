"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getErrorMessage } from "@/lib/api"

/**
 * Small data-fetching hook for Super Admin pages.
 * Handles loading/error state and exposes a stable `reload`.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const reload = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError("")
    try {
      const result = await fetcherRef.current()
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load data."))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled])

  useEffect(() => {
    if (enabled) reload()
  }, [reload, enabled])

  return { data, loading, error, reload, setData }
}
