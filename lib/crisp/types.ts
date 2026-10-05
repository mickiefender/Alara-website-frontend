/**
 * Shared types for the Alara <-> Crisp customer support integration.
 *
 * Only client-safe, public data flows through these types. No Crisp private
 * secrets (REST API identifier/key, identity verification token) ever live in
 * the frontend - those belong exclusively on the server.
 */

/** A single command pushed onto the Crisp command queue. */
export type CrispCommand = unknown[]

/** The logged-in school admin, mapped onto Crisp session data. */
export interface CrispIdentity {
  /** Full display name (first + last name). */
  name: string
  /** Account email - Crisp's primary identity key. */
  email: string
  /** Alara user id. */
  userId: string | number
  /** School (tenant) id. */
  schoolId: string | number | null
  /** School (tenant) display name. */
  schoolName: string | null
  /** Alara role, e.g. "school_admin". */
  role: string
}

/** The dashboard page/section the admin is currently viewing. */
export interface CrispPageContext {
  /** Full pathname, e.g. /dashboard/school-admin/students. */
  path: string
  /** Human readable section label, e.g. "Students". */
  section: string
}

/** Notified whenever the unread operator-message count changes. */
export type CrispUnreadListener = (count: number) => void

/**
 * Session-data keys passed to Crisp. Prefixed with `alara_` so operators can
 * recognise them at a glance in the Crisp inbox sidebar.
 */
export const CRISP_SESSION_KEYS = {
  app: "alara_app",
  userId: "alara_user_id",
  schoolId: "alara_school_id",
  schoolName: "alara_school_name",
  role: "alara_role",
  page: "alara_current_page",
  section: "alara_current_section",
} as const

export type CrispSessionKey = (typeof CRISP_SESSION_KEYS)[keyof typeof CRISP_SESSION_KEYS]

/** Builds the stable string used to detect identity changes. */
export function buildIdentityKey(identity: CrispIdentity): string {
  return [
    identity.name,
    identity.email,
    identity.userId,
    identity.schoolId ?? "",
    identity.schoolName ?? "",
    identity.role,
  ].join("\u0000")
}

/** Builds the stable string used to detect page-context changes. */
export function buildContextKey(context: CrispPageContext): string {
  return `${context.path}\u0000${context.section}`
}
