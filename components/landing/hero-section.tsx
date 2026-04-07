"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"

// 🔥 Typewriter Component
function TypewriterHeading({ className }: { className: string }) {
  const texts = [
    "Manage Attendance Seamlessly",
    "Track Fees Effortlessly",
    "Use Ai Question Generator",
    "Monitor Performance Live",
    "Communicate Instantly",
  ] as const

  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing")
  const [charIndex, setCharIndex] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout>()
  const config = {
    typeSpeed: 80,
    deleteSpeed: 50,
    pauseDuration: 2000,
  } as const

  const updateDisplay = useCallback(() => {
    const currentText = texts[currentIndex]
    const currentLength = currentText.length

    if (phase === "typing") {
      if (charIndex < currentLength) {
        setDisplayText(currentText.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      } else {
        setPhase("pausing")
      }
    } else if (phase === "deleting") {
      if (charIndex > 0) {
        setDisplayText(currentText.slice(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      } else {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setPhase("typing")
        setDisplayText("")
      }
    } else {
      setTimeout(() => setPhase("deleting"), config.pauseDuration)
    }
  }, [currentIndex, charIndex, phase])

  useEffect(() => {
    intervalRef.current = setInterval(updateDisplay, config.typeSpeed)
    return () => clearInterval(intervalRef.current)
  }, [updateDisplay])

  const cursorBlink =
    "ml-1 inline-block w-[2px] h-7 bg-gradient-to-b from-white/80 to-transparent animate-pulse"

  const lastSpaceIndex = displayText.lastIndexOf(" ")
  const baseText =
    lastSpaceIndex > 0 ? displayText.slice(0, lastSpaceIndex) : displayText
  const gradientText =
    lastSpaceIndex > 0 ? ` ${displayText.slice(lastSpaceIndex + 1)}` : ""

  return (
    <div className={className}>
      <span className="text-white">{baseText}</span>
      {gradientText && (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-200 font-bold">
          {gradientText}
        </span>
      )}
      <span className={cursorBlink} aria-hidden />
    </div>
  )
}

// 🔥 Hero Section
export function HeroSection() {
  return (
    <section className="relative pt-16 md:pt-20 lg:pt-28 pb-0 overflow-hidden">
      
      {/* 🔥 Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/Hero-grid.png"
          alt="Background"
          fill
          priority
          className="object-cover blur-[1.5px] animate-[zoomBg_20s_ease-in-out_infinite]"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-black/70" />
      </div>

      {/* 🔥 Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-0 leading-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-[80px] md:h-[100px]"
        >
          <path
            d="M0,40 Q300,80 600,60 T1200,40 L1200,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* 🔥 Content */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
          
          {/* Left */}
          <div className="flex flex-col justify-center py-12 md:py-0">
            <TypewriterHeading className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white leading-snug mb-6" />


            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-base bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 border-0 rounded-lg font-semibold shadow-lg hover:shadow-xl transition w-full sm:w-auto"
              >
                <Link href="/auth/register">Login</Link>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex items-center justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
              <Image
                src="/Featured-section/Purple and White Gradient Business Marketing Presentation Device Mockup Instagram Post (1).png"
                alt="School management app"
                width={500}
                height={600}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 Custom Animation (NO tailwind config needed) */}
      <style jsx>{`
        @keyframes zoomBg {
          0% {
            transform: scale(1.05) translateY(0px);
          }
          50% {
            transform: scale(1.12) translateY(-10px);
          }
          100% {
            transform: scale(1.05) translateY(0px);
          }
        }
      `}</style>
    </section>
  )
}