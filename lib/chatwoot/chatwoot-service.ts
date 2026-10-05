import { CHATWOOT_BASE_URL, CHATWOOT_WIDGET_COLOR, CHATWOOT_WEBSITE_TOKEN } from "./config"
import type { ChatwootIdentity, ChatwootPageContext } from "./types"
import type { ChatwootSettings } from "./window"

const CHATWOOT_SCRIPT_ID = "alara-chatwoot-sdk"
let lastIdentity: ChatwootIdentity | null = null
let lastContext: ChatwootPageContext | null = null
let readyListenerRegistered = false

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "")
}

function buildSettings(): ChatwootSettings {
  return {
    position: "right",
    type: "standard",
    widgetColor: CHATWOOT_WIDGET_COLOR,
    launcherTitle: "Alara Help",
    hideMessageBubble: true,
  }
}

function getCustomAttributes(
  identity: ChatwootIdentity | null,
  context: ChatwootPageContext | null,
): Record<string, string | number | boolean | null> {
  return {
    alara_user_id: identity?.userId ?? "",
    school_id: identity?.schoolId ?? "",
    school_name: identity?.schoolName ?? "",
    role: identity?.role ?? "",
    current_path: context?.path ?? "",
    current_section: context?.section ?? "",
  }
}

function applyIdentity(): void {
  const widget = window.$chatwoot
  if (!widget || !lastIdentity) return

  const identifier = lastIdentity.userId
  if (identifier !== null && identifier !== undefined && widget.setUser) {
    widget.setUser(`alara-${identifier}`, {
      name: lastIdentity.name,
      email: lastIdentity.email ?? undefined,
    })
  }
  widget.setCustomAttributes?.(getCustomAttributes(lastIdentity, lastContext))
}

function onChatwootReady(): void {
  applyIdentity()
}

export function ensureChatwootLoaded(websiteToken?: string, baseUrl = CHATWOOT_BASE_URL): void {
  if (typeof window === "undefined") return

  const safeBaseUrl = normalizeBaseUrl(baseUrl || CHATWOOT_BASE_URL)
  const token = websiteToken?.trim() || CHATWOOT_WEBSITE_TOKEN
  if (!token) return

  window.chatwootSettings = {
    ...window.chatwootSettings,
    ...buildSettings(),
  }

  if (!readyListenerRegistered) {
    window.addEventListener("chatwoot:ready", onChatwootReady)
    readyListenerRegistered = true
  }

  const existingScript = document.getElementById(CHATWOOT_SCRIPT_ID)
  if (existingScript) {
    if (window.chatwootSDK) {
      window.chatwootSDK.run({ websiteToken: token, baseUrl: safeBaseUrl })
    }
    return
  }

  const script = document.createElement("script")
  script.id = CHATWOOT_SCRIPT_ID
  script.type = "text/javascript"
  script.async = true
  script.defer = true
  script.src = `${safeBaseUrl}/packs/js/sdk.js`
  script.onload = () => {
    if (window.chatwootSDK) {
      window.chatwootSDK.run({ websiteToken: token, baseUrl: safeBaseUrl })
    }
  }
  document.head.appendChild(script)
}

export function identifyChatwootUser(identity: ChatwootIdentity | null): void {
  if (typeof window === "undefined") return
  lastIdentity = identity
  window.chatwootSettings = {
    ...window.chatwootSettings,
    ...buildSettings(),
  }
  applyIdentity()
}

export function setChatwootContext(context: ChatwootPageContext | null): void {
  if (typeof window === "undefined") return
  lastContext = context
  window.chatwootSettings = {
    ...window.chatwootSettings,
    ...buildSettings(),
  }
  applyIdentity()
}

export function openChatwootChat(): void {
  if (typeof window === "undefined") return

  if (window.$chatwoot) {
    window.$chatwoot.toggle("open")
    return
  }

  const openWhenReady = () => {
    window.$chatwoot?.toggle("open")
  }
  window.addEventListener("chatwoot:ready", openWhenReady, { once: true })
}
