'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle, Zap, Shield, TrendingUp, ArrowRight, Sparkles, BarChart3, Clock } from 'lucide-react'

const Hero = () => {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 600], [1, 0])
  const scale = useTransform(scrollY, [0, 600], [1, 0.95])

  const trustMetrics = [
    { icon: Shield, label: 'Ethically Screened', value: '100%', description: 'Transparent criteria' },
    { icon: Zap, label: 'Ultra-Fast', value: '<1s', description: 'Signal latency' },
    { icon: TrendingUp, label: 'Uptime', value: '99.9%', description: 'Service reliability' },
    { icon: CheckCircle, label: 'Transparent', value: 'Full', description: 'Signal rationale' },
  ]

  const stats = [
    { value: '1B+', label: 'Data Points' },
    { value: '24/7', label: 'Market Monitoring' },
    { value: '50+', label: 'Verified Stocks' },
  ]

  return (
    <section className="relative bg-hp-black pt-32 pb-24 overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-hp-yellow/10 via-transparent to-hp-yellow/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-hp-yellow/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-32 h-32 bg-hp-yellow/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-10 w-40 h-40 bg-hp-yellow/5 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-hp-gray900/80 to-hp-black/80 backdrop-blur-sm border border-hp-yellow/30 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-hp-yellow/10"
          >
            <Sparkles className="text-hp-yellow w-4 h-4" />
            <span className="text-hp-yellow text-sm font-semibold tracking-wide">
              AI-Powered Ethical Trading
            </span>
            <span className="bg-hp-yellow/20 text-hp-yellow text-xs font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          </motion.div>

          {/* Main Heading with Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-hp-white mb-6 leading-[1.1] tracking-tight"
          >
            Trade with{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-hp-yellow via-hp-yellow to-hp-yellow600 bg-clip-text text-transparent">
                confidence
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-hp-yellow to-hp-yellow600 rounded-full"
              />
            </span>
            <br />
            <span className="text-gray-300">and</span>{' '}
            <span className="bg-gradient-to-r from-hp-yellow via-hp-yellow to-hp-yellow600 bg-clip-text text-transparent">
              clarity
            </span>
          </motion.h1>

          {/* Enhanced Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Real-time ethical trading signals with{' '}
            <span className="text-hp-white font-medium">transparent rationale</span>
            —powered by AI, guided by principles, built for results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-500/30 rounded-full mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-400 font-semibold">
              Beta Program NOW OPEN — 100 Spots Available (First 20 FREE)
            </span>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button 
              size="lg" 
              asChild 
              className="w-full sm:w-auto text-base px-8 h-14 shadow-lg shadow-hp-yellow/20 hover:shadow-xl hover:shadow-hp-yellow/30 transition-all group relative overflow-hidden"
            >
              <Link href="/beta/signup" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Join Beta Program
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="absolute top-0 right-0 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-bl-lg">
                  LIVE
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto text-base px-8 h-14 border-2 hover:bg-hp-yellow/5 group"
            >
              <Link href="#waitlist" className="flex items-center gap-2">
                Or Join Waitlist
              </Link>
            </Button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-500 mb-12 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            First 20 users get <strong className="text-hp-yellow mx-1">FREE</strong> access • $49.99 one-time after • Valid until Dec 31, 2025
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16 pb-16 border-b border-hp-yellow/10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-hp-yellow mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium Trust Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-8"
          >
            {trustMetrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative p-6 bg-gradient-to-br from-hp-gray900/90 to-hp-black/90 backdrop-blur-sm rounded-xl border border-hp-yellow/20 hover:border-hp-yellow/40 transition-all duration-300 hover:shadow-lg hover:shadow-hp-yellow/10"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-hp-yellow/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="w-12 h-12 bg-hp-yellow/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-hp-yellow/20 transition-colors">
                      <Icon className="text-hp-yellow" size={24} />
                    </div>
                    <div className="text-2xl font-bold text-hp-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-gray-300 mb-1">
                      {metric.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Enhanced Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Shield className="w-3 h-3" />
            <span>Not financial advice. Past performance doesn&apos;t guarantee future results.</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-hp-yellow/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-hp-yellow rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero

