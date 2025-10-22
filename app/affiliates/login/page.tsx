'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AffiliateLoginPage = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // For demo purposes - in production, this would authenticate and redirect
      setError('Login functionality coming soon. Please check your email for your dashboard link.')
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      {/* Login Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-hp-yellow/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-hp-yellow to-hp-yellow600 rounded-xl mb-4 shadow-lg shadow-hp-yellow/20">
                  <Lock className="w-8 h-8 text-hp-black" />
                </div>
                <h1 className="text-3xl font-bold text-hp-white mb-2">
                  Affiliate Login
                </h1>
                <p className="text-gray-400">
                  Access your affiliate dashboard and track your earnings
                </p>
              </div>

              {/* Login Form */}
              <div className="bg-hp-gray900 border border-hp-yellow/20 rounded-xl p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-11 pr-12 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-hp-yellow/20 bg-hp-black text-hp-yellow focus:ring-hp-yellow/50"
                      />
                      <span className="text-gray-400">Remember me</span>
                    </label>
                    <a href="#" className="text-hp-yellow hover:text-hp-yellow600 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-bold text-lg py-6"
                  >
                    {isSubmitting ? (
                      'Logging in...'
                    ) : (
                      <>
                        Login to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-hp-yellow/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-hp-gray900 text-gray-500">or</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-3">
                    Don't have an affiliate account?
                  </p>
                  <Button
                    variant="outline"
                    className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                    asChild
                  >
                    <Link href="/affiliates#apply">
                      Apply to Become an Affiliate
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-500">
                  Need help? Contact us at{' '}
                  <a 
                    href="mailto:affiliates@honeypotai.com" 
                    className="text-hp-yellow hover:underline"
                  >
                    affiliates@honeypotai.com
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 border-t border-hp-yellow/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-hp-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-hp-yellow" />
              </div>
              <h3 className="font-semibold text-hp-white">Real-Time Analytics</h3>
              <p className="text-sm text-gray-400">
                Track clicks, conversions, and earnings in real-time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-hp-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-hp-yellow" />
              </div>
              <h3 className="font-semibold text-hp-white">Marketing Materials</h3>
              <p className="text-sm text-gray-400">
                Access banners, copy, and promotional content
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-hp-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-hp-yellow" />
              </div>
              <h3 className="font-semibold text-hp-white">Monthly Payouts</h3>
              <p className="text-sm text-gray-400">
                Automated payments via PayPal or bank transfer
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AffiliateLoginPage

