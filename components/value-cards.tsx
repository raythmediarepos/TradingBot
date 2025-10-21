'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, FileText, Sliders } from 'lucide-react'

const ValueCards = () => {
  const values = [
    {
      icon: Shield,
      title: 'Halal by Design',
      description:
        'Screened tickers and no derivatives—ever. Built from the ground up with compliance in mind.',
      color: 'hp-yellow',
    },
    {
      icon: Zap,
      title: 'Speed that Matters',
      description:
        'Sub-second signal pipeline with instant notifications. When markets move, you know immediately.',
      color: 'hp-yellow',
    },
    {
      icon: FileText,
      title: 'Explainable Signals',
      description:
        'Each alert shows the "why" in plain English. See the datapoints and rationale behind every signal.',
      color: 'hp-yellow',
    },
    {
      icon: Sliders,
      title: 'Practical Guardrails',
      description:
        'Position sizing helpers and risk management tools. You stay in complete control of your trades.',
      color: 'hp-yellow',
    },
  ]

  return (
    <section id="features" className="py-24 bg-hp-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-hp-yellow/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-hp-white mb-4">
            Why Traders Choose Honeypot
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features designed for traders who value speed, transparency, and compliance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-hp-gray900 border border-hp-yellow/10 rounded-lg hover:border-hp-yellow/30 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 bg-hp-yellow/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-hp-yellow" size={24} />
                </div>
                <h3 className="text-hp-white font-semibold text-lg mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ValueCards

