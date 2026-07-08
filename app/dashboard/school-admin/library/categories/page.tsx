"use client"

import { useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit2, Trash2, FolderOpen, BookOpen } from "lucide-react"
import { DUMMY_BOOKS, DUMMY_CATEGORIES, type Category } from "@/lib/dummy-library-data"

export default function LibraryCategoriesPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <LibraryCategoriesContent />
    </ProtectedRoute>
  )
}

function LibraryCategoriesContent() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>(DUMMY_CATEGORIES)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  const bookCountByCategory = useMemo(() => {
    const counts = new Map<string, number>()
    for (const book of DUMMY_BOOKS) {
      counts.set(book.category, (counts.get(book.category) || 0) + 1)
    }
    return counts
  }, [])

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
    setIsOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description })
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: "Name required", description: "Please enter a category name.", variant: "destructive" })
      return
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, name: formData.name, description: formData.description } : c)),
      )
      toast({ title: "Category updated", description: `"${formData.name}" was updated.` })
    } else {
      const newCategory: Category = {
        id: Math.max(0, ...categories.map((c) => c.id)) + 1,
        name: formData.name,
        description: formData.description,
      }
      setCategories((prev) => [...prev, newCategory])
      toast({ title: "Category created", description: `"${formData.name}" was added to the library.` })
    }

    setIsOpen(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
  }

  const handleDelete = (category: Category) => {
    setCategories((prev) => prev.filter((c) => c.id !== category.id))
    toast({ title: "Category deleted", description: `"${category.name}" was removed.` })
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Library Categories</h1>
          <p className="text-muted-foreground text-lg mt-2">Organize your book catalog into categories</p>
        </div>
        <Button onClick={openCreateDialog} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>{categories.length} categor{categories.length === 1 ? "y" : "ies"} in your library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground">Try a different search, or add a new category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="border hover:border-primary/40 hover:shadow-md transition">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      {bookCountByCategory.get(category.name) || 0} book{(bookCountByCategory.get(category.name) || 0) === 1 ? "" : "s"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mathematics"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe this category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingCategory ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
