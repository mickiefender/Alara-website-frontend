"use client"

import { useAuthContext } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useState, useEffect, useRef } from "react"
import { academicsAPI, resolveImageUrl } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Menu } from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"

interface TopBarProps {
  onToggle?: () => void
}

import { AuthBoundary } from "@/components/auth-boundary"

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
  const [profilePic, setProfilePic] = useState<string>("")
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)


  // Get school logo
  const schoolLogo = school?.logo_url || school?.logo_url_computed

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!user?.id) return
      try {
        const picRes = await academicsAPI.profilePictureByUser(user.id)
        const pics = picRes.data.results || picRes.data || []
        if (pics.length > 0) {
          const picUrl = pics[0].display_url || pics[0].storage_url || pics[0].picture || ""
          setProfilePic(resolveImageUrl(picUrl))
        }
      } catch (err) {
        // silent
      }
    }
    fetchProfilePic()
  }, [user?.id])

  // Log API response for debugging
  useEffect(() => {
    if (profilePic) {
      console.log('Profile picture loaded:', profilePic)
    } else {
      console.log('No profile picture found for user:', user?.id)
    }
  }, [profilePic, user?.id])

  // Close dropdowns on outside click
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return ""
      case "withdrawal":
        return ""
      default:
        return ""
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <header className="bg-white dark:bg-slate-900 h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 shadow-sm relative z-30">
      {/* Left side - Hamburger menu for mobile */}
      <div className="flex items-center gap-3">

          <button 
            onClick={onToggle}
            className="p-2 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

      </div>

      {/* Right side - Language, theme toggle, notifications, profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Language Selector */}
        <select className="bg-transparent text-sm text-slate-600 dark:text-slate-300 font-medium outline-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <option className="dark:bg-slate-800">English</option>
          <option className="dark:bg-slate-800">Bangla</option>
          <option className="dark:bg-slate-800">Arabic</option>
        </select>


        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
            className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <Bell size={22} />
            {unreadCount > 0 && (

              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-96 max-h-[480px] overflow-hidden z-50">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Notifications</h3>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[380px]">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="text-4xl block mb-2"></span>
                    <p className="text-sm text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !notif.read ? "bg-cyan-50 dark:bg-cyan-900/20" : ""
                      }`}

                    >
                      <div className="flex gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notif.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notif.read ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}>
                              {notif.title}
                            </p>

                            {!notif.read && (
                              <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatTimeAgo(notif.created_at)}</p>

                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
          >
            <ProfileAvatar 
              src={profilePic || undefined} 
              alt={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
              size="sm"
              schoolLogo={schoolLogo}
              className="border-2 border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[user.role as keyof typeof roleLabels]}</p>
            </div>

          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg w-48">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">My Profile</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Settings</button>
              <hr className="my-2 border-slate-200 dark:border-slate-700" />

              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  logout()
                }}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

