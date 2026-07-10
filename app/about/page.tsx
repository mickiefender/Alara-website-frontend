import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Target, Lightbulb, Heart, Shield, Users, Sparkles, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'About Alara | School Management Platform',
  description: 'Learn about Alara and Vertex Blueprint Technology mission to transform education management',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                About Alara
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Transforming education through intelligent school management solutions
              </p>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <p className="text-primary font-semibold text-sm mb-2">WHO WE ARE</p>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                  <span className="text-primary">Alara:</span> The Future of School Management
                </h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  Alara is an intelligent school management platform designed to simplify administrative operations and enhance educational outcomes. Built with educators in mind, we provide comprehensive tools for student management, academic planning, and institutional excellence.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Developed by Vertex Blueprint Technology, Alara combines modern technology with a deep understanding of educational institutions to deliver solutions that truly matter.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-10">
                <p className="font-bold text-xl text-foreground mb-6">What Alara Brings Together</p>
                <ul className="space-y-4">
                  {[
                    'Student records, admissions, and academic planning in one place',
                    'Attendance, grading, and terminal reports without the paperwork',
                    'Fee collection and finance tracking built for schools',
                    'Communication tools that keep staff, students, and parents aligned',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  label: 'INSTITUTION TRUST',
                  title: 'Built for Real School Operations',
                  description: 'Alara is designed around the day-to-day realities of running a school, from admissions to graduation, on secure and dependable infrastructure.',
                },
                {
                  icon: Lightbulb,
                  label: 'TECHNOLOGY INNOVATION',
                  title: 'Cutting-Edge Solutions',
                  description: 'Modern tooling, thoughtful automation, and a focus on continuous improvement drive everything we build.',
                },
                {
                  icon: Heart,
                  label: 'STUDENT SUCCESS',
                  title: 'Impact-Driven Platform',
                  description: 'Every feature is designed with students and educators in mind, so schools can spend less time on admin and more time teaching.',
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="bg-muted p-8 rounded-lg text-center hover:shadow-lg transition">
                    <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon size={32} />
                    </div>
                    <p className="text-secondary font-semibold text-xs mb-2">{item.label}</p>
                    <h3 className="font-bold text-xl text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">OUR APPROACH</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                How We Build Alara
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Security First',
                  description: 'Student and school data is sensitive. We build with privacy and data protection as a foundation, not an afterthought.',
                },
                {
                  icon: Users,
                  title: 'Built With Educators',
                  description: 'We work closely with school administrators, teachers, and staff to shape features around how schools actually operate.',
                },
                {
                  icon: Sparkles,
                  title: 'Always Improving',
                  description: 'Alara is under active development, with new features and refinements shipped based on real feedback from schools using it.',
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="bg-white p-8 rounded-lg text-center">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">OUR VALUES</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Core Principles That Guide Us
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Excellence',
                  description: 'Delivering exceptional quality in every feature, interaction, and customer experience.',
                },
                {
                  title: 'Innovation',
                  description: 'Continuously pushing boundaries to introduce practical, useful solutions for education.',
                },
                {
                  title: 'Integrity',
                  description: 'Operating with transparency and maintaining the highest ethical standards.',
                },
                {
                  title: 'Accessibility',
                  description: 'Ensuring schools, regardless of size, can benefit from a well-designed management platform.',
                },
                {
                  title: 'Reliability',
                  description: 'Providing dependable, secure systems that schools can count on every single day.',
                },
                {
                  title: 'Support',
                  description: 'Offering responsive support and clear guidance to help every school succeed with Alara.',
                },
              ].map((value, index) => (
                <div key={index} className="bg-muted p-8 rounded-lg">
                  <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mb-4">
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who's Behind Alara */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-primary font-semibold text-sm mb-2">THE TEAM BEHIND ALARA</p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Made by Vertex Blueprint Technology
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Alara is developed and maintained by Vertex Blueprint Technology, a team focused on building
              practical software for schools. We're hands-on with every school we work with, and we're always
              open to hearing what would make Alara more useful for your institution.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the Alara Community</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Discover how schools are transforming their operations with Alara.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Schedule a Demo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
