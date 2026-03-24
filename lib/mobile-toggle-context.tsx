"use client"

import { createContext, useContext, ReactNode } from 'react'

interface MobileToggleContextType {
  toggleSidebar: () => void
}

const MobileToggleContext = createContext<MobileToggleContextType | undefined>(undefined)

export function MobileToggleProvider({ children, toggleSidebar }: { children: ReactNode; toggleSidebar: () => void }) {
  return (
    <MobileToggleContext.Provider value={{ toggleSidebar }}>
      {children}
    </MobileToggleContext.Provider>
  )
}

export function useMobileToggle() {
  const context = useContext(MobileToggleContext)
  if (context === undefined) {
    throw new Error('useMobileToggle must be used within a MobileToggleProvider')
  }
  return context
}

