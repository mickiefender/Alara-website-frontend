/**
 * Client-side Crisp service.
 *
 * A thin, framework-agnostic wrapper around Crisp's public JS API. It is a
 * module singleton, so state (unread count, last applied identity/context)
 * survives Next.js client-side navigation between dashboard routes.
 *
 * Responsibilities:
 *  - lazily inject the Crisp loader at most once,
 *  - identify the school admin (name, email, id, school, role),
 *  - report the current dashboard page/section,
 *  - track unread operator messages and expose an open-chat action.
 */
import { CRISP_SCRIPT_ELEMENT_ID, CRISP_SCRIPT_SRC } from "./config"
import { type CrispQueue } from "./crisp-window"
import "./crisp-window"
import {
  CRISP_SESSION_KEYS,
  type CrispCommand,
  type CrispIdentity,
  type CrispPageContext,
  type CrispUnreadListener,
} from "./types"

const UNREAD_STORAGE_KEY = "alara_crisp_unread_count"

let injectedWebsiteId: string | null = null
let eventsRegistered = false
let unreadCount = 0
let isChatOpen = false
let lastIdentity: CrispIdentity | null = null
let lastContext: CrispPageContext | null = null

const unreadListeners = new Set<CrispUnreadListener>()

/** Returns the Crisp command queue, creating it if the loader has not run yet. */
function getQueue(): CrispQueue | null {
  if (typeof window === "undefined") return null
  if (!window.$crisp) {
    // Crisp's loader expects a plain array it can augment; this mirrors the
    // official snippet (`window.$crisp = []`) before the script executes.
    window.$crisp = [] as unknown as CrispQueue
  }
  return window.$crisp
}

/** Pushes a single command onto the Crisp queue (safe before the loader runs). */
function push(command: CrispCommand): void {
  getQueue()?.push(command)
}

/** Converts identity + context into Crisp `session:data` key/value pairs. */
function toSessionPairs(
  identity: CrispIdentity | null,
  context: CrispPageContext | null,
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [[CRISP_SESSION_KEYS.app, "alara"]]

  if (identity) {
    pairs.push([CRISP_SESSION_KEYS.userId, String(identity.userId)])
    pairs.push([CRISP_SESSION_KEYS.role, identity.role])
    if (identity.schoolId !== null && identity.schoolId !== undefined) {
      pairs.push([CRISP_SESSION_KEYS.schoolId, String(identity.schoolId)])
    }
    if (identity.schoolName) {
      pairs.push([CRISP_SESSION_KEYS.schoolName, identity.schoolName])
    }
  }

  if (context) {
    pairs.push([CRISP_SESSION_KEYS.page, context.path])
    pairs.push([CRISP_SESSION_KEYS.section, context.section])
  }

  return pairs
}

/** Applies the email + nickname identity fields to the Crisp user profile. */
function applyIdentity(identity: CrispIdentity): void {
  const name = identity.name.trim()
  if (name) push(["set", "user:nickname", [name]])
  if (identity.email) push(["set", "user:email", [identity.email]])
}

/** Pushes the combined session data (identity + page context) to Crisp. */
function applySessionData(): void {
  const pairs = toSessionPairs(lastIdentity, lastContext)
  push(["set", "session:data", [pairs]])
}

/** Hides Crisp's default launcher so our own "Alara Help" button is the entry. */
export function hideDefaultLauncher(): void {
  push(["do", "chat:hide"])
}

/** Re-applies everything that Crisp resets when a new session initialises. */
function reapplySession(): void {
  if (lastIdentity) applyIdentity(lastIdentity)
  applySessionData()
  hideDefaultLauncher()
}

function persistUnread(value: number): void {
  try {
    sessionStorage.setItem(UNREAD_STORAGE_KEY, String(value))
  } catch {
    /* sessionStorage can be unavailable (private mode); the badge still works live. */
  }
}

function setUnread(next: number): void {
  const clamped = Math.max(0, Math.floor(next))
  unreadCount = clamped
  persistUnread(clamped)
  unreadListeners.forEach((listener) => listener(clamped))
}

/** Restores a persisted unread count for the current browser tab. */
export function hydrateUnreadCount(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = sessionStorage.getItem(UNREAD_STORAGE_KEY)
    if (raw) unreadCount = Math.max(0, parseInt(raw, 10) || 0)
  } catch {
    unreadCount = 0
  }
  return unreadCount
}

/** Registers Crisp event handlers exactly once. */
function registerEvents(): void {
  if (eventsRegistered) return
  eventsRegistered = true

  push(["on", "session:loaded", reapplySession])

  push([
    "on",
    "chat:opened",
    () => {
      isChatOpen = true
      setUnread(0)
    },
  ])

  push([
    "on",
    "chat:closed",
    () => {
      isChatOpen = false
      hideDefaultLauncher()
    },
  ])

  push([
    "on",
    "message:received",
    () => {
      if (!isChatOpen) setUnread(unreadCount + 1)
    },
  ])
}

/**
 * Injects the Crisp loader exactly once for the given website id. Idempotent:
 * repeated calls (route changes, re-renders) are cheap no-ops.
 */
export function ensureCrispLoaded(websiteId: string): void {
  if (typeof window === "undefined" || !websiteId) return

  getQueue()
  registerEvents()

  const alreadyInjected = document.getElementById(CRISP_SCRIPT_ELEMENT_ID)

  if (injectedWebsiteId === websiteId && alreadyInjected) return

  window.CRISP_WEBSITE_ID = websiteId
  injectedWebsiteId = websiteId

  if (alreadyInjected) return

  const script = document.createElement("script")
  script.id = CRISP_SCRIPT_ELEMENT_ID
  script.type = "text/javascript"
  script.src = CRISP_SCRIPT_SRC
  script.async = true
  script.setAttribute("data-cfasync", "false")
  document.head.appendChild(script)
}

/** Identifies the logged-in school admin to Crisp. */
export function identifyCrispUser(identity: CrispIdentity): void {
  lastIdentity = identity
  applyIdentity(identity)
  applySessionData()
}

/** Reports the current dashboard page/section to Crisp. */
export function setCrispContext(context: CrispPageContext): void {
  lastContext = context
  applySessionData()
}

/** Opens the Crisp chat widget and clears the unread badge. */
export function openCrispChat(): void {
  push(["do", "chat:show"])
  push(["do", "chat:open"])
  setUnread(0)
}

/** Subscribes to unread-count changes. Returns an unsubscribe function. */
export function subscribeUnreadCount(listener: CrispUnreadListener): () => void {
  unreadListeners.add(listener)
  const current = hydrateUnreadCount()
  listener(current)
  return () => {
    unreadListeners.delete(listener)
  }
}
