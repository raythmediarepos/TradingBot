'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, TrendingUp, Users, Award } from 'lucide-react'
import testimonials from '@/data/testimonials.json'

type Testimonial = {
  id: string
  quote: string
  author: string
  role: string
  rating: number
}

const Testimonials = () => {
  const testimonialsData = testimonials as Testimonial[]

  const trustBadges = [
    { icon: Users, value: '1B+', label: 'Data Points Analyzed' },
    { icon: TrendingUp, value: '50+', label: 'Halal Stocks Screened' },
    { icon: Award, value: '24/7', label: 'Market Coverage' },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-hp-black to-hp-gray900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-hp-yellow/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-hp-yellow/5 rounded-full blur-3xl" />

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
            <Award className="w-4 h-4 text-hp-yellow" />
            <span className="text-hp-yellow text-sm font-semibold">
              Trusted by Thousands
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
            Loved by traders{' '}
            <span className="bg-gradient-to-r from-hp-yellow to-hp-yellow600 bg-clip-text text-transparent">
              worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied traders making informed, halal-compliant decisions
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center p-6 bg-hp-black/50 backdrop-blur-sm border border-hp-yellow/10 rounded-xl"
              >
                <div className="w-12 h-12 bg-hp-yellow/10 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-hp-yellow" />
                </div>
                <div className="text-3xl font-bold text-hp-white mb-1">
                  {badge.value}
                </div>
                <div className="text-sm text-gray-400">{badge.label}</div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-8 bg-gradient-to-br from-hp-black/80 to-hp-gray900/80 backdrop-blur-sm border border-hp-yellow/20 rounded-2xl hover:border-hp-yellow/40 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-hp-yellow/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
              
              <div className="relative">
                {/* Quote Icon */}
                <Quote className="absolute -top-2 -left-2 w-12 h-12 text-hp-yellow/20" />
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-hp-yellow text-hp-yellow"
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-gray-300 text-lg leading-relaxed mb-6 relative z-10">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-hp-yellow/20 to-hp-yellow600/20 rounded-full flex items-center justify-center text-hp-yellow font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-hp-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            Built for traders who value compliance and transparency
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-hp-yellow/30 to-hp-yellow600/30 rounded-full border-2 border-hp-black flex items-center justify-center text-xs font-bold text-hp-yellow"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-2">
              Join early adopters getting exclusive access
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials

