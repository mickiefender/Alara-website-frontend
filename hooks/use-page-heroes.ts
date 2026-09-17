"use client"

import { useEffect, useState } from "react"
import { platformAPI } from "@/lib/api"
import type { PageHeroMap } from "@/lib/page-heroes"

let cachedHeroes: PageHeroMap | null = null
let inflightRequest: Promise<PageHeroMap> | null = null

function startHeroRequest(): Promise<PageHeroMap> {
  const request = platformAPI
    .publicPageHeroes()
    .then((response) => {
      const heroes = (response.data?.heroes ?? {}) as PageHeroMap
      cachedHeroes = heroes
      return heroes
    })
    .catch((error) => {
      // A missing or unreachable endpoint must never break a marketing page:
      // the hero component simply falls back to its built-in gradient.
      console.error("Failed to load page hero images", error)
      return {} as PageHeroMap
    })
    .finally(() => {
      inflightRequest = null
    })

  inflightRequest = request
  return request
}

/** Every public page load shares one request for the published hero images. */
export async function fetchPageHeroes(): Promise<PageHeroMap> {
  if (cachedHeroes) return cachedHeroes
  return inflightRequest ?? startHeroRequest()
}

/**
 * Hero images published by the super admin for the public marketing pages.
 *
 * Returns an empty map (and therefore each page's built-in gradient banner)
 * while loading and whenever the request fails.
 */
export function usePageHeroes() {
  const [heroes, setHeroes] = useState<PageHeroMap>(cachedHeroes ?? {})
  const [loading, setLoading] = useState(!cachedHeroes)

  useEffect(() => {
    if (cachedHeroes) return
    let active = true
    fetchPageHeroes()
      .then((result) => {
        if (!active) return
        setHeroes(result)
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { heroes, loading }
}
