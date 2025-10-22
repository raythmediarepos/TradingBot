'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Link2, DollarSign, Users, TrendingUp, Repeat, CheckCircle2, Zap, Gift, ArrowRight, ExternalLink } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AffiliatesPage = () => {
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle')

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const benefits = [
    {
      icon: DollarSign,
      title: '10% Recurring Commission',
      description: 'Earn 10% of every subscription payment, every month, as long as your referral stays subscribed.'
    },
    {
      icon: Repeat,
      title: 'Lifetime Recurring Revenue',
      description: 'Your commission continues month after month. Build true passive income that compounds over time.'
    },
    {
      icon: Zap,
      title: 'Instant Tracking',
      description: 'Real-time dashboard showing clicks, conversions, and earnings. See your commissions grow live.'
    },
    {
      icon: Gift,
      title: 'Premium Support',
      description: 'Dedicated affiliate support, marketing materials, and exclusive resources to help you succeed.'
    },
  ]

  const earnings = [
    { referrals: 10, tier: 'Starter', monthly: '$290', yearly: '$3,480' },
    { referrals: 50, tier: 'Pro', monthly: '$1,450', yearly: '$17,400' },
    { referrals: 100, tier: 'Elite', monthly: '$2,900', yearly: '$34,800' },
    { referrals: 500, tier: 'Champion', monthly: '$14,500', yearly: '$174,000' },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Apply & Get Approved',
      description: 'Submit your application below. We review and approve qualified applicants within 24-48 hours.'
    },
    {
      step: '2',
      title: 'Receive Your Unique Link',
      description: 'Get your personalized referral link and access to marketing materials, graphics, and copy.'
    },
    {
      step: '3',
      title: 'Share & Promote',
      description: 'Share your link on social media, your website, YouTube, or anywhere your audience hangs out.'
    },
    {
      step: '4',
      title: 'Earn Recurring Commissions',
      description: 'Get paid 10% monthly for every subscriber who signs up through your link. Forever.'
    },
  ]

  const idealFor = [
    'Content Creators & YouTubers',
    'Finance Bloggers & Podcasters',
    'Islamic Finance Educators',
    'Trading Communities & Discord Servers',
    'Social Media Influencers',
    'Newsletter Writers',
    'Financial Advisors',
    'Anyone with an Audience',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setEmail('')
      setName('')
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-hp-yellow/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full mb-6">
              <Link2 className="w-4 h-4 text-hp-yellow" />
              <span className="text-sm font-semibold text-hp-yellow">Affiliate Program</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-hp-white via-hp-yellow to-hp-white bg-clip-text text-transparent">
              Earn 10% Recurring
              <br />
              Commission Every Month
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Become a Honeypot AI affiliate and earn lifetime recurring commissions. 
              Share your unique link, get paid 10% every single month for as long as your referrals stay subscribed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-bold text-lg px-8"
                asChild
              >
                <a href="#apply">
                  Apply Now - It's Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                asChild
              >
                <a href="#calculator">
                  Calculate Your Earnings
                </a>
              </Button>
            </div>

            {/* Existing Affiliate Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <p className="text-gray-400 text-sm mb-3">Already an affiliate?</p>
              <Button
                variant="ghost"
                className="text-hp-yellow hover:text-hp-yellow600 hover:bg-hp-yellow/10 font-semibold"
                asChild
              >
                <Link href="/affiliates/login">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to Affiliate Dashboard →
                </Link>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-hp-gray900/50 border border-hp-yellow/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-hp-yellow">10%</div>
                <div className="text-xs text-gray-400">Commission</div>
              </div>
              <div className="bg-hp-gray900/50 border border-hp-yellow/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-hp-yellow">∞</div>
                <div className="text-xs text-gray-400">Lifetime</div>
              </div>
              <div className="bg-hp-gray900/50 border border-hp-yellow/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-hp-yellow">24h</div>
                <div className="text-xs text-gray-400">Approval</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-transparent to-hp-gray900/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Why Join Our Affiliate Program?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most generous and transparent affiliate program in Islamic fintech.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-8 hover:border-hp-yellow/40 hover:shadow-lg hover:shadow-hp-yellow/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <benefit.icon className="w-12 h-12 text-hp-yellow mb-4" />
                <h3 className="text-xl font-bold text-hp-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section id="calculator" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Your Earning Potential
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Based on our $29/month Starter plan. Scale up to higher tiers for even more earnings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {earnings.map((tier, index) => (
              <motion.div
                key={tier.tier}
                className={`rounded-xl p-6 border-2 transition-all ${
                  index === 2 
                    ? 'bg-gradient-to-br from-hp-yellow/10 to-hp-yellow/5 border-hp-yellow' 
                    : 'bg-hp-gray900 border-hp-yellow/20 hover:border-hp-yellow/40'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {index === 2 && (
                  <div className="text-xs font-bold text-hp-yellow bg-hp-yellow/20 px-2 py-1 rounded-full inline-block mb-3">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                <div className="text-2xl font-bold text-hp-white mb-1">{tier.referrals} Referrals</div>
                <div className="text-3xl font-bold text-hp-yellow mb-4">{tier.monthly}<span className="text-sm text-gray-400">/mo</span></div>
                <div className="pt-4 border-t border-hp-yellow/20">
                  <div className="text-sm text-gray-400">Annual Income</div>
                  <div className="text-xl font-bold text-hp-white">{tier.yearly}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              💡 <strong className="text-hp-yellow">Pro Tip:</strong> These are conservative estimates based on the $29/month Starter plan. 
              Many referrals upgrade to Pro ($99/mo) or Elite ($199/mo) plans, increasing your commissions significantly!
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-hp-gray900/50 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in 4 simple steps. It's completely free to join.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  className="relative"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-6 hover:border-hp-yellow/40 transition-all h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-hp-yellow text-hp-black font-bold text-xl flex items-center justify-center flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-hp-white mb-2">{step.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-hp-yellow/10 via-hp-yellow/5 to-transparent border border-hp-yellow/30 rounded-2xl p-12">
              <div className="text-center mb-8">
                <Users className="w-16 h-16 text-hp-yellow mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-hp-white mb-4">
                  Perfect For
                </h2>
                <p className="text-gray-400 text-lg">
                  Our affiliate program is ideal for anyone with an audience interested in halal investing and trading.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {idealFor.map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3 bg-hp-gray900/50 border border-hp-yellow/20 rounded-lg p-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-gradient-to-b from-hp-gray900/50 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-hp-white mb-4">
                  Apply to Become an Affiliate
                </h2>
                <p className="text-gray-400">
                  Fill out the form below and we'll review your application within 24-48 hours.
                </p>
              </div>

              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="w-16 h-16 text-hp-yellow mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-hp-white mb-2">Application Submitted!</h3>
                  <p className="text-gray-400 mb-6">
                    We'll review your application and send you an email within 24-48 hours with your unique affiliate link.
                  </p>
                  <Button
                    onClick={() => setSubmitStatus('idle')}
                    variant="outline"
                    className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                  >
                    Submit Another Application
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="platform" className="block text-sm font-semibold text-gray-300 mb-2">
                      Where will you promote Honeypot AI? *
                    </label>
                    <select
                      id="platform"
                      required
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white focus:outline-none focus:border-hp-yellow/50 transition-colors"
                    >
                      <option value="">Select a platform</option>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="tiktok">TikTok</option>
                      <option value="blog">Blog/Website</option>
                      <option value="podcast">Podcast</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="discord">Discord Community</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-semibold text-gray-300 mb-2">
                      Audience Size (Optional)
                    </label>
                    <input
                      type="text"
                      id="audience"
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="e.g., 10,000 followers"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-gray-300 mb-2">
                      Website/Social Profile URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="website"
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="https://..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-bold text-lg py-6"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By applying, you agree to our affiliate terms and conditions.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'How long does the commission last?',
                a: 'Forever! You earn 10% commission every single month for as long as your referral stays subscribed. If they stay for 5 years, you earn for 5 years.'
              },
              {
                q: 'When and how do I get paid?',
                a: 'Commissions are paid monthly via PayPal or bank transfer. Minimum payout is $50. Payments are processed within 5 business days of the end of each month.'
              },
              {
                q: 'Is there a limit to how much I can earn?',
                a: 'No limit! Refer as many people as you want. The more referrals, the more you earn. Some of our top affiliates earn $10,000+ per month.'
              },
              {
                q: 'Do I need a website to join?',
                a: 'No! You can promote through social media, YouTube, Discord, email, or anywhere else. We provide you with everything you need.'
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-6 hover:border-hp-yellow/40 transition-all"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-bold text-hp-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AffiliatesPage

