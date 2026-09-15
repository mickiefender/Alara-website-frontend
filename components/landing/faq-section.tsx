"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { platformAPI } from "@/lib/api"

type Faq = { id: number; question: string; answer: string }

const fallbackFaqs: Faq[] = [
  {
    id: 1,
    question: "What is Alara?",
    answer: "Alara is an all-in-one school management platform for student records, attendance, fees, communication, academics, and reporting.",
  },
  {
    id: 2,
    question: "Can Alara grow with my school?",
    answer: "Yes. Alara supports schools as they grow, with plans and tools that can adapt to more users, classes, and campuses.",
  },
  {
    id: 3,
    question: "How do I get started?",
    answer: "Contact our team to schedule a demo and find the right setup for your school.",
  },
]

export function FaqSection() {
  const [faqs, setFaqs] = useState(fallbackFaqs)
  const [openId, setOpenId] = useState<number | null>(fallbackFaqs[0].id)

  useEffect(() => {
    platformAPI.publicFaqs()
      .then((response) => {
        const items = response.data?.faqs
        if (Array.isArray(items) && items.length > 0) {
          setFaqs(items)
          setOpenId(items[0].id)
        }
      })
      .catch((error) => console.error("Failed to load FAQs", error))
  }, [])

  return (
    <section id="faq" className="bg-red-50/50 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Questions, answered</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about using Alara for your school.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const open = openId === faq.id
            return (
              <div key={faq.id} className="overflow-hidden rounded-2xl border border-red-100 bg-background shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-foreground"
                  aria-expanded={open}
                >
                  {faq.question}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-red-600 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <p className="border-t border-red-100 px-5 pb-5 pt-4 leading-7 text-muted-foreground">{faq.answer}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
