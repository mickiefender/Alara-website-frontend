"use client"

import Image from "next/image"

const schoolPartners = [
  { id: 1, name: "House Of Faith Int'l School", logo: "/logos/House-of-faith.png" },
  { id: 2, name: "Great Vision Int'l School", logo: "/logos/Great vision int'l.png" },
  { id: 3, name: "Olivia Academy", logo: "/logos/Olivia-Academy.png" },
  { id: 4, name: "Royal Power Preparatory", logo: "/logos/Royal power Preparatory.png" },
  { id: 5, name: "Happy Home Complex", logo: "/logos/Happy home complex.png" },
]

export function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Leading Schools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of schools across Africa that trust Alara for their management needs
          </p>
        </div>

        {/* LOGO SCROLLER */}
        <div className="relative w-full overflow-hidden">

          {/* Left Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

          {/* Right Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* SCROLL TRACK */}
          <div
            className="flex items-center gap-12 md:gap-16 lg:gap-20 w-max animate-scroll"
          >
            {/* FIRST SET */}
            {schoolPartners.map((partner) => (
              <div
                key={`${partner.id}-1`}
                className="flex-shrink-0 flex items-center justify-center h-24 md:h-32 lg:h-40"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            ))}

            {/* DUPLICATE SET (IMPORTANT: EXACT SAME) */}
            {schoolPartners.map((partner) => (
              <div
                key={`${partner.id}-2`}
                className="flex-shrink-0 flex items-center justify-center h-24 md:h-32 lg:h-40"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ANIMATION STYLE */}
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  )
}