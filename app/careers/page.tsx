import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Briefcase, MapPin, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Careers at Alara | Join Our Team',
  description: 'Join Vertex Blueprint Technology and help transform education. Explore career opportunities at Alara.',
}

export default function CareersPage() {
  const jobListings = [
    {
      id: 1,
      title: 'Senior Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      level: 'Senior',
      description: 'Lead product strategy and development for our school management platform.',
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      level: 'Mid-Level',
      description: 'Build scalable features for our education technology platform.',
    },
    {
      id: 3,
      title: 'Sales Representative',
      department: 'Sales',
      location: 'New York, NY',
      level: 'Entry-Level',
      description: 'Grow our customer base by connecting with schools across the region.',
    },
    {
      id: 4,
      title: 'Education Success Manager',
      department: 'Customer Success',
      location: 'Boston, MA',
      level: 'Mid-Level',
      description: 'Ensure successful adoption and implementation at our school customers.',
    },
    {
      id: 5,
      title: 'Security Engineer',
      department: 'Engineering',
      location: 'Remote',
      level: 'Senior',
      description: 'Protect educational data and maintain our enterprise security standards.',
    },
    {
      id: 6,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'San Francisco, CA',
      level: 'Mid-Level',
      description: 'Drive brand awareness and growth in the education technology space.',
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
                Help us transform education through innovative technology and passionate people
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
                  description: 'Develop your career with mentorship from industry leaders and clear advancement paths.',
                },
                {
                  icon: Users,
                  title: 'Collaborative Culture',
                  description: 'Work with passionate teammates who care about making a real impact in education.',
                },
                {
                  icon: Briefcase,
                  title: 'Competitive Benefits',
                  description: 'Comprehensive healthcare, 401(k) matching, flexible work, and professional development.',
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
                    'Flexible remote work options',
                    'Generous PTO and parental leave',
                    'Wellness programs and gym stipends',
                    'Mental health support services',
                  ],
                },
                {
                  title: 'Professional Development',
                  items: [
                    'Annual training budget per employee',
                    'Conference attendance opportunities',
                    'Internal mentorship programs',
                    'Career development planning',
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
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Open Positions
              </h2>
            </div>

            {/* Filter/Search Bar */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search positions..."
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
              </select>
              <select className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Levels</option>
                <option value="entry">Entry-Level</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {jobListings.map(job => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-lg border border-border hover:shadow-lg hover:border-primary transition cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase size={16} /> {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} /> {job.location}
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {job.level}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-3">{job.description}</p>
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
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
                  At Alara, we believe that great products are built by great people working together. Our culture is built on trust, collaboration, and a shared commitment to transforming education.
                </p>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  We celebrate diversity, encourage bold ideas, and support continuous learning. Every team member has a voice, and every contribution matters.
                </p>
                <div className="space-y-4">
                  {[
                    'Team outings and social events',
                    'Regular lunch-and-learns and workshops',
                    'Inclusive hiring and diverse perspectives',
                    'Community involvement and volunteer days',
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg h-40"></div>
                <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-lg h-40"></div>
                <div className="bg-gradient-to-br from-primary/60 to-primary/40 rounded-lg h-40"></div>
                <div className="bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-lg h-40"></div>
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

            <div className="grid md:grid-cols-5 gap-4 md:gap-2">
              {[
                {
                  step: '1',
                  title: 'Application',
                  description: 'Submit your resume and cover letter',
                },
                {
                  step: '2',
                  title: 'Review',
                  description: 'Our team reviews your qualifications',
                },
                {
                  step: '3',
                  title: 'Interview',
                  description: 'Phone or video interview with hiring manager',
                },
                {
                  step: '4',
                  title: 'Assessment',
                  description: 'Technical or practical assessment',
                },
                {
                  step: '5',
                  title: 'Offer',
                  description: 'Receive and accept offer',
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-foreground text-center mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm text-center">{item.description}</p>
                  {index < 4 && <div className="hidden md:block absolute w-12 h-0.5 bg-primary/20 mt-20"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Employee Testimonials */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">TEAM VOICES</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                What Our Team Says
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: 'Working at Alara has been transformative. I feel like my work directly impacts education globally.',
                  author: 'Alex Rodriguez',
                  role: 'Product Designer',
                },
                {
                  quote: 'The support and mentorship I receive here have accelerated my career growth significantly.',
                  author: 'Maria Chen',
                  role: 'Software Engineer',
                },
                {
                  quote: 'I love being part of a team that genuinely cares about improving education for everyone.',
                  author: 'James Thompson',
                  role: 'Sales Manager',
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-muted p-8 rounded-lg border border-border">
                  <p className="text-foreground italic mb-6 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.author}</p>
                    <p className="text-primary text-sm">{testimonial.role}</p>
                  </div>
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
              Apply now and join a team transforming education through technology.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
              View All Openings
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
