"use client"

import { useAuthContext } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useState, useEffect, useRef } from "react"
import { academicsAPI, resolveImageUrl } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Menu } from "lucide-react"
import Link from "next/link"
import { ProfileAvatar } from "@/components/profile-avatar"
import { AuthBoundary } from "@/components/auth-boundary"

interface TopBarProps {
  onToggle?: () => void
}

const ADMIN_STAFF_ROLES = ["academic_admin", "exam_officer", "finance_officer", "ct_admin_support"]

function getProfileHref(role?: string): string | null {
  if (role === "school_admin") return "/dashboard/school-admin/profile"
  if (role === "teacher") return "/dashboard/teacher/profile"
  if (role && ADMIN_STAFF_ROLES.includes(role)) return "/dashboard/admin-staff/profile"
  return null
}

function getSettingsHref(role?: string): string | null {
  if (role === "school_admin") return "/dashboard/school-admin/settings"
  return null
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
    <header className="sticky top-0 z-40 w-full border-b border-white/30 dark:border-white/5 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/55 shadow-[0_1px_12px_-6px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_12px_-6px_rgba(0,0,0,0.4)]">
      {/* Gradient hairline for the glass edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="h-16 flex items-center justify-between px-4 md:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Theme */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfileMenu(false)
              }}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-all duration-200 active:scale-95"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md shadow-primary/40 animate-in zoom-in-50 duration-300">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-popover/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_16px_48px_-12px_rgba(0,0,0,0.25)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_16px_48px_-12px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifications</h3>

                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`w-full text-left px-4 py-3 border-b border-border ${
                          !notif.read
                            ? "bg-accent"
                            : ""
                        }`}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
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
              className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200 active:scale-95"
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
              <div className="absolute right-0 mt-3 w-48 bg-popover/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_16px_48px_-12px_rgba(0,0,0,0.25)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_16px_48px_-12px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">

                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {roleLabels[user.role as keyof typeof roleLabels]}
                  </p>
                </div>

                {getProfileHref(user.role) && (
                  <Link
                    href={getProfileHref(user.role)!}
                    onClick={() => setShowProfileMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                  >
                    My Profile
                  </Link>
                )}

                {getSettingsHref(user.role) && (
                  <Link
                    href={getSettingsHref(user.role)!}
                    onClick={() => setShowProfileMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                  >
                    Settings
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
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