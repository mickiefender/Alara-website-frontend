"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const teamImages = [
  "/testimonial-img/GodwinSarfo.JPG",
  "/testimonial-img/nico-black&yellow.JPG",
  "/placeholder-user.jpg",
  "/placeholder-user.jpg",
]

function TypewriterHeading() {
  const fullText = "Simplify School Management."
  const [characterCount, setCharacterCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const isComplete = characterCount === fullText.length
    const isEmpty = characterCount === 0
    const delay = isComplete
      ? 2200
      : isEmpty && isDeleting
        ? 500
        : isDeleting
          ? 55
          : 95

    const timeout = window.setTimeout(() => {
      if (isComplete) {
        setIsDeleting(true)
      } else if (isEmpty && isDeleting) {
        setIsDeleting(false)
      } else {
        setCharacterCount((count) => count + (isDeleting ? -1 : 1))
      }
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [characterCount, isDeleting])

  const visibleText = fullText.slice(0, characterCount)
  const managementStart = "Simplify School ".length
  const plainText = visibleText.slice(0, managementStart)
  const highlightedText = visibleText.slice(managementStart)

  return (
    <h1 className="max-w-[10ch] text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
      {plainText}
      <span className="bg-gradient-to-r from-red-100 via-white to-orange-200 bg-clip-text text-transparent">
        {highlightedText}
      </span>
      <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-1 rounded-full bg-red-100/80 align-baseline animate-pulse" aria-hidden="true" />
    </h1>
  )
}

export function HeroSection() {
  return (
    <section className="pt-0">
      <div className="hero-shell relative isolate w-full overflow-hidden bg-[#650d16] text-white shadow-2xl shadow-red-950/30">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_48%,rgba(255,120,120,0.24),transparent_34%),linear-gradient(110deg,#650d16_0%,#a91624_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-8 px-6 pb-0 pt-28 sm:px-10 md:min-h-[720px] md:grid-cols-[0.9fr_1.1fr] md:px-14 md:pt-32 lg:min-h-[760px] lg:px-20">
          <div className="hero-copy order-2 max-w-xl pb-12 md:order-none md:pb-14">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-red-100">
              The smarter way to run your school
            </p>
            <TypewriterHeading />


            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-white px-7 text-red-800 shadow-lg shadow-red-950/30 transition hover:bg-red-50"
              >
                <Link href="/auth/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="h-12 rounded-full border border-white/15 px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#features">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Explore Alara
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-3" aria-label="Alara community members">
                {teamImages.map((image, index) => (
                  <Image
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                    width={38}
                    height={38}
                    className="h-9 w-9 rounded-full border-2 border-[#101431] object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-red-50/75">
                Trusted by schools building a better future
              </p>
            </div>
          </div>

          <div className="hero-person order-1 relative flex min-h-[330px] items-end justify-center self-end md:order-none md:min-h-[560px] md:justify-end">
            <div className="absolute bottom-8 right-[10%] h-64 w-64 rounded-full bg-red-300/25 blur-3xl md:h-96 md:w-96" />
            <Image
              src="/images/hero-person.png"
              alt="School administrator using Alara on a laptop"
              width={1344}
              height={700}
              priority
              className="relative z-10 w-[115%] max-w-none object-contain object-bottom md:absolute md:bottom-0 md:right-[-12%] md:w-[125%] lg:right-[-7%] lg:w-[115%]"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-shell {
          animation: heroFadeIn 700ms ease-out both;
        }

        .hero-copy {
          animation: slideInLeft 800ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-person {
          animation: slideInRight 900ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-orbit {
          position: absolute;
          z-index: -1;
          border: 1px solid rgba(255, 210, 210, 0.16);
          border-radius: 9999px;
          transform: rotate(-18deg);
        }

        .hero-orbit-one {
          right: 8%;
          top: 10%;
          width: 54%;
          height: 72%;
        }

        .hero-orbit-two {
          right: 2%;
          top: 18%;
          width: 58%;
          height: 72%;
          border-color: rgba(255, 190, 190, 0.1);
        }

        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-56px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(72px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-shell,
          .hero-copy,
          .hero-person {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
