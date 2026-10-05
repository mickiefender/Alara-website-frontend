export const CHATWOOT_BASE_URL = (process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? "https://app.chatwoot.com").replace(/\/$/, "")
export const CHATWOOT_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim() ?? ""
export const CHATWOOT_WIDGET_COLOR = "#123A73"
export const CHATWOOT_HELP_BUTTON_LABEL = "Alara Help"
export const DASHBOARD_ROUTE_PREFIX = "/dashboard"
export const SUPPORT_FALLBACK_PATH = "/support"
export const SUPPORT_ELIGIBLE_ROLES: ReadonlySet<string> = new Set([
  "school_admin",
  "super_admin",
  "platform_staff",
  "academic_admin",
  "exam_officer",
  "finance_officer",
  "ct_admin_support",
])
