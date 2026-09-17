"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  if (loading) return <div className="p-6 text-muted-foreground">Loading page hero images...</div>

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Page Hero Images"
        description="Upload the banner image shown at the top of the About, Careers, Join the Team, Contact, and Support pages."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How hero images work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Uploaded images are published immediately on the public site. Each page keeps its original heading and
            subtitle, which are drawn over the image with a dark scrim so the text stays readable.
          </p>
          <p>
            Until an image is uploaded for a page, that page keeps its built-in gradient banner — nothing breaks if an
            image is missing.
          </p>
        </CardContent>
      </Card>

      {message && <p className="rounded-lg bg-muted p-3 text-sm">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
    </div>
  )
}
