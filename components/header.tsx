'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AlaraLogo } from '@/components/alara-logo'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-[#650d16] text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AlaraLogo
              width={226}
              height={48}
              className="h-12 w-auto"
              priority
              forceVariant="dark"
            />
            <span className="text-lg font-bold tracking-tight text-white">Alara</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="block text-primary-foreground hover:text-white/80">
              Home
            </Link>
            <Link href="/about" className="text-primary-foreground hover:text-white/80 transition">
              About
            </Link>
            <Link href="/blog" className="text-primary-foreground hover:text-white/80 transition">
              Blog
            </Link>
            <Link href="/careers" className="text-primary-foreground hover:text-white/80 transition">
              Careers
            </Link>
            <Link href="/join-team" className="text-primary-foreground hover:text-white/80 transition">
              Join Team
            </Link>
            <Link href="/contact" className="text-primary-foreground hover:text-white/80 transition">
              Contact
            </Link>
            <Link href="/support" className="text-primary-foreground hover:text-white/80 transition">
              Support
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="bg-white text-[#650d16] px-6 py-2 rounded-lg hover:bg-white/90 transition font-medium"
            >
              Schedule Demo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4">
            <Link href="/" className="block text-primary-foreground hover:text-white/80">
              Home
            </Link>
            <Link href="/about" className="block text-primary-foreground hover:text-white/80">
              About
            </Link>
            <Link href="/blog" className="block text-primary-foreground hover:text-white/80">
              Blog
            </Link>
            <Link href="/careers" className="block text-primary-foreground hover:text-white/80">
              Careers
            </Link>
            <Link href="/join-team" className="block text-primary-foreground hover:text-white/80">
              Join Team
            </Link>
            <Link href="/contact" className="block text-primary-foreground hover:text-white/80">
              Contact
            </Link>
            <Link href="/support" className="block text-primary-foreground hover:text-white/80">
              Support
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full bg-white text-[#650d16] px-4 py-2 rounded-lg hover:bg-white/90 transition font-medium"
            >
              Schedule Demo
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
