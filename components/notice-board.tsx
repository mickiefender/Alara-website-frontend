"use client"

import { useState, useEffect } from "react"
import { messagingAPI } from "@/lib/api"
import { Bell, Megaphone, Pin, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface Notice {
  id: number
  title: string
  content: string
  priority: "urgent" | "high" | "medium" | "low"
  created_at: string
  is_pinned: boolean
  author_name?: string
}

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
  author_name?: string
}

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"notices" | "announcements">("notices")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [noticesRes, announcementsRes] = await Promise.all([
          messagingAPI.notices(),
          messagingAPI.announcements(),
        ])

        const allNotices = noticesRes.data.results || noticesRes.data || []
        const allAnnouncements = announcementsRes.data.results || announcementsRes.data || []

        // Sort notices: pinned first, then by date
        allNotices.sort((a: Notice, b: Notice) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        // Sort announcements by date (newest first)
        allAnnouncements.sort(
          (a: Announcement, b: Announcement) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )

        setNotices(allNotices)
        setAnnouncements(allAnnouncements)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch notices and announcements", err)
        setError("Could not load notices.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          bg: "bg-red-50 dark:bg-red-500/10",
          border: "border-red-200 dark:border-red-500/30",
          icon: "text-red-500",
          badge: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
          Icon: AlertCircle
        }
      case "high":
        return {
          bg: "bg-orange-50 dark:bg-orange-500/10",
          border: "border-orange-200 dark:border-orange-500/30",
          icon: "text-orange-500",
          badge: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
          Icon: AlertTriangle
        }
      case "medium":
        return {
          bg: "bg-amber-50 dark:bg-amber-500/10",
          border: "border-amber-200 dark:border-amber-500/30",
          icon: "text-amber-500",
          badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
          Icon: Info
        }
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-500/10",
          border: "border-blue-200 dark:border-blue-500/30",
          icon: "text-blue-500",
          badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
          Icon: Info
        }
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            Notice Board
          </h3>
        </div>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  const totalCount = notices.length + announcements.length

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              Notice Board
              <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                {totalCount}
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

      {/* Tab buttons */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab("notices")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "notices"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Bell size={14} />
          Notices ({notices.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "announcements"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Megaphone size={14} />
          Announcements ({announcements.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {activeTab === "notices" && notices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Bell size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No notices available</p>
          </div>
        )}

        {activeTab === "announcements" && announcements.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Megaphone size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No announcements available</p>
          </div>
        )}

        {/* Notices */}
        {activeTab === "notices" &&
          notices.map((notice) => {
            const styles = getPriorityStyles(notice.priority)
            const PriorityIcon = styles.Icon
            
            return (
              <div
                key={`notice-${notice.id}`}
                className={`p-3 rounded-xl border ${styles.bg} ${styles.border} hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${styles.bg} ${styles.icon}`}>
                    <PriorityIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.is_pinned && (
                        <Pin size={12} className="text-slate-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {notice.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}>
                        {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatTimeAgo(notice.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

        {/* Announcements */}
        {activeTab === "announcements" &&
          announcements.map((announcement) => (
            <div
              key={`announcement-${announcement.id}`}
              className="p-3 rounded-xl border border-blue-100 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {announcement.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                    {announcement.content}
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatTimeAgo(announcement.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

