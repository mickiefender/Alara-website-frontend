import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { PartnersSection } from "@/components/landing/partners-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
