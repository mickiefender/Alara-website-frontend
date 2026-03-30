

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClientOnlyProviders } from "@/components/ClientOnlyProviders"




const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Management SaaS",
  description: "Multi-tenant school management system",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<html lang="en" suppressHydrationWarning>
        <body className={`font-sans antialiased`} suppressHydrationWarning>
<ClientOnlyProviders>{children}</ClientOnlyProviders>
        <Analytics />
      </body>
    </html>
  )
}

