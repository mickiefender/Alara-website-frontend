import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Briefcase, TrendingUp, Users, Code, LineChart, Headset, Megaphone, Mail } from 'lucide-react'

export const metadata = {
  title: 'Careers at Alara | Join Our Team',
  description: 'Join Vertex Blueprint Technology and help transform education. Explore career opportunities at Alara.',
}

export default function CareersPage() {
  const hiringAreas = [
    {
      icon: Code,
      department: 'Engineering',
      description: 'Backend, frontend, and mobile engineers building and scaling the Alara platform.',
    },
    {
      icon: LineChart,
      department: 'Product',
      description: 'Product-minded people who understand how schools work and can turn that into great features.',
    },
    {
      icon: Headset,
      department: 'Customer Success',
      description: 'Helping schools get the most out of Alara, from onboarding to ongoing support.',
    },
    {
      icon: Megaphone,
      department: 'Sales & Marketing',
      description: 'Growing awareness of Alara and helping schools discover a better way to manage operations.',
    },
  ]

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Join Our Mission
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us transform education through thoughtful technology
              </p>
            </div>
          </div>
        </section>

        {/* Why Work Here */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">WHY ALARA</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Why Work With Us
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: 'Growth Opportunities',
                  description: 'Take on real ownership early, with room to grow as the team and product grow.',
                },
                {
                  icon: Users,
                  title: 'Collaborative Culture',
                  description: 'Work with a small, focused team that cares about making a real impact in education.',
                },
                {
                  icon: Briefcase,
                  title: 'Meaningful Work',
                  description: 'Build software that schools actually use every day to run their operations.',
                },
              ].map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="bg-muted p-8 rounded-lg hover:shadow-lg transition">
                    <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {[
                {
                  title: 'Work-Life Balance',
                  items: [
                    'Flexible remote-friendly work',
                    'Time off when you need it',
                    'Reasonable, sustainable pace',
                  ],
                },
                {
                  title: 'Professional Development',
                  items: [
                    'Room to work across the stack',
                    'Direct exposure to real customers and feedback',
                    'Say in the direction of the product',
                  ],
                },
              ].map((section, index) => (
                <div key={index} className="bg-primary/5 p-8 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-xl text-foreground mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm mb-2">OPPORTUNITIES</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance mb-4">
                Where You Could Fit In
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We don't always have specific openings listed, but we're regularly looking for people in these
                areas. Reach out and we'll follow up when there's a fit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hiringAreas.map((area, index) => {
                const Icon = area.icon
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg border border-border hover:shadow-lg hover:border-primary transition"
                  >
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{area.department}</h3>
                    <p className="text-muted-foreground text-sm">{area.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 bg-white p-8 rounded-lg border border-border text-center">
              <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-xl text-foreground mb-2">No open role that matches right now?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Send us your resume and a note about what you're interested in. We keep applications on file and
                reach out when something opens up.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>

        {/* Company Culture */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-primary font-semibold text-sm mb-2">OUR CULTURE</p>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                  Life at Alara
                </h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  We believe great products are built by people who work well together. Our culture is built on
                  trust, collaboration, and a shared commitment to transforming education.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We value diversity, encourage bold ideas, and support continuous learning. Every team member
                  has a voice, and every contribution matters.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Users, label: 'Collaborative' },
                  { icon: TrendingUp, label: 'Growth-Minded' },
                  { icon: Briefcase, label: 'Purpose-Driven' },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={index}
                      className="bg-muted rounded-lg p-6 text-center flex flex-col items-center justify-center gap-3"
                    >
                      <Icon className="w-8 h-8 text-primary" />
                      <span className="font-semibold text-foreground text-sm">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">HOW TO APPLY</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Our Hiring Process
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Reach Out',
                  description: 'Send your resume and a short note about what you\'re interested in.',
                },
                {
                  step: '2',
                  title: 'Conversation',
                  description: 'A call to talk through your background and what we\'re building.',
                },
                {
                  step: '3',
                  title: 'Practical Check-In',
                  description: 'A short, relevant exercise or portfolio review depending on the role.',
                },
                {
                  step: '4',
                  title: 'Decision',
                  description: 'We move quickly and follow up either way.',
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Reach out and tell us how you'd like to contribute to transforming education through technology.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
