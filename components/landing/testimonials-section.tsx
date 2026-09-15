"use client"

import Image from "next/image"
import { Star } from "lucide-react"

// ─── Data ────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    id: 0,
    type: "rating-tags",
    quote: "Highly satisfied with my experience, thank you!",
    author: "Godwin Sarfo",
    rating: 5,
    tags: ["Responsive design", "Secured", "Faster"],
    image: "/testimonial-img/GodwinSarfo.JPG",
  },
  {
    id: 1,
    type: "standard",
    quote:
      "I absolutely love the platform. It's not only stylish but also very functional.",
    author: "Sonia & Nick",
    role: "2 days ago",
    image: "/testimonial-img/nico-black&yellow.JPG",
  },
  {
    id: 3,
    type: "featured",
    quote: "Prompt and helpful responses to my inquiry!",
    subtext: "Superb quality, impressed",
    author: "Mrs. Ama Mensah",
    role: "Headmistress, Accra International School",
    image: "/testimonial-img/mistress.png",
  },
]

// ─── Sizes ───────────────────────────────────────────────────────────────────
const BASE_SIZES: Record<number, { w: string; h: number }> = {
  0: { w: "col-span-1", h: 240 },
  1: { w: "col-span-1", h: 220 },
  3: { w: "col-span-1", h: 260 },
}

// ─── Avatar (🔥 Updated) ─────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string
  name?: string
  size?: "sm" | "md" | "lg"
}) {
  const sz =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9"

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?"

  return (
    <div
      className={`${sz} relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-red-200 bg-red-50 shadow-sm dark:border-red-900/60 dark:bg-red-950/40`}
    >
      {src ? (
        <Image src={src} alt={name || "User"} fill className="object-cover" />
      ) : (
        <span className="text-xs font-bold text-red-700 dark:text-red-200">{initials}</span>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Stars({ count = 5, label }: { count?: number; label?: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-red-600 text-red-600" />
      ))}
      {label && <span className="ml-1 text-xs text-gray-500 dark:text-gray-300">{label}</span>}
    </div>
  )
}

// ─── Cards ───────────────────────────────────────────────────────────────────
function RatingTagsCard({ t }: any) {
  return (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        <Stars />
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          {t.quote}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {t.tags?.map((tag: string) => (
            <span key={tag} className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-200">
              {tag}
            </span>
          ))}
        </div>

        {/* Avatar added */}
        <div className="flex items-center gap-2 mt-3">
          <Avatar src={t.image} name={t.author} />
          <span className="text-xs text-gray-500 dark:text-gray-300">{t.author}</span>
        </div>
      </div>
    </div>
  )
}

function StandardCard({ t }: any) {
  return (
    <div className="p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Avatar src={t.image} name={t.author} />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.author}</p>
            <p className="text-xs text-gray-500 dark:text-gray-300">{t.role}</p>
          </div>
        </div>
        <Stars label={t.ratingLabel} />
      </div>
      <p className="mt-2 text-sm text-gray-900 dark:text-white">
        {t.quote}
      </p>
    </div>
  )
}

function FeaturedCard({ t }: any) {
  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Avatar size="lg" src={t.image} name={t.author} />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{t.author}</p>
            <p className="text-xs text-gray-500 dark:text-gray-300">{t.role}</p>
          </div>
        </div>
        <Stars />
      </div>
      <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
        {t.quote}
      </p>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        {testimonials.map((t) => {
          const base = BASE_SIZES[t.id]

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-red-100 bg-white p-2 text-gray-900 shadow-sm dark:border-red-900/50 dark:bg-card dark:text-white"
              style={{
                minHeight: base.h,
              }}
            >
              {t.type === "rating-tags" && <RatingTagsCard t={t} />}
              {t.type === "standard" && <StandardCard t={t} />}
              {t.type === "featured" && <FeaturedCard t={t} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}