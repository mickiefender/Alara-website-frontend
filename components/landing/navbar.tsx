"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlaraLogo } from "@/components/alara-logo"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Join Team", href: "/join-team" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/contact" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [mobileOpen])

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <AlaraLogo
                height={48}
                width={226}
                className="h-12 w-auto"
                priority
                forceVariant="dark"
              />
              <span className="text-lg font-bold tracking-tight text-white">Alara</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Log In</Link>
              </Button>

             
            </div>

            {/* Mobile Menu Button */}
            <button
              className="text-white md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

          </div>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`mobile-menu-panel fixed inset-0 z-50 h-screen w-full bg-[#650d16] text-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <AlaraLogo height={40} width={180} className="h-10 w-auto" forceVariant="dark" />
            <span className="text-lg font-bold tracking-tight text-white">Alara</span>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Links (BIG) */}
        <nav className="flex flex-col gap-2 px-6 py-10">
          {navLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`mobile-nav-link rounded-2xl px-4 py-4 text-3xl font-semibold tracking-tight text-white/85 transition-colors hover:bg-white/10 hover:text-white ${
                mobileOpen ? "mobile-nav-link-visible" : ""
              }`}
              style={{ animationDelay: `${120 + index * 55}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="mt-auto flex flex-col gap-3 border-t border-white/15 px-6 pb-8 pt-6 sm:flex-row">
          <Button variant="outline" className="h-12 w-full rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>

          <Button
            className="h-12 w-full rounded-full border-0 bg-white text-red-800 hover:bg-red-50"
            asChild
          >
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      </aside>

      <style jsx>{`
        .mobile-menu-panel {
          display: flex;
          flex-direction: column;
        }

        .mobile-nav-link {
          opacity: 0;
          transform: translateY(14px);
        }

        .mobile-nav-link-visible {
          animation: mobileNavIn 450ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes mobileNavIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-menu-panel {
            transition: none;
          }

          .mobile-nav-link {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </>
  )
}