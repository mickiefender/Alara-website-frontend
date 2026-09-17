/**
 * Public marketing pages that render an uploadable hero image.
 *
 * Keep the keys in sync with `PAGE_HERO_PAGES` in
 * backend/apps/platform/page_heroes.py.
 */
export const PAGE_HERO_KEYS = ["about", "careers", "join-team", "contact", "support"] as const

export type PageHeroKey = (typeof PAGE_HERO_KEYS)[number]

export type PageHeroEntry = {
  url: string
  updated_at?: string
}

export type PageHeroMap = Partial<Record<PageHeroKey, PageHeroEntry>>

export type PageHeroPage = {
  key: PageHeroKey
  label: string
  path: string
  description: string
}

/** Display order and copy for the super-admin management screen. */
export const PAGE_HERO_PAGES: PageHeroPage[] = [
  {
    key: "about",
    label: "About",
    path: "/about",
    description: "Hero image shown at the top of the About page.",
  },
  {
    key: "careers",
    label: "Careers",
    path: "/careers",
    description: "Hero image shown at the top of the Careers page.",
  },
  {
    key: "join-team",
    label: "Join the Team",
    path: "/join-team",
    description: "Hero image shown at the top of the Join the Team application page.",
  },
  {
    key: "contact",
    label: "Contact",
    path: "/contact",
    description: "Hero image shown at the top of the Contact page.",
  },
  {
    key: "support",
    label: "Support",
    path: "/support",
    description: "Hero image shown at the top of the Support page.",
  },
]

export const PAGE_HERO_ACCEPTED_TYPES = "image/jpeg,image/png,image/webp"
export const PAGE_HERO_MAX_BYTES = 8 * 1024 * 1024
