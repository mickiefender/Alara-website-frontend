"use client"

import { useState } from "react"
import { BookOpen, ImagePlus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage, platformAPI, resolveImageUrl } from "@/lib/api"
import type { AnyObj } from "@/components/super-admin/types"
import { useFetch } from "@/components/super-admin/use-fetch"
import { PageHeader } from "@/components/super-admin/page-header"

export default function BlogManagementPage() {
  const posts = useFetch<AnyObj[]>(
    () => platformAPI.blogPosts().then((response) => response.data || []),
    [],
  )
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    readTime: "5 min read",
    tags: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [featured, setFeatured] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function createPost(event: React.FormEvent) {
    event.preventDefault()
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim() || !form.category.trim()) {
      setMessage("Enter a title, excerpt, content, and category.")
      return
    }
    if (image && (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 8 * 1024 * 1024)) {
      setMessage("Choose a JPEG, PNG, or WebP image up to 8 MB.")
      return
    }

    setBusy(true)
    setMessage("")
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value))
      data.append("featured", String(featured))
      if (image) data.append("image", image)
      await platformAPI.createBlogPost(data)
      setForm({ title: "", excerpt: "", content: "", category: "", author: "", readTime: "5 min read", tags: "" })
      setImage(null)
      setFeatured(false)
      const input = document.getElementById("blog-image") as HTMLInputElement | null
      if (input) input.value = ""
      await posts.reload()
      setMessage("Blog post published on the website.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function removePost(post: AnyObj) {
    if (!window.confirm(`Delete “${post.title}” from the website?`)) return
    setBusy(true)
    setMessage("")
    try {
      await platformAPI.deleteBlogPost(Number(post.id))
      await posts.reload()
      setMessage("Blog post deleted.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Blog Posts" description="Publish articles and manage the stories shown on the public blog." />
      {message && <p className="rounded-lg bg-muted p-3 text-sm">{message}</p>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Publish a blog post</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createPost} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label htmlFor="blog-title">Title</Label><Input id="blog-title" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="The future of school management" /></div>
              <div className="space-y-2"><Label htmlFor="blog-category">Category</Label><Input id="blog-category" value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Education Technology" /></div>
              <div className="space-y-2"><Label htmlFor="blog-author">Author</Label><Input id="blog-author" value={form.author} onChange={(event) => updateField("author", event.target.value)} placeholder="Alara Team" /></div>
              <div className="space-y-2"><Label htmlFor="blog-read-time">Read time</Label><Input id="blog-read-time" value={form.readTime} onChange={(event) => updateField("readTime", event.target.value)} placeholder="5 min read" /></div>
              <div className="space-y-2"><Label htmlFor="blog-tags">Tags</Label><Input id="blog-tags" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="Innovation, School Leadership" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="blog-excerpt">Excerpt</Label><Textarea id="blog-excerpt" value={form.excerpt} onChange={(event) => updateField("excerpt", event.target.value)} placeholder="A short summary shown beside the article image." rows={3} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="blog-content">Article content</Label><Textarea id="blog-content" value={form.content} onChange={(event) => updateField("content", event.target.value)} placeholder="Write the full article..." rows={9} /></div>
              <div className="space-y-2"><Label htmlFor="blog-image">Cover image</Label><Input id="blog-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /><p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 8 MB.</p></div>
              <label className="flex items-center gap-2 self-center text-sm"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Feature this post</label>
            </div>
            <Button type="submit" disabled={busy}><Plus className="mr-2 h-4 w-4" />Publish post</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Published posts ({posts.data?.length || 0})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {posts.loading && <p className="text-sm text-muted-foreground">Loading posts...</p>}
          {!posts.loading && !posts.data?.length && <p className="text-sm text-muted-foreground">No blog posts published yet.</p>}
          {posts.data?.map((post) => (
            <div key={post.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
              {post.image ? <img src={resolveImageUrl(post.image)} alt="" className="h-16 w-24 rounded object-cover" /> : <div className="flex h-16 w-24 items-center justify-center rounded bg-muted"><ImagePlus className="h-5 w-5 text-muted-foreground" /></div>}
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{post.title}</p><p className="text-xs text-muted-foreground">{post.category} · {post.date}</p></div>
              <Button variant="ghost" size="icon" disabled={busy} aria-label={`Delete ${post.title}`} onClick={() => removePost(post)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
