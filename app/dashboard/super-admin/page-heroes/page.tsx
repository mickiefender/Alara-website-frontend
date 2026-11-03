"use client"

import { useEffect, useState } from "react"
import { ImagePlus, Info } from "lucide-react"
import { PageHeader } from "@/components/super-admin/page-header"
import { PageHeroCard } from "@/components/super-admin/page-hero-card"
import { getErrorMessage, platformAPI } from "@/lib/api"
import {
  PAGE_HERO_PAGES,
  type PageHeroEntry,
  type PageHeroKey,
  type PageHeroMap,
} from "@/lib/page-heroes"

export default function PageHeroesPage() {
  const [heroes, setHeroes] = useState<PageHeroMap>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    platformAPI.pageHeroes()
      .then((response) => {
        const stored = response.data?.heroes
        setHeroes(stored && typeof stored === "object" ? (stored as PageHeroMap) : {})
      })
      .catch((error) => setMessage(getErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  function handleUploaded(pageKey: PageHeroKey, entry: PageHeroEntry) {
    setHeroes((current) => ({ ...current, [pageKey]: entry }))
  }

  function handleRemoved(pageKey: PageHeroKey) {
    setHeroes((current) => {
      const next = { ...current }
      delete next[pageKey]
      return next
    })
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Page Hero Images"
        description="Upload the banner image shown at the top of the About, Careers, Join the Team, Contact, and Support pages."
      />

      <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">About page hero images</p>
          <p className="text-muted-foreground">
            Images publish immediately. Page headings remain layered over the image with a dark overlay for
            readability. Pages without a custom image continue using their built-in banner.
          </p>
        </div>
      </div>

      {message && (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {message}
        </p>
      )}

      <section className="space-y-3" aria-label="Page hero images">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Managed pages</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading page banners..." : `${PAGE_HERO_PAGES.length} pages · ${Object.keys(heroes).length} custom images`}
            </p>
          </div>
          {!loading && (
            <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              <ImagePlus className="h-3.5 w-3.5" />
              Hero image library
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            {PAGE_HERO_PAGES.map((page) => (
              <div key={page.key} className="h-48 animate-pulse rounded-xl border border-border bg-muted/40 md:h-40" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {PAGE_HERO_PAGES.map((page) => (
              <PageHeroCard
                key={page.key}
                page={page}
                hero={heroes[page.key]}
                onUploaded={handleUploaded}
                onRemoved={handleRemoved}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
