import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Target, Shield, Lightbulb, Heart } from 'lucide-react'

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
                  Developed by Vertex Blueprint Technology, Alara combines cutting-edge technology with deep understanding of educational institutions to deliver solutions that truly matter.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-12 text-center">
                <div className="text-6xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground text-lg">Schools Transformed</p>
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                  <p className="text-muted-foreground">Students Supported</p>
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  label: 'INSTITUTION TRUST',
                  title: 'Enterprise-Grade Reliability',
                  description: 'Schools worldwide trust Alara for critical operations. Built on secure infrastructure with 99.9% uptime guarantee.',
                },
                {
                  icon: Lightbulb,
                  label: 'TECHNOLOGY INNOVATION',
                  title: 'Cutting-Edge Solutions',
                  description: 'Advanced analytics, AI-powered insights, and continuous innovation drive educational excellence.',
                },
                {
                  icon: Heart,
                  label: 'STUDENT SUCCESS',
                  title: 'Impact-Driven Platform',
                  description: 'Every feature designed with students and educators in mind to maximize learning outcomes.',
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

        {/* Our Story Section */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">OUR JOURNEY</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Building the Future of Education
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  year: '2020',
                  title: 'Founded',
                  description: 'Vertex Blueprint Technology launches Alara with a vision to revolutionize school management.',
                },
                {
                  year: '2021',
                  title: 'First 100 Schools',
                  description: 'Rapid adoption as schools recognize the value of intelligent management solutions.',
                },
                {
                  year: '2022',
                  title: 'Global Expansion',
                  description: 'Alara reaches 300+ schools across multiple regions and countries.',
                },
                {
                  year: '2024',
                  title: 'Industry Leader',
                  description: 'Recognized as the leading school management platform with 500+ institutional partners.',
                },
              ].map((milestone, index) => (
                <div key={index} className="bg-white p-6 rounded-lg text-center">
                  <p className="text-primary font-bold text-3xl mb-2">{milestone.year}</p>
                  <h3 className="font-bold text-foreground text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground text-sm">{milestone.description}</p>
                </div>
              ))}
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
                  description: 'Continuously pushing boundaries to introduce cutting-edge solutions for education.',
                },
                {
                  title: 'Integrity',
                  description: 'Operating with transparency and maintaining the highest ethical standards.',
                },
                {
                  title: 'Accessibility',
                  description: 'Ensuring all schools, regardless of size, can benefit from advanced management tools.',
                },
                {
                  title: 'Reliability',
                  description: 'Providing dependable, secure systems that schools can count on every single day.',
                },
                {
                  title: 'Support',
                  description: 'Offering comprehensive support and training to ensure success of every institution.',
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

        {/* Leadership Team Section */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">LEADERSHIP</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Meet Our Team
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Chief Executive Officer',
                  bio: 'Former education technology director with 15+ years experience transforming institutions.',
                },
                {
                  name: 'Michael Chen',
                  role: 'Chief Technology Officer',
                  bio: 'Tech innovator passionate about building scalable solutions for complex problems.',
                },
                {
                  name: 'Emma Rodriguez',
                  role: 'Chief Operations Officer',
                  bio: 'Operations expert dedicated to ensuring seamless school integration and success.',
                },
                {
                  name: 'David Thompson',
                  role: 'Head of Product',
                  bio: 'Product visionary focused on creating intuitive solutions for educators.',
                },
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="bg-gradient-to-b from-primary to-primary/80 h-48"></div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                    <div className="flex gap-3 mt-4">
                      <a href="#" className="text-primary hover:text-primary/70">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.553-1.555-2.553-1.556 0-1.784 1.216-1.784 2.471v3.26H8.371V9h2.468v1.192h.035c.345-.652 1.188-1.337 2.445-1.337 2.612 0 3.095 1.718 3.095 3.954v4.529zM3.337 7.433c-.842 0-1.523-.653-1.523-1.459 0-.806.68-1.459 1.523-1.459.842 0 1.523.653 1.523 1.459 0 .806-.68 1.459-1.523 1.459zm1.27 8.905H2.067V9h2.54v7.338zM17.54 2H2.46C1.346 2 .5 2.846.5 3.96v12.08c0 1.114.846 1.96 1.96 1.96h15.08c1.114 0 1.96-.846 1.96-1.96V3.96C19.5 2.846 18.654 2 17.54 2z" />
                        </svg>
                      </a>
                      <a href="#" className="text-primary hover:text-primary/70">
                        <span className="sr-only">Twitter</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the Alara Community</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Discover how schools worldwide are transforming their operations with Alara.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
              Schedule a Demo
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
