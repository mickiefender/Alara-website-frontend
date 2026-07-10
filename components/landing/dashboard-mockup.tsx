import Image from "next/image"

export function DashboardMockup() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Main dashboard image */}
      <div className="relative rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-white/20">
        <Image
          src="/images/dashboard-mockup.jpg"
          alt="Alara school management dashboard showing student statistics, attendance tracking, fee collection, and performance analytics"
          width={1200}
          height={700}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Floating profile card (left) */}
      <div className="absolute -left-4 md:-left-16 top-6 md:top-12 w-40 md:w-48 hidden md:block rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <Image
          src="/images/profile-card.jpg"
          alt="Vice Principal John Taled profile card with messaging option"
          width={240}
          height={280}
          className="w-full h-auto"
        />
      </div>

      {/* Floating calendar card (right) */}
      <div className="absolute -right-4 md:-right-12 top-2 md:top-8 w-36 md:w-44 hidden md:block rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <Image
          src="/images/calendar-card.jpg"
          alt="January 2025 calendar widget showing highlighted school events"
          width={220}
          height={240}
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}
