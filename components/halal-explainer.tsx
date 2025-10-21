'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, X, BarChart3, Info } from 'lucide-react'

const HalalExplainer = () => {
  const features = [
    {
      icon: X,
      title: 'Sector Exclusions',
      description:
        'No alcohol, gambling, adult entertainment, or conventional banking/interest-heavy businesses.',
    },
    {
      icon: ShieldCheck,
      title: 'No Derivatives',
      description:
        'Zero options, calls, puts, or leveraged products—ever. Only direct equity and compliant crypto.',
    },
    {
      icon: BarChart3,
      title: 'Financial Screening',
      description:
        'Interest income thresholds and leverage limits aligned with halal investing principles.',
    },
    {
      icon: Info,
      title: 'Configurable Standards',
      description:
        'You control how strictly screens are applied based on your interpretation.',
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-hp-black to-hp-gray900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-hp-black border border-hp-yellow/20 rounded-full px-4 py-2 mb-4">
              <ShieldCheck className="text-hp-yellow" size={16} />
              <span className="text-hp-yellow text-sm font-medium">
                Halal Compliance
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-hp-white mb-4">
              What Halal-Compliant Means
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Transparency in how we screen and filter trading opportunities
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-hp-black border border-hp-yellow/10 rounded-lg hover:border-hp-yellow/30 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-hp-yellow/10 rounded-lg flex items-center justify-center">
                      <Icon className="text-hp-yellow" size={20} />
                    </div>
                    <div>
                      <h3 className="text-hp-white font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-hp-yellow/5 border border-hp-yellow/20 rounded-lg"
          >
            <p className="text-gray-300 text-center">
              <span className="font-semibold text-hp-yellow">Note:</span> We
              apply sector exclusions and financial screens aligned with halal
              investing principles and avoid options or leveraged products. You
              control how strictly screens are applied.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HalalExplainer

