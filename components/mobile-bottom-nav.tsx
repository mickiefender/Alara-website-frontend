"use client"

import { useAuthContext } from '@/lib/auth-context'
import { useMobileToggle } from '@/lib/mobile-toggle-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, LayoutDashboard, Users, BookOpen, CheckSquare, ClipboardList, CalendarDays, DollarSign } from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isMenu?: boolean
}

const navItems: Record<string, NavItem[]> = {
  school_admin: [
    { label: 'Dashboard', href: '/dashboard/school-admin', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/school-admin/students', icon: Users },
    { label: 'Teachers', href: '/dashboard/school-admin/teachers', icon: Users },
    { label: 'Academics', href: '/dashboard/school-admin/timetable', icon: BookOpen },
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
    { label: 'Timetable', href: '/dashboard/student/timetable', icon: CalendarDays },
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
    { label: 'Academics', href: '/dashboard/school-admin/timetable', icon: BookOpen },
    { label: 'More', href: '#', icon: Menu, isMenu: true },
  ],
}

export function MobileBottomNav() {
  const { user } = useAuthContext()
  const { toggleSidebar } = useMobileToggle()
  const pathname = usePathname()

  if (!user) return null

  const items = navItems[user.role as keyof typeof navItems] || []

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sidebar-border z-40 shadow-2xl pb-[env(safe-area-inset-bottom)">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href.split('#')[0])
          const isMenu = item.isMenu

          return isMenu ? (
            <button
              key="menu"
              onClick={toggleSidebar}
              className={`flex flex-col items-center justify-center w-full h-16 text-xs transition-colors rounded-lg ${
                isActive
                  ? 'bg-transparent text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
              aria-label="Open sidebar"
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          ) : (
            <Link key={item.href} href={item.href} className="w-full flex\">
              <button
                className={`flex flex-col items-center justify-center w-full h-16 text-xs transition-colors rounded-lg ${
                  isActive
                    ? 'bg-transparent text-secondary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mb-1\" />
                <span className="text-xs font-medium\">{item.label}</span>
              </button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

