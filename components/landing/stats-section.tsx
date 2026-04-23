"use client"

const topRowStats = [
  { number: "12", label: "Schools Using Alara" },
  { number: "473", label: "Students Onboarded" },
  { number: "99.9%", label: "System Uptime" },
  { number: "11", label: "Courses/Subjects Managed" },
  { number: "99% Uptime", label: "System Reliability" },
  { number: "42", label: "Parents Connected" },
]

const bottomRowStats = [
  { number: "82", label: "Teachers Registered" },
  { number: "190+", label: "Daily Active Users" },
  { number: "+25% Growth", label: "Monthly Growth Rate" },
  { number: "82%", label: "Retention Rate" },
  { number: "4", label: "Cities/Regions Covered" },
  { number: "100%", label: "Data Encrypted" },
]

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="relative flex-shrink-0 w-[180px] md:w-[220px] h-[90px] md:h-[110px] rounded-2xl bg-[#008484]/15 border border-[#008484]/30 backdrop-blur-sm flex items-center justify-center gap-3 px-4 shadow-lg shadow-[#008484]/10 hover:bg-[#008484]/25 transition-colors duration-300">
      <span className="text-3xl md:text-4xl font-bold text-white">{number}</span>
      <span className="text-xs md:text-sm text-white/70 max-w-[80px] leading-tight">
        {label}
      </span>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-[#001a1a] overflow-hidden relative w-full">
      
      {/* 🔥 Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#008484]/15 rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#008484]/5 via-transparent to-[#008484]/5" />
      </div>

      <div className="relative z-10 px-4 w-full">
        
        {/* 🔥 Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Empowering Education with Data-Driven Insights
          </h2>
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00b3b3]">
              Transforming Schools, One Insight at a Time
          </p>
        </div>

        {/* 🔥 Top Row */}
        <div className="relative mb-4 md:mb-6 overflow-hidden">
          
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#001a1a] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#001a1a] to-transparent z-10" />

          <div className="flex gap-4 animate-marquee-left">
            {[...topRowStats, ...topRowStats, ...topRowStats].map((stat, index) => (
              <StatCard key={`top-${index}`} number={stat.number} label={stat.label} />
            ))}
          </div>
        </div>

        {/* 🔥 Bottom Row */}
        <div className="relative overflow-hidden">
          
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#001a1a] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#001a1a] to-transparent z-10" />

          <div className="flex gap-4 animate-marquee-right">
            {[...bottomRowStats, ...bottomRowStats, ...bottomRowStats].map((stat, index) => (
              <StatCard key={`bottom-${index}`} number={stat.number} label={stat.label} />
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 Animation Styles */}
      <style jsx>{`
        @keyframes marqueeLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marqueeRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        /* 🚀 SPEED SETTINGS */
        .animate-marquee-left {
          animation: marqueeLeft 8s linear infinite;
        }

        .animate-marquee-right {
          animation: marqueeRight 10s linear infinite;
        }
      `}</style>
    </section>
  )
}