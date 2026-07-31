'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type ShowcaseStep = {
  id: string
  number: string
  title: string
  description: string
  image: string
}

const showcaseSteps: ShowcaseStep[] = [
  {
    id: 'Feed',
    number: '01',
    title: 'Find learning feed contents',
    description: 'Find learning feed contents from the feed screen, you can also search for a specific content by using the search bar.',
    image: '/Featured-section/feed.png',
  },
  {
    id: 'feed upload',
    number: '02',
    title: 'Feed Upload',
    description: 'Any authenticated teacher can create content and upload it to the feed.',
    image: '/Featured-section/feed-upload.png',
  },
  {
    id: 'Student Attendance',
    number: '03',
    title: 'Student Attendance',
    description: 'Parents can see daily attendace of their kids.',
    image: '/Featured-section/student-attendance.png',
  },
  
  {
    id: 'Student Dashboard',
    number: '04',
    title: 'Student Dashboard',
    description: 'The student dashboard displaying summary of attendce, grade, fees, assignments, etc.',
    image: '/Featured-section/student-dashboafrd.png',
  },
  {
    id: 'Teacher Attendance',
    number: '05',
    title: 'Teacher Attendance',
    description: 'Teacher can mark attendance of students from this screen. Attendance records will be kept for future reference.',
    image: '/Featured-section/Teacher-attendance.png',
  },
  {
    id: 'Teacher Dashboard',
    number: '06',
    title: 'Teacher Dashboard',
    description: 'Teacher dashboard showing summary of students attendance overview, assignments, grades, etc.',
    image: '/Featured-section/teacher-dashboard.png',
  },
]

export function AppShowcaseTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeStep = useMemo(() => showcaseSteps[activeIndex], [activeIndex])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseSteps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-[#0b1114]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(8,152,162,0.32),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(7,102,124,0.28),transparent_45%),linear-gradient(120deg,#0a1013_0%,#0f171b_45%,#0a1215_100%)]" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-[0.03] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-white text-3xl md:text-5xl font-bold mb-8">
            Some of our features
            </h2>

            <div className="relative w-[280px] sm:w-[320px] md:w-[380px] mx-auto lg:mx-0">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="relative aspect-[9/19]">
                  <Image
                    src={activeStep.image}
                    alt={activeStep.title}
                    fill
                    className="object-contain transition-opacity duration-500"
                    sizes="(max-width: 768px) 280px, 380px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-sm md:text-base text-white/80 mb-10 max-w-xl">
             These are some features you'll find in the Alara app. Alara is not just a school management app, it is a complete solution for managing your school, from student attendance to teacher management, and even payment processing.   
            </p>

            <div className="relative pl-14">
              <div className="absolute left-5 top-2 bottom-2 w-px bg-white/15" />
              <div
                className="absolute left-5 w-px bg-primary transition-all duration-500"
                style={{
                  top: `${activeIndex * 94 + 8}px`,
                  height: '72px',
                }}
              />

              <div className="space-y-8">
                {showcaseSteps.map((step, index) => {
                  const active = index === activeIndex
                  return (
                    <div key={step.id} className="relative min-h-[64px]">
                      <span
                        className={`absolute -left-[41px] top-[8px] w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                          active
                            ? 'bg-white border-primary shadow-[0_0_0_4px_rgba(8,152,162,0.35)]'
                            : 'bg-[#0f171b] border-white/25'
                        }`}
                      />
                      <p className={`text-sm font-bold mb-1 ${active ? 'text-white' : 'text-white/35'}`}>
                        {step.number}
                      </p>
                      <h3 className={`text-2xl font-semibold mb-1 transition-colors ${active ? 'text-white' : 'text-white/35'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm md:text-base max-w-lg transition-colors ${active ? 'text-white/80' : 'text-white/25'}`}>
                        {step.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
