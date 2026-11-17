"use client"

import { BarChart3, BookOpen, MessageCircle, Users, Wallet } from "lucide-react"
import { motion } from "framer-motion"

const benefitGroups = [
  {
    title: "Academic Management",
    icon: BookOpen,
    benefits: [
      "Student & teacher registration and profiles",
      "Class & subject management",
      "Attendance tracking",
      "Timetable scheduling",
      "Exams scheduling",
    ],
  },
  {
    title: "Performance & Exams",
    icon: BarChart3,
    benefits: [
      "Exams & grading",
      "Report cards generation",
      "Result analytics",
      "Instant e-mail to parents on all exams update",
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    benefits: [
      "Manage fee type",
      "Record fees",
      "Fees receipt",
      "Invoice generation",
      "Expenses",
      "Instant e-mail notification to parents on all fees info update",
    ],
  },
  {
    title: "Staff Management",
    icon: Users,
    benefits: ["Admin staff onboarding", "Role & access control"],
  },
  {
    title: "Communication",
    icon: MessageCircle,
    benefits: [
      "Bulk e-mail and notification to parents and teachers",
      "Instant message broadcast to students, teachers and parents",
    ],
  },
]

export function SchoolAdminBenefitsSection() {
  return (
    <section className="w-full bg-background px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-4xl md:mb-14">
          <motion.h2
            className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Benefits for School Administrators
          </motion.h2>
          <motion.p
            className="mt-4 text-base leading-7 text-slate-600 md:text-xl md:leading-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          >
            Manage academics, exams, finances, staff, and school-wide communication
            from one connected platform.
          </motion.p>
        </div>

        <ol className="space-y-7 md:space-y-8">
          {benefitGroups.map(({ title, icon: Icon, benefits }, groupIndex) => (
            <li key={title} className="flex items-start gap-5 md:gap-6">
              <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 pt-0.5">
                <motion.h3
                  className="text-base font-semibold tracking-tight text-slate-900 md:text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {title}
                </motion.h3>
                <ul className="mt-1 space-y-1 text-sm leading-6 text-slate-600 md:text-base md:leading-7">
                  {benefits.map((benefit, benefitIndex) => (
                    <motion.li
                      key={benefit}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{
                        duration: 0.45,
                        delay: groupIndex * 0.04 + benefitIndex * 0.04,
                        ease: "easeOut",
                      }}
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}