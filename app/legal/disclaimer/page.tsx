import * as React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

export const metadata = {
  title: 'Risk Disclaimer',
  description: 'Comprehensive risk disclaimer for Helwa AI - Important information about trading risks, limitations, and user responsibilities.',
}

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-hp-black">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
              Risk Disclaimer
            </h1>
            <p className="text-gray-400 mb-4">
              <strong>Last Updated:</strong> November 1, 2025
            </p>
            <p className="text-gray-400 mb-8">
              <strong>Effective Date:</strong> November 1, 2025
            </p>

            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg mb-8">
              <p className="text-red-400 font-bold text-lg mb-3">
                ⚠️ CRITICAL RISK WARNING
              </p>
              <p className="text-red-300 mb-2">
                <strong>PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING HONEYPOT AI.</strong>
              </p>
              <p className="text-gray-300 text-sm">
                Trading and investing in financial markets involves substantial risk of loss. This disclaimer contains important 
                information about the limitations of our Service, the risks involved in trading, and your responsibilities as a user. 
                By using Helwa AI, you acknowledge that you have read, understood, and agree to this disclaimer.
              </p>
            </div>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  1. Not Financial, Investment, or Legal Advice
                </h2>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="font-semibold text-red-400">
                    HONEYPOT AI DOES NOT PROVIDE FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">1.1 Educational Purpose Only:</strong> All content, alerts, signals, analysis, 
                  research tools, and information provided through Helwa AI (the &quot;Service&quot;) are for educational and informational 
                  purposes only. They do not constitute:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Financial advice or investment recommendations</li>
                  <li>Trading advice or strategies</li>
                  <li>Tax advice or guidance</li>
                  <li>Legal advice or opinions</li>
                  <li>Religious or scholarly guidance</li>
                  <li>Personalized recommendations tailored to your circumstances</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">1.2 No Advisory Relationship:</strong> Use of the Service does not create an 
                  advisor-client, fiduciary, attorney-client, or any professional relationship between you and Helwa AI. We are 
                  not acting as your broker, advisor, attorney, accountant, or agent.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">1.3 Your Responsibility:</strong> You should not treat any of the Service&apos;s content 
                  as a substitute for professional advice. All trading and investment decisions are made solely by you at your own discretion 
                  and risk.
                </p>
                <p>
                  <strong className="text-hp-white">1.4 Consult Professionals:</strong> Before making any financial, investment, tax, or 
                  legal decisions, you should consult with qualified licensed professionals who can provide personalized advice based on 
                  your specific circumstances, objectives, and risk tolerance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  2. Substantial Risk of Loss
                </h2>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="font-semibold text-red-400 mb-2">
                    ⚠️ TRADING INVOLVES SUBSTANTIAL RISK OF LOSS
                  </p>
                  <p className="text-gray-300 text-sm">
                    You may lose some or all of your invested capital. Never invest or trade with money you cannot afford to lose.
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">2.1 Market Risk:</strong> Trading securities, including stocks, cryptocurrencies, 
                  derivatives, and other financial instruments, carries a high level of risk. Market conditions can change rapidly and 
                  unpredictably, potentially resulting in significant losses.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">2.2 Capital Loss:</strong> You may lose some or all of your invested capital. In some 
                  cases, particularly with leveraged trading, losses can exceed your initial investment.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">2.3 Volatility:</strong> Financial markets can be extremely volatile. Price movements 
                  can be sudden and severe, potentially causing rapid and substantial losses.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">2.4 Unsuitable for All Investors:</strong> Trading may not be suitable for all investors. 
                  You should carefully consider your:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Financial situation and ability to bear losses</li>
                  <li>Investment objectives and time horizon</li>
                  <li>Risk tolerance and experience level</li>
                  <li>Knowledge of financial markets and trading</li>
                  <li>Other financial obligations and commitments</li>
                </ul>
                <p>
                  <strong className="text-hp-white">2.5 Only Risk Capital:</strong> You should only trade with &quot;risk capital&quot; — money 
                  that you can afford to lose without affecting your lifestyle, standard of living, or ability to meet financial obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  3. No Guarantees or Warranties
                </h2>
                <p className="mb-4">
                  Helwa AI makes no representations, warranties, or guarantees of any kind, express or implied, regarding:
                </p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">3.1 Performance and Results</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The accuracy, completeness, or timeliness of our signals, alerts, or information</li>
                    <li>The profitability of any trades or investment strategies</li>
                    <li>The achievement of any specific returns or outcomes</li>
                    <li>The performance of any particular security or market</li>
                    <li>The success rate or win rate of trading signals</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">3.2 Service Availability and Reliability</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Uninterrupted, timely, secure, or error-free operation of the Service</li>
                    <li>The availability of the Service at any particular time</li>
                    <li>The delivery or timeliness of alerts and notifications</li>
                    <li>The absence of viruses, bugs, or other harmful components</li>
                    <li>The compatibility with your devices or software</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">3.3 Data and Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The accuracy of market data, prices, or financial information</li>
                    <li>The completeness of our ethical screening process</li>
                    <li>The quality or reliability of third-party data sources</li>
                    <li>The absence of errors, omissions, or inaccuracies in our content</li>
                  </ul>
                </div>

                <p className="mt-4 p-3 bg-hp-yellow/5 border border-hp-yellow/20 rounded text-sm">
                  <strong className="text-hp-yellow">Disclaimer:</strong> The Service is provided &quot;as is&quot; and &quot;as available&quot; 
                  without warranties of any kind. We expressly disclaim all warranties, including but not limited to implied warranties of 
                  merchantability, fitness for a particular purpose, title, and non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  4. Past Performance Not Indicative of Future Results
                </h2>
                <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-4">
                  <p className="font-semibold text-hp-yellow mb-2">
                    PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS
                  </p>
                  <p className="text-sm text-gray-300">
                    Historical returns, win rates, and performance metrics are not reliable indicators of future performance.
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">4.1 No Predictive Value:</strong> Past performance, whether actual or hypothetical, 
                  is not indicative of future results. Historical data cannot predict how securities will perform in the future.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">4.2 Changing Conditions:</strong> Market conditions, economic factors, regulations, 
                  and other variables are constantly changing. Strategies that worked in the past may not work in the future.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">4.3 No Representation:</strong> Any reference to past performance, win rates, or 
                  historical returns should not be construed as a representation or guarantee of similar future performance.
                </p>
                <p>
                  <strong className="text-hp-white">4.4 Forward-Looking Statements:</strong> Any forward-looking statements, projections, 
                  or estimates are based on assumptions and expectations that may prove to be incorrect. Actual results may differ materially.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  5. Hypothetical, Simulated, and Backtested Results
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">5.1 Inherent Limitations:</strong> Any hypothetical, simulated, or backtested 
                  performance results have significant inherent limitations, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong className="text-hp-white">Hindsight Bias:</strong> Backtested results are designed with the benefit of hindsight 
                  and do not represent actual trading decisions made in real-time</li>
                  <li><strong className="text-hp-white">Not Actual Trading:</strong> Simulated results do not represent actual trading and may 
                  not account for real-world challenges and constraints</li>
                  <li><strong className="text-hp-white">Execution Assumptions:</strong> Hypothetical results assume perfect execution at stated 
                  prices, which may not be achievable in real markets</li>
                  <li><strong className="text-hp-white">Missing Costs:</strong> Backtests may not fully account for slippage, commissions, fees, 
                  bid-ask spreads, and other transaction costs</li>
                  <li><strong className="text-hp-white">Market Impact:</strong> Simulations do not account for the market impact of large orders 
                  or low liquidity conditions</li>
                  <li><strong className="text-hp-white">Survivorship Bias:</strong> Backtests may suffer from survivorship bias if they only 
                  include securities that survived to the present</li>
                  <li><strong className="text-hp-white">Data Quality:</strong> Historical data may contain errors, omissions, or corporate actions 
                  that affect results</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">5.2 Overfitting Risk:</strong> Trading strategies can be over-optimized to historical data, 
                  resulting in inflated backtested performance that does not translate to real-world trading.
                </p>
                <p>
                  <strong className="text-hp-white">5.3 No Account Guarantee:</strong> No representation is made that any account will or is 
                  likely to achieve profits or losses similar to those shown in hypothetical or backtested results.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  6. Specific Risk Factors
                </h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">6.1 Cryptocurrency Risk</h3>
                  <p className="mb-3">Cryptocurrencies are highly speculative and involve extreme risk:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Extreme price volatility - prices can fluctuate dramatically in short periods</li>
                    <li>Limited or no regulation in many jurisdictions</li>
                    <li>Risk of total loss - cryptocurrencies can become worthless</li>
                    <li>Security risks including hacking, theft, and loss of private keys</li>
                    <li>Market manipulation and fraud</li>
                    <li>Lack of liquidity in certain markets or times</li>
                    <li>Regulatory uncertainty and potential for government action</li>
                    <li>Technology risks and potential for system failures</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">6.2 Leverage and Margin Risk</h3>
                  <p className="mb-3">If you use leverage or trade on margin:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Losses can exceed your initial investment</li>
                    <li>You may be required to deposit additional funds on short notice</li>
                    <li>Your positions may be liquidated without your consent</li>
                    <li>Small market movements can result in large losses</li>
                    <li>Interest charges and financing costs can accumulate</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">6.3 Liquidity Risk</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Some securities may be illiquid, making them difficult to buy or sell</li>
                    <li>You may not be able to exit positions at desired prices</li>
                    <li>Bid-ask spreads may be wide, increasing transaction costs</li>
                    <li>Market disruptions can cause sudden loss of liquidity</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">6.4 Technical and System Risk</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Technology failures, outages, or delays</li>
                    <li>Internet connectivity issues</li>
                    <li>Cybersecurity threats and hacking attempts</li>
                    <li>Software bugs or errors</li>
                    <li>Incompatibility with your devices or systems</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-hp-white mb-3">6.5 Timing and Execution Risk</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Delays in receiving signals or alerts</li>
                    <li>Time required to manually execute trades</li>
                    <li>Slippage between signal price and execution price</li>
                    <li>Market gaps and after-hours price movements</li>
                    <li>Order rejection or failure to execute</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  7. ethical Screening Disclaimer
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">7.1 Not Religious Guidance:</strong> While we make efforts to screen securities 
                  according to principles commonly associated with Islamic finance, Helwa AI is not a religious authority, Islamic 
                  scholar, or certification body. We do not provide religious guidance or certification.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.2 Methodology Limitations:</strong> Our ethical screening is based on:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Publicly available financial data which may be incomplete, outdated, or inaccurate</li>
                  <li>Our interpretation of commonly cited Islamic finance principles</li>
                  <li>Automated algorithms which may contain errors or limitations</li>
                  <li>General screening criteria that may not align with specific scholarly opinions</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">7.3 Scholarly Differences:</strong> Islamic scholars and authorities have varying 
                  interpretations and opinions regarding what constitutes ethical investing. Our screening may not align with all scholarly 
                  views or your personal interpretation.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.4 No Guarantee of Compliance:</strong> We make no representations, warranties, or 
                  guarantees that any security identified through our screening is halal, shariah-compliant, or permissible according to 
                  Islamic law.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">7.5 Your Responsibility:</strong> You are solely responsible for determining whether 
                  any investment is appropriate for your religious beliefs and values. We strongly encourage you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Conduct your own research and due diligence</li>
                  <li>Consult with qualified Islamic scholars or advisors</li>
                  <li>Verify the compliance status of any security</li>
                  <li>Consider multiple screening methodologies</li>
                </ul>
                <p>
                  <strong className="text-hp-white">7.6 Subject to Change:</strong> A security&apos;s ethical status can change over time due to 
                  changes in business activities, financial ratios, or scholarly interpretations. Past screening results do not guarantee 
                  current or future compliance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  8. Data Delays, Errors, and Limitations
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">8.1 Data Sources:</strong> We rely on third-party data providers for market data, 
                  financial information, prices, and other content. We do not independently verify all third-party data.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">8.2 Potential Issues:</strong> The Service may experience or contain:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong className="text-hp-white">Data Delays:</strong> Market data may be delayed by 15 minutes or more</li>
                  <li><strong className="text-hp-white">Inaccuracies:</strong> Data may contain errors, omissions, or inaccuracies</li>
                  <li><strong className="text-hp-white">Interruptions:</strong> Service outages, downtime, or connectivity issues</li>
                  <li><strong className="text-hp-white">Technical Errors:</strong> Software bugs, glitches, or calculation errors</li>
                  <li><strong className="text-hp-white">Outdated Information:</strong> Information may not reflect the most current data</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">8.3 Independent Verification:</strong> You should always independently verify 
                  information before making trading decisions. Do not rely solely on information from our Service.
                </p>
                <p>
                  <strong className="text-hp-white">8.4 No Liability:</strong> We are not liable for any losses resulting from data delays, 
                  errors, omissions, or system failures.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  9. No Automatic Trading or Account Access
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">9.1 Manual Trading Only:</strong> Helwa AI does not execute trades on your behalf. 
                  We do not have access to your brokerage accounts, funds, or trading authority.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">9.2 Signals Are Suggestions:</strong> Our trading signals and alerts are educational 
                  suggestions only. The decision to act on any signal is entirely yours.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">9.3 Execution Responsibility:</strong> You are solely responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Reviewing and analyzing signals before acting</li>
                  <li>Deciding whether to execute any trades</li>
                  <li>Determining position sizes and risk parameters</li>
                  <li>Executing trades through your broker</li>
                  <li>Managing your trading account and positions</li>
                  <li>Monitoring and closing positions as appropriate</li>
                </ul>
                <p>
                  <strong className="text-hp-white">9.4 Third-Party Integrations:</strong> Any integration with third-party platforms 
                  (e.g., brokerages, Discord) is for informational and notification purposes only, not for automated trade execution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  10. Tax and Legal Considerations
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">10.1 Tax Obligations:</strong> You are solely responsible for understanding and 
                  complying with all applicable tax laws and reporting requirements in your jurisdiction.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">10.2 Tax Consequences:</strong> Trading activities may have significant tax consequences, 
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Capital gains or losses</li>
                  <li>Ordinary income from trading activities</li>
                  <li>Tax on cryptocurrency transactions</li>
                  <li>Foreign investment reporting requirements</li>
                  <li>Wash sale rules and other tax regulations</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">10.3 Regulatory Compliance:</strong> You are responsible for complying with all applicable 
                  laws and regulations, including securities laws, in your jurisdiction.
                </p>
                <p>
                  <strong className="text-hp-white">10.4 Professional Advice:</strong> Consult with qualified tax professionals, accountants, 
                  and attorneys regarding your specific tax and legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  11. Regulatory Status and Disclosures
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">11.1 Not a Regulated Entity:</strong> Helwa AI is not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>A registered investment advisor (RIA)</li>
                  <li>A registered broker-dealer</li>
                  <li>A financial institution</li>
                  <li>A commodities trading advisor (CTA)</li>
                  <li>A registered securities exchange</li>
                  <li>Subject to regulatory oversight by the SEC, FINRA, CFTC, or similar agencies</li>
                </ul>
                <p className="mb-4">
                  <strong className="text-hp-white">11.2 Technology Platform:</strong> We are a technology platform providing educational 
                  tools, information services, and market data. We do not provide regulated financial services.
                </p>
                <p>
                  <strong className="text-hp-white">11.3 No Registration Requirement:</strong> We believe our services do not require 
                  registration as an investment advisor or broker-dealer based on our business model and the educational nature of our 
                  content. However, regulatory interpretations may change.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  12. Third-Party Information and Services
                </h2>
                <p className="mb-4">
                  <strong className="text-hp-white">12.1 Third-Party Content:</strong> Our Service may include information, data, opinions, 
                  or content from third-party sources. We do not endorse, verify, or take responsibility for third-party content.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">12.2 Third-Party Services:</strong> We integrate with third-party services such as brokerages, 
                  payment processors, and communication platforms. We are not responsible for the actions, policies, or practices of third parties.
                </p>
                <p>
                  <strong className="text-hp-white">12.3 Links:</strong> Our Service may contain links to external websites. We do not control 
                  or endorse these websites and are not responsible for their content or practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  13. Limitation of Liability
                </h2>
                <div className="p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg mb-4">
                  <p className="font-semibold text-hp-yellow">
                    IMPORTANT: NO LIABILITY FOR TRADING LOSSES
                  </p>
                </div>
                <p className="mb-4">
                  <strong className="text-hp-white">13.1 No Liability for Losses:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, 
                  HONEYPOT AI, ITS OFFICERS, DIRECTORS, EMPLOYEES, AFFILIATES, AGENTS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR 
                  ANY TRADING LOSSES, INVESTMENT LOSSES, OR DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="mb-4">
                  <strong className="text-hp-white">13.2 Exclusion of Damages:</strong> WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST DATA, TRADING LOSSES, OR 
                  BUSINESS INTERRUPTION.
                </p>
                <p>
                  <strong className="text-hp-white">13.3 Use at Your Own Risk:</strong> You acknowledge that you use the Service entirely 
                  at your own risk. We are not responsible for any decisions you make or actions you take based on information from the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  14. Your Responsibilities as a User
                </h2>
                <p className="mb-4">
                  By using Helwa AI, you acknowledge and agree that you are solely responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong className="text-hp-white">Trading Decisions:</strong> All trading and investment decisions and their consequences</li>
                  <li><strong className="text-hp-white">Research:</strong> Conducting your own research, analysis, and due diligence</li>
                  <li><strong className="text-hp-white">Risk Assessment:</strong> Evaluating and understanding the risks involved</li>
                  <li><strong className="text-hp-white">Financial Capability:</strong> Ensuring you have adequate financial resources to bear losses</li>
                  <li><strong className="text-hp-white">Compliance:</strong> Complying with all applicable laws and regulations</li>
                  <li><strong className="text-hp-white">Tax Obligations:</strong> Understanding and meeting your tax obligations</li>
                  <li><strong className="text-hp-white">Account Security:</strong> Protecting your account credentials and information</li>
                  <li><strong className="text-hp-white">Professional Advice:</strong> Seeking professional advice when appropriate</li>
                  <li><strong className="text-hp-white">Information Verification:</strong> Independently verifying information before acting on it</li>
                  <li><strong className="text-hp-white">Risk Management:</strong> Implementing appropriate risk management strategies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  15. Updates to This Disclaimer
                </h2>
                <p className="mb-4">
                  We may update this Risk Disclaimer from time to time. Material changes will be communicated through email or the Service. 
                  Your continued use after changes constitutes acceptance of the updated disclaimer.
                </p>
                <p>
                  We encourage you to review this disclaimer periodically to stay informed of any updates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-hp-white mb-4">
                  16. Contact Information
                </h2>
                <p className="mb-4">
                  For questions or concerns about this Risk Disclaimer:
                </p>
                <div className="p-4 bg-hp-gray-900 border border-gray-800 rounded-lg">
                  <p className="mb-2"><strong className="text-hp-white">Legal Inquiries:</strong> legal@helwa.ai</p>
                  <p className="mb-2"><strong className="text-hp-white">General Support:</strong> support@helwa.ai</p>
                  <p><strong className="text-hp-white">Website:</strong> https://helwa.ai</p>
                </div>
              </section>

              <div className="mt-12 p-6 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg">
                <p className="text-hp-yellow font-bold text-lg mb-3">
                  Acknowledgment and Agreement
                </p>
                <p className="text-gray-300 mb-3">
                  By using Helwa AI, you acknowledge that you have read, understood, and agree to this Risk Disclaimer in its entirety. 
                  You understand the risks involved in trading and agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                  <li>Accept full responsibility for all trading decisions and their consequences</li>
                  <li>Conduct your own research and due diligence</li>
                  <li>Only trade with money you can afford to lose</li>
                  <li>Consult with qualified professionals before making financial decisions</li>
                  <li>Not hold Helwa AI liable for any losses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
