"use client"

import { useAuthContext } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState, useEffect } from "react"
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
  Library,
  UserCircle,
  BookUser,
  BarChart,
  ClipboardCheck,
  FilePen,
  UploadCloud,
  MessageCircle,
  Newspaper,
  DollarSignIcon,
  CreditCard,
  Bell,
  Search,
  X,
  Shield,
  ClipboardList,
  Sparkles,
  Megaphone,
} from "lucide-react"

import { NAV_LINK_PERMISSIONS } from "@/lib/permissions"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

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
  super_admin: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/super-admin",
    },
    
        { label: "Super Admin Home", href: "/dashboard/super-admin", icon: LayoutDashboard },
        { label: "Schools & Usage", href: "/dashboard/super-admin#schools-usage", icon: School },
{ label: "School Onboarding", href: "/dashboard/super-admin/onboarding", icon: School },
        { label: "Global Users", href: "/dashboard/super-admin#global-users", icon: Users },
        { label: "Subscriptions & Billing", href: "/dashboard/super-admin#billing", icon: CreditCard },
        { label: "Analytics & Reports", href: "/dashboard/super-admin#analytics", icon: BarChart },
     
  ],
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
    label: "Results",
      icon: BarChart,
      items: [

        { label: "Export Results", href: "/dashboard/school-admin/results/export", icon: FileText },
        { label: "Report Templates", href: "/dashboard/school-admin/results/templates", icon: FileText },
        
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
        { label: "Announcements", href: "/dashboard/school-admin/announcements", icon: Megaphone },
        { label: "Notices", href: "/dashboard/school-admin/manage-notices", icon: Bell },
        { label: "News", href: "/dashboard/school-admin/news", icon: Newspaper },
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
  admin_staff: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin-staff",
    },
    {
      label: "Profile",
      icon: UserCircle,
      href: "/dashboard/admin-staff/profile",
    },
    {
      label: "Permissions",
      icon: Shield,
      href: "/dashboard/admin-staff/permissions",
    },
    {
      label: "My Tasks",
      icon: ClipboardList,
      items: [
        { label: "Quick Actions", href: "/dashboard/admin-staff/tasks", icon: ClipboardCheck },
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
        { label: "Ai Chat", href: "/dashboard/teacher/ai-assistant", icon: Sparkles }, 
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
        { label: "AI Chat", href: "/dashboard/student/ai-chat", icon: Sparkles },
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
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)


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

  if (!user || loading) return null

  const sections = navSections[user.role as keyof typeof navSections] || []

  // Permission-based filtering for admin staff roles
  const userPerms = user.permissions || []
  const isAdminStaff = ['academic_admin', 'exam_officer', 'finance_officer', 'ct_admin_support'].includes(user.role || '')
  
  const permissionFilteredSections = sections.map(section => ({
    ...section,
    items: section.items?.filter(item => {
      // Always allow dashboard/admin core for school_admin
      if (user.role === 'school_admin') return true
      // Admin staff: filter by permissions
      if (isAdminStaff) {
        // Exact match by href from NAV_LINK_PERMISSIONS
        const hrefMatch = NAV_LINK_PERMISSIONS.find(p => p.href === item.href)
        if (hrefMatch && userPerms.includes(hrefMatch.id as any)) return true
        
        // Fallback heuristic
        const itemId = item.href.split('/').pop()?.replace(/-/g, '_') || ''
        return userPerms.includes(itemId) || 
               userPerms.includes('view_' + itemId)
      }
      return true
    })
  }))

  // Filter sections based on search + permissions - always show core admin_staff sections
  const filteredSections = searchQuery
    ? permissionFilteredSections.map(section => ({
        ...section,
        items: section.items?.filter(
          item => item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
      })).filter(section => 
        section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.items?.length ?? 0) > 0 ||
        // Always show core admin_staff sections
        (isAdminStaff && ['Dashboard', 'Profile', 'Permissions', 'My Tasks'].includes(section.label))
      )
    : permissionFilteredSections.filter(section => 
        !(section.items && section.items.length === 0) ||
        // Always show core admin_staff sections even if filtered items empty
        (isAdminStaff && ['Dashboard', 'Profile', 'Permissions', 'My Tasks'].includes(section.label))
      )

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedSections(newExpanded)
  }

  const schoolName = school?.name || "School Name"

  const schoolLogoUrl = school?.logo_url || school?.logo_url_computed
  const schoolInitial = school?.name?.charAt(0) || "S"

  return (
    <aside
      className={`
        relative flex flex-col overflow-hidden
        ring-1 ring-inset ring-white/10
        transition-all duration-300 ease-in-out
        ${isMobile ? "h-[100dvh] w-full shadow-2xl border-r-0" : `h-screen border-r border-black/40 ${isCollapsed ? "w-20" : "w-72"}`}
      `}
      style={{
        background: "linear-gradient(180deg, #991b1b 0%, #5a0d0d 45%, #1a0404 80%, #000000 100%)",
        "--sidebar-foreground-computed": "#f8fafc",
        "--sidebar-primary": "#f87171",
        "--sidebar-border": "rgba(255, 255, 255, 0.12)",
      } as React.CSSProperties}
    >
      {/* Liquid-glass glow accents */}
      <div className="pointer-events-none absolute -z-10 -top-24 -left-16 h-64 w-64 rounded-full blur-3xl opacity-80" style={{ backgroundColor: "var(--sidebar-glow-primary)" }} />
      <div className="pointer-events-none absolute -z-10 bottom-0 -right-20 h-72 w-72 rounded-full blur-3xl opacity-70" style={{ backgroundColor: "var(--sidebar-glow-secondary)" }} />
      <div className="pointer-events-none absolute -z-10 inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {/* Header */}
      <div className={`
relative h-16 px-4 flex items-center justify-between
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
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 ring-1 ring-white/20 rounded-xl flex items-center justify-center font-bold text-sidebar-primary-foreground flex-shrink-0 shadow-lg shadow-sidebar-primary/30">
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
              className="w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg pl-9 pr-4 py-2 text-sm text-sidebar-foreground-computed placeholder:text-sidebar-foreground-computed/50 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring/50 transition-all"
            />
          </div>
        </div>
      ) : null}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
        {isAdminStaff && (
          <div>
            <button
              onClick={() => setShowPermissionsDialog(true)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                text-sidebar-foreground-computed/70 hover:bg-white/10 hover:text-sidebar-foreground-computed group
                ${isCollapsed && !isMobile ? "justify-center" : ""}
              `}
            >
              <Shield className="w-4 h-4 flex-shrink-0 text-sidebar-foreground-computed/60 group-hover:text-sidebar-foreground-computed" />
              {!isCollapsed || isMobile ? (
                <>
                  <span className="font-medium text-sm flex-1 text-left truncate">My Permissions</span>
                  <div className="flex items-center gap-1 bg-sidebar-primary/20 text-sidebar-primary text-xs px-2 py-0.5 rounded-full font-medium">
                    {userPerms.length}
                  </div>
                </>
              ) : (
                <div className="w-5 h-5 bg-sidebar-primary/20 text-sidebar-primary text-xs rounded-full flex items-center justify-center font-medium">
                  {userPerms.length}
                </div>
              )}
            </button>
          </div>
        )}
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
                      ? "bg-sidebar-primary/15 backdrop-blur-sm text-sidebar-primary ring-1 ring-sidebar-primary/40 shadow-[0_0_20px_-6px_var(--sidebar-primary)]"
                      : "text-sidebar-foreground-computed/70 hover:bg-white/10 hover:text-sidebar-foreground-computed"
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
                  text-sidebar-foreground-computed/70 hover:bg-white/10 hover:text-sidebar-foreground-computed
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
                              ? "bg-sidebar-primary/15 backdrop-blur-sm text-sidebar-primary ring-1 ring-sidebar-primary/30"
                              : "text-sidebar-foreground-computed/60 hover:text-sidebar-foreground-computed hover:bg-white/10"
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

      {/* Permissions Dialog for Staff Admins */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              My Permissions ({userPerms.length})
            </DialogTitle>
            <DialogDescription>
              These are the permissions assigned to your account by the school administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {userPerms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm">No permissions assigned yet.</p>
                <p className="text-xs">Contact your school administrator to grant access.</p>
              </div>
            ) : (
              userPerms.map((permId) => {
                const permission = NAV_LINK_PERMISSIONS.find(p => p.id === permId)
                if (!permission) return null
                return (
                  <div key={permId} className="flex items-center justify-between p-3 bg-sidebar-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-sidebar-primary/60 to-sidebar-primary/40 rounded-sm" />
                      <div>
                        <p className="font-medium text-sidebar-foreground-computed">{permission.label}</p>
                        <p className="text-xs text-sidebar-foreground-computed/60">{permission.category}</p>
                      </div>
                    </div>
                    <div className="w-2 h-8 bg-green-400 rounded-sm animate-pulse" />
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        
        <Button
          onClick={logout}
          className={`
            w-full bg-white/10 backdrop-blur-sm hover:bg-white/15 text-sidebar-foreground-computed hover:text-white
            border border-white/15 hover:border-sidebar-primary/50 font-semibold transition-all duration-200
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

