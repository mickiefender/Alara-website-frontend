import Link from 'next/link'
import { ArrowRight, Facebook, Linkedin, Mail, Twitter } from 'lucide-react'
import { AlaraLogo } from '@/components/alara-logo'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/about#pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Alara', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#100d0e] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:76px_76px]" />
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-900/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-12 pt-16 sm:px-8 lg:grid-cols-[0.9fr_1fr_1.4fr] lg:gap-16 lg:px-12">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2.5">
            <AlaraLogo width={226} height={48} className="h-12 w-auto" forceVariant="dark" />
            <span className="text-xl font-bold tracking-tight">Alara</span>
          </Link>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/65">
            The smarter way to manage your school. Bring students, teachers,
            parents, and administrators together in one powerful platform.
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Stay in the loop</h3>
            <p className="mt-2 text-sm text-white/50">Get practical school management tips and product updates.</p>
            <form className="mt-4 flex max-w-md overflow-hidden rounded-full border border-white/15 bg-white/[0.04] p-1">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <Mail className="ml-4 mt-3 h-4 w-4 shrink-0 text-white/45" />
              <input id="footer-email" type="email" placeholder="Enter your email address" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40" />
              <button type="button" className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold transition hover:bg-red-500">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pt-2">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-5 text-sm font-semibold text-white">{group.title}</h3>
              <ul className="space-y-4 text-sm text-white/55">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-red-300">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative flex min-h-[300px] items-end justify-center overflow-hidden lg:min-h-[390px]">
          <img
            src="/images/footer mockup.png"
            alt="Alara mobile app screens"
            className="relative z-10 w-[min(92%,480px)] translate-y-16 object-contain sm:translate-y-24 lg:absolute lg:bottom-[-150px] lg:w-[110%]"
          />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 text-sm text-white/45 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p>© {currentYear} Alara by Vertex Blueprint Technology. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="mr-2 hidden sm:inline">Follow Alara</span>
            {[
              { label: 'LinkedIn', href: '#', icon: Linkedin },
              { label: 'Twitter', href: '#', icon: Twitter },
              { label: 'Facebook', href: '#', icon: Facebook },
            ].map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/65 transition hover:bg-red-600 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <ArrowRight className="ml-2 h-4 w-4 text-red-400" />
          </div>
        </div>
      </div>
    </footer>
  )
}
