import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { ClientOnlyProviders } from "@/components/ClientOnlyProviders"
import { PageLoader } from "@/components/page-loader"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Alara | Professional School Management Software",
    template: "%s | Alara",
  },
  description:
    "Alara is the #1 multi-tenant SaaS for schools - seamless attendance, automated fees, AI question generation, live performance analytics, and instant communication. Transform school management today.",
  keywords:
    "school management software, school management system, attendance tracking, fee management, education SaaS, student performance, AI education tools",
  authors: [{ name: "Alara Team" }],
  creator: "Alara",
  publisher: "Alara",
  metadataBase: new URL("https://alara.school"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Alara - Professional School Management Software",
    description:
      "Multi-tenant SaaS platform for modern schools with attendance, fees, analytics, AI tools & more.",
    url: "/",
    siteName: "Alara",
    images: [
      {
        url: "/images/Hero-final.png",
        width: 1200,
        height: 630,
        alt: "Alara School Management Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alara - Professional School Management Software",
    description:
      "Transform your school with our all-in-one SaaS: attendance, fees, AI assessments, analytics.",
    images: ["/images/Hero-final.png"],
    creator: "@alara_edu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/Alara-app-icon.ico", sizes: "any" },
    ],
    shortcut: "/images/Alara-app-icon.ico",
    apple: [{ url: "/images/Alara-app-icon.ico" }],
  },
  verification: {
    google: "your-google-verification",
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#EC4899' },
      { media: '(prefers-color-scheme: dark)', color: '#A855F7' },
    ],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <PageLoader />
        <ClientOnlyProviders>{children}</ClientOnlyProviders>
        <Analytics />
        <Script
          id="alara-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Alara School Management Software",
              description:
                "Multi-tenant SaaS for schools: attendance, fees, AI questions, analytics, messaging.",
              applicationCategory: "EducationApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              featureList: [
                "Seamless Attendance",
                "Automated Fee Management",
                "AI Question Generator",
                "Live Performance Analytics",
                "Instant Communication",
              ],
              provider: {
                "@type": "Organization",
                name: "Alara",
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
