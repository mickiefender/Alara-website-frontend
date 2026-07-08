import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

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
            <p className="text-muted-foreground">Last Updated: July 3, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Acceptance of Terms */}
            <div id="acceptance">
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern access to and use of Alara, a school management platform provided by Vertex Blueprint Technology (&quot;Alara,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account, or by accessing or using the Service, you agree to be bound by these Terms. If you are using Alara on behalf of a school or organization, you represent that you have authority to accept these Terms on its behalf, and &quot;you&quot; refers to both you and that organization.
              </p>
            </div>

            {/* Description of Service */}
            <div id="description">
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alara provides tools for schools to manage academic and administrative operations, which may include attendance, grading, timetabling, fee collection, communication, and related features. Features available to a given account depend on the plan and role assigned by the school administrator. We may add, change, or remove features over time as the Service evolves.
              </p>
            </div>

            {/* Eligibility & Accounts */}
            <div id="accounts">
              <h2 className="text-3xl font-bold text-foreground mb-4">3. Eligibility & Accounts</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Most accounts on Alara are created and managed by a school administrator on behalf of staff, students, and parents. If your account was created by a school, that school controls the account and may modify, suspend, or remove it in accordance with its own policies. Where you register directly, you must provide accurate information and are responsible for keeping it up to date.
                </p>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-muted-foreground"><span className="font-semibold">Account Security:</span> You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us or your school administrator immediately if you suspect unauthorized access.</p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-muted-foreground"><span className="font-semibold">Minors:</span> Where student accounts belong to minors, the school and, where applicable, a parent or guardian, are responsible for consenting to and overseeing the student&apos;s use of the Service in accordance with the school&apos;s own policies and applicable law.</p>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div id="use-of-service">
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Acceptable Use</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Authorized Use</h3>
                  <p className="text-muted-foreground mb-3">
                    You agree to use Alara only for lawful purposes related to your school&apos;s educational and administrative operations, and in a way that does not infringe upon the rights of others.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Harassing, threatening, abusing, or defaming any person</li>
                    <li>Attempting to gain unauthorized access to accounts, data, or systems</li>
                    <li>Interfering with or disrupting the integrity or performance of the Service</li>
                    <li>Sharing your login credentials or letting others access the Service through your account</li>
                    <li>Uploading unlawful, infringing, or malicious content</li>
                    <li>Reverse engineering, scraping, or attempting to extract the Service&apos;s source code or underlying data at scale, except as permitted by law</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div id="payment">
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Subscription & Payment</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Billing</h3>
                  <p className="text-muted-foreground">
                    Where Alara is offered on a paid subscription basis, fees, billing frequency, and payment terms will be set out in the order or agreement your school enters into with us. Payments are processed through third-party payment providers; we do not store full card details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancellation</h3>
                  <p className="text-muted-foreground">
                    A school may cancel its subscription in accordance with the terms of its agreement with us or by contacting us directly. Unless otherwise agreed in writing, cancellation takes effect at the end of the then-current billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Refunds</h3>
                  <p className="text-muted-foreground">
                    Refund eligibility, if any, will be set out in the specific agreement or order between Alara and your school, since billing arrangements can vary by plan and negotiated terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Data & School Responsibility */}
            <div id="student-data">
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Student Data & School Responsibility</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Academic and administrative data entered into Alara by a school — including student records, attendance, and grades — remains the property of that school. Alara processes this data as a service provider, on the school&apos;s instructions, solely to provide the Service.
                </p>
                <div className="bg-muted p-6 rounded-lg space-y-3">
                  <p className="text-muted-foreground"><span className="font-semibold">School&apos;s Responsibility:</span> The school is responsible for ensuring it has the necessary rights and consents to submit student and staff data to the Service, and for complying with education and privacy laws that apply to it.</p>
                  <p className="text-muted-foreground"><span className="font-semibold">Data Return & Deletion:</span> Upon termination of a school&apos;s account, we will work with the school to delete or return its data within a reasonable period, subject to legal retention requirements.</p>
                  <p className="text-muted-foreground"><span className="font-semibold">Backups:</span> We maintain routine backups to support service continuity, though backups are not a substitute for a school maintaining its own records where required.</p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div id="intellectual-property">
              <h2 className="text-3xl font-bold text-foreground mb-4">7. Intellectual Property Rights</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The Service, including its software, design, and documentation, is the intellectual property of Vertex Blueprint Technology and is protected by applicable intellectual property laws. Schools and users retain ownership of the data and content they submit to the Service.
                </p>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Limited License:</span> We grant you a limited, non-exclusive, non-transferable license to access and use Alara for your school&apos;s internal educational and administrative purposes, subject to these Terms.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">Restrictions:</span> You may not reverse engineer, decompile, resell, or white-label the Service, or use it to build a competing product, except as permitted by law.</p>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div id="ai-features">
              <h2 className="text-3xl font-bold text-foreground mb-4">8. AI-Powered Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some parts of the Service may use AI-assisted features (for example, generating draft questions or answering questions in a chat interface). AI-generated content may be inaccurate or incomplete, and is provided as a starting point, not a final authoritative answer. You are responsible for reviewing AI-generated content before relying on it for grading, communication, or other decisions. We do not guarantee the accuracy of AI-generated output.
              </p>
            </div>

            {/* Disclaimers */}
            <div id="disclaimers">
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Disclaimers</h2>
              <div className="bg-muted border-l-4 border-secondary p-4">
                <p className="text-muted-foreground">
                  The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or completely secure.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="limitation">
              <h2 className="text-3xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                To the maximum extent permitted by applicable law, Alara and Vertex Blueprint Technology will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, or data, arising out of or related to your use of the Service, even if advised of the possibility of such damages. Our total liability for any claim arising out of these Terms or the Service is limited to the amount you or your school paid us in the twelve (12) months preceding the claim.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nothing in these Terms limits liability that cannot be limited or excluded under applicable law.
              </p>
            </div>

            {/* Termination */}
            <div id="termination">
              <h2 className="text-3xl font-bold text-foreground mb-4">11. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may suspend or terminate access to the Service if these Terms are violated, if required by law, or if continued provision of the Service becomes impractical. A school may terminate its use of the Service in accordance with its agreement with us or by contacting us directly. Provisions that by their nature should survive termination (such as intellectual property, disclaimers, and limitation of liability) will continue to apply.
              </p>
            </div>

            {/* General Provisions */}
            <div id="general">
              <h2 className="text-3xl font-bold text-foreground mb-4">12. General Provisions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Changes to These Terms</h3>
                  <p className="text-muted-foreground">
                    We may update these Terms from time to time. We will update the &quot;Last Updated&quot; date above, and for material changes we will make reasonable efforts to notify account holders. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Severability</h3>
                  <p className="text-muted-foreground">
                    If any provision of these Terms is found unenforceable, the remaining provisions will remain in full effect.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Assignment</h3>
                  <p className="text-muted-foreground">
                    You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Entire Agreement</h3>
                  <p className="text-muted-foreground">
                    These Terms, together with any order form or agreement your school has entered into with us, constitute the entire agreement between you and Alara regarding the Service.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Legal */}
            <div id="contact-legal" className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please{' '}
                <Link href="/contact" className="text-primary hover:underline">get in touch</Link>{' '}
                and we&apos;ll route your question to the right team.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
