"use client"

import { useState } from "react"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3">
          <span className="text-base">{page.label}</span>
          <a
            href={page.path}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            {page.path}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hero?.url ? (
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
            <img src={resolveImageUrl(hero.url)} alt="" className="h-40 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-3 py-2">
              <p className="text-[11px] font-medium text-white">
                Published{updatedAt ? ` · ${updatedAt}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
            <div className="text-center">
              <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Default banner in use</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{page.description}</p>

        <form onSubmit={uploadHero} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={inputId}>{hero?.url ? "Replace image" : "Upload image"}</Label>
            <Input
              id={inputId}
              type="file"
              accept={PAGE_HERO_ACCEPTED_TYPES}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              <Upload className="mr-2 h-4 w-4" />
              {hero?.url ? "Replace hero" : "Upload hero"}
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
        </form>

        <p className="text-[11px] text-muted-foreground">
          JPEG, PNG, or WebP up to 8 MB. Landscape images around 1920×1080 work best.
        </p>
        {message && <p className="rounded-md bg-muted p-2 text-xs">{message}</p>}
      </CardContent>
    </Card>
  )
}
