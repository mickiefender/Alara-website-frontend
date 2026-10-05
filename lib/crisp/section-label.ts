import { DASHBOARD_ROUTE_PREFIX } from "./config"

/** Dashboard "areas" that appear directly under /dashboard/<area>. */
const DASHBOARD_AREAS = new Set([
  "dashboard",
  "school-admin",
  "super-admin",
  "admin-staff",
  "teacher",
  "student",
  "parent",
])

/** A path segment that should never be surfaced as a section label. */
function isOpaqueSegment(segment: string): boolean {
  // Pure numeric ids (e.g. /students/42) or long hex/uuid ids.
  return /^\d+$/.test(segment) || /^[0-9a-f]{8,}$/i.test(segment) || segment.length >= 32
}

/** "manage-fees" -> "Manage Fees" */
function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Derives a human readable dashboard section from a pathname, e.g.
 *   /dashboard/school-admin             -> "Dashboard"
 *   /dashboard/school-admin/students    -> "Students"
 *   /dashboard/school-admin/students/7  -> "Students"
 *   /dashboard/school-admin/manage-fees -> "Manage Fees"
 *   /dashboard/super-admin/analytics    -> "Analytics"
 */
export function deriveSectionFromPath(pathname: string): string {
  if (!pathname) return "Dashboard"

  const cleanPath = pathname.split("?")[0].split("#")[0]
  const segments = cleanPath.split("/").filter(Boolean)

  // Drop the leading "/dashboard" - every dashboard route starts with it.
  if (segments[0] === "dashboard") {
    segments.shift()
  } else if (cleanPath.startsWith(DASHBOARD_ROUTE_PREFIX)) {
    segments.shift()
  }

  // Drop the role area (school-admin, super-admin, ...) so it isn't repeated.
  if (segments.length > 0 && DASHBOARD_AREAS.has(segments[0])) {
    segments.shift()
  }

  const visible = segments.filter((segment) => !isOpaqueSegment(segment))
  if (visible.length === 0) return "Dashboard"

  return visible.map(humanizeSegment).join(" · ")
}
