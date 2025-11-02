'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Users, ArrowRight, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import pricingData from '@/data/pricing.json'

type PricingTier = {
  id: string
  name: string
  priceMonthly: string
  priceYearly: string
  billing?: string
  billingMonthly?: string
  billingYearly?: string
  yearlyTotal?: string
  monthlySavings?: string
  description: string
  features: string[]
  cta: string
  ctaLink: string
  highlighted: boolean
  badge?: string
}

const PricingTiers = () => {
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('monthly')
  const tiers = pricingData as PricingTier[]

  const getIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'pro':
        return Zap
      case 'team':
        return Users
      default:
        return Shield
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-hp-gray900 to-hp-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-hp-yellow/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-hp-yellow" />
            <span className="text-hp-yellow text-sm font-semibold">
              Transparent Pricing
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
            Choose your{' '}
            <span className="bg-gradient-to-r from-hp-yellow to-hp-yellow600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            No performance fees. No hidden charges. Cancel anytime.
            <br />
            <span className="text-hp-white font-medium">All plans include ethical screening.</span>
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={billingPeriod === 'monthly' ? 'text-hp-white font-semibold' : 'text-gray-400'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-hp-gray900 rounded-full border border-hp-yellow/20 transition-colors hover:border-hp-yellow/40"
            >
              <motion.div
                animate={{ x: billingPeriod === 'monthly' ? 2 : 28 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-hp-yellow rounded-full"
              />
            </button>
            <span className={billingPeriod === 'yearly' ? 'text-hp-white font-semibold' : 'text-gray-400'}>
              Yearly
            </span>
            <Badge variant="default" className="text-xs">
              Save 20%
            </Badge>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16">
          {tiers.map((tier, index) => {
            const Icon = getIcon(tier.name)
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Highlighted Border Glow */}
                {tier.highlighted && (
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-hp-yellow via-hp-yellow600 to-hp-yellow rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity" />
                )}

                <div
                  className={`relative h-full flex flex-col p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-br from-hp-black to-hp-gray900 border-2 border-hp-yellow shadow-2xl'
                      : 'bg-gradient-to-br from-hp-gray900/80 to-hp-black/80 border border-hp-yellow/20 hover:border-hp-yellow/40'
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="shadow-lg shadow-hp-yellow/30 px-4 py-1">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    tier.highlighted
                      ? 'bg-hp-yellow/20'
                      : 'bg-hp-yellow/10'
                  }`}>
                    <Icon className="w-7 h-7 text-hp-yellow" />
                  </div>

                  {/* Tier Name */}
                  <h3 className="text-2xl font-bold text-hp-white mb-2">
                    {tier.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-hp-white">
                        {billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly}
                      </span>
                      <span className="text-gray-400">
                        / {billingPeriod === 'monthly' 
                          ? (tier.billingMonthly || tier.billing || 'month')
                          : (tier.billingYearly || 'month')
                        }
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && tier.priceMonthly !== '$0' && (
                      <p className="text-sm text-hp-yellow mt-2">
                        {tier.yearlyTotal ? `${tier.yearlyTotal}/year` : 'Billed yearly'} • {tier.monthlySavings || 'Save 20%'}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    className={`w-full mb-8 group/btn ${
                      tier.highlighted
                        ? 'shadow-lg shadow-hp-yellow/20 hover:shadow-xl hover:shadow-hp-yellow/30'
                        : ''
                    }`}
                    asChild
                  >
                    <Link href={tier.ctaLink} className="flex items-center justify-center gap-2">
                      {tier.cta}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  {/* Features */}
                  <div className="space-y-4 flex-grow">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      What's included:
                    </p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + featureIndex * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 bg-hp-yellow/20 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-hp-yellow" />
                          </div>
                          <span className="text-gray-300 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-hp-white text-center mb-8">
            Feature Comparison
          </h3>
          
          <div className="overflow-x-auto rounded-2xl border border-hp-yellow/20 bg-hp-gray900/50 backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hp-yellow/20">
                  <th className="text-left p-4 text-gray-400 font-semibold">Feature</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Free</th>
                  <th className="text-center p-4 text-hp-yellow font-semibold">Pro</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hp-yellow/10">
                {[
                  { feature: 'Real-time alerts', free: false, pro: true, team: true },
                  { feature: 'Ethical screening', free: true, pro: true, team: true },
                  { feature: 'Email notifications', free: true, pro: true, team: true },
                  { feature: 'SMS & Telegram alerts', free: false, pro: true, team: true },
                  { feature: 'Signal rationale', free: false, pro: true, team: true },
                  { feature: 'Unlimited tickers', free: false, pro: true, team: true },
                  { feature: 'Research Chatbot', free: false, pro: true, team: true },
                  { feature: 'Priority support', free: false, pro: true, team: true },
                  { feature: 'Team collaboration', free: false, pro: false, team: true },
                  { feature: 'API access', free: false, pro: false, team: true },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-hp-yellow/5 transition-colors">
                    <td className="p-4 text-gray-300">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.free ? (
                        <Check className="w-5 h-5 text-hp-yellow mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center bg-hp-yellow/5">
                      {row.pro ? (
                        <Check className="w-5 h-5 text-hp-yellow mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.team ? (
                        <Check className="w-5 h-5 text-hp-yellow mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 space-y-4"
        >
          <p className="text-gray-500 text-sm">
            All prices in USD. No hidden fees. Cancel your subscription at any time.
          </p>
          <p className="text-gray-400">
            Need a custom plan?{' '}
            <a href="mailto:sales@helwa.ai" className="text-hp-yellow hover:underline font-semibold">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingTiers

