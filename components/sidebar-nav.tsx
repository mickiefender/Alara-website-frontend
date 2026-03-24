"use client"

import { useAuthContext } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { CircularLoader } from "@/components/circular-loader"
import Image from "next/image"
import { academicsAPI } from "@/lib/api"
import {
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  Users,
  User,
  BookOpen,
  School,
  Book,
  Clock,
  Calendar,
  ClipboardEdit,
  Wrench,
  CheckSquare,
  FileText,
  Bus,
  Home,
  Megaphone,
  MessageSquare,
  Library,
  UserCircle,
  BookUser,
  BarChart,
  ClipboardCheck,
  FilePen,
  UploadCloud,
  MessageCircle,
  DollarSignIcon,
  CreditCard,
  Bell,
  Search,
  X,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type NavSection = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items?: NavItem[]
  href?: string
}

const navSections: Record<string, NavSection[]> = {
  school_admin: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/school-admin",
    },
    {
      label: "Admin",
      icon: Settings,
      items: [
         { label: "Admin Staff Management", href: "/dashboard/school-admin/manage-admin-staff", icon: Users },
        { label: "Students", href: "/dashboard/school-admin/students", icon: Users },
        { label: "Teachers", href: "/dashboard/school-admin/teachers", icon: User },
        { label: "Student Assignment", href: "/dashboard/school-admin/student-assignment", icon: ClipboardCheck},
        { label: "Teacher Assignment", href: "/dashboard/school-admin/teacher-assignment", icon: FilePen },
        { label: "School Profile", href: "/dashboard/school-admin/settings", icon: Settings },
      ],
    },
    
    {
      label: "Academics",
      icon: BookOpen,
      items: [
        { label: "Class", href: "/dashboard/school-admin/classes", icon: School },
        { label: "Subject", href: "/dashboard/school-admin/subjects", icon: Book },
        
        { label: "Timetable", href: "/dashboard/school-admin/timetable", icon: Calendar },
        { label: "Grading", href: "/dashboard/school-admin/grading", icon: ClipboardEdit },
        { label: "Attendance", href: "/dashboard/school-admin/attendance", icon: CheckSquare },
        { label: "Exam", href: "/dashboard/school-admin/exam", icon: FileText },
      ],
    },
    {
    label: "Finance",
      icon: CreditCard,
      items: [
        { label: "Manage Types", href: "/dashboard/school-admin/manage-fees", icon: CreditCard },
        { label: "Collect Fees", href: "/dashboard/school-admin/collect-fees", icon: DollarSignIcon },
        { label: "Payments", href: "/dashboard/school-admin/payments", icon: CreditCard },
        { label: "Withdrawals", href: "/dashboard/school-admin/withdrawals", icon: DollarSignIcon },
        { label: "Receipts", href: "/dashboard/school-admin/receipts", icon: BookUser },
        { label: "Expenses", href: "/dashboard/school-admin/expenses", icon: FileText },
      ],
      },
    {
      label: "Operations",
      icon: Wrench,
      items: [
        { label: "Transport", href: "/dashboard/school-admin/transport", icon: Bus },
        { label: "Hostel", href: "/dashboard/school-admin/hostel", icon: Home },
      ],
    },
    {
      label: "Communication",
      icon: MessageCircle,
      items: [
        { label: "Announcement", href: "/dashboard/school-admin/announcement", icon: Megaphone },
        { label: "Message", href: "/dashboard/school-admin/messaging", icon: MessageSquare },
        { label: "News", href: "/dashboard/school-admin/news", icon: BookOpen },
      ],
    },
    {
   label: "Library",
      icon: Library,
      items: [
        { label: "Books", href: "/dashboard/school-admin/library/books", icon: Book },
        { label: "Issued Books", href: "/dashboard/school-admin/library/issued-books", icon: BookUser },
        { label: "Categories", href: "/dashboard/school-admin/library/categories", icon: BookOpen },
      ],
    },
  ],
  teacher: [
    {
      label: "Dashboard",
      icon: ClipboardEdit,
      href: "/dashboard/teacher",
    },
    {
      label: "My Profile",
      icon: UserCircle,
      href: "/dashboard/teacher/profile",
    },
    {
      label: "Teaching",
      icon: User,
      items: [
        { label: "Overview", href: "/dashboard/teacher", icon: User },
        { label: "My Classes", href: "/dashboard/teacher/my-classes", icon: School },
        { label: "Attendance", href: "/dashboard/teacher/attendance", icon: CheckSquare },
        { label: "Grades", href: "/dashboard/teacher/grades", icon: ClipboardEdit },
        { label: "Assignments", href: "/dashboard/teacher/assignments", icon: ClipboardCheck },
        { label: "Submissions", href: "/dashboard/teacher/submissions", icon: BookOpen },
        { label: "Performance", href: "/dashboard/teacher/performance", icon: BarChart},
        { label: "Materials", href: "/dashboard/teacher/materials", icon: UploadCloud },
        { label: "Messages", href: "/dashboard/teacher/messages", icon: MessageCircle },
        { label: "Notifications", href: "/dashboard/teacher/notifications", icon: Bell },
      ],
    },
  ],
  student: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/student",
      items: [
        { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
        
        { label: "Fees & Payments", href: "/dashboard/student/fees", icon: DollarSignIcon },
        { label: "Timetable", href: "/dashboard/student/timetable", icon: Calendar },
        { label: "Notifications", href: "/dashboard/student/notifications", icon: Bell },
        { label: "Attendance", href: "/dashboard/student/attendance", icon: CheckSquare },
        { label: "Grades", href: "/dashboard/student/results", icon: BarChart },
        { label: "Assignments", href: "/dashboard/student/assignments", icon: ClipboardCheck },
        { label: "Documents", href: "/dashboard/student/documents", icon: FileText },
      ],
    },
  ],
}

interface SidebarNavProps {
  isCollapsed?: boolean
  onClose?: () => void
  isMobile?: boolean
  onToggleCollapse?: () => void
}

import { AuthBoundary } from "@/components/auth-boundary"

export function SidebarNav({ isCollapsed = false, onClose, isMobile = false, onToggleCollapse }: SidebarNavProps) {
  return (
    <AuthBoundary>
      <SidebarNavContent 
        isCollapsed={isCollapsed}
        onClose={onClose}
        isMobile={isMobile}
        onToggleCollapse={onToggleCollapse}
      />
    </AuthBoundary>
  )
}

interface SidebarNavContentProps {
  isCollapsed: boolean
  onClose?: () => void
  isMobile: boolean
  onToggleCollapse?: () => void
}

function SidebarNavContent({ isCollapsed, onClose, isMobile, onToggleCollapse }: SidebarNavContentProps) {
  const { user, logout, school, loading } = useAuthContext()
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Dashboard"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [profilePic, setProfilePic] = useState<string>("")


  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!user?.id) return
      try {
        const picRes = await academicsAPI.profilePictureByUser(user.id)
        const pics = picRes.data.results || picRes.data || []
        if (pics.length > 0) {
          const picUrl = pics[0].display_url || pics[0].storage_url || pics[0].picture || ""
          setProfilePic(picUrl)
        }
      } catch (err) {
        // silent
      }
    }
    fetchProfilePic()
  }, [user?.id])

  if (!user || loading) return (
    <aside className="flex flex-col bg-gradient-to-b from-sidebar via-sidebar backdrop-blur-xl h-screen w-72 border-r border-sidebar-border">
      <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-muted-foreground/20 border-t-muted-foreground rounded-xl animate-spin"></div>
      </div>
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-muted-foreground">Loading navigation...</p>
        </div>
      </div>
    </aside>
  )

  const sections = navSections[user.role as keyof typeof navSections] || []

  // Filter sections based on search
  const filteredSections = searchQuery
    ? sections.map(section => ({
        ...section,
        items: section.items?.filter(
          item => item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => 
        section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.items?.length
      )
    : sections

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedSections(newExpanded)
  }

  const schoolName = loading ? (
    <span className="flex items-center gap-2">
      <CircularLoader size="sm" /> Loading...
    </span>
  ) : school?.name || "School Name"

  const schoolLogoUrl = school?.logo_url || school?.logo_url_computed
  const schoolInitial = loading ? "" : school?.name?.charAt(0) || "S"

  return (
    <aside 
      className={`
        flex flex-col bg-sidebar 
        backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${isMobile ? "h-[100dvh] w-[85%] max-w-[320px] shadow-2xl border-r-0" : `h-screen border-r border-sidebar-border ${isCollapsed ? "w-20" : "w-72"}`}
      `}
    >
      {/* Header */}
      <div className={`
h-16 px-4 flex items-center justify-between
        ${isCollapsed && !isMobile ? "justify-center px-2 gap-0" : "gap-3"}
      `}>
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground-computed/70 hover:text-sidebar-foreground-computed transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {schoolLogoUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-sidebar-primary/10 shadow-lg">
            <img 
              src={schoolLogoUrl} 
              alt={school?.name || "School"} 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center font-bold text-sidebar-primary-foreground flex-shrink-0 shadow-lg">
            {schoolInitial}
          </div>
        )}
        
        {!isCollapsed || isMobile ? (
          <>
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-base font-bold text-sidebar-foreground-computed truncate">{schoolName}</h1>
              <p className="text-xs text-sidebar-foreground-computed/60">School Management</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sidebar-primary/60 to-transparent"></div>
          </>
        ) : null}
      </div>

      {/* Search Bar */}
      {!isCollapsed || isMobile ? (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground-computed/50" size={16} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sidebar-accent/50 border border-sidebar-border rounded-lg pl-9 pr-4 py-2 text-sm text-sidebar-foreground-computed placeholder:text-sidebar-foreground-computed/50 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring/50 transition-all"
            />
          </div>
        </div>
      ) : null}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.label)
          const isActive = section.href && pathname.includes(section.href.split("#")[0])
          const Icon = section.icon
          const hasItems = section.items && section.items.length > 0

          if (!hasItems) {
            return (
              <Link key={section.label} href={section.href || "#"} onClick={isMobile ? onClose : undefined}>
                <div
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary border-l-4 border-sidebar-primary -ml-1 pl-4" 
                      : "text-sidebar-foreground-computed/70 hover:bg-sidebar-accent hover:text-sidebar-foreground-computed"
                    }
                    ${isCollapsed && !isMobile ? "justify-center" : ""}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground-computed/60 group-hover:text-sidebar-foreground-computed"}`} />
                  {!isCollapsed || isMobile ? (
                    <span className="font-medium text-sm truncate">{section.label}</span>
                  ) : null}
                </div>
              </Link>
            )
          }

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  text-sidebar-foreground-computed/70 hover:bg-sidebar-accent hover:text-sidebar-foreground-computed
                  ${isCollapsed && !isMobile ? "justify-center" : ""}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-sidebar-foreground-computed/60" />
                {!isCollapsed || isMobile ? (
                  <>
                    <span className="font-medium text-sm flex-1 text-left truncate">{section.label}</span>
    <ChevronDown 
      size={16} 
      className={`text-sidebar-foreground-computed/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
    />
                  </>
                ) : null}
              </button>

              {isExpanded && hasItems && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-sidebar-primary/70 pl-3">
                  {section.items?.map((item) => {
                    const ItemIcon = item.icon
                    const isItemActive = pathname.includes(item.href.split("#")[0])
                    return (
                      <Link key={item.href} href={item.href} onClick={isMobile ? onClose : undefined}>
                        <div
                          className={`
                            group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${isItemActive 
                              ? "bg-sidebar-primary/10 text-sidebar-primary" 
                              : "text-sidebar-foreground-computed/60 hover:text-sidebar-foreground-computed hover:bg-sidebar-accent/50"
                            }
                            ${isCollapsed && !isMobile ? "justify-center" : ""}
                          `}
                        >
  <ItemIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isItemActive ? "text-sidebar-primary" : "text-sidebar-foreground-computed/50 group-hover:text-sidebar-foreground-computed"}`} />
                          {!isCollapsed || isMobile ? (
                            <span className="truncate">{item.label}</span>
                          ) : null}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        
        <Button 
          onClick={logout} 
          className={`
            w-full bg-sidebar-accent/50 hover:bg-sidebar-primary/10 text-sidebar-foreground-computed hover:text-sidebar-primary-foreground 
            border border-sidebar-border hover:border-sidebar-primary/50 font-semibold transition-all duration-200
            ${isCollapsed && !isMobile ? "px-2" : ""}
          `}
          variant="ghost"
        >
          <span className={isCollapsed && !isMobile ? "sr-only" : "flex items-center gap-2 justify-center"}>
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </span>
        </Button>
      </div>
    </aside>
  )
}
