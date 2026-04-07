'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
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
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'sales@alara.com',
                  subtext: 'Response within 24 hours',
                },
                {
                  icon: Phone,
                  title: 'Phone',
                  content: '+1 (555) 123-4567',
                  subtext: 'Monday - Friday, 9am-5pm',
                },
                {
                  icon: MapPin,
                  title: 'Address',
                  content: '123 Tech Boulevard',
                  subtext: 'San Francisco, CA 94105',
                },
                {
                  icon: Clock,
                  title: 'Support',
                  content: '24/7 Availability',
                  subtext: 'Technical assistance always available',
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
        <section className="py-20 md:py-32 bg-muted">
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

              {/* Support Options */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Support Options</h2>
                
                <div className="space-y-8">
                  {[
                    {
                      title: 'Sales Inquiries',
                      description: 'Interested in Alara for your school? Our sales team responds within 24 hours to discuss your specific needs and provide a customized demo.',
                      contact: 'sales@alara.com',
                      time: 'Available: Mon-Fri, 9am-5pm EST',
                    },
                    {
                      title: 'Technical Support',
                      description: 'Need help with your Alara account? Our technical support team is available 24/7 to assist with any issues or questions.',
                      contact: 'support@alara.com',
                      time: 'Available: 24/7',
                    },
                    {
                      title: 'Implementation Services',
                      description: 'Our implementation specialists will guide your school through the entire onboarding process, ensuring smooth adoption and training.',
                      contact: 'implementation@alara.com',
                      time: 'Custom schedule based on your needs',
                    },
                  ].map((option, index) => (
                    <div key={index} className="bg-white p-8 rounded-lg border border-border hover:shadow-lg transition">
                      <h3 className="font-bold text-lg text-foreground mb-3">{option.title}</h3>
                      <p className="text-muted-foreground mb-4">{option.description}</p>
                      <div className="space-y-2">
                        <p className="text-primary font-semibold">{option.contact}</p>
                        <p className="text-sm text-muted-foreground">{option.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white p-12 rounded-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    question: 'How long does implementation take?',
                    answer: 'Implementation typically takes 2-4 weeks, depending on your school&apos;s size and complexity. Our team will provide a detailed timeline during onboarding.',
                  },
                  {
                    question: 'Is there a trial period?',
                    answer: 'Yes, we offer a 14-day free trial so you can experience Alara with your entire team before making a commitment.',
                  },
                  {
                    question: 'What support is included?',
                    answer: 'All plans include 24/7 technical support, comprehensive training, and access to our knowledge base and community forums.',
                  },
                  {
                    question: 'Can I upgrade my plan later?',
                    answer: 'Absolutely! You can upgrade your plan at any time to access more features and functionality as your school grows.',
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
              Our expert team is ready to help you transform your school&apos;s management experience.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
              Schedule a Consultation
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
