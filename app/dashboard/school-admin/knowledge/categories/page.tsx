"use client"

import { useEffect, useState } from "react"
import { GripVertical, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createSlug, DEFAULT_KNOWLEDGE_CATEGORIES, KnowledgeCategory, KNOWLEDGE_CATEGORIES_KEY, readKnowledge, writeKnowledge } from "@/lib/knowledge-base"

export default function KnowledgeCategoriesPage() {
  return <ProtectedRoute allowedRoles={["school_admin"]}><KnowledgeCategoriesContent /></ProtectedRoute>
}

function KnowledgeCategoriesContent() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => setCategories(readKnowledge(KNOWLEDGE_CATEGORIES_KEY, DEFAULT_KNOWLEDGE_CATEGORIES)), [])
  const reset = () => { setEditingId(null); setName(""); setSlug(""); setDescription(""); setParentId(""); setImageUrl("") }
  const edit = (category: KnowledgeCategory) => { setEditingId(category.id); setName(category.name); setSlug(category.slug); setDescription(category.description); setParentId(category.parentId || "") }
  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) { toast({ title: "Name required", description: "Enter a category name.", variant: "destructive" }); return }
    const category: KnowledgeCategory = { id: editingId || crypto.randomUUID(), name: name.trim(), slug: slug.trim() || createSlug(name), description: description.trim(), parentId: parentId || undefined, status: "active", createdAt: new Date().toISOString() }
    const next = editingId ? categories.map((item) => item.id === editingId ? { ...item, ...category, createdAt: item.createdAt } : item) : [...categories, category]
    setCategories(next); writeKnowledge(KNOWLEDGE_CATEGORIES_KEY, next); toast({ title: editingId ? "Category updated" : "Category created", description: `"${category.name}" was saved.` }); reset()
  }
  const remove = (id: string) => { const next = categories.filter((item) => item.id !== id); setCategories(next); writeKnowledge(KNOWLEDGE_CATEGORIES_KEY, next) }

  return <div className="grid gap-6 bg-muted/20 p-4 md:p-6 lg:grid-cols-[minmax(280px,420px)_1fr] lg:p-8">
    <Card className="h-fit"><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent className="space-y-2">{categories.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="flex-1">{category.name}</span><Button variant="ghost" size="icon" onClick={() => edit(category)} aria-label={`Edit ${category.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => remove(category.id)} aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}{!categories.length && <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle>{editingId ? "Edit Category" : "Add Category (en)"}</CardTitle></CardHeader><CardContent><form onSubmit={save} className="space-y-5"><div className="space-y-2"><Label htmlFor="category-name">Name <span className="text-destructive">*</span></Label><Input id="category-name" placeholder="Enter name" value={name} onChange={(event) => { setName(event.target.value); if (!slug) setSlug(createSlug(event.target.value)) }} /></div><div className="space-y-2"><Label htmlFor="category-slug">Slug <span className="text-destructive">*</span></Label><div className="flex"><span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">/category/</span><Input id="category-slug" className="rounded-l-none" placeholder="category-slug" value={slug} onChange={(event) => setSlug(createSlug(event.target.value))} /></div></div><div className="space-y-2"><Label htmlFor="category-description">Description</Label><Textarea id="category-description" placeholder="Enter description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="category-parent">Parent</Label><select id="category-parent" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">No parent</option>{categories.filter((category) => category.id !== editingId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="space-y-2"><Label>Image</Label><div className="flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed text-muted-foreground"><ImagePlus className="h-6 w-6" /></div><Input placeholder="Optional image URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /></div></div><div className="space-y-2"><Label htmlFor="category-meta-title">Meta Title</Label><Input id="category-meta-title" placeholder="Enter meta title" /></div><div className="space-y-2"><Label htmlFor="category-meta-description">Meta Description</Label><Textarea id="category-meta-description" placeholder="Enter meta description" rows={3} /></div><div className="flex items-center justify-between border-t pt-4"><Label htmlFor="category-status">Status</Label><Switch id="category-status" defaultChecked /></div><div className="flex gap-3"><Button type="submit"><Plus className="mr-2 h-4 w-4" />{editingId ? "Update Category" : "Save Category"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div></form></CardContent></Card>
  </div>
}

