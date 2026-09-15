import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    description: "Everything a growing school needs to get organised.",
    price: "₵1,500",
    period: "/ year",
    features: ["Student and teacher management", "Attendance tracking", "Fee management", "Essential reports"],
    featured: false,
  },
  {
    name: "Professional",
    description: "Powerful tools for schools ready to work smarter.",
    price: "₵3,000",
    period: "/ year",
    features: ["Everything in Starter", "Performance analytics", "Parent communication", "AI question generator", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Flexible support and control for larger school groups.",
    price: "Let's talk",
    period: "",
    features: ["Everything in Professional", "Multi-school management", "Advanced integrations", "Dedicated onboarding", "Custom reporting"],
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-red-50/50 py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-red-200/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Simple, transparent pricing</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Choose the right plan for your school
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with the tools you need today and grow with Alara as your school evolves.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 shadow-sm ${
                plan.featured
                  ? "border-red-600 bg-red-700 text-white shadow-xl shadow-red-900/20 lg:-translate-y-3"
                  : "border-red-100 bg-white text-foreground"
              }`}
            >
              {plan.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-50">
                  Most popular
                </span>
              )}
              <h3 className={`text-xl font-bold ${plan.featured ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
              <p className={`mt-3 min-h-12 text-sm leading-6 ${plan.featured ? "text-red-100" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="mt-7 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className={`text-sm ${plan.featured ? "text-red-100" : "text-muted-foreground"}`}>{plan.period}</span>}
              </div>
              <Button
                asChild
                className={`mt-7 h-11 rounded-full ${
                  plan.featured
                    ? "bg-white text-red-700 hover:bg-red-50"
                    : "bg-red-700 text-white hover:bg-red-800"
                }`}
              >
                <Link href="/contact">
                  {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className={`my-7 h-px ${plan.featured ? "bg-white/20" : "bg-red-100"}`} />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-red-100" : "text-red-600"}`} />
                    <span className={plan.featured ? "text-red-50" : "text-muted-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
