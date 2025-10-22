'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const AffiliateLoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tradingbot-w843.onrender.com'
      
      const response = await fetch(`${apiUrl}/api/affiliates/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store affiliate data in session/localStorage
        localStorage.setItem('affiliateAuth', JSON.stringify(data.affiliate))
        
        // Redirect to setup if not completed, otherwise dashboard
        if (!data.affiliate.setupCompleted) {
          router.push('/affiliates/setup')
        } else {
          router.push('/affiliates/dashboard')
        }
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-hp-yellow/5 rounded-full blur-[120px]" />
      </div>

      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full mb-4">
                  <LogIn className="w-8 h-8 text-hp-yellow" />
                </div>
                <h1 className="text-3xl font-bold text-hp-white mb-2">
                  Affiliate Login
                </h1>
                <p className="text-gray-400">
                  Access your affiliate dashboard
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold text-lg py-6"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <a href="/affiliates#signup" className="text-hp-yellow hover:underline">
                      Sign up here
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Need help? Contact{' '}
                    <a href="mailto:affiliates@honeypotai.com" className="text-hp-yellow hover:underline">
                      affiliates@honeypotai.com
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AffiliateLoginPage
