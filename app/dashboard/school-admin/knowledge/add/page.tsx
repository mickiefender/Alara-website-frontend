"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImagePlus, Save } from "lucide-react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createSlug, DEFAULT_KNOWLEDGE_ARTICLES, DEFAULT_KNOWLEDGE_CATEGORIES, KnowledgeArticle, KnowledgeCategory, KNOWLEDGE_ARTICLES_KEY, KNOWLEDGE_CATEGORIES_KEY, readKnowledge, writeKnowledge } from "@/lib/knowledge-base"

export default function AddKnowledgePage() {
  return <ProtectedRoute allowedRoles={["school_admin"]}><AddKnowledgeContent /></ProtectedRoute>
}

function AddKnowledgeContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const editingId = params.get("id")

  useEffect(() => {
    const loadedCategories = readKnowledge(KNOWLEDGE_CATEGORIES_KEY, DEFAULT_KNOWLEDGE_CATEGORIES)
    const loadedArticles = readKnowledge(KNOWLEDGE_ARTICLES_KEY, DEFAULT_KNOWLEDGE_ARTICLES)
    setCategories(loadedCategories)
    setArticles(loadedArticles)
    const article = loadedArticles.find((item) => item.id === editingId)
    if (article) {
      setTitle(article.title); setSlug(article.slug); setDescription(article.description); setContent(article.content)
      setTags(article.tags.join(", ")); setCategoryIds(article.categoryIds); setStatus(article.status === "inactive" ? "inactive" : "active")
      setThumbnailUrl(article.thumbnailUrl || ""); setMetaTitle(article.metaTitle); setMetaDescription(article.metaDescription)
    }
  }, [editingId])

  const generatedSlug = useMemo(() => createSlug(title), [title])
  const toggleCategory = (id: string) => setCategoryIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !content.trim() || !categoryIds.length) {
      toast({ title: "Required fields missing", description: "Add a title, content, and at least one category.", variant: "destructive" })
      return
    }
    const now = new Date().toISOString()
    const article: KnowledgeArticle = {
      id: editingId || crypto.randomUUID(), title: title.trim(), slug: slug.trim() || generatedSlug, description: description.trim(),
      content: content.trim(), categoryIds, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), thumbnailUrl: thumbnailUrl.trim() || undefined,
      metaTitle: metaTitle.trim() || title.trim(), metaDescription: metaDescription.trim() || description.trim(), status,
      createdAt: articles.find((item) => item.id === editingId)?.createdAt || now, updatedAt: now,
    }
    const next = editingId ? articles.map((item) => item.id === editingId ? article : item) : [article, ...articles]
    writeKnowledge(KNOWLEDGE_ARTICLES_KEY, next)
    toast({ title: editingId ? "Knowledge updated" : "Knowledge published", description: `"${article.title}" was saved.` })
    router.push("/dashboard/school-admin/knowledge")
  }

  return (
    <div className="space-y-6 bg-muted/20 p-4 md:p-6 lg:p-8">
      <div><h1 className="text-3xl font-bold tracking-tight">{editingId ? "Edit Knowledge" : "Add Knowledge"}</h1><p className="mt-1 text-muted-foreground">Create a clear, searchable article for your knowledge base.</p></div>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Knowledge Details</CardTitle></CardHeader><CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="knowledge-title">Title <span className="text-destructive">*</span></Label><Input id="knowledge-title" placeholder="Enter title" value={title} onChange={(event) => { setTitle(event.target.value); if (!slug) setSlug(createSlug(event.target.value)) }} /></div>
            <div className="space-y-2"><Label htmlFor="knowledge-slug">Slug <span className="text-destructive">*</span></Label><div className="flex"><span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">/knowledge/</span><Input id="knowledge-slug" className="rounded-l-none" placeholder={generatedSlug} value={slug} onChange={(event) => setSlug(createSlug(event.target.value))} /></div></div>
            <div className="space-y-2"><Label htmlFor="knowledge-description">Description</Label><Textarea id="knowledge-description" placeholder="Enter knowledge description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="knowledge-content">Content <span className="text-destructive">*</span></Label><Textarea id="knowledge-content" placeholder="Write the knowledge content..." rows={14} value={content} onChange={(event) => setContent(event.target.value)} /></div>
            <div className="space-y-2"><Label>Thumbnail</Label><div className="flex items-center gap-4"><div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground"><ImagePlus className="h-6 w-6" /></div><Input placeholder="Optional image URL" value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} /></div></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Search Engine Optimization (SEO)</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="meta-title">Meta Title</Label><Input id="meta-title" placeholder="Enter meta title" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="meta-description">Meta Description</Label><Textarea id="meta-description" placeholder="Enter meta description" rows={4} value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} /></div></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Publish</CardTitle></CardHeader><CardContent><Button className="w-full" type="submit"><Save className="mr-2 h-4 w-4" />{editingId ? "Save Changes" : "Save and Publish"}</Button></CardContent></Card>
          <Card><CardHeader><CardTitle>Additional Info</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-3"><Label>Categories <span className="text-destructive">*</span></Label><div className="space-y-3 rounded-md border p-3">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 text-sm"><Checkbox checked={categoryIds.includes(category.id)} onCheckedChange={() => toggleCategory(category.id)} />{category.name}</label>)}</div><p className="text-xs text-muted-foreground">Create more categories from the Categories page.</p></div><div className="space-y-2"><Label htmlFor="tags">Tags</Label><Input id="tags" placeholder="students, attendance" value={tags} onChange={(event) => setTags(event.target.value)} /><p className="text-xs text-muted-foreground">Separate tags with commas.</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Knowledge Status</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1"><Button type="button" variant={status === "active" ? "secondary" : "ghost"} onClick={() => setStatus("active")}>Active</Button><Button type="button" variant={status === "inactive" ? "secondary" : "ghost"} onClick={() => setStatus("inactive")}>Inactive</Button></div></CardContent></Card>
        </div>
      </form>
    </div>
  )
}

