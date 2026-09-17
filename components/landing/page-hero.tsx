"use client"

import { resolveImageUrl } from "@/lib/api"
import { usePageHeroes } from "@/hooks/use-page-heroes"
import type { PageHeroKey } from "@/lib/page-heroes"

type PageHeroProps = {
  /** Public page this hero belongs to — the key the super admin uploads against. */
  pageKey: PageHeroKey
  title: string
  subtitle: string
  /** Extra content rendered under the subtitle, e.g. call-to-action buttons. */
  children?: React.ReactNode
  /** Section classes (padding/background) used when no image is published. */
  className?: string
  /** Heading classes used when no image is published. */
  titleClassName?: string
  /** Subtitle classes used when no image is published. */
  subtitleClassName?: string
  /** Extra classes for the centred text column in both variants. */
  contentClassName?: string
}

const DEFAULT_SECTION_CLASS = "py-20 md:py-40"
const DEFAULT_TITLE_CLASS = "mb-6 text-balance text-4xl font-bold text-foreground md:text-6xl"
const DEFAULT_SUBTITLE_CLASS = "mx-auto max-w-2xl text-xl text-muted-foreground"
const IMAGE_TITLE_CLASS =
  "mb-6 text-balance text-4xl font-bold text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] md:text-6xl"
const IMAGE_SUBTITLE_CLASS =
  "mx-auto max-w-2xl text-xl text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)]"

/**
 * Hero banner for a public marketing page.
 *
 * Renders the image the super admin uploaded for `pageKey`, falling back to the
 * built-in gradient banner (with the page's own typography) until one exists —
 * so the page never looks broken if the image is missing or the request fails.
 */
export function PageHero({
  pageKey,
  title,
  subtitle,
  children,
  className = DEFAULT_SECTION_CLASS,
  titleClassName = DEFAULT_TITLE_CLASS,
  subtitleClassName = DEFAULT_SUBTITLE_CLASS,
  contentClassName = "",
}: PageHeroProps) {
  const { heroes } = usePageHeroes()
  const imageUrl = heroes[pageKey]?.url

  if (imageUrl) {
    return (
      <section className={`relative isolate overflow-hidden bg-slate-900 ${className}`}>
        <img
          src={resolveImageUrl(imageUrl)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/65" aria-hidden="true" />
        <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
          <div className="text-center">
            <h1 className={IMAGE_TITLE_CLASS}>{title}</h1>
            <p className={IMAGE_SUBTITLE_CLASS}>{subtitle}</p>
            {children}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`relative bg-gradient-to-b from-primary/10 to-transparent ${className}`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
        <div className="text-center">
          <h1 className={titleClassName}>{title}</h1>
          <p className={subtitleClassName}>{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  )
}
