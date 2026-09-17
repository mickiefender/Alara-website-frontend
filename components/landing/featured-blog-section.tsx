"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { platformAPI, resolveImageUrl } from "@/lib/api"

type BlogPost = {
  id: number
  title: string
  excerpt: string
  category: string
  date: string
  image: string
  featured?: boolean
}

export function FeaturedBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    platformAPI.publicBlogPosts()
      .then((response) => {
        const items = response.data?.posts
        if (Array.isArray(items)) {
          setPosts(items.filter((post: BlogPost) => post.featured).slice(0, 3))
        }
      })
      .catch((error) => console.error("Failed to load featured blog posts", error))
  }, [])

  if (!posts.length) return null

  return (
    <section className="bg-background px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">From the Alara journal</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Stay updated with Alara</h2>
          </div>
          <div className="md:justify-self-end md:max-w-md">
            <p className="text-base leading-7 text-muted-foreground">
              Practical tips, stories, and announcements for school leaders and educators building better learning communities.
            </p>
            <Link href="/blog" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md sm:max-w-none">
              <Link href="/blog" className="block">
                <div className="aspect-[2/1] overflow-hidden bg-muted">
                  {post.image ? (
                    <img src={resolveImageUrl(post.image)} alt="" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-primary/15" />
                  )}
                </div>
                <div className="p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                  <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-foreground">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{post.date}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">Read more <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
