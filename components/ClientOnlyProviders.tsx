"use client"

import dynamic from 'next/dynamic'

const ClientProviders = dynamic(
  () => import('./ClientProviders').then((mod) => mod.ClientProviders),
  { ssr: false }
)

interface ClientOnlyProvidersProps {
  children: React.ReactNode
}

export function ClientOnlyProviders({ children }: ClientOnlyProvidersProps) {
  return <ClientProviders>{children}</ClientProviders>
}
