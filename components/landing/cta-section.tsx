import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/Hero-bg.jpg" // 👈 replace with your image path
          alt="CTA Background"
          className="w-full h-full object-cover scale-105 blur-sm"
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Optional soft glow (keeps modern look) */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
          Ready to Transform Your School?
        </h2>

        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto text-pretty">
          Start your free trial today. No credit card required. Cancel anytime. Join 10,000+ schools already using Alara.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="h-12 px-8 text-base bg-white text-[#6366f1] hover:bg-white/90 border-0 rounded-full shadow-xl font-semibold"
          >
            <Link href="/">
              Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>

          <Button
            size="lg"
            asChild
            variant="outline"
            className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}