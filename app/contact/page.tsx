'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mail, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    phone: '',
    inquiryType: 'sales',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your inquiry. We will get back to you soon!')
    setFormData({ name: '', email: '', school: '', phone: '', inquiryType: 'sales', message: '' })
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Get In Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our team is ready to help you find the perfect solution for your school
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
              {[
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'hello@alara.school',
                  subtext: "We read every message personally",
                },
                {
                  icon: MessageCircle,
                  title: 'Message Us',
                  content: 'Use the form below',
                  subtext: "We'll route it to the right team",
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="bg-muted p-6 rounded-lg text-center hover:shadow-lg transition">
                    <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="font-semibold text-primary mb-1">{item.content}</p>
                    <p className="text-muted-foreground text-sm">{item.subtext}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Options */}
        <section id="contact-form" className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      School/Organization Name
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your school name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="implementation">Implementation</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* What to Expect */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">What Happens Next</h2>

                <div className="space-y-8">
                  {[
                    {
                      title: 'Tell us what you need',
                      description: 'Pick the inquiry type that fits best — sales, support, implementation, or something else — and give us a bit of context.',
                    },
                    {
                      title: 'A real person gets back to you',
                      description: "There's no ticket queue or bot response. Someone from the team reads every message and replies directly.",
                    },
                    {
                      title: 'We figure out the right next step together',
                      description: "That might be a walkthrough of Alara, a question answered, or connecting you with the right person on our side.",
                    },
                  ].map((option, index) => (
                    <div key={index} className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition">
                      <h3 className="font-bold text-lg text-foreground mb-3">{option.title}</h3>
                      <p className="text-muted-foreground">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-card p-12 rounded-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    question: 'How long does implementation take?',
                    answer: "It depends on your school&apos;s size and how much data needs migrating. We'll give you a realistic timeline once we understand your setup.",
                  },
                  {
                    question: 'Is there a self-serve trial?',
                    answer: "Not yet — reach out and we'll set up a live walkthrough with your team so you can see Alara in action before committing to anything.",
                  },
                  {
                    question: 'What support is included?',
                    answer: "Ongoing support and onboarding help are included as we work with your school to get set up and answer questions along the way.",
                  },
                  {
                    question: 'Can I upgrade my plan later?',
                    answer: "Yes — as your school grows, get in touch and we'll help you move to a plan that fits your needs.",
                  },
                ].map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Reach out and we'll help you figure out if Alara is the right fit for your school.
            </p>
            <a
              href="#contact-form"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Send us a Message
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
