import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { PartnersSection } from "@/components/landing/partners-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { SchoolAdminBenefitsSection } from "@/components/landing/school-admin-benefits-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { Footer } from "@/components/footer"
import { AppShowcaseTimeline } from "@/components/AppShowcaseTimeline"
import { FaqSection } from "@/components/landing/faq-section"
import { FeaturedBlogSection } from "@/components/landing/featured-blog-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <PartnersSection />
        <AppShowcaseTimeline />
        <SchoolAdminBenefitsSection />
        <FaqSection />
        <FeaturedBlogSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
