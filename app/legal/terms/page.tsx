import * as React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Helwa AI - Ethical trading signals platform.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-hp-black">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-400 mb-4">
              <strong>Last Updated:</strong> November 1, 2025
            </p>
            <p className="text-gray-400 mb-8">
              <strong>Effective Date:</strong> November 1, 2025
            </p>
            <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-8">
              <p className="text-sm text-gray-300">
                <strong className="text-hp-yellow">Important:</strong> Please read these Terms of Service carefully before using Helwa AI. 
                By accessing or using our service, you agree to be bound by these terms. If you disagree with any part of these terms, 
                you may not access the service.
              </p>
            </div>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                  These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding agreement between you 
                  (&quot;User&quot;, &quot;you&quot;, &quot;your&quot;) and Helwa AI (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) regarding your 
                  access to and use of the Helwa AI platform, website, and related services (collectively, the &quot;Service&quot;).
                </p>
                <p className="mb-4">
                  By accessing, browsing, or using our Service, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you must not 
                  use our Service.
                </p>
                <p>
                  We reserve the right to modify these Terms at any time. Your continued use of the Service after such modifications 
                  constitutes your acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  2. Definitions
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-hp-white">&quot;Service&quot;</strong> - The Helwa AI platform, including website, Discord community, trading signals, and all related services</li>
                  <li><strong className="text-hp-white">&quot;Trading Signals&quot;</strong> - Algorithmic or manually curated alerts, recommendations, or information about trading opportunities</li>
                  <li><strong className="text-hp-white">&quot;Halal Screening&quot;</strong> - Our proprietary filtering process to identify securities that may comply with Islamic finance principles</li>
                  <li><strong className="text-hp-white">&quot;User Content&quot;</strong> - Any data, information, or content you provide to the Service</li>
                  <li><strong className="text-hp-white">&quot;Account&quot;</strong> - Your registered user account with Helwa AI</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  3. Service Description
                </h2>
                <p className="mb-4">
                  Helwa AI provides educational trading alerts and market information services designed for traders 
                  seeking ethical investment opportunities. Our Service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-hp-white">Trading Signals:</strong> Real-time and delayed trading alerts for stocks and cryptocurrencies</li>
                  <li><strong className="text-hp-white">Halal Screening:</strong> Proprietary filters to identify potentially ethical securities</li>
                  <li><strong className="text-hp-white">Discord Community:</strong> Access to our trading community and signal delivery channel</li>
                  <li><strong className="text-hp-white">Market Analysis:</strong> Educational content, rationale, and datapoints for trading opportunities</li>
                  <li><strong className="text-hp-white">Research Tools:</strong> AI-powered research assistant (when available)</li>
                </ul>
                <p className="mt-4 p-3 bg-hp-yellow/5 border border-hp-yellow/20 rounded text-sm">
                  <strong className="text-hp-yellow">Note:</strong> Our Service is currently in pre-launch and beta phases. Features, 
                  availability, and performance may vary. We reserve the right to modify, suspend, or discontinue any aspect of the 
                  Service at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  4. Eligibility and Account Registration
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">4.1 Age Requirement:</strong> You must be at least 18 years of age to use our Service. 
                  By using the Service, you represent and warrant that you meet this age requirement.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">4.2 Account Registration:</strong> To access certain features, you may be required to 
                  create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your login credentials</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">4.3 Account Security:</strong> You are solely responsible for maintaining the confidentiality 
                  of your account credentials. We are not liable for any loss or damage arising from your failure to protect your account information.
                </p>
                <p>
                  <strong className="text-hp-white">4.4 One Account Per Person:</strong> You may only maintain one active account. Creating multiple 
                  accounts or allowing others to use your account is strictly prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  5. User Conduct and Prohibited Activities
                </h2>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Violate or infringe upon the rights of others, including intellectual property rights</li>
                  <li>Transmit any viruses, malware, or other malicious code</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
                  <li>Reverse engineer, decompile, or disassemble any aspect of the Service</li>
                  <li>Use automated systems (bots, scrapers, etc.) to access the Service without our written permission</li>
                  <li>Share, resell, or redistribute our trading signals or content without authorization</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
                  <li>Harass, abuse, or harm other users or our staff</li>
                  <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  6. Not Financial or Investment Advice
                </h2>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="font-semibold text-red-400 mb-2">
                    ⚠️ CRITICAL DISCLAIMER
                  </p>
                  <p>
                    Helwa AI provides educational content, market information, and trading alerts for informational and educational purposes only. 
                    <strong className="text-hp-white"> WE DO NOT PROVIDE FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE.</strong>
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">6.1 Educational Purpose:</strong> All content, signals, alerts, and information provided through 
                  our Service are for educational and informational purposes only. Nothing in our Service should be construed as a recommendation 
                  to buy or sell any security or to engage in any particular investment strategy.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">6.2 No Professional Relationship:</strong> Use of our Service does not create an advisor-client, 
                  fiduciary, or professional relationship between you and Helwa AI. We are not acting as your broker, advisor, or agent.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">6.3 Your Responsibility:</strong> All trading and investment decisions are made solely by you. 
                  You are responsible for conducting your own research, due diligence, and analysis before making any financial decisions.
                </p>
                <p>
                  <strong className="text-hp-white">6.4 Consult Professionals:</strong> You should consult with qualified financial advisors, 
                  tax professionals, and legal counsel before making any investment decisions based on information from our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  7. Risk Disclosure and Warnings
                </h2>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="font-semibold text-red-400 mb-2">
                    ⚠️ TRADING RISK WARNING
                  </p>
                  <p>
                    <strong className="text-hp-white">TRADING INVOLVES SUBSTANTIAL RISK OF LOSS.</strong> Only risk capital you can afford to lose.
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">7.1 Market Risk:</strong> Trading securities, including stocks, cryptocurrencies, and other 
                  financial instruments, carries a high level of risk and may not be suitable for all investors. You may lose some or all of your 
                  invested capital.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.2 Past Performance:</strong> Past performance is not indicative of future results. Any 
                  historical returns, expected returns, or probability projections may not reflect actual future performance.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.3 Hypothetical and Backtested Results:</strong> Any hypothetical, backtested, or simulated 
                  performance results have inherent limitations:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>They are designed with the benefit of hindsight</li>
                  <li>They do not represent actual trading and may not reflect real market conditions</li>
                  <li>They do not account for slippage, fees, and other transaction costs</li>
                  <li>They assume reinvestment of profits and dividends</li>
                  <li>No representation is made that any account will achieve similar results</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">7.4 Cryptocurrency Risk:</strong> Cryptocurrencies are highly volatile and speculative. The 
                  cryptocurrency market is largely unregulated, and you may lose your entire investment.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.5 Leverage Risk:</strong> If you use leverage or margin in your trading, losses can exceed 
                  your initial investment.
                </p>
                <p>
                  <strong className="text-hp-white">7.6 Personal Circumstances:</strong> You should carefully consider your financial situation, 
                  investment objectives, risk tolerance, and experience level before making any trading decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  8. ethical Screening Disclaimer
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">8.1 No Religious Certification:</strong> While we make efforts to screen securities according 
                  to principles commonly associated with Islamic finance, Helwa AI is not a religious authority and does not provide religious 
                  certification or guidance.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">8.2 Methodology Limitations:</strong> Our ethical screening methodology is based on publicly 
                  available financial data and our interpretation of commonly cited Islamic finance principles. Different scholars and authorities 
                  may have varying interpretations.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">8.3 Data Accuracy:</strong> We rely on third-party data sources which may contain errors or 
                  be incomplete. We do not guarantee the accuracy, completeness, or timeliness of our ethical screening.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">8.4 Your Responsibility:</strong> You are solely responsible for determining whether any 
                  investment is appropriate for your religious beliefs. We strongly encourage you to consult with qualified Islamic scholars or 
                  advisors before making any investment decisions.
                </p>
                <p>
                  <strong className="text-hp-white">8.5 No Guarantee:</strong> We make no representations or warranties regarding the ethical status 
                  of any security. A security passing our screening does not constitute a guarantee that it is halal.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  9. No Auto-Trading or Account Access
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">9.1 No Trading Authority:</strong> Helwa AI does not execute trades on your behalf, access 
                  your brokerage accounts, or have any trading authority. You maintain full control of your trading decisions and accounts at all times.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">9.2 Signals Are Suggestions:</strong> Our trading signals are suggestions for educational purposes 
                  only. The decision to act on any signal is entirely yours.
                </p>
                <p>
                  <strong className="text-hp-white">9.3 Third-Party Integrations:</strong> Any integration with third-party platforms or brokerages 
                  is for informational and notification purposes only, not for automated trade execution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  10. Service Availability and Performance
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">10.1 No Uptime Guarantee:</strong> While we strive for high availability and reliability, 
                  we do not guarantee uninterrupted, timely, secure, or error-free access to our Service. The Service is provided &quot;as is&quot; 
                  and &quot;as available.&quot;
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">10.2 Maintenance and Updates:</strong> We may suspend, restrict, or terminate the Service 
                  at any time for maintenance, updates, improvements, or other operational reasons, with or without prior notice.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">10.3 Signal Delays:</strong> We do not guarantee the timeliness or delivery of trading signals. 
                  Market conditions, technical issues, or other factors may cause delays or failures in signal delivery.
                </p>
                <p>
                  <strong className="text-hp-white">10.4 Data Accuracy:</strong> We make reasonable efforts to ensure accuracy but do not guarantee 
                  that information provided through the Service is accurate, complete, or current.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  11. Limitation of Liability
                </h2>
                <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-4">
                  <p className="font-semibold text-hp-yellow">
                    IMPORTANT LIMITATION OF LIABILITY
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">11.1 No Liability for Trading Losses:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, 
                  HONEYPOT AI, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY TRADING LOSSES, INVESTMENT 
                  LOSSES, OR DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">11.2 Exclusion of Damages:</strong> IN NO EVENT SHALL HONEYPOT AI BE LIABLE FOR ANY 
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Loss of profits or revenue</li>
                  <li>Loss of data or information</li>
                  <li>Loss of business opportunities</li>
                  <li>Loss of goodwill or reputation</li>
                  <li>Cost of substitute services</li>
                  <li>Trading losses or missed opportunities</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">11.3 Cap on Liability:</strong> Our total liability to you for all claims arising from 
                  or related to the Service shall not exceed the total amount you paid to us in the twelve (12) months preceding the claim, 
                  or $100 USD, whichever is greater.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">11.4 No Warranty:</strong> THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT 
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                  FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT.
                </p>
                <p>
                  <strong className="text-hp-white">11.5 Jurisdiction Limitations:</strong> Some jurisdictions do not allow the exclusion or 
                  limitation of certain warranties or liabilities. In such jurisdictions, our liability is limited to the maximum extent 
                  permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  12. Subscription and Payment Terms
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">12.1 Subscription Plans:</strong> We offer various subscription plans with different features 
                  and pricing. Plan details, features, and pricing are subject to change.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.2 Billing:</strong> Subscription fees are billed in advance on a recurring basis 
                  (monthly, annually, or as otherwise specified). All fees are quoted and payable in U.S. Dollars (USD) unless otherwise stated.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.3 Automatic Renewal:</strong> Your subscription will automatically renew at the end of 
                  each billing period unless you cancel before the renewal date. You authorize us to charge your payment method for renewal fees.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.4 Payment Methods:</strong> We accept payment via credit card, debit card, and other 
                  payment methods we may make available. You are responsible for providing accurate and up-to-date payment information.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.5 Failed Payments:</strong> If payment fails, we may suspend or terminate your access to 
                  the Service. You remain responsible for any uncollected amounts.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.6 Price Changes:</strong> We reserve the right to change our pricing at any time. We will 
                  provide at least 30 days&apos; advance notice of any price increase. Continued use after the price change constitutes acceptance.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.7 Refunds:</strong> We offer a 14-day money-back guarantee for first-time subscribers. 
                  Refund requests must be submitted within 14 days of your initial purchase. Refunds are provided at our discretion and may be 
                  subject to conditions.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.8 Cancellation:</strong> You may cancel your subscription at any time through your 
                  account settings or by contacting support. Cancellation will be effective at the end of the current billing period. No refunds 
                  will be provided for partial periods.
                </p>
                <p>
                  <strong className="text-hp-white">12.9 No Performance Fees:</strong> We do not charge performance-based fees or commissions on 
                  your trading activities. Our fee is solely for access to the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  13. Intellectual Property Rights
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">13.1 Ownership:</strong> All content, features, functionality, software, designs, text, 
                  graphics, logos, icons, images, audio clips, data compilations, algorithms, and software (&quot;Service Content&quot;) are owned by 
                  Helwa AI or our licensors and are protected by United States and international copyright, trademark, patent, trade secret, 
                  and other intellectual property laws.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">13.2 Limited License:</strong> Subject to your compliance with these Terms, we grant you a 
                  limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal, 
                  non-commercial use.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">13.3 Restrictions:</strong> You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                  <li>Remove or modify any proprietary notices or labels</li>
                  <li>Use the Service to create a competing product or service</li>
                  <li>Frame or mirror any part of the Service without our express written consent</li>
                  <li>Use any automated means to access or collect data from the Service</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">13.4 Trademarks:</strong> &quot;Helwa AI,&quot; our logo, and other marks are trademarks of 
                  Helwa AI. You may not use these marks without our prior written permission.
                </p>
                <p>
                  <strong className="text-hp-white">13.5 User Content:</strong> You retain ownership of any content you submit to the Service. 
                  By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your 
                  content in connection with operating the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  14. Termination and Suspension
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">14.1 Termination by You:</strong> You may terminate your account at any time by canceling 
                  your subscription or contacting support. Termination will be effective at the end of your current billing period.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">14.2 Termination by Us:</strong> We reserve the right to suspend or terminate your account 
                  and access to the Service immediately, with or without prior notice, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent, illegal, or abusive activity</li>
                  <li>Non-payment of fees</li>
                  <li>Our decision to discontinue the Service</li>
                  <li>Request by law enforcement or government agencies</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">14.3 Effect of Termination:</strong> Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your right to access and use the Service immediately ceases</li>
                  <li>We may delete your account data, including saved preferences and content</li>
                  <li>You remain liable for any fees owed prior to termination</li>
                  <li>Sections of these Terms that by their nature should survive termination will survive (e.g., disclaimers, limitations of liability)</li>
                </ul>
                <p>
                  <strong className="text-hp-white">14.4 No Refund on Termination:</strong> If we terminate your account for violation of these 
                  Terms, you are not entitled to a refund of any prepaid fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  15. Changes to Terms
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">15.1 Right to Modify:</strong> We reserve the right to modify, amend, or update these Terms 
                  at any time in our sole discretion.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">15.2 Notification:</strong> We will notify you of material changes to these Terms by:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Posting the updated Terms on our website with a new &quot;Last Updated&quot; date</li>
                  <li>Sending an email notification to your registered email address</li>
                  <li>Displaying an in-app notification when you next access the Service</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">15.3 Acceptance of Changes:</strong> Your continued use of the Service after the effective 
                  date of any changes constitutes your acceptance of the updated Terms. If you do not agree to the changes, you must stop using 
                  the Service and cancel your subscription.
                </p>
                <p>
                  <strong className="text-hp-white">15.4 Review Regularly:</strong> We encourage you to review these Terms periodically to stay 
                  informed of our policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  16. Indemnification
                </h2>
                <p className="mb-4">
                  You agree to indemnify, defend, and hold harmless Helwa AI, its officers, directors, employees, agents, affiliates, 
                  licensors, and service providers from and against any and all claims, liabilities, damages, losses, costs, expenses, or 
                  fees (including reasonable attorneys&apos; fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your use or misuse of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any applicable law or regulation</li>
                  <li>Your violation of any third-party rights, including intellectual property rights</li>
                  <li>Any trading losses or damages resulting from your trading decisions</li>
                  <li>Any content you submit to the Service</li>
                </ul>
                <p>
                  This indemnification obligation will survive the termination of these Terms and your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  17. Third-Party Services and Links
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">17.1 Third-Party Services:</strong> Our Service may integrate with or provide access to 
                  third-party services, platforms, content, or websites (e.g., Discord, brokerage platforms, data providers).
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">17.2 No Endorsement:</strong> We do not endorse, control, or assume responsibility for any 
                  third-party services. Your use of third-party services is governed by their own terms and privacy policies.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">17.3 Third-Party Data:</strong> We rely on third-party data providers for market data, 
                  financial information, and other content. We are not responsible for the accuracy, completeness, or timeliness of third-party data.
                </p>
                <p>
                  <strong className="text-hp-white">17.4 Links:</strong> The Service may contain links to third-party websites. We are not 
                  responsible for examining or evaluating the content or accuracy of third-party websites, and we do not warrant or assume any 
                  liability for third-party materials or websites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  18. Data Privacy and Security
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">18.1 Privacy Policy:</strong> Your use of the Service is also governed by our Privacy Policy, 
                  which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data practices.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">18.2 Security Measures:</strong> While we implement reasonable security measures to protect 
                  your information, we cannot guarantee absolute security. You use the Service at your own risk.
                </p>
                <p>
                  <strong className="text-hp-white">18.3 Data Breach:</strong> In the event of a data breach, we will take appropriate action 
                  in accordance with applicable law, which may include notifying affected users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  19. Governing Law and Jurisdiction
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">19.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance 
                  with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">19.2 Jurisdiction:</strong> Any legal action or proceeding arising under these Terms shall 
                  be brought exclusively in the federal or state courts located in Delaware, and the parties hereby consent to the personal 
                  jurisdiction and venue of these courts.
                </p>
                <p>
                  <strong className="text-hp-white">19.3 International Users:</strong> If you access the Service from outside the United States, 
                  you are responsible for compliance with local laws in your jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  20. Dispute Resolution and Arbitration
                </h2>
                <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-4">
                  <p className="font-semibold text-hp-yellow mb-2">
                    IMPORTANT: PLEASE READ THIS ARBITRATION AGREEMENT CAREFULLY
                  </p>
                  <p className="text-sm text-gray-300">
                    This section affects your rights and will have a substantial impact on how claims between you and Helwa AI are resolved.
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">20.1 Informal Resolution:</strong> Before filing a claim, you agree to contact us at 
                  support@helwa.ai to attempt to resolve the dispute informally. We will attempt to resolve the dispute within 60 days.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">20.2 Binding Arbitration:</strong> If we cannot resolve the dispute informally, any controversy 
                  or claim arising out of or relating to these Terms or the Service shall be settled by binding arbitration in accordance with the 
                  Commercial Arbitration Rules of the American Arbitration Association (AAA).
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">20.3 Arbitration Location:</strong> The arbitration will be conducted in Delaware, unless 
                  otherwise agreed by the parties.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">20.4 Class Action Waiver:</strong> YOU AND HONEYPOT AI AGREE THAT EACH MAY BRING CLAIMS 
                  AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR 
                  REPRESENTATIVE PROCEEDING.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">20.5 Opt-Out:</strong> You may opt out of this arbitration agreement by sending written notice 
                  to support@helwa.ai within 30 days of first accepting these Terms. Your notice must include your name, address, and a clear 
                  statement that you wish to opt out of this arbitration agreement.
                </p>
                <p>
                  <strong className="text-hp-white">20.6 Small Claims Court:</strong> Notwithstanding the foregoing, either party may bring an 
                  individual action in small claims court.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  21. Miscellaneous
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">21.1 Entire Agreement:</strong> These Terms, together with our Privacy Policy and any other 
                  agreements referenced herein, constitute the entire agreement between you and Helwa AI regarding the Service.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">21.2 Severability:</strong> If any provision of these Terms is found to be unenforceable or 
                  invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain 
                  in full force and effect.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">21.3 Waiver:</strong> Our failure to enforce any right or provision of these Terms will not 
                  be considered a waiver of those rights. Any waiver must be in writing and signed by an authorized representative.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">21.4 Assignment:</strong> You may not assign or transfer these Terms or your rights hereunder 
                  without our prior written consent. We may assign these Terms without restriction.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">21.5 No Agency:</strong> No agency, partnership, joint venture, or employment relationship is 
                  created as a result of these Terms, and neither party has any authority to bind the other.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">21.6 Force Majeure:</strong> We shall not be liable for any failure to perform our obligations 
                  under these Terms due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, 
                  riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, 
                  facilities, fuel, energy, labor, or materials.
                </p>
                <p>
                  <strong className="text-hp-white">21.7 Survival:</strong> All provisions of these Terms which by their nature should survive 
                  termination shall survive termination, including but not limited to disclaimers, limitations of liability, indemnity, and 
                  governing law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  22. Contact Information
                </h2>
                <p className="mb-4">
                  For questions, concerns, or notices regarding these Terms of Service, please contact us:
                </p>
                <div className="p-4 bg-hp-gray-900 border border-gray-800 rounded-lg">
                  <p className="mb-2"><strong className="text-hp-white">Email:</strong> support@helwa.ai</p>
                  <p className="mb-2"><strong className="text-hp-white">Legal Notices:</strong> legal@helwa.ai</p>
                  <p><strong className="text-hp-white">Website:</strong> https://helwa.ai</p>
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  By using Helwa AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

