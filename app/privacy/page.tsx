import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

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
            <p className="text-muted-foreground">Last Updated: July 3, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Introduction */}
            <div id="introduction">
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                Alara is a school management platform developed and operated by Vertex Blueprint Technology (&quot;Alara,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy explains what information we collect, how we use and share it, and the choices available to you when your school, or you directly, use our website and platform (together, the &quot;Service&quot;).
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                In most cases, Alara is used by schools to manage their own students, staff, and academic records. Where that is the case, your school (not Alara) determines what student information is collected and how it is used, and Alara acts as a service provider processing that information on the school&apos;s behalf and instructions. If you have questions about how your school specifically uses your data, please contact your school administrator directly.
              </p>
            </div>

            {/* Information We Collect */}
            <div id="information-we-collect">
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Information We Collect</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Account & Contact Information</h3>
                  <p className="text-muted-foreground mb-3">
                    When an account is created for you (by your school) or you sign up directly, we may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Name, email address, and phone number</li>
                    <li>School or organization name and role (e.g. administrator, teacher, student, parent)</li>
                    <li>Account credentials, such as a hashed password</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Academic & School Records</h3>
                  <p className="text-muted-foreground">
                    On behalf of schools using Alara, we process academic and administrative records that schools choose to store on the platform — for example attendance, grades, class assignments, fee and billing records, and communications sent through the platform. This data belongs to the school, and Alara processes it as directed by the school.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Payment Information</h3>
                  <p className="text-muted-foreground">
                    Where the Service supports fee collection or subscription billing, payments are handled by third-party payment processors. Alara does not store full payment card numbers; the payment processor handles that information under its own privacy and security practices.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Usage & Device Data</h3>
                  <p className="text-muted-foreground">
                    We automatically collect certain technical information when you use the Service, such as IP address, browser and device type, pages visited, and timestamps, generally through standard server and application logs.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div id="how-we-use">
              <h2 className="text-3xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <div className="bg-muted p-8 rounded-lg space-y-3">
                {[
                  'Providing, operating, and maintaining the Service on behalf of your school',
                  'Authenticating accounts and securing access to the platform',
                  'Processing fee payments and subscription billing where applicable',
                  'Responding to support requests and communicating service-related updates',
                  'Monitoring, troubleshooting, and improving the reliability and performance of the Service',
                  'Complying with legal obligations and enforcing our agreements',
                ].map((use, index) => (
                  <p key={index} className="text-muted-foreground flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>{use}</span>
                  </p>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                We do not sell personal information, and we do not use student data collected on behalf of schools for targeted advertising.
              </p>
            </div>

            {/* Legal Basis */}
            <div id="legal-basis">
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Legal Basis for Processing</h2>
              <p className="text-muted-foreground leading-relaxed">
                Where data protection laws such as the EU/UK General Data Protection Regulation (GDPR) apply, we process personal information on the basis of: performance of a contract (providing the Service your school has signed up for), legitimate interests (such as securing and improving the Service), compliance with legal obligations, and, where required, your or your school&apos;s consent.
              </p>
            </div>

            {/* Sharing */}
            <div id="sharing">
              <h2 className="text-3xl font-bold text-foreground mb-4">5. How We Share Information</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We do not sell personal information. We may share information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li>With service providers who help us operate the Service (for example, hosting, database, and payment providers), under confidentiality obligations and only to the extent needed to perform their function</li>
                <li>With your school, since school staff with appropriate permissions can access records relevant to their role</li>
                <li>When required by law, regulation, legal process, or governmental request</li>
                <li>To protect the rights, property, or safety of Alara, our users, or others</li>
                <li>In connection with a merger, acquisition, or sale of assets, subject to continued protection of personal information</li>
              </ul>
            </div>

            {/* Retention */}
            <div id="retention">
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain personal information for as long as needed to provide the Service and for legitimate business or legal purposes, such as complying with our legal obligations, resolving disputes, and enforcing our agreements. When a school&apos;s account is closed, we work with the school to delete or return their data within a reasonable period, subject to any legal retention requirements.
              </p>
            </div>

            {/* Data Security */}
            <div id="data-security">
              <h2 className="text-3xl font-bold text-foreground mb-4">7. Data Security</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We take reasonable technical and organizational measures designed to protect personal information, including:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'Encrypted connections (HTTPS/TLS) between your browser and our servers',
                  'Encryption at rest provided by our infrastructure and database providers',
                  'Access to school data restricted to authenticated, authorized accounts',
                  'Role-based permissions so staff only see what their role requires',
                ].map((measure, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">{measure}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                No method of transmission or storage is 100% secure, and we cannot guarantee absolute security. We continue to invest in improving our security practices as the Service and our team grow.
              </p>
            </div>

            {/* Your Rights */}
            <div id="your-rights">
              <h2 className="text-3xl font-bold text-foreground mb-4">8. Your Rights</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Depending on your location and applicable law, you may have rights to access, correct, or delete personal information we hold about you, or to receive a copy of it in a portable format. If your account was created by a school, please start by contacting your school administrator, since they generally control the underlying records; you&apos;re also welcome to reach out to us directly and we will coordinate with your school as needed.
              </p>
              <div className="space-y-4">
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Access</h3>
                  <p className="text-muted-foreground">Request a copy of the personal information we hold about you.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Correction</h3>
                  <p className="text-muted-foreground">Ask us to correct inaccurate or incomplete information.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Deletion</h3>
                  <p className="text-muted-foreground">Request deletion of your data, subject to legal, contractual, or legitimate business retention requirements.</p>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                  <h3 className="font-semibold text-foreground mb-2">Right to Data Portability</h3>
                  <p className="text-muted-foreground">Request your data in a structured, commonly-used format.</p>
                </div>
              </div>
            </div>

            {/* Student Data & Children's Privacy */}
            <div id="students">
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Student Data & Children&apos;s Privacy</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Alara is designed to be used by schools to manage their own students&apos; records, including for students under the age of majority. In this context, the school — not Alara — is responsible for obtaining any consents required under applicable law (such as parental consent where required) before entering student information into the Service, and for complying with education and privacy laws that apply to it, which may include frameworks such as FERPA (United States), COPPA (United States), GDPR (European Union/UK), or local data protection legislation depending on where the school operates.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We design our handling of student data to align with these frameworks where they apply, including limiting our use of student data to providing the Service to the school and not using it for advertising. Schools and parents/guardians with questions about a specific student&apos;s data should contact the school directly, as they control those records.
              </p>
            </div>

            {/* International */}
            <div id="international">
              <h2 className="text-3xl font-bold text-foreground mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on where you and your school are located and where our infrastructure providers operate, your information may be processed in a country other than your own. Where required by applicable law, we rely on appropriate safeguards for such transfers.
              </p>
            </div>

            {/* Cookies */}
            <div id="cookies">
              <h2 className="text-3xl font-bold text-foreground mb-4">11. Cookies & Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies necessary to keep you signed in and to remember basic preferences (such as light/dark theme). We may also use privacy-conscious analytics to understand how the Service is used and to improve it. You can control cookies through your browser settings; disabling essential cookies may affect your ability to use the Service.
              </p>
            </div>

            {/* Changes */}
            <div id="changes">
              <h2 className="text-3xl font-bold text-foreground mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will update the &quot;Last Updated&quot; date above, and for significant changes we will make reasonable efforts to notify account holders, such as by email or a notice on the Service.
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please{' '}
                <Link href="/contact" className="text-primary hover:underline">get in touch</Link>{' '}
                and we&apos;ll do our best to help, or route your question to the right team.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
