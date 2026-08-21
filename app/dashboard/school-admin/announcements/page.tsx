"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { messagingAPI, getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipientPicker } from "@/components/recipient-picker"
import { Trash2, Plus, Megaphone, Users } from "lucide-react"
import { DataStateError } from "@/components/data-state"

type Audience = "all" | "students" | "teachers" | "individual"

interface Announcement {
  id: number
  title: string
  content: string
  priority: string
  send_to_all: boolean
  send_to_teachers: boolean
  send_to_students: boolean
  recipient_names: string[]
  created_by_name?: string
  created_at: string
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
]

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: "all", label: "Everyone", hint: "All students and teachers in your school" },
  { value: "students", label: "All Students", hint: "Every student in your school" },
  { value: "teachers", label: "All Teachers", hint: "Every teacher in your school" },
  { value: "individual", label: "Specific People", hint: "Pick individual students and/or teachers" },
]

const emptyForm = {
  title: "",
  content: "",
  audience: "all" as Audience,
  priority: "medium",
  recipientIds: [] as number[],
}

function describeAudience(a: Announcement): string {
  if (a.send_to_all) return "Everyone"
  if (a.send_to_teachers && a.send_to_students) return "Students & Teachers"
  if (a.send_to_teachers) return "Teachers"
  if (a.send_to_students) return "Students"
  if (a.recipient_names?.length) return `${a.recipient_names.length} specific recipient(s)`
  return "—"
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await messagingAPI.announcements()
      setAnnouncements(res.data.results || res.data || [])
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError(getErrorMessage(err, "Failed to load announcements. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  const buildPayload = () => ({
    title: formData.title.trim(),
    content: formData.content.trim(),
    priority: formData.priority,
    send_to_all: formData.audience === "all",
    send_to_students: formData.audience === "students",
    send_to_teachers: formData.audience === "teachers",
    recipients:
      formData.audience === "individual"
        ? formData.recipientIds
        : [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all required fields")
      return
    }
    if (formData.audience === "individual" && formData.recipientIds.length === 0) {
      setError("Select at least one recipient")
      return
    }

    try {
      setSubmitting(true)
      await messagingAPI.createAnnouncement(buildPayload())
      setIsOpen(false)
      setFormData(emptyForm)
      setError(null)
      fetchData()
    } catch (err: any) {
      console.error("Error:", err?.response?.data)
      setError(getErrorMessage(err, "Failed to save announcement"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await messagingAPI.deleteAnnouncement(id)
      fetchData()
    } catch (err) {
      setError("Failed to delete announcement")
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
                setFormData(emptyForm)
                setError(null)
              }}
              className="bg-red-700 hover:bg-red-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Post New Announcement</DialogTitle>
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
                  rows={5}
                />
              </div>

              <div>
                <Label>Send To *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, audience: opt.value })}
                      className={`p-2.5 border rounded-md text-left transition-colors ${
                        formData.audience === opt.value
                          ? "border-red-600 bg-red-50 ring-1 ring-red-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="block text-sm font-medium">{opt.label}</span>
                      <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.audience === "individual" && (
                <div>
                  <Label>Select Recipients</Label>
                  <RecipientPicker
                    selected={formData.recipientIds}
                    onChange={(recipientIds) => setFormData({ ...formData, recipientIds })}
                  />
                </div>
              )}

              <div>
                <Label>Priority</Label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-red-700 hover:bg-red-800">
                {submitting ? "Posting..." : "Post Announcement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isOpen && <DataStateError message={error} onRetry={fetchData} className="mb-4" />}

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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{announcement.content}</p>

                      {/* Audience */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                          <Users className="w-3 h-3" />
                          {describeAudience(announcement)}
                        </span>
                        {announcement.priority === "urgent" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            Urgent
                          </span>
                        )}
                        {announcement.priority === "high" && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                            High priority
                          </span>
                        )}
                      </div>

                      {/* Individual recipients */}
                      {!announcement.send_to_all &&
                        announcement.recipient_names?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            To: {announcement.recipient_names.join(", ")}
                          </p>
                        )}

                      <p className="text-xs text-gray-500 mt-2">
                        Posted {new Date(announcement.created_at).toLocaleDateString()}
                        {announcement.created_by_name ? ` by ${announcement.created_by_name}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
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
