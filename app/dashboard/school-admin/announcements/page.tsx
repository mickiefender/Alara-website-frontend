"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { announcementsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2, Plus, Megaphone } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await announcementsAPI.list()
      setAnnouncements(res.data.results || res.data || [])
      setError(null)
    } catch (err: any) {
      console.error("Error:", err)
      setError("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.title || !formData.content) {
        setError("Please fill in all required fields")
        return
      }

      if (editingAnnouncement) {
        await announcementsAPI.update(editingAnnouncement.id, formData)
      } else {
        await announcementsAPI.create(formData)
      }

      setIsOpen(false)
      setEditingAnnouncement(null)
      setFormData({ title: "", content: "" })
      setError(null)
      fetchData()
    } catch (err: any) {
      console.error("Error:", err?.response?.data)
      setError(err?.response?.data?.detail || "Failed to save announcement")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      try {
        await announcementsAPI.delete(id)
        fetchData()
      } catch (err) {
        setError("Failed to delete announcement")
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingAnnouncement(null)
                setFormData({ title: "", content: "" })
              }}
              className="bg-red-700 hover:bg-red-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Post New Announcement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mid-term Break Dates"
                />
              </div>

              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement here..."
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800">
                {editingAnnouncement ? "Update" : "Post"} Announcement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-red-600"
                role="status"
                aria-label="Loading"
              />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p>No announcements yet. Post your first one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-red-600 pl-4 py-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{announcement.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Posted {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAnnouncement(announcement)
                          setFormData({ title: announcement.title, content: announcement.content })
                          setIsOpen(true)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
