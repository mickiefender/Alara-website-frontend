const PERMISSION_ALIASES: Record<string, string[]> = {
  "platform.audit": ["platform.audit", "audit.view"],
  "platform.analytics": ["platform.analytics", "analytics.view"],
  "platform.support": ["platform.support", "support.manage"],
  "platform.security": ["platform.security", "security.manage"],
  "platform.flags": ["platform.flags", "flags.manage"],
  "platform.settings": ["platform.settings", "settings.manage"],
  "platform.apikeys": ["platform.apikeys", "integrations.manage"],
  "platform.monitoring": ["platform.monitoring", "monitoring.view"],
  "finance.view": ["finance.view", "payments.manage", "subscriptions.manage"],
  "content.moderate": ["content.moderate", "moderation.manage"],
  "schools.view": ["schools.view", "schools.manage"],
  "users.view": ["users.view", "users.manage"],
}

export function hasPlatformPermission(
  permissions: string[] | undefined,
  required: string,
): boolean {
  if (!permissions) return false
  if (permissions.includes("*")) return true
  return (PERMISSION_ALIASES[required] || [required]).some((permission) =>
    permissions.includes(permission),
  )
}
