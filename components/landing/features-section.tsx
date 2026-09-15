"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const features = [
  {
    id: 1,
    title: "Smart Attendance",
    description:
      "Track student attendance in real-time with mobile check-in and automated parent notifications.",
    image: "/Featured-section/Attendance-page.png",
    color: "#dc2626",
  },
  {
    id: 2,
    title: "Performance Analytics",
    description:
      "Comprehensive dashboards with actionable insights into student and class performance.",
    image: "/Featured-section/Performance-analytics.png",
    color: "#ef4444",
  },
  {
    id: 3,
    title: "Fee Management",
    description:
      "Complete fee assignment, online payments, automated receipts, and balance tracking.",
    image: "/Featured-section/Fees-management.png",
    color: "#f05252",
  },
  {
    id: 4,
    title: "AI Question Generator",
    description:
      "Generate practice questions and quizzes in seconds using our AI-powered system. Input a topic or upload a document to get customized questions with instant feedback.",
    image: "/Featured-section/Ai.png",
    color: "#b91c1c",
  },
  {
    id: 5,
    title: "Student Management",
    description:
      "Manage student profiles, enrollment, and academic records with ease. Get a full view of each student's academic journey and performance trends.",
    image: "/Featured-section/Student management page.png",
    color: "#991b1b",
  },
]

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActiveIndex((prev) => (prev - 1 + features.length) % features.length)
      if (e.key === "ArrowRight") setActiveIndex((prev) => (prev + 1) % features.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section id="features" className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#7f111b_0%,#b91c2b_48%,#8f1622_100%)] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(255,180,180,0.18),transparent_32%)]" aria-hidden="true" />
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Upgrade Your{" "}
            <span className="bg-gradient-to-r from-red-700 via-red-500 to-orange-500 bg-clip-text text-transparent">
              School
            </span>{" "}
            With Our Top Features
          </h2>
        </div>

        {/* Carousel - Fixed height container with proper constraints */}
        <div className="relative w-full flex flex-col gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center transition-all duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100 visible" : "opacity-0 invisible absolute inset-0"
              }`}
            >
              {/* Image */}
              <div className="flex justify-center order-2 md:order-1">
                <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={500}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority={index === 0}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: `linear-gradient(135deg, ${feature.color}, transparent)` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-6 order-1 md:order-2">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-200 bg-red-50 shadow-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: feature.color }} />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">{feature.title}</h3>
                    <p className="text-base leading-relaxed text-red-50/85 md:text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3 pt-4">
                  {["Real-time updates", "Seamless integration", "24/7 Support"].map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-600" />
                      <span className="text-sm text-white/90">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === activeIndex ? "var(--primary)" : "var(--muted-foreground)",
                opacity: index === activeIndex ? 1 : 0.4,
                transform: index === activeIndex ? "scale(1.2)" : "scale(1)",
              }}
              aria-label={`View feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
