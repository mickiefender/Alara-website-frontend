"use client"

import { useAuthContext } from '@/lib/auth-context'
import { useMobileToggle } from '@/lib/mobile-toggle-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  ClipboardList,
  CalendarDays,
  DollarSign,
  Sparkles,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isMenu?: boolean
}

const MOBILE_NAV_PERMISSION_MAP: Record<string, string> = {
  Students: 'manage_students',
  Teachers: 'manage_teachers',
  Academics: 'manage_timetable',
  Classes: 'manage_classes',
  Attendance: 'manage_attendance',
  Grades: 'manage_grades',
  Timetable: 'manage_timetable',
  Fees: 'view_fees',
  Dashboard: 'view_admin_dashboard',
  Profile: 'view_profile',
}

const navItems: Record<string, NavItem[]> = {
  school_admin: [
    { label: 'Dashboard', href: '/dashboard/school-admin', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/school-admin/students', icon: Users },
    { label: 'Teachers', href: '/dashboard/school-admin/teachers', icon: Users },
    { label: 'Academics', href: '/dashboard/school-admin/timetable', icon: BookOpen },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
  admin_staff: [
    { label: 'Dashboard', href: '/dashboard/admin-staff', icon: LayoutDashboard },
    { label: 'Profile', href: '/dashboard/admin-staff/profile', icon: Users },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
  teacher: [
    { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { label: 'Classes', href: '/dashboard/teacher/my-classes', icon: BookOpen },
    { label: 'Attendance', href: '/dashboard/teacher/attendance', icon: CheckSquare },
    { label: 'Grades', href: '/dashboard/teacher/grades', icon: ClipboardList },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'AI Chat', href: '/dashboard/student/ai-chat', icon: Sparkles },
    { label: 'Grades', href: '/dashboard/student/results', icon: ClipboardList },
    { label: 'Fees', href: '/dashboard/student/fees', icon: DollarSign },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
  super_admin: [
    { label: 'Dashboard', href: '/dashboard/school-admin', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/school-admin/students', icon: Users },
    { label: 'Teachers', href: '/dashboard/school-admin/teachers', icon: Users },
    { label: 'Academics', href: '/dashboard/school-admin/timetable', icon: BookOpen },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
}

export function MobileBottomNav() {
  const { user } = useAuthContext()
  const { toggleSidebar } = useMobileToggle()
  const pathname = usePathname()

  if (!user) return null

  const isFullAccess = ['super_admin', 'school_admin'].includes(user.role || '')
  const userPermissions = user.permissions || []

  const filterMobileItem = (item: NavItem): boolean => {
    if (['teacher', 'student'].includes(user.role || '') || isFullAccess || item.isMenu) return true
    const permission = MOBILE_NAV_PERMISSION_MAP[item.label]
    return userPermissions.includes(permission)
  }

  const items =
    navItems[user.role as keyof typeof navItems]
      ?.filter(filterMobileItem)
      .slice(0, 4) || []

  return (
    <nav className="md:hidden fixed bottom-4 left-0 right-0 z-20 flex justify-center px-4">
      {/* Floating Container */}
      <div className="flex items-center justify-between w-full max-w-md h-16 px-2 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-black/60 shadow-xl border border-white/20">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href.split('#')[0])
          const isMenu = item.isMenu

          const baseClasses =
            "flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200"

          const activeClasses = isActive
            ? "text-primary scale-105"
            : "text-muted-foreground hover:text-foreground"

          const content = (
            <div
              className={`${baseClasses} ${activeClasses}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="mt-1 text-[11px] font-medium">
                {item.label}
              </span>
            </div>
          )

          if (isMenu) {
            return (
              <button
                key="menu"
                onClick={toggleSidebar}
                className="flex-1 h-full"
              >
                {content}
              </button>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full">
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}