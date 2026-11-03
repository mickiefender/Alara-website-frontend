"use client"

import { useState } from "react"
import { ExternalLink, ImagePlus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { getErrorMessage, platformAPI, resolveImageUrl } from "@/lib/api"
import {
  PAGE_HERO_ACCEPTED_TYPES,
  PAGE_HERO_MAX_BYTES,
  type PageHeroEntry,
  type PageHeroKey,
  type PageHeroPage,
} from "@/lib/page-heroes"

type PageHeroCardProps = {
  page: PageHeroPage
  hero?: PageHeroEntry
  onUploaded: (pageKey: PageHeroKey, entry: PageHeroEntry) => void
  onRemoved: (pageKey: PageHeroKey) => void
}

function formatUpdatedAt(value?: string) {
  if (!value) return ""
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString()
}

export function PageHeroCard({ page, hero, onUploaded, onRemoved }: PageHeroCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const inputId = `page-hero-file-${page.key}`

  async function uploadHero(event: React.FormEvent) {
    event.preventDefault()
    if (!file) {
      setMessage("Choose an image file to upload first.")
      return
    }
    if (file.size > PAGE_HERO_MAX_BYTES) {
      setMessage("Hero images must be 8 MB or smaller.")
      return
    }

    setBusy(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("page", page.key)
      formData.append("image", file)
      const response = await platformAPI.uploadPageHero(formData)
      onUploaded(page.key, response.data as PageHeroEntry)
      setFile(null)
      const input = document.getElementById(inputId) as HTMLInputElement | null
      if (input) input.value = ""
      setMessage(`${page.label} hero image saved and live.`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function removeHero() {
    if (!window.confirm(`Remove the ${page.label} hero image? The page will use its default banner.`)) return
    setBusy(true)
    setMessage("")
    try {
      await platformAPI.deletePageHero(page.key)
      onRemoved(page.key)
      setMessage(`${page.label} hero image removed.`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const updatedAt = formatUpdatedAt(hero?.updated_at)

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)_minmax(250px,0.9fr)] md:items-center md:gap-5 md:p-5">
        {hero?.url ? (
          <div className="relative h-36 overflow-hidden rounded-lg border border-border bg-muted">
            <img src={resolveImageUrl(hero.url)} alt={`${page.label} hero preview`} className="h-full w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
              Published
            </span>
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
            <div className="text-center">
              <ImagePlus className="mx-auto h-7 w-7 text-muted-foreground/70" />
              <p className="mt-2 text-xs font-medium text-muted-foreground">Default banner in use</p>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">{page.label}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              hero?.url ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"
            }`}>
              {hero?.url ? "Custom image" : "Using default"}
            </span>
          </div>
          <a
            href={page.path}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {page.path}
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{page.description}</p>
          {updatedAt && <p className="mt-3 text-xs text-muted-foreground">Last published {updatedAt}</p>}
        </div>

        <form onSubmit={uploadHero} className="min-w-0 space-y-3 rounded-lg bg-muted/30 p-3 md:bg-transparent md:p-0">
          <div className="space-y-1.5">
            <Label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground">
              {hero?.url ? "Replace hero image" : "Add a hero image"}
            </Label>
            <Input
              id={inputId}
              type="file"
              accept={PAGE_HERO_ACCEPTED_TYPES}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="bg-background text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={busy || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {busy ? "Saving..." : hero?.url ? "Replace image" : "Upload image"}
            </Button>
            {hero?.url && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={removeHero}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">
            JPEG, PNG, or WebP · Max 8 MB · 1920×1080 recommended
          </p>
          {message && (
            <p role="status" className={`rounded-md p-2 text-xs ${
              message.includes("saved") || message.includes("removed")
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-destructive/10 text-destructive"
            }`}>
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
