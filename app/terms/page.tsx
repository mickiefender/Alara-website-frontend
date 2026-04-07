import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Terms of Service | Alara',
  description: 'Terms of service for Alara school management platform',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last Updated: March 2024</p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-12 md:py-20 bg-muted border-b border-border sticky top-20 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-bold text-foreground mb-4">Quick Navigation</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <a href="#acceptance" className="text-primary hover:underline">Acceptance of Terms</a>
              <a href="#use-of-service" className="text-primary hover:underline">Use of Service</a>
              <a href="#accounts" className="text-primary hover:underline">User Accounts</a>
              <a href="#intellectual-property" className="text-primary hover:underline">Intellectual Property</a>
              <a href="#limitation" className="text-primary hover:underline">Limitation of Liability</a>
              <a href="#contact-legal" className="text-primary hover:underline">Contact Legal</a>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Acceptance of Terms */}
            <div id="acceptance">
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                By accessing and using Alara, you agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service. We reserve the right to make changes to these terms at any time, and it is your responsibility to review them regularly.
              </p>
            </div>

            {/* Use of Service */}
            <div id="use-of-service">
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Use of Service</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Authorized Use</h3>
                  <p className="text-muted-foreground mb-3">
                    You agree to use Alara only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of Alara.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Harassing, threatening, abusing, or defaming any person</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Interfering with network functionality</li>
                    <li>Sharing unauthorized credentials or accounts</li>
                    <li>Violating any applicable laws or regulations</li>
                    <li>Engaging in any form of fraudulent activity</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Accounts */}
            <div id="accounts">
              <h2 className="text-3xl font-bold text-foreground mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  When you create an account, you are responsible for maintaining the confidentiality of your login information and password. You agree to accept responsibility for all activities that occur under your account.
                </p>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-muted-foreground"><span className="font-semibold">Account Accuracy:</span> You must provide accurate and complete information when creating your account and keep this information updated.</p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-muted-foreground"><span className="font-semibold">Security Responsibility:</span> You are responsible for protecting your password and account access. You agree to notify us immediately of any unauthorized use.</p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div id="intellectual-property">
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Intellectual Property Rights</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  All content on Alara, including software, design, and documentation, is the intellectual property of Vertex Blueprint Technology and protected by international copyright laws.
                </p>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Limited License:</span> We grant you a limited, non-exclusive, non-transferable license to use Alara for your school's legitimate educational purposes.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Restrictions:</span> You may not reverse engineer, decompile, or attempt to derive the source code of Alara or its underlying technology.</p>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Subscription Billing</h3>
                  <p className="text-muted-foreground">
                    Subscription fees are billed monthly or annually depending on your selected plan. Payments are due on the date specified in your agreement and must be made in advance of service provision.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Refund Policy</h3>
                  <p className="text-muted-foreground">
                    Refunds may be requested within 30 days of purchase if you have not actively used the service. Refunds are not available for partially used billing periods.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancellation</h3>
                  <p className="text-muted-foreground">
                    You may cancel your subscription at any time by contacting our support team. Cancellation takes effect at the end of your current billing cycle.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Ownership */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Data Ownership & Security</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Educational data, including student records, attendance, and academic information, remains the property of your school and is protected under FERPA regulations.
                </p>
                <div className="bg-muted p-6 rounded-lg space-y-3">
                  <p className="text-muted-foreground"><span className="font-semibold">Retention:</span> Upon contract termination, we will securely delete or return your data as requested.</p>
                  <p className="text-muted-foreground"><span className="font-semibold">Backups:</span> We maintain regular backups of all data for disaster recovery purposes.</p>
                  <p className="text-muted-foreground"><span className="font-semibold">Security:</span> We implement industry-standard security measures including encryption and access controls.</p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="limitation">
              <h2 className="text-3xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                To the maximum extent permitted by law, Alara and Vertex Blueprint Technology shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, even if advised of the possibility of such damage.
              </p>
              <div className="bg-yellow-50 border-l-4 border-secondary p-4">
                <p className="text-muted-foreground">
                  <span className="font-semibold">Disclaimer:</span> Alara is provided &quot;as is&quot; without any warranties, express or implied. We do not guarantee the platform will be error-free or uninterrupted.
                </p>
              </div>
            </div>

            {/* Compliance */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">8. Regulatory Compliance</h2>
              <p className="text-muted-foreground mb-4">
                Alara complies with applicable education and privacy laws including FERPA, COPPA, GDPR, and CCPA. You agree to use the platform in compliance with all applicable laws and regulations.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to terminate or suspend your account if you violate these terms or engage in prohibited activities. Upon termination, your access to Alara will be immediately revoked.
              </p>
            </div>

            {/* Contact Legal */}
            <div id="contact-legal" className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact for Legal Inquiries</h2>
              <p className="text-muted-foreground mb-4">
                If you have legal questions regarding these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-foreground">
                <p className="font-semibold">Legal Department</p>
                <p>Email: legal@alara.com</p>
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
