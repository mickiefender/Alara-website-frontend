import { useSyncExternalStore } from "react"

/**
 * Global loading state manager.
 *
 * The single point of truth for the app-wide circular loader.
 * - `pending`: number of in-flight data (GET) requests tracked by the axios
 *   interceptor in lib/api.ts.
 * - `holds`: number of explicit holds (e.g. auth token validation on boot).
 *
 * The loader stays visible until BOTH are zero, which guarantees the loader
 * never finishes before the page data is actually ready.
 */

interface LoadingState {
  pending: number
  holds: number
}

let state: LoadingState = { pending: 0, holds: 0 }

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export const loadingManager = {
  beginRequest() {
    state = { ...state, pending: state.pending + 1 }
    emit()
  },
  endRequest() {
    state = { ...state, pending: Math.max(0, state.pending - 1) }
    emit()
  },
  hold() {
    state = { ...state, holds: state.holds + 1 }
    emit()
  },
  release() {
    state = { ...state, holds: Math.max(0, state.holds - 1) }
    emit()
  },
  getState(): LoadingState {
    return state
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

/** Server-safe snapshot used before hydration. */
const SERVER_SNAPSHOT: LoadingState = { pending: 0, holds: 0 }

/**
 * React hook for subscribing to the global loading state.
 * Safe to call from any client component.
 */
export function useGlobalLoadingState(): LoadingState {
  return useSyncExternalStore(
    (listener) => loadingManager.subscribe(listener),
    () => loadingManager.getState(),
    () => SERVER_SNAPSHOT
  )
}
