"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock3, Search, Tag, User } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { platformAPI, resolveImageUrl } from "@/lib/api"

type BlogPost = {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  date: string
  readTime: string
  tags: string[]
  image: string
  featured?: boolean
}

const fallbackPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Future of School Administration",
    excerpt: "Explore practical ways technology is reshaping how schools operate, communicate, and support every learner.",
    content: "Schools are building stronger communities when their teams have the right information at the right time. From attendance to family communication, simple connected workflows give educators more time to focus on what matters most.",
    category: "Education Technology",
    author: "Alara Team",
    date: "25 Jan, 2026",
    readTime: "5 min read",
    tags: ["Innovation", "School Leadership", "Digital Learning"],
    image: "/images/dashboard-card-3.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Data Privacy in Education: What Schools Need to Know",
    excerpt: "A practical guide to protecting student information and building trust with families.",
    content: "Responsible data practices are a foundation for modern schools. Clear access controls and thoughtful policies help every member of the school community use technology with confidence.",
    category: "Safety & Security",
    author: "Alara Team",
    date: "18 Jan, 2026",
    readTime: "6 min read",
    tags: ["Safety", "Data Privacy"],
    image: "/images/Hero-quality.png",
  },
  {
    id: 3,
    title: "Building Inclusive Classrooms with Technology",
    excerpt: "How schools can use thoughtful digital tools to make learning more accessible.",
    content: "Technology works best when it serves the needs of every learner. Inclusive tools, clear communication, and teacher-led decisions create better outcomes.",
    category: "Best Practices",
    author: "Alara Team",
    date: "12 Jan, 2026",
    readTime: "4 min read",
    tags: ["Inclusion", "Teaching"],
    image: "/images/teacher-dashoard1.png",
  },
]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    platformAPI.publicBlogPosts()
      .then((response) => {
        const published = response.data?.posts
        if (Array.isArray(published) && published.length) setPosts(published)
      })
      .catch(() => {
        // Keep the editorial fallback visible if the public content service is unavailable.
      })
  }, [])

  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((post) => post.category)))], [posts])
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const query = searchTerm.trim().toLowerCase()
    return matchesCategory && (!query || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query))
  })
  const featured = filteredPosts.find((post) => post.featured) || filteredPosts[0]
  const recent = filteredPosts.filter((post) => post.id !== featured?.id).slice(0, 5)
  const tags = Array.from(new Set(filteredPosts.flatMap((post) => post.tags || []))).slice(0, 10)

  return (
    <>
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-muted/40 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Alara journal</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">Ideas for better schools</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Practical insights, stories, and resources for school leaders, educators, and growing learning communities.</p>
          </div>
        </section>

        <section className="px-4 py-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input aria-label="Search blog posts" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search articles..." className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((category) => (
                    <button key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{category}</button>
                  ))}
                </div>
              </div>

              {featured ? (
                <article>
                  <div className="overflow-hidden rounded-xl border border-border bg-muted">
                    {featured.image ? <img src={resolveImageUrl(featured.image)} alt="" className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] bg-primary/20" />}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{featured.category}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{featured.date}</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{featured.readTime}</span>
                  </div>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{featured.title}</h2>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{featured.excerpt}</p>
                  <div className="mt-7 border-t border-border pt-6 text-sm leading-7 text-muted-foreground">
                    {featured.content.split(/\n+/).map((paragraph, index) => <p key={index} className="mb-4 last:mb-0">{paragraph}</p>)}
                  </div>
                </article>
              ) : (
                <p className="py-16 text-center text-muted-foreground">No articles found.</p>
              )}

              {recent.length > 0 && (
                <div className="mt-14 border-t border-border pt-10">
                  <h2 className="mb-6 text-2xl font-bold text-foreground">More from the journal</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {recent.map((post) => (
                      <article key={post.id} className="overflow-hidden rounded-lg border border-border bg-card">
                        {post.image && <img src={resolveImageUrl(post.image)} alt="" className="aspect-[16/9] w-full object-cover" />}
                        <div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p><h3 className="mt-2 text-lg font-bold text-foreground">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p><p className="mt-4 text-xs text-muted-foreground">{post.date} · {post.readTime}</p></div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-9 lg:border-l lg:border-border lg:pl-7">
              <div><h2 className="border-b border-border pb-3 text-sm font-semibold text-foreground">Categories</h2><div className="mt-3 space-y-2">{categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={`block w-full text-left text-sm ${selectedCategory === category ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}>{category}</button>)}</div></div>
              <div><h2 className="border-b border-border pb-3 text-sm font-semibold text-foreground">Recent Posts</h2><div className="mt-3 space-y-4">{posts.slice(0, 5).map((post) => <div key={post.id} className="flex gap-3"><div className="h-14 w-16 shrink-0 overflow-hidden rounded bg-muted">{post.image && <img src={resolveImageUrl(post.image)} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><p className="line-clamp-2 text-xs font-medium text-foreground">{post.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{post.date}</p></div></div>)}</div></div>
              <div><h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold text-foreground"><Tag className="h-4 w-4" />Tags</h2><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">{tag}</span>)}</div></div>
              <div className="rounded-lg bg-primary/5 p-5"><User className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold text-foreground">Stay in the loop</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Get thoughtful school-management insights from Alara.</p></div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
