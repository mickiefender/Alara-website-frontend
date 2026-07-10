"use client"

import { useEffect, useState, useRef } from "react"
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

const DOMINANT_SCALE = 1.06
const SHRUNK_SCALE = 0.85
const CYCLE_MS = 2800

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
      className={`${sz} relative rounded-full overflow-hidden border border-[#008484]/40 shadow-md bg-[#008484]/10 flex items-center justify-center flex-shrink-0`}
    >
      {src ? (
        <Image src={src} alt={name || "User"} fill className="object-cover" />
      ) : (
        <span className="text-xs font-bold text-[#008484]">{initials}</span>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Stars({ count = 5, label }: { count?: number; label?: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-[#008484] text-[#008484]" />
      ))}
      {label && <span className="text-xs text-gray-500 ml-1">{label}</span>}
    </div>
  )
}

// ─── Cards ───────────────────────────────────────────────────────────────────
function RatingTagsCard({ t, dominant }: any) {
  return (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        <Stars />
        <p className={`mt-2 font-semibold ${dominant ? "text-lg" : "text-sm"}`}>
          {t.quote}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {t.tags?.map((tag: string) => (
            <span key={tag} className="text-xs bg-[#008484]/20 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Avatar added */}
        <div className="flex items-center gap-2 mt-3">
          <Avatar src={t.image} name={t.author} />
          <span className="text-xs text-gray-500">{t.author}</span>
        </div>
      </div>
    </div>
  )
}

function StandardCard({ t, dominant }: any) {
  return (
    <div className="p-4 flex flex-col justify-between h-full">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Avatar src={t.image} name={t.author} />
          <div>
            <p className="text-sm font-semibold">{t.author}</p>
            <p className="text-xs text-gray-500">{t.role}</p>
          </div>
        </div>
        <Stars label={t.ratingLabel} />
      </div>
      <p className={`mt-2 ${dominant ? "text-sm" : "text-xs"}`}>
        {t.quote}
      </p>
    </div>
  )
}

function FeaturedCard({ t, dominant }: any) {
  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Avatar size="lg" src={t.image} name={t.author} />
          <div>
            <p className="font-semibold">{t.author}</p>
            <p className="text-xs text-gray-500">{t.role}</p>
          </div>
        </div>
        <Stars />
      </div>
      <p className={`mt-3 font-bold ${dominant ? "text-2xl" : "text-lg"}`}>
        {t.quote}
      </p>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const [dominantId, setDominantId] = useState(3)
  const orderRef = useRef<number[]>([])

  useEffect(() => {
    const ids = testimonials.map((t) => t.id)
    orderRef.current = [...ids].sort(() => Math.random() - 0.5)

    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % orderRef.current.length
      setDominantId(orderRef.current[idx])
    }, CYCLE_MS)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="testimonials" className="py-16 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {testimonials.map((t) => {
          const isDominant = t.id === dominantId
          const base = BASE_SIZES[t.id]

          return (
            <div
              key={t.id}
              className="rounded-2xl border p-2 transition-all duration-700"
              style={{
                minHeight: isDominant ? base.h : base.h * 0.4,
                transform: `scale(${isDominant ? 1.05 : 0.85})`,
              }}
            >
              {t.type === "rating-tags" && <RatingTagsCard t={t} dominant={isDominant} />}
              {t.type === "standard" && <StandardCard t={t} dominant={isDominant} />}
              {t.type === "featured" && <FeaturedCard t={t} dominant={isDominant} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}