/**
 * Minimal ambient typing for the globals injected by Crisp's chat loader
 * (`https://client.crisp.chat/l.js`).
 *
 * Crisp's loader reads `window.$crisp` (a command queue array) and augments it
 * with imperative helpers. We only depend on `push`, so that is all we type.
 */
import type { CrispCommand } from "./types"

export interface CrispQueue {
  push: (command: CrispCommand) => void
}

declare global {
  interface Window {
    /** Crisp command queue. Present as a plain array before the loader runs. */
    $crisp?: CrispQueue
    /** Crisp website id read by the loader. */
    CRISP_WEBSITE_ID?: string
    /** Callback invoked by the loader once it is ready (set by Crisp itself). */
    CRISP_READY_TRIGGER?: () => void
  }
}

export {}
