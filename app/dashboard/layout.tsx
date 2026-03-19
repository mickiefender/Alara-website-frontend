"use client"

import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"
import { ProtectedRoute } from "@/lib/protected-route"
import { NotificationProvider } from "@/lib/notifications-context"
import { useAuthContext } from "@/lib/auth-context"
import { useState } from "react"
import { Menu } from "lucide-react"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <NotificationProvider userId={user?.id}>
      <div className="flex h-screen bg-background dark:bg-slate-950 overflow-hidden">
        {/* Desktop Sidebar - Flex item that can collapse */}
        <div 
          className={`hidden lg:block transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-20" : "w-72"}`}
        >
          <SidebarNav 
            isCollapsed={sidebarCollapsed} 
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* Mobile Sidebar - Full screen overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            {/* Sidebar */}
            <div className="absolute left-0 top-0 h-[100dvh] w-[85%] max-w-[320px] bg-slate-900 shadow-2xl overflow-y-auto overflow-x-hidden">
              <SidebarNav isMobile={true} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content - Flexes to fill remaining space */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Bar - includes hamburger for mobile */}
          <TopBar onMenuClick={() => setMobileOpen(true)} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  )
}
