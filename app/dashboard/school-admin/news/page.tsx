"use client"


import { useEffect, useMemo, useState, useCallback } from "react"


import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { newsAPI } from "@/lib/api"
import { Search, Plus, Newspaper, ChevronLeft, ChevronRight, CalendarDays, ImagePlus, X, Trash2, Edit3 } from "lucide-react"


interface NewsItem {
  id: number
  title: string
  excerpt: string

  content?: string
  category: string
  audience: string
  banner_image_url: string | null
  is_published: boolean
  is_banner: boolean
  created_by_name: string | null
  published_at: string | null
  created_at: string
  updated_at?: string
}

const BANNER_INTERVAL_MS = 5000

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
]

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  audience: "all",
  is_banner: false,
  is_published: true,
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getImageUrl(item: NewsItem): string {
  if (item.banner_image_url) return item.banner_image_url
  // Deterministic fallback based on id
  return FALLBACK_IMAGES[item.id % FALLBACK_IMAGES.length]

}

export default function SchoolNewsPage() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <SchoolNewsContent />
    </ProtectedRoute>
  )
}

function SchoolNewsContent() {
  const { toast } = useToast()


  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [bannerIndex, setBannerIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isPostOpen, setIsPostOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await newsAPI.list()
      const results = res.data?.results || res.data || []
      setNewsItems(Array.isArray(results) ? results : [])
    } catch (err) {
      console.error("Failed to fetch news:", err)
      toast({
        title: "Failed to load news",
        description: "Could not fetch news items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Banner rotation — use items marked as banners
  const bannerItems = useMemo(
    () => newsItems.filter((n) => n.is_banner && n.is_published),
    [newsItems],
  )

  useEffect(() => {
    if (bannerItems.length === 0) return
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerItems.length)
    }, BANNER_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [bannerItems.length])

  const categories = useMemo(
    () => Array.from(new Set(newsItems.map((n) => n.category).filter(Boolean))).sort(),

    [newsItems],
  )

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||

        (item.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [newsItems, searchTerm, categoryFilter])


  const openPostDialog = (item?: NewsItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        excerpt: item.excerpt || "",
        content: item.content || "",
        category: item.category || "",
        audience: item.audience || "all",
        is_banner: item.is_banner,
        is_published: item.is_published,
      })
    } else {
      setEditingItem(null)
      setFormData(EMPTY_FORM)
    }
    setBannerFile(null)
    setIsPostOpen(true)
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the news item.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category.trim() || "Announcements",
        audience: formData.audience,
        is_banner: formData.is_banner,
        is_published: formData.is_published,
      }

      let savedItem: NewsItem

      if (editingItem) {
        const res = await newsAPI.update(editingItem.id, payload)
        savedItem = res.data
      } else {
        const res = await newsAPI.create(payload)
        savedItem = res.data
      }

      // Upload banner image if file selected
      if (bannerFile && savedItem.id) {
        const formDataUpload = new FormData()
        formDataUpload.append("banner", bannerFile)
        try {
          await newsAPI.uploadBanner(savedItem.id, formDataUpload)
        } catch (uploadErr) {
          console.error("Banner upload failed:", uploadErr)
          toast({
            title: "Banner upload failed",
            description: "News was saved but the image could not be uploaded.",
            variant: "destructive",
          })
        }
      }

      setIsPostOpen(false)
      setEditingItem(null)
      setBannerFile(null)
      setFormData(EMPTY_FORM)
      toast({
        title: editingItem ? "News updated" : "News published",
        description: `"${payload.title}" is now live.`,
      })
      fetchNews()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || "Something went wrong"
      toast({
        title: "Failed to save news",
        description: Array.isArray(msg) ? msg.join(", ") : msg,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await newsAPI.delete(id)
      setNewsItems((prev) => prev.filter((n) => n.id !== id))
      toast({ title: "News deleted", description: "The news item has been removed." })
    } catch (err: any) {
      toast({
        title: "Failed to delete",
        description: err?.response?.data?.detail || err?.message || "Could not delete the news item.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      await newsAPI.patch(item.id, { is_published: !item.is_published })
      fetchNews()
      toast({
        title: item.is_published ? "News hidden" : "News published",
        description: `"${item.title}" is now ${item.is_published ? "hidden from" : "visible to"} the community.`,
      })
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "Could not update the news item.",
        variant: "destructive",
      })
    }

  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">School News</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Share updates, achievements, and announcements with your school community
          </p>
        </div>
        <Button onClick={() => openPostDialog()} size="lg" disabled={isLoading}>

          <Plus className="w-5 h-5 mr-2" />
          Post News
        </Button>
      </div>


      {/* Banner Carousel */}
      {bannerItems.length > 0 && (
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden group">
          {bannerItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === bannerIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={getImageUrl(item)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-white max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-primary text-primary-foreground border-0">
                    {item.category}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(item.published_at || item.created_at)}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-2">
                  {item.title}
                </h2>
                <p className="text-white/80 text-sm md:text-base line-clamp-2">
                  {item.excerpt}
                </p>
              </div>
            </div>
          ))}

          {bannerItems.length > 1 && (
            <>
              <button
                onClick={() =>
                  setBannerIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setBannerIndex((prev) => (prev + 1) % bannerItems.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 right-6 flex items-center gap-2">
                {bannerItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setBannerIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === bannerIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Search + Filter */}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (

              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>

            ))}
          </SelectContent>
        </Select>
      </div>


      {/* News Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading news...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No news found</h3>
          <p className="text-muted-foreground">
            {newsItems.length === 0
              ? "Post your first news item to get started."
              : "Try adjusting your search or category filter."}
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNews.map((item) => (

            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition p-0 gap-0">
              <div className="h-40 overflow-hidden relative">
                <img
                  src={getImageUrl(item)}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {!item.is_published && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-yellow-500/90 text-white border-0">
                      Draft
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline">{item.category || "General"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.published_at || item.created_at)}
                  </span>
                </div>
                <h3 className="font-bold text-foreground leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.excerpt}
                </p>
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPostDialog(item)}
                    className="h-8 px-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(item)}
                    className="h-8 px-2"
                  >
                    {item.is_published ? "Hide" : "Publish"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Create / Edit Dialog */}
      <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit News" : "Post News"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <Label>Title *</Label>

              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual Sports Day Draws Record Turnout"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}

                placeholder="A short summary of the story (shown in cards and banners)"
                rows={2}
              />
            </div>

            <div>
              <Label>Full Content (optional)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="The full article content"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Events, Facilities, Achievements"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>Audience</Label>
                <Select
                  value={formData.audience}
                  onValueChange={(v) => setFormData({ ...formData, audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_banner}
                  onCheckedChange={(v) => setFormData({ ...formData, is_banner: v })}
                  id="is-banner"
                />
                <Label htmlFor="is-banner" className="cursor-pointer">
                  Show in banner carousel
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(v) => setFormData({ ...formData, is_published: v })}
                  id="is-published"
                />
                <Label htmlFor="is-published" className="cursor-pointer">
                  Publish immediately
                </Label>
              </div>
            </div>

            <div>
              <Label>Banner Image (optional)</Label>
              <div className="mt-1 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-sm">{bannerFile ? bannerFile.name : "Choose image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setBannerFile(file)
                    }}
                  />
                </label>
                {bannerFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBannerFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {editingItem?.banner_image_url && !bannerFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current image will be kept unless you select a new one.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPostOpen(false)
                  setEditingItem(null)
                  setBannerFile(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingItem ? "Update" : "Publish"}
              </Button>

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News Item</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this news item? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
