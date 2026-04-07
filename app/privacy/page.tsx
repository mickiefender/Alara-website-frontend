import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Privacy Policy | Alara',
  description: 'Privacy policy for Alara school management platform',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: March 2024</p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-12 md:py-20 bg-muted border-b border-border sticky top-20 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-bold text-foreground mb-4">Quick Navigation</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <a href="#introduction" className="text-primary hover:underline">Introduction</a>
              <a href="#information-we-collect" className="text-primary hover:underline">Information We Collect</a>
              <a href="#how-we-use" className="text-primary hover:underline">How We Use Information</a>
              <a href="#data-security" className="text-primary hover:underline">Data Security</a>
              <a href="#your-rights" className="text-primary hover:underline">Your Rights</a>
              <a href="#contact" className="text-primary hover:underline">Contact Us</a>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Introduction */}
            <div id="introduction">
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                At Alara, operated by Vertex Blueprint Technology, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are transparent about our data practices and comply with applicable privacy laws including FERPA, GDPR, and CCPA. Your privacy is our priority, and we take every measure to protect your personal information.
              </p>
            </div>

            {/* Information We Collect */}
            <div id="information-we-collect">
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Information We Collect</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Name, email address, and phone number</li>
                    <li>School/organization name and location</li>
                    <li>Account credentials and authentication information</li>
                    <li>Student records and academic information</li>
                    <li>Parent and teacher contact information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Usage Data</h3>
                  <p className="text-muted-foreground">
                    We automatically collect certain information about how you interact with our platform, including IP addresses, browser type, pages visited, and time spent on pages.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Educational Records</h3>
                  <p className="text-muted-foreground">
                    We maintain student records in accordance with FERPA regulations, including academic progress, attendance, and behavioral information as provided by schools.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div id="how-we-use">
              <h2 className="text-3xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <div className="bg-muted p-8 rounded-lg space-y-3">
                <p className="text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Providing and maintaining our school management services</span>
                </p>
                <p className="text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Processing transactions and sending related information</span>
                </p>
                <p className="text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Improving our platform features and user experience</span>
                </p>
                <p className="text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Complying with legal obligations and protecting against fraud</span>
                </p>
                <p className="text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Communicating with you about updates or security alerts</span>
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div id="data-security">
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We implement comprehensive security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. Our security measures include:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'AES-256 encryption for data at rest',
                  'TLS/SSL encryption for data in transit',
                  'Regular security audits and penetration testing',
                  'Multi-factor authentication for admin access',
                  'Role-based access control and audit logs',
                  'Secure data backups with geographic redundancy',
                ].map((measure, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">{measure}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Rights */}
            <div id="your-rights">
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                You have the right to access, correct, and delete your personal information. To exercise these rights, please contact us at privacy@alara.com.
              </p>
              <div className="space-y-4">
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Access</h3>
                  <p className="text-muted-foreground">You can request a copy of your personal information at any time.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Correction</h3>
                  <p className="text-muted-foreground">You can correct any inaccurate information we hold about you.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Deletion</h3>
                  <p className="text-muted-foreground">You can request deletion of your data, subject to legal and contractual requirements.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Data Portability</h3>
                  <p className="text-muted-foreground">You can request your data in a portable format for transfer to another service.</p>
                </div>
              </div>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements and FERPA compliance requirements.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alara complies with COPPA and FERPA regulations for student data. We require parental consent before collecting information from students under 13 years old, and we implement special safeguards to protect minors' privacy.
              </p>
            </div>

            {/* Policy Changes */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">8. Policy Changes</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or prominent notice on our website.
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-foreground">
                <p className="font-semibold">Privacy Team</p>
                <p>Email: privacy@alara.com</p>
                <p>Address: 123 Tech Boulevard, San Francisco, CA 94105</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
