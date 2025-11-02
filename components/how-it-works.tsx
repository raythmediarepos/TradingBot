'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Database, Search, ShieldCheck, Bell } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: Database,
      number: '01',
      title: 'Data Aggregation',
      description:
        'We continuously aggregate market data from multiple sources to identify potential trading opportunities.',
    },
    {
      icon: Search,
      number: '02',
      title: 'Quality Analysis',
      description:
        'Our team analyzes each call for quality, risk factors, and market conditions to ensure only the best opportunities.',
    },
    {
      icon: ShieldCheck,
      number: '03',
      title: 'Ethical Screening',
      description:
        'Every call is thoroughly screened to ensure it meets ethical investing principles and transparent criteria.',
    },
    {
      icon: Bell,
      number: '04',
      title: 'Delivered to Discord',
      description:
        'Approved trading calls are sent directly to our Discord community with full rationale and analysis.',
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-hp-gray900 to-hp-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-hp-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get started with Helwa AI in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-hp-yellow/20" />
                )}

                <div className="relative bg-hp-gray900 border border-hp-yellow/10 rounded-lg p-6 hover:border-hp-yellow/30 transition-colors">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-hp-yellow rounded-full flex items-center justify-center font-bold text-hp-black text-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-hp-yellow/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-hp-yellow" size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="text-hp-white font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

