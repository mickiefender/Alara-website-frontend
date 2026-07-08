"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Newspaper, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

interface NewsItem {
  id: number
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  image: string
}

const BANNER_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "Annual Sports Day Draws Record Turnout",
    excerpt: "Students, parents, and staff came together for a day of athletics, team spirit, and celebration.",
    category: "Events",
    author: "School Admin",
    date: "2026-06-28",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "New Science Lab Officially Opens",
    excerpt: "The newly renovated science laboratory is now open, giving students hands-on access to modern equipment.",
    category: "Facilities",
    author: "School Admin",
    date: "2026-06-20",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Students Excel at Regional Mathematics Competition",
    excerpt: "Our Form 3 team placed first in the regional mathematics olympiad, advancing to the national round.",
    category: "Achievements",
    author: "School Admin",
    date: "2026-06-15",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Graduation Ceremony Set for Next Term",
    excerpt: "Preparations are underway for this year's graduation ceremony, honoring our outgoing senior class.",
    category: "Announcements",
    author: "School Admin",
    date: "2026-06-08",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
  },
]

const NEWS_ITEMS: NewsItem[] = [
  ...BANNER_ITEMS,
  {
    id: 5,
    title: "Library Extends Weekday Hours",
    excerpt: "The school library will now stay open until 6pm on weekdays to support after-school study groups.",
    category: "Facilities",
    author: "School Admin",
    date: "2026-06-02",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "PTA Meeting Scheduled for This Month",
    excerpt: "Parents and guardians are invited to the upcoming PTA meeting to discuss the term's progress and plans.",
    category: "Announcements",
    author: "School Admin",
    date: "2026-05-27",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "New Classroom Block Construction Begins",
    excerpt: "Construction has started on a new classroom block to accommodate growing enrollment numbers.",
    category: "Facilities",
    author: "School Admin",
    date: "2026-05-19",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Debate Club Wins Inter-School Championship",
    excerpt: "Congratulations to our debate club for bringing home the trophy from this year's inter-school championship.",
    category: "Achievements",
    author: "School Admin",
    date: "2026-05-10",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
  },
]

const BANNER_INTERVAL_MS = 5000

const DEFAULT_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=1200&auto=format&fit=crop",
]

const EMPTY_FORM = { title: "", excerpt: "", category: "", image: "" }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS)
  const [bannerIndex, setBannerIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isPostOpen, setIsPostOpen] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNER_ITEMS.length)
    }, BANNER_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(newsItems.map((n) => n.category))).sort(),
    [newsItems],
  )

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [newsItems, searchTerm, categoryFilter])

  const openPostDialog = () => {
    setFormData(EMPTY_FORM)
    setIsPostOpen(true)
  }

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.excerpt.trim()) {
      toast({ title: "Missing details", description: "Please fill in a title and excerpt.", variant: "destructive" })
      return
    }

    const newItem: NewsItem = {
      id: Math.max(0, ...newsItems.map((n) => n.id)) + 1,
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim(),
      category: formData.category.trim() || "Announcements",
      author: "School Admin",
      date: new Date().toISOString().slice(0, 10),
      image: formData.image.trim() || DEFAULT_IMAGE_POOL[newsItems.length % DEFAULT_IMAGE_POOL.length],
    }

    setNewsItems((prev) => [newItem, ...prev])
    setIsPostOpen(false)
    setFormData(EMPTY_FORM)
    toast({ title: "News posted", description: `"${newItem.title}" is now live.` })
  }

  const handleRead = (item: NewsItem) => {
    toast({ title: item.title, description: item.excerpt })
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">School News</h1>
          <p className="text-muted-foreground text-lg mt-2">Share updates, achievements, and announcements with your school community</p>
        </div>
        <Button onClick={openPostDialog} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Post News
        </Button>
      </div>

      {/* Banner */}
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden group">
        {BANNER_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === bannerIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-white max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary text-primary-foreground border-0">{item.category}</Badge>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <CalendarDays className="w-4 h-4" />
                  {formatDate(item.date)}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-2">{item.title}</h2>
              <p className="text-white/80 text-sm md:text-base line-clamp-2">{item.excerpt}</p>
            </div>
          </div>
        ))}

        {/* Prev / Next controls */}
        <button
          onClick={() => setBannerIndex((prev) => (prev - 1 + BANNER_ITEMS.length) % BANNER_ITEMS.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setBannerIndex((prev) => (prev + 1) % BANNER_ITEMS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2">
          {BANNER_ITEMS.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setBannerIndex(index)}
              className={`h-2 rounded-full transition-all ${index === bannerIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Search + filter */}
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
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* News grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No news found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNews.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition cursor-pointer p-0 gap-0"
              onClick={() => handleRead(item)}
            >
              <div className="h-40 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                </div>
                <h3 className="font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post News</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <Label>Title</Label>
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
                placeholder="A short summary of the story"
                rows={3}
                required
              />
            </div>
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
              <Label>Image URL (optional)</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Paste an image link, or leave blank for a default photo"
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPostOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
