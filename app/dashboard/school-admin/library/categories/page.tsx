"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit2, Trash2, FolderOpen, BookOpen } from "lucide-react"
import { getErrorMessage, libraryAPI } from "@/lib/api"
import type { LibraryCategory } from "@/lib/library"

function records(data: unknown): LibraryCategory[] {
  if (Array.isArray(data)) return data as LibraryCategory[]
  if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) return data.results as LibraryCategory[]
  return []
}

export default function LibraryCategoriesPage() {
  return <ProtectedRoute allowedRoles={["school_admin"]}><LibraryCategoriesContent /></ProtectedRoute>
}

function LibraryCategoriesContent() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<LibraryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  async function loadCategories() {
    setError("")
    try {
      const response = await libraryAPI.categories()
      setCategories(records(response.data))
    } catch (err) {
      setError(getErrorMessage(err, "Could not load library categories."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
    const refreshTimer = window.setInterval(() => void loadCategories(), 30_000)
    return () => window.clearInterval(refreshTimer)
  }, [])

  const filteredCategories = useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query) || category.description.toLowerCase().includes(query),
    )
  }, [categories, searchTerm])

  function openDialog(category?: LibraryCategory) {
    setEditingCategory(category ?? null)
    setFormData(category ? { name: category.name, description: category.description } : { name: "", description: "" })
    setIsOpen(true)
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const payload = { name: formData.name.trim(), description: formData.description.trim() }
    try {
      if (editingCategory) await libraryAPI.updateCategory(editingCategory.id, payload)
      else await libraryAPI.createCategory(payload)
      setIsOpen(false)
      toast({ title: editingCategory ? "Category updated" : "Category created", description: `"${payload.name}" saved to your library.` })
      await loadCategories()
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the category."))
    } finally {
      setBusy(false)
    }
  }

  async function deleteCategory(category: LibraryCategory) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    setError("")
    try {
      await libraryAPI.deleteCategory(category.id)
      toast({ title: "Category deleted", description: `"${category.name}" was removed.` })
      await loadCategories()
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this category."))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Library Categories</h1><p className="mt-2 text-lg text-muted-foreground">Organize your school&apos;s book catalog</p></div>
        <Button onClick={() => openDialog()} size="lg"><Plus className="mr-2 h-5 w-5" />Add Category</Button>
      </div>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <Card>
        <CardHeader><CardTitle>Categories</CardTitle><CardDescription>{categories.length} categor{categories.length === 1 ? "y" : "ies"} in your library</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search categories..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-9" /></div>
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading categories…</p> : filteredCategories.length === 0 ? (
            <div className="py-12 text-center"><FolderOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground" /><h3 className="font-semibold">No categories found</h3><p className="mt-1 text-sm text-muted-foreground">{categories.length ? "Try a different search." : "Create categories to organize your books."}</p></div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredCategories.map((category) => (
              <Card key={category.id} className="border transition hover:border-primary/40 hover:shadow-md"><CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2"><FolderOpen className="h-5 w-5 text-primary" /><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => openDialog(category)}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => void deleteCategory(category)}><Trash2 className="h-4 w-4" /></Button></div></div>
                <div><h3 className="font-bold">{category.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description || "No description"}</p></div>
                <Badge variant="secondary" className="gap-1.5"><BookOpen className="h-3 w-3" />{category.book_count} book{category.book_count === 1 ? "" : "s"}</Badge>
              </CardContent></Card>
            ))}</div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle><DialogDescription>Changes are saved to your school&apos;s library.</DialogDescription></DialogHeader>
        <form onSubmit={saveCategory} className="space-y-4">
          <div><Label htmlFor="category-name">Category Name</Label><Input id="category-name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required /></div>
          <div><Label htmlFor="category-description">Description</Label><Textarea id="category-description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows={3} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : editingCategory ? "Save changes" : "Create category"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
    </div>
  )
}
