'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const NextThemesProvider = dynamic(
  () => import('next-themes').then(mod => ({ default: mod.ThemeProvider })),
  { ssr: false }
)

interface ThemeProviderProps extends React.PropsWithChildren<Record<string, any>> {}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
