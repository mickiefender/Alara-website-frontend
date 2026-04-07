import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Security | Alara',
  description: 'Security information and compliance details for Alara school management platform',
}

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Security You Can Trust
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade security protecting your school&apos;s most valuable data
              </p>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <p className="text-primary font-semibold text-sm mb-2">OUR COMMITMENT</p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
              Your Data is Our Priority
            </h2>
          </div>

          {/* Certifications */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            {[
              {
                icon: Shield,
                title: 'SOC 2 Type II',
                description: 'Enterprise security and compliance certification',
              },
              {
                icon: Lock,
                title: 'FERPA Compliant',
                description: 'Family Educational Rights and Privacy Act compliance',
              },
              {
                icon: CheckCircle,
                title: 'ISO 27001',
                description: 'Information security management system certification',
              },
            ].map((cert, index) => {
              const Icon = cert.icon
              return (
                <div key={index} className="bg-muted p-8 rounded-lg text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{cert.title}</h3>
                  <p className="text-muted-foreground">{cert.description}</p>
                </div>
              )
            })}
          </div>

          {/* Additional Compliance */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
            {[
              { name: 'GDPR', description: 'General Data Protection Regulation compliant' },
              { name: 'CCPA', description: 'California Consumer Privacy Act compliant' },
              { name: 'COPPA', description: 'Children\'s Online Privacy Protection Act compliant' },
              { name: 'HIPAA', description: 'Health Information Portability and Accountability Act aligned' },
            ].map((cert, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <CheckCircle className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-foreground">{cert.name}</h3>
                  <p className="text-muted-foreground text-sm">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Architecture */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">INFRASTRUCTURE</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Security Architecture
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Infrastructure Security</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Cloud Hosting', description: 'AWS infrastructure with enterprise-grade security' },
                    { title: 'DDoS Protection', description: 'Advanced attack mitigation and network defense' },
                    { title: 'Firewall Configuration', description: 'Multi-layered firewall systems and intrusion detection' },
                    { title: 'Network Monitoring', description: '24/7 security operations center monitoring' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg">
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Data Encryption</h3>
                <div className="space-y-4">
                  {[
                    { title: 'End-to-End Encryption', description: 'All sensitive data encrypted during transmission' },
                    { title: 'Encryption at Rest', description: 'AES-256 encryption for stored data' },
                    { title: 'Key Management', description: 'Secure key management with regular rotation' },
                    { title: 'Secure Transfer', description: 'TLS 1.3 for all network communications' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg">
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">ACCESS & AUTHENTICATION</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Access Control & Authentication
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Multi-Factor Authentication',
                  items: [
                    'Optional MFA for all users',
                    'Hardware security keys supported',
                    'TOTP authenticator support',
                    'SMS-based verification available',
                  ],
                },
                {
                  title: 'Role-Based Access',
                  items: [
                    'Granular permission management',
                    'Custom role creation',
                    'Department-level access controls',
                    'Admin oversight and audit trails',
                  ],
                },
                {
                  title: 'Session Management',
                  items: [
                    'Automatic timeout policies',
                    'Device tracking and management',
                    'Real-time login notifications',
                    'Session revocation capabilities',
                  ],
                },
              ].map((section, index) => (
                <div key={index} className="bg-muted p-8 rounded-lg">
                  <h3 className="font-bold text-lg text-foreground mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monitoring & Response */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">MONITORING</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Incident Response & Monitoring
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <AlertCircle className="text-secondary" size={28} />
                  24/7 Monitoring
                </h3>
                <ul className="space-y-4">
                  {[
                    'Real-time threat detection',
                    'Automated security alerts',
                    'Continuous vulnerability scanning',
                    'Network activity monitoring',
                    'Intrusion detection systems (IDS)',
                    'Security information and event management (SIEM)',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="text-primary flex-shrink-0" size={20} />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-foreground mb-6">Incident Response</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-foreground text-lg mb-2">Response Timeline</p>
                    <p className="text-muted-foreground">
                      Critical incidents are addressed within 1 hour. All customers are notified of any potential impact.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg mb-2">Documentation</p>
                    <p className="text-muted-foreground">
                      We maintain detailed incident logs and provide comprehensive post-incident reports.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg mb-2">Communication</p>
                    <p className="text-muted-foreground">
                      Regular updates during incidents and full transparency in our security practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Backup & Disaster Recovery */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">RELIABILITY</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Backup & Disaster Recovery
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Data Backup',
                  stats: [
                    { label: 'Backup Frequency', value: 'Hourly' },
                    { label: 'Geographic Redundancy', value: 'Multiple regions' },
                    { label: 'Backup Testing', value: 'Weekly validation' },
                    { label: 'Recovery Time Objective', value: '< 1 hour' },
                  ],
                },
                {
                  title: 'Business Continuity',
                  stats: [
                    { label: 'Uptime Guarantee', value: '99.9% SLA' },
                    { label: 'Failover Mechanism', value: 'Automatic' },
                    { label: 'Disaster Recovery Sites', value: 'Multiple' },
                    { label: 'RTO/RPO', value: '< 1 hour' },
                  ],
                },
              ].map((section, index) => (
                <div key={index} className="bg-muted p-8 rounded-lg">
                  <h3 className="text-2xl font-bold text-foreground mb-6">{section.title}</h3>
                  <div className="space-y-4">
                    {section.stats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-bold text-primary">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Data Protection */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-balance">
                Educational Data Protection
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Student Privacy',
                  items: [
                    'FERPA compliance',
                    'Parental consent management',
                    'Data minimization practices',
                    'Restricted access to records',
                  ],
                },
                {
                  title: 'COPPA Compliance',
                  items: [
                    'Special protections for minors',
                    'Parental notification systems',
                    'Verifiable parental consent',
                    'Limited data collection',
                  ],
                },
                {
                  title: 'Permissions & Audit',
                  items: [
                    'Granular access controls',
                    'Comprehensive audit logs',
                    'Data export capabilities',
                    'Access request tracking',
                  ],
                },
              ].map((section, index) => (
                <div key={index} className="bg-primary/20 p-6 rounded-lg border border-primary/40">
                  <h3 className="font-bold text-lg mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vulnerability Management */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold text-sm mb-2">SECURITY TESTING</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
                Vulnerability Management
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-foreground mb-6">Regular Assessments</h3>
                <ul className="space-y-4">
                  {[
                    'Quarterly penetration testing',
                    'Annual third-party security audits',
                    'Continuous vulnerability scanning',
                    'Automated patch management',
                    'Code security reviews',
                    'Dependency vulnerability analysis',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="text-primary flex-shrink-0" size={20} />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-foreground mb-6">Bug Bounty Program</h3>
                <p className="text-muted-foreground mb-6">
                  We welcome responsible disclosure of security vulnerabilities. Security researchers can report issues through our coordinated vulnerability disclosure program.
                </p>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    <span className="font-bold">Reporting Contact:</span> security@alara.com
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-bold">Response Time:</span> Within 24 hours
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-bold">Scope:</span> All production systems and applications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Security FAQs</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How often is my data backed up?',
                  a: 'Data is backed up hourly to multiple geographic locations with automated testing to ensure recovery capability.',
                },
                {
                  q: 'Can I request a security audit?',
                  a: 'Yes, enterprise customers can request on-premise security audits. Contact our security team for details.',
                },
                {
                  q: 'What is your incident response time?',
                  a: 'Critical incidents are addressed within 1 hour. We maintain 24/7 security operations center monitoring.',
                },
                {
                  q: 'Is my FERPA data protected?',
                  a: 'Yes, Alara is fully FERPA compliant with special protections for educational records and student data.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-muted p-6 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Have Security Questions?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Our security team is ready to discuss compliance and security details with your organization.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
              Contact Security Team
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
