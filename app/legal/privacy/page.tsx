import * as React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Honeypot AI - How we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-hp-black">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 mb-4">
              <strong>Last Updated:</strong> November 1, 2025
            </p>
            <p className="text-gray-400 mb-8">
              <strong>Effective Date:</strong> November 1, 2025
            </p>
            <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-8">
              <p className="text-sm text-gray-300">
                <strong className="text-hp-yellow">Your Privacy Matters:</strong> Honeypot AI is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </div>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  1. Introduction
                </h2>
                <p className="mb-4">
                  This Privacy Policy (&quot;Policy&quot;) describes how Honeypot AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, 
                  discloses, and protects information about you when you access or use our website, platform, Discord community, trading 
                  signals service, and related services (collectively, the &quot;Service&quot;).
                </p>
                <p className="mb-4">
                  By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy 
                  Policy. If you do not agree with our policies and practices, please do not use the Service.
                </p>
                <p>
                  This Policy applies to information we collect through the Service and through email, text, and other electronic communications. 
                  It does not apply to information collected by third parties, including through third-party websites, applications, or services 
                  linked to or from the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  2. Information We Collect
                </h2>
                <p className="mb-4">
                  We collect several types of information from and about users of our Service:
                </p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">2.1 Personal Information</h3>
                  <p className="mb-3">Information by which you may be personally identified:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Contact Information:</strong> Email address, phone number (if provided for SMS alerts)</li>
                    <li><strong className="text-hp-white">Account Information:</strong> Username, password (encrypted), profile preferences</li>
                    <li><strong className="text-hp-white">Payment Information:</strong> Credit card information, billing address (processed securely by our payment providers)</li>
                    <li><strong className="text-hp-white">Identity Verification:</strong> Information required for identity verification and fraud prevention</li>
                    <li><strong className="text-hp-white">Communication Data:</strong> Content of support requests, feedback, survey responses, and other communications with us</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">2.2 Usage and Technical Information</h3>
                  <p className="mb-3">Information automatically collected when you use the Service:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Device Information:</strong> Device type, operating system, browser type and version, unique device identifiers</li>
                    <li><strong className="text-hp-white">Connection Data:</strong> IP address, internet service provider, geolocation data (country/region)</li>
                    <li><strong className="text-hp-white">Usage Data:</strong> Pages visited, features used, time spent on pages, click data, navigation paths</li>
                    <li><strong className="text-hp-white">Log Data:</strong> Server logs, error reports, system activity, access dates and times</li>
                    <li><strong className="text-hp-white">Cookie Data:</strong> Information collected through cookies and similar tracking technologies (see Section 8)</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">2.3 Trading and Preferences Data</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Watchlist preferences and saved securities</li>
                    <li>Alert preferences and notification settings</li>
                    <li>Halal screening preferences and customization</li>
                    <li>Research queries and chatbot interactions (when available)</li>
                    <li>Trading interests and market preferences</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">2.4 Information from Third Parties</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Information from payment processors regarding payment transactions</li>
                    <li>Information from Discord (if you connect your Discord account)</li>
                    <li>Analytics data from third-party analytics providers</li>
                    <li>Marketing and advertising data from partners</li>
                  </ul>
                </div>

                <p className="mt-4 p-3 bg-hp-yellow/5 border border-hp-yellow/20 rounded text-sm">
                  <strong className="text-hp-yellow">Note:</strong> We do not access or store your brokerage account credentials or trading 
                  history. We do not have access to execute trades on your behalf.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  3. How We Collect Information
                </h2>
                <p className="mb-4">We collect information through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-hp-white">Direct Interactions:</strong> When you register, subscribe, request support, or communicate with us</li>
                  <li><strong className="text-hp-white">Automated Technologies:</strong> Through cookies, web beacons, and similar tracking technologies</li>
                  <li><strong className="text-hp-white">Third-Party Sources:</strong> From payment processors, analytics providers, and advertising partners</li>
                  <li><strong className="text-hp-white">Public Sources:</strong> From publicly available sources and data providers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  4. How We Use Your Information
                </h2>
                <p className="mb-4">We use the information we collect for the following purposes:</p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">4.1 Service Provision</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage your account</li>
                    <li>Provide access to trading signals and market alerts</li>
                    <li>Deliver notifications via email, SMS, Discord, or other channels</li>
                    <li>Apply halal screening based on your preferences</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Process payments and manage subscriptions</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">4.2 Service Improvement and Development</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Analyze usage patterns and user behavior</li>
                    <li>Improve existing features and develop new features</li>
                    <li>Conduct research and analytics</li>
                    <li>Test and optimize service performance</li>
                    <li>Train and improve our AI models and algorithms</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">4.3 Communication</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Send service-related notifications and updates</li>
                    <li>Provide customer support and respond to requests</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Conduct surveys and gather feedback</li>
                    <li>Announce new features, products, or services</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">4.4 Security and Fraud Prevention</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Detect, prevent, and address fraud, security breaches, and abuse</li>
                    <li>Verify identity and authenticate users</li>
                    <li>Protect against unauthorized access or use</li>
                    <li>Comply with security best practices and standards</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">4.5 Legal and Compliance</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Comply with legal obligations and regulations</li>
                    <li>Enforce our Terms of Service and other agreements</li>
                    <li>Respond to legal requests and prevent legal claims</li>
                    <li>Protect our rights, property, and safety</li>
                  </ul>
                </div>

                <p className="mt-4 p-3 bg-hp-yellow/5 border border-hp-yellow/20 rounded text-sm">
                  <strong className="text-hp-yellow">Legal Basis:</strong> We process your personal information based on: (1) your consent, 
                  (2) performance of our contract with you, (3) our legitimate business interests, or (4) compliance with legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  5. How We Share Your Information
                </h2>
                <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-4">
                  <p className="font-semibold text-hp-yellow mb-2">
                    We Do Not Sell Your Personal Information
                  </p>
                  <p className="text-sm">
                    We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                  </p>
                </div>

                <p className="mb-4">We may share your information in the following circumstances:</p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">5.1 Service Providers</h3>
                  <p className="mb-3">We share information with third-party service providers who perform services on our behalf:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Payment Processors:</strong> To process subscription payments and manage billing</li>
                    <li><strong className="text-hp-white">Communication Platforms:</strong> Email providers (for alerts), SMS providers, Discord</li>
                    <li><strong className="text-hp-white">Analytics Providers:</strong> To analyze usage data and improve our Service</li>
                    <li><strong className="text-hp-white">Cloud Infrastructure:</strong> For hosting, storage, and computing services</li>
                    <li><strong className="text-hp-white">Customer Support Tools:</strong> To provide customer service and support</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">5.2 Legal Requirements</h3>
                  <p className="mb-3">We may disclose information if required to do so by law or in response to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Court orders, subpoenas, or other legal processes</li>
                    <li>Requests from law enforcement or government agencies</li>
                    <li>Legal claims or disputes</li>
                    <li>Investigations of potential violations of our Terms</li>
                    <li>Protection of our rights, property, or safety, or that of others</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">5.3 Business Transfers</h3>
                  <p className="mb-3">
                    In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be 
                    transferred to the acquiring entity. We will notify you of any such change and any choices you may have.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">5.4 With Your Consent</h3>
                  <p className="mb-3">
                    We may share your information with third parties when you have given us explicit consent to do so.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">5.5 Aggregated and De-Identified Data</h3>
                  <p className="mb-3">
                    We may share aggregated, anonymized, or de-identified information that cannot reasonably be used to identify you. 
                    This may include usage statistics, market trends, and research insights.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  6. Data Retention
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">6.1 Retention Period:</strong> We retain your personal information for as long as 
                  necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or 
                  permitted by law.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">6.2 Active Accounts:</strong> While your account is active, we retain your account 
                  information, preferences, and usage data to provide the Service.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">6.3 Account Deletion:</strong> After you delete your account:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Most personal information is deleted within 30 days</li>
                  <li>Some information may be retained for up to 90 days for backup and disaster recovery purposes</li>
                  <li>Certain data may be retained longer for legal, regulatory, or security reasons</li>
                  <li>Aggregated, anonymized data may be retained indefinitely for analytics purposes</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">6.4 Legal Obligations:</strong> We may retain certain information as required by law, 
                  including financial records, transaction history, and communications related to legal matters.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  7. Data Security
                </h2>
                <p className="mb-4">
                  We take the security of your personal information seriously and implement reasonable administrative, technical, and 
                  physical safeguards to protect it.
                </p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">7.1 Security Measures</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
                    <li><strong className="text-hp-white">Access Controls:</strong> Strict access controls and authentication requirements</li>
                    <li><strong className="text-hp-white">Monitoring:</strong> Continuous monitoring for suspicious activity and security threats</li>
                    <li><strong className="text-hp-white">Regular Audits:</strong> Periodic security audits and vulnerability assessments</li>
                    <li><strong className="text-hp-white">Employee Training:</strong> Security awareness training for all employees</li>
                    <li><strong className="text-hp-white">Secure Infrastructure:</strong> Use of reputable cloud providers with robust security measures</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">7.2 Limitations</h3>
                  <p className="mb-3">
                    While we strive to protect your information, no method of transmission over the internet or electronic storage is 
                    100% secure. We cannot guarantee absolute security of your information.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">7.3 Your Responsibility</h3>
                  <p className="mb-3">You are responsible for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>Using strong, unique passwords</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Logging out after using shared devices</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">7.4 Data Breach Notification</h3>
                  <p className="mb-3">
                    In the event of a data breach that may compromise your personal information, we will notify you and relevant 
                    authorities as required by applicable law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  8. Cookies and Tracking Technologies
                </h2>
                <p className="mb-4">
                  We use cookies, web beacons, and similar tracking technologies to collect information and enhance your experience.
                </p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">8.1 Types of Cookies</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong className="text-hp-white">Essential Cookies:</strong> Required for basic Service functionality, such as 
                      authentication and security. These cannot be disabled.
                    </li>
                    <li>
                      <strong className="text-hp-white">Performance Cookies:</strong> Collect information about how you use the Service 
                      to help us improve performance and user experience.
                    </li>
                    <li>
                      <strong className="text-hp-white">Functional Cookies:</strong> Remember your preferences and settings to provide 
                      enhanced functionality.
                    </li>
                    <li>
                      <strong className="text-hp-white">Targeting/Advertising Cookies:</strong> Used for targeted advertising and marketing 
                      (only with your consent).
                    </li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">8.2 Analytics</h3>
                  <p className="mb-3">We use analytics services, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Vercel Analytics:</strong> For website performance and usage analytics</li>
                    <li><strong className="text-hp-white">Other Analytics Tools:</strong> To understand user behavior and improve the Service</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">8.3 Your Choices</h3>
                  <p className="mb-3">You can control cookies through:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Browser settings (most browsers allow you to refuse or delete cookies)</li>
                    <li>Our cookie consent banner (for non-essential cookies)</li>
                    <li>Opt-out tools provided by advertising networks</li>
                    <li>Browser &quot;Do Not Track&quot; signals (where supported)</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    <strong>Note:</strong> Disabling essential cookies may affect Service functionality.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  9. Your Privacy Rights
                </h2>
                <p className="mb-4">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">9.1 General Rights</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-hp-white">Access:</strong> Request access to the personal information we hold about you</li>
                    <li><strong className="text-hp-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                    <li><strong className="text-hp-white">Deletion:</strong> Request deletion of your personal information (subject to legal exceptions)</li>
                    <li><strong className="text-hp-white">Portability:</strong> Request a copy of your data in a portable format</li>
                    <li><strong className="text-hp-white">Objection:</strong> Object to certain processing of your personal information</li>
                    <li><strong className="text-hp-white">Restriction:</strong> Request restriction of processing in certain circumstances</li>
                    <li><strong className="text-hp-white">Withdraw Consent:</strong> Withdraw consent for processing based on consent</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">9.2 Marketing Communications</h3>
                  <p className="mb-3">You have the right to opt out of marketing communications:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Click the &quot;unsubscribe&quot; link in marketing emails</li>
                    <li>Adjust your notification preferences in account settings</li>
                    <li>Contact us at privacy@honeypot.ai</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    <strong>Note:</strong> You cannot opt out of essential service-related communications (e.g., account security, billing).
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">9.3 Additional Rights for EU/EEA Residents (GDPR)</h3>
                  <p className="mb-3">If you are located in the European Union or European Economic Area, you have additional rights under GDPR:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to lodge a complaint with a supervisory authority</li>
                    <li>Right to withdraw consent at any time</li>
                    <li>Right to object to processing based on legitimate interests</li>
                    <li>Right to data portability in machine-readable format</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">9.4 Additional Rights for California Residents (CCPA/CPRA)</h3>
                  <p className="mb-3">If you are a California resident, you have rights under the California Consumer Privacy Act:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to know what personal information is collected, used, shared, or sold</li>
                    <li>Right to delete personal information (subject to exceptions)</li>
                    <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                    <li>Right to non-discrimination for exercising your privacy rights</li>
                    <li>Right to correct inaccurate personal information</li>
                    <li>Right to limit use and disclosure of sensitive personal information</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">9.5 How to Exercise Your Rights</h3>
                  <p className="mb-3">To exercise any of these rights, please:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Email us at privacy@honeypot.ai</li>
                    <li>Use the privacy settings in your account</li>
                    <li>Submit a request through our website</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    We will respond to your request within the timeframe required by applicable law (typically 30-45 days). 
                    We may need to verify your identity before processing your request.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  10. Third-Party Services and Links
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">10.1 Third-Party Integrations:</strong> Our Service may integrate with third-party 
                  services such as Discord, payment processors, and data providers. These third parties have their own privacy policies, 
                  and we are not responsible for their practices.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">10.2 External Links:</strong> The Service may contain links to third-party websites. 
                  We are not responsible for the privacy practices or content of those websites. We encourage you to review their privacy 
                  policies.
                </p>
                <p>
                  <strong className="text-hp-white">10.3 Social Media:</strong> If you interact with us on social media platforms, your 
                  interactions are governed by the privacy policies of those platforms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  11. Children's Privacy
                </h2>
                <p className="mb-4">
                  Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from 
                  children under 18.
                </p>
                <p className="mb-4">
                  If we become aware that we have collected personal information from a child under 18 without verification of parental 
                  consent, we will take steps to delete that information as quickly as possible.
                </p>
                <p>
                  If you believe we have collected information from a child under 18, please contact us immediately at privacy@honeypot.ai.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  12. International Data Transfers
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">12.1 Cross-Border Transfers:</strong> Your information may be transferred to, stored, 
                  and processed in countries other than your country of residence, including the United States, where our servers and service 
                  providers are located.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.2 Data Protection:</strong> When we transfer data internationally, we implement 
                  appropriate safeguards to ensure your information receives adequate protection, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Data Processing Agreements with third parties</li>
                  <li>Compliance with applicable data protection frameworks</li>
                </ul>
                <p>
                  <strong className="text-hp-white">12.3 Consent:</strong> By using the Service, you consent to the transfer of your 
                  information to countries outside your country of residence, which may have different data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  13. Changes to This Privacy Policy
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">13.1 Updates:</strong> We may update this Privacy Policy from time to time to reflect 
                  changes in our practices, technology, legal requirements, or other factors.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">13.2 Notification:</strong> We will notify you of material changes by:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Posting the updated Privacy Policy on our website with a new &quot;Last Updated&quot; date</li>
                  <li>Sending an email notification to your registered email address</li>
                  <li>Displaying a prominent notice on the Service</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">13.3 Continued Use:</strong> Your continued use of the Service after the effective date 
                  of any changes constitutes your acceptance of the updated Privacy Policy.
                </p>
                <p>
                  <strong className="text-hp-white">13.4 Review Regularly:</strong> We encourage you to review this Privacy Policy 
                  periodically to stay informed about how we protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  14. Contact Information
                </h2>
                <p className="mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="p-4 bg-hp-gray-900 border border-gray-800 rounded-lg mb-4">
                  <p className="mb-2"><strong className="text-hp-white">Privacy Inquiries:</strong> privacy@honeypot.ai</p>
                  <p className="mb-2"><strong className="text-hp-white">General Support:</strong> support@honeypot.ai</p>
                  <p><strong className="text-hp-white">Website:</strong> https://honeypot.ai</p>
                </div>
                <p className="text-sm text-gray-500">
                  We will respond to your inquiry within a reasonable timeframe, typically within 30 days.
                </p>
              </section>

              <section className="mt-8 p-4 bg-hp-yellow/5 border border-hp-yellow/20 rounded-lg">
                <h3 className="text-lg font-semibold text-hp-yellow mb-2">Your Privacy is Important to Us</h3>
                <p className="text-sm text-gray-300">
                  We are committed to transparency and protecting your personal information. If you have any questions or concerns about 
                  how we handle your data, please don&apos;t hesitate to contact us.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
