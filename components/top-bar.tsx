"use client"

import { useAuthContext } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useState, useEffect, useRef } from "react"
import { academicsAPI, resolveImageUrl } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Menu } from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"
import { AuthBoundary } from "@/components/auth-boundary"

interface TopBarProps {
  onToggle?: () => void
}

export function TopBar({ onToggle }: TopBarProps) {
  return (
    <AuthBoundary>
      <TopBarContent onToggle={onToggle} />
    </AuthBoundary>
  )
}

function TopBarContent({ onToggle }: TopBarProps) {
  const { user, logout, school } = useAuthContext()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [profilePic, setProfilePic] = useState("")

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const schoolLogo = school?.logo_url || school?.logo_url_computed

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!user?.id) return
      try {
        const picRes = await academicsAPI.profilePictureByUser(user.id)
        const pics = picRes.data.results || picRes.data || []

        if (pics.length > 0) {
          const picUrl =
            pics[0].display_url ||
            pics[0].storage_url ||
            pics[0].picture ||
            ""
          setProfilePic(resolveImageUrl(picUrl))
        } else {
          setProfilePic("")
        }
      } catch {
        setProfilePic("")
      }
    }

    fetchProfilePic()
  }, [user?.id, user?.school_id])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const roleLabels = {
    super_admin: "Super Administrator",
    school_admin: "School Administrator",
    teacher: "Teacher",
    student: "Student",
  }

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()

    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)

    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <header className="fixed top-3 left-0 right-0 px-3 z-40">
      {/* Floating container */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 md:px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Language */}
          <select className="bg-transparent text-sm text-slate-600 dark:text-slate-300 font-medium outline-none cursor-pointer">
            <option className="dark:bg-slate-800">English</option>
            <option className="dark:bg-slate-800">Bangla</option>
            <option className="dark:bg-slate-800">Arabic</option>
          </select>

          {/* Theme */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfileMenu(false)
              }}
              className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <Bell size={22} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b dark:border-slate-700">
                  <h3 className="text-sm font-semibold">Notifications</h3>

                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-600"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`w-full text-left px-4 py-3 border-b dark:border-slate-800 ${
                          !notif.read
                            ? "bg-cyan-50 dark:bg-cyan-900/20"
                            : ""
                        }`}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-slate-500">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTimeAgo(notif.created_at)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2"
            >
              <ProfileAvatar
                src={profilePic || undefined}
                userId={user.id}
                alt="User"
                size="sm"
                schoolLogo={schoolLogo}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">

                <div className="px-4 py-3 border-b dark:border-slate-700">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {roleLabels[user.role as keyof typeof roleLabels]}
                  </p>
                </div>

                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                  My Profile
                </button>

                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                  Settings
                </button>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}