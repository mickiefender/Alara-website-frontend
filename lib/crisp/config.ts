/**
 * Crisp configuration for the Alara frontend.
 *
 * PUBLIC configuration only. The Crisp *website id* is a public identifier
 * (it is embedded verbatim in the client-side loader script), so it is safe to
 * expose via a NEXT_PUBLIC_ env var.
 *
 * NEVER place the Crisp REST API identifier/key or the identity-verification
 * (HMAC) secret here - they are server-only secrets. This integration does not
 * need them: it only loads the widget and sets session data client-side.
 */

/** Crisp website id, read from the public env var. Empty string when unset. */
export const CRISP_WEBSITE_ID: string =
  process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim() ?? ""

/** True when the integration is configured and the Crisp widget can load. */
export const IS_CRISP_CONFIGURED: boolean = CRISP_WEBSITE_ID.length > 0

/** Official Crisp client loader. */
export const CRISP_SCRIPT_SRC = "https://client.crisp.chat/l.js"

/** DOM id used to guarantee the loader is injected at most once. */
export const CRISP_SCRIPT_ELEMENT_ID = "alara-crisp-loader"

/** Default label shown on the floating help button. */
export const CRISP_HELP_BUTTON_LABEL = "Alara Help"

/** Every dashboard route lives under this prefix. */
export const DASHBOARD_ROUTE_PREFIX = "/dashboard"

/**
 * In-app support page opened when the Crisp website id is not configured yet,
 * so the floating button is never a dead control.
 */
export const SUPPORT_FALLBACK_PATH = "/support"

/**
 * Roles that may see the floating help launcher: School Admins, Super Admins,
 * platform staff, and admin-staff officer roles.
 */
export const SUPPORT_ELIGIBLE_ROLES: ReadonlySet<string> = new Set([
  "school_admin",
  "super_admin",
  "platform_staff",
  "academic_admin",
  "exam_officer",
  "finance_officer",
  "ct_admin_support",
])
