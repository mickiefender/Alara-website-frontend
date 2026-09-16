"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/auth-context"
import { hasPlatformPermission } from "@/lib/platform-permissions"
import { AlaraLogo } from "@/components/alara-logo"
import {
  Activity,
  UserPlus,
  BookOpen,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Building2,
  Database,
  FileText,
  Flag,
  KeyRound,
  LifeBuoy,
  Lock,
  ScrollText,
  Settings,
  ImagePlus,
  Inbox,
  HelpCircle,
  ShieldCheck,
  Users,
  UserCog,
  Wallet,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react"

export const NAV_GROUPS: Array<{
  label: string
  items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission?: string }>
}> = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard/super-admin", label: "Dashboard", icon: BarChart3 },
      { href: "/dashboard/super-admin/schools", label: "Schools", icon: Building2, permission: "schools.view" },
      { href: "/dashboard/super-admin/compliance", label: "Compliance", icon: ClipboardCheck, permission: "compliance.view" },
      { href: "/dashboard/super-admin/compliance-documents", label: "Compliance Documents", icon: FileText, permission: "compliance.view" },
      { href: "/dashboard/super-admin/users", label: "Users", icon: Users, permission: "users.view" },
      { href: "/dashboard/super-admin/roles", label: "Roles & Permissions", icon: UserCog, permission: "platform.roles" },
      { href: "/dashboard/super-admin/admin-staff", label: "Staff Administrators", icon: UserPlus, permission: "platform.staff" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/dashboard/super-admin/subscriptions", label: "Subscriptions & Plans", icon: BadgeDollarSign, permission: "finance.view" },
      { href: "/dashboard/super-admin/payments", label: "Payments & Finance", icon: Wallet, permission: "finance.view" },
      { href: "/dashboard/super-admin/analytics", label: "Analytics", icon: FileText, permission: "platform.analytics" },
      { href: "/dashboard/super-admin/reports", label: "Reports", icon: FileText, permission: "platform.audit" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/super-admin/moderation", label: "Content Moderation", icon: ShieldCheck, permission: "content.moderate" },
      { href: "/dashboard/super-admin/notifications", label: "Notifications", icon: Bell, permission: "platform.notifications" },
      { href: "/dashboard/super-admin/sms", label: "SMS Messaging", icon: MessageSquare, permission: "platform.notifications" },
      { href: "/dashboard/super-admin/support", label: "Support Center", icon: LifeBuoy, permission: "platform.support" },
      { href: "/dashboard/super-admin/contact-inquiries", label: "Contact Inquiries", icon: Inbox, permission: "content.contact" },
      { href: "/dashboard/super-admin/faqs", label: "Homepage FAQs", icon: HelpCircle, permission: "content.manage" },
      { href: "/dashboard/super-admin/blog", label: "Blog Posts", icon: BookOpen, permission: "content.manage" },
      { href: "/dashboard/super-admin/audit-logs", label: "Audit Logs", icon: ScrollText, permission: "platform.audit" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/super-admin/settings", label: "System Settings", icon: Settings, permission: "platform.settings" },
      { href: "/dashboard/super-admin/trusted-schools", label: "Trusted Schools", icon: ImagePlus, permission: "content.manage" },
      { href: "/dashboard/super-admin/feature-flags", label: "Feature Flags", icon: Flag, permission: "platform.flags" },
      { href: "/dashboard/super-admin/storage", label: "Storage Management", icon: Database, permission: "platform.storage" },
      { href: "/dashboard/super-admin/security", label: "Security Center", icon: Lock, permission: "platform.security" },
      { href: "/dashboard/super-admin/monitoring", label: "Monitoring", icon: Activity, permission: "platform.monitoring" },
      { href: "/dashboard/super-admin/integrations", label: "API & Integrations", icon: KeyRound, permission: "platform.apikeys" },
    ],
  },
]

export function PlatformSidebar() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const canSee = (permission?: string) =>
    user?.role === "super_admin" || !permission || hasPlatformPermission(user?.platform_permissions, permission)
  const visibleGroups = NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item.permission)) }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen overflow-y-auto w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <AlaraLogo width={36} height={36} className="h-9 w-9 object-contain shrink-0" forceVariant="dark" />
        <div>
          <p className="text-sm font-bold tracking-tight text-foreground">Alara Platform</p>
          <p className="text-[11px] text-muted-foreground">Super Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard/super-admin"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="sa-nav-link"
                    data-active={active}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          Every sensitive action is recorded in the audit log.
        </p>
      </div>
    </aside>
  )
}
