'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Target, Zap, Shield, Globe, DollarSign, BarChart3, Lock, Mail, ArrowRight } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const InvestorsPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const metrics = [
    { label: 'Market Size', value: '$12.8B', icon: Globe, description: 'Islamic Finance Tech Market by 2027' },
    { label: 'Target Users', value: '1.8B', icon: Users, description: 'Muslim investors worldwide' },
    { label: 'Growth Rate', value: '25%', icon: TrendingUp, description: 'Annual market growth' },
    { label: 'Beta Waitlist', value: '100', icon: Target, description: 'Early adopters secured' },
  ]

  const traction = [
    { label: 'Waitlist Growth', value: '150%', period: 'Month-over-Month' },
    { label: 'Market Validation', value: '95%', period: 'User Interest Rate' },
    { label: 'Beta Launch', value: 'Q4 2025', period: 'First 100 Users' },
    { label: 'Revenue Target', value: '$500K', period: 'Year 1 ARR' },
  ]

  const highlights = [
    {
      icon: Shield,
      title: 'Unique Value Proposition',
      description: 'First AI-powered trading platform exclusively for halal-compliant investing with transparent Shariah screening.'
    },
    {
      icon: Zap,
      title: 'Technology Edge',
      description: 'Real-time AI analysis of 1B+ data points with <1s latency, delivering instant actionable insights.'
    },
    {
      icon: DollarSign,
      title: 'Revenue Model',
      description: 'Subscription-based SaaS with tiered pricing ($29-$199/month) targeting high-value traders and institutions.'
    },
    {
      icon: Lock,
      title: 'Market Moat',
      description: 'Proprietary Shariah compliance algorithms and first-mover advantage in the Islamic fintech AI space.'
    },
  ]

  const roadmap = [
    {
      quarter: 'Q4 2025',
      title: 'Beta Launch',
      items: ['100 beta users onboarded', 'Discord community launch', 'Core trading signals live']
    },
    {
      quarter: 'Q1 2026',
      title: 'Public Launch',
      items: ['Full platform release', 'Marketing campaign', 'Revenue generation begins']
    },
    {
      quarter: 'Q2 2026',
      title: 'Scale & Expand',
      items: ['1,000+ paying subscribers', 'Mobile app launch', 'Advanced AI features']
    },
    {
      quarter: 'Q3 2026',
      title: 'Growth Phase',
      items: ['Institutional partnerships', 'International expansion', 'Series A fundraising']
    },
  ]

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
              <DollarSign className="w-4 h-4 text-hp-yellow" />
              <span className="text-sm font-semibold text-hp-yellow">Investment Opportunity</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-hp-white via-hp-yellow to-hp-white bg-clip-text text-transparent">
              Invest in the Future of
              <br />
              Halal Trading Intelligence
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing Islamic finance with AI-powered trading signals. 
              We're building the platform that 1.8 billion Muslims have been waiting for.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-bold text-lg px-8"
                asChild
              >
                <a href="mailto:investors@honeypotai.com">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Us
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                asChild
              >
                <Link href="#deck">
                  View Investment Deck
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Metrics */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Islamic fintech is one of the fastest-growing sectors globally, with unprecedented demand for ethical investment tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-6 hover:border-hp-yellow/40 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <metric.icon className="w-10 h-10 text-hp-yellow mb-4" />
                <div className="text-4xl font-bold text-hp-white mb-2">{metric.value}</div>
                <div className="text-lg font-semibold text-gray-300 mb-1">{metric.label}</div>
                <div className="text-sm text-gray-500">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20 bg-gradient-to-b from-transparent to-hp-gray900/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Why Invest in Honeypot AI?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We're not just building software—we're creating the infrastructure for ethical investing at scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-8 hover:border-hp-yellow/40 hover:shadow-lg hover:shadow-hp-yellow/10 transition-all"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <highlight.icon className="w-12 h-12 text-hp-yellow mb-4" />
                <h3 className="text-xl font-bold text-hp-white mb-3">{highlight.title}</h3>
                <p className="text-gray-400 leading-relaxed">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction Metrics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Early Traction & Momentum
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Strong product-market fit validated by rapid user adoption and engagement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {traction.map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-gradient-to-br from-hp-yellow/10 to-hp-yellow/5 border border-hp-yellow/30 rounded-xl p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl font-bold text-hp-yellow mb-2">{item.value}</div>
                <div className="text-lg font-semibold text-hp-white mb-1">{item.label}</div>
                <div className="text-sm text-gray-400">{item.period}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-gradient-to-b from-hp-gray900/50 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-hp-white mb-4">
              Growth Roadmap
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Clear path to profitability with aggressive but achievable milestones.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roadmap.map((phase, index) => (
                <motion.div
                  key={phase.quarter}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-6 hover:border-hp-yellow/40 transition-all h-full">
                    <div className="inline-block px-3 py-1 bg-hp-yellow/20 text-hp-yellow text-xs font-bold rounded-full mb-4">
                      {phase.quarter}
                    </div>
                    <h3 className="text-xl font-bold text-hp-white mb-4">{phase.title}</h3>
                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-hp-yellow mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < roadmap.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-hp-yellow/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Deck CTA */}
      <section id="deck" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-br from-hp-yellow/10 via-hp-yellow/5 to-transparent border border-hp-yellow/30 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BarChart3 className="w-16 h-16 text-hp-yellow mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-hp-white mb-4">
              Ready to Learn More?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Get access to our detailed investment deck, financial projections, and team information. 
              We're actively seeking strategic partners and investors who share our vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-bold text-lg px-8"
                asChild
              >
                <a href="mailto:investors@honeypotai.com?subject=Investment Inquiry">
                  <Mail className="w-5 h-5 mr-2" />
                  Request Investment Deck
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                asChild
              >
                <Link href="/#waitlist">
                  Try the Platform
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-hp-yellow/20">
              <p className="text-sm text-gray-500">
                Contact us at <a href="mailto:investors@honeypotai.com" className="text-hp-yellow hover:underline">investors@honeypotai.com</a> or schedule a call to discuss partnership opportunities.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default InvestorsPage

