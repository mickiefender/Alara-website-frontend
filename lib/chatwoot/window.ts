export interface ChatwootSDK {
  run: (config: Record<string, unknown>) => void
}

export interface ChatwootWidget {
  toggle: (action?: "open" | "close") => void
  setUser?: (
    identifier: string,
    user: {
      name?: string
      email?: string
      avatar_url?: string
      phone_number?: string
    },
  ) => void
  setCustomAttributes?: (attributes: Record<string, string | number | boolean | null>) => void
}

export interface ChatwootSettings {
  position?: "right" | "left"
  type?: "standard" | "expanded_bubble"
  widgetColor?: string
  launcherTitle?: string
  hideMessageBubble?: boolean
  [key: string]: unknown
}

declare global {
  interface Window {
    chatwootSDK?: ChatwootSDK
    chatwootSettings?: ChatwootSettings
    $chatwoot?: ChatwootWidget
  }
}

export {}
