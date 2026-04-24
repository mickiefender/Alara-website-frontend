"use client"

import { useState } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ArrowRight, Users, Mail, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { NewTeamApplication } from '@/types/team-application'
import { TEAM_POSITIONS } from '@/types/team-application'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function JoinTeamPage() {
  const [formData, setFormData] = useState<NewTeamApplication>({
    name: '',
    email: '',
    phone: '',
    positions: [],
    cover_letter: ''
  })
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const POSITION_DESCRIPTIONS: Record<string, string> = {
    'Frontend Developer': 'Build responsive, modern user interfaces using React, Next.js, and Tailwind CSS. Focus on performance, accessibility, and exceptional user experience.',
    'Backend Developer': 'Develop scalable APIs and database systems using Node.js, Python, or Supabase. Ensure security, data integrity, and high performance.',
    'Social Media Manager': 'Manages Instagram, Facebook, TikTok, X , Posts updates, responds to comments/DMs, Builds daily engagement',
    'UI/UX Designer': 'Create intuitive, beautiful designs that solve real user problems. Collaborate with developers to bring designs to life.',
    'Product Manager': 'Define product vision, prioritize features, and work with engineering and schools to deliver value.',
    'Content Creator': 'Designs flyers, short videos, reels, Writes captions and promotional content for social media, Collaborates with the marketing team to create engaging content.',
    'School Ambassador': 'Promotes Alara in schools, Talks to teachers, admins, students, Organizes events and demos, Provides feedback from the field to our team.',
    'Sales Representative': 'Help schools discover Alara and close deals that transform education.',
    'Customer Support': 'Be the friendly voice helping schools get the most from Alara.',
    'Marketing': 'Tell our story, grow our community, and attract amazing schools and talent.',
    'Event/Launch Coordinator': 'Helps organize launch events (online/offline), Coordinates logistics, Manages event promotion and follow-up.',
    'PR & Outreach': 'Contacts blogs, radio stations, influencers to share our story, Builds relationships with media and partners, Manages press releases and outreach campaigns.',
    'Data Analyst': 'Analyzes user data to uncover insights, Helps optimize product and marketing strategies, Creates dashboards and reports for the team.',
    'Product Tester (QA)': 'Tests new features to ensure they work perfectly, Identifies bugs and usability issues, Works closely with developers to maintain high quality.',
    'Other': 'Tell us about your unique skills and how you can help us grow.'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePositionChange = (position: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      positions: checked 
        ? [...prev.positions, position]
        : prev.positions.filter(p => p !== position)
    }))
    setSelectedPosition(checked ? position : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced validation matching DB constraints
    if (formData.positions.length === 0) {
      setError('Please select at least one position.')
      return
    }
    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email.')
      return
    }
    // Standard email regex (case-insensitive, allows lowercase like john.doe@gmail.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    const { error: submitError } = await supabase
      .from('team_applications')
      .insert([formData])

    setLoading(false)

    if (submitError) {
      // Log detailed error for debugging
      console.error('Team application submission error:', submitError)
      
      // Parse common Supabase errors for user-friendly messages
      let userError = 'Submission failed. Please try again.'
      
      if (submitError.message?.includes('row-level security policy')) {
        userError = 'Server configuration issue. Please try again later or contact support.'
      } else if (submitError.message?.includes('email') || submitError.message?.includes('CHECK')) {
        userError = 'Invalid email format. Please check your email and try again.'
      } else if (submitError.message?.includes('positions')) {
        userError = 'Position selection error. Please select valid positions and try again.'
      } else if (submitError.message?.includes('violates not-null')) {
        userError = 'Missing required fields. Please fill all required information.'
      }
      
      setError(userError)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16">
          <section className="py-32 text-center">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-12 md:p-20">
                <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
                  Thank You for Applying! ✅
                </h1>
                <p className="text-xl text-green-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Your application has been submitted successfully. We'll review and get back to you within 3-5 business days if there's a good fit.
                </p>
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href="/">
                    Back to Home<ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent mb-6 drop-shadow-lg">
              Join the Alara Team
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Help us build the future of education technology. We're looking for passionate people to join our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button size="lg" variant="outline" className="border-2 border-primary px-8 py-6 text-lg font-semibold rounded-xl hover:bg-primary/5 hover:border-primary/80">
                Current Openings
              </Button>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50">
                <h2 className="text-3xl font-bold text-foreground mb-2">Apply Now</h2>
                <p className="text-muted-foreground mb-8">Fill out the form below. We'll be in touch if there's a match.</p>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-medium">
                    {error}
                    <details className="mt-2 text-xs opacity-75 pt-2 border-t border-destructive/20">
                      <summary className="cursor-pointer underline decoration-dotted">Show technical details</summary>
                      <pre className="mt-1 p-2 bg-destructive/5 rounded text-xs overflow-auto max-h-32">
                        Check browser console (F12) for detailed error
                      </pre>
                    </details>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-background"
                    placeholder="Gloria Arhin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-background"
                    placeholder="emmanuel@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-background"
                    placeholder="+233 208 517 482"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Positions (select all that apply) *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 bg-muted/50 rounded-xl border">
                    {TEAM_POSITIONS.map((position) => (
                      <label key={position} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.positions.includes(position)}
                          onChange={(e) => handlePositionChange(position, e.target.checked)}
                          className="w-4 h-4 rounded border-primary/50 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{position}</span>
                      </label>
                    ))}
                  </div>
                  {formData.positions.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">Select at least one position</p>
                  )}
                  
                  {selectedPosition && POSITION_DESCRIPTIONS[selectedPosition] && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <h4 className="font-semibold text-lg text-foreground">
                          About {selectedPosition}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {POSITION_DESCRIPTIONS[selectedPosition]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Cover Letter / Why Alara?</label>
                  <textarea
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-vertical bg-background"
                    placeholder="Tell us about yourself, your experience, and why you'd be a great fit for Alara..."
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg font-semibold rounded-xl shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              {/* Info */}
              <div className="lg:sticky lg:top-24 space-y-8">
                <div className="bg-muted/50 p-8 rounded-2xl border border-border/50">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    What We're Looking For
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Passion for education technology</li>
                    <li>• 2+ years relevant experience</li>
                    <li>• Strong problem-solving skills</li>
                    <li>• Remote-friendly, collaborative team players</li>
                    <li>• Bonus: Experience with schools/edtech</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-8 rounded-2xl border border-border/50">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Mail className="h-8 w-8 text-primary" />
                    Our Process
                  </h3>
                  <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>Submit application</li>
                    <li>Phone screen (15 min)</li>
                    <li>Technical interview</li>
                    <li>Team interview</li>
                    <li>Offer!</li>
                  </ol>
                </div>
                <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 text-center">
                  <Phone className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h4 className="font-bold text-lg mb-2">Questions?</h4>
                  <p className="text-muted-foreground mb-4">Email us at</p>
                  <p className="font-semibold text-primary">hiring@alara.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
