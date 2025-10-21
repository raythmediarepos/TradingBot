'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const WaitlistForm = () => {
  const [email, setEmail] = React.useState('')
  const [list, setList] = React.useState<'newsletter' | 'chatbot'>('newsletter')
  const [status, setStatus] = React.useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, list }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    }
  }

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-b from-hp-black to-hp-gray900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-hp-white mb-4">
              Join the Trading Bot Waitlist
            </h2>
            <p className="text-gray-400 text-lg">
              Be the first to get early access to Honeypot AI halal-compliant trading signals
            </p>
          </div>

          <div className="p-8 bg-hp-gray900 border border-hp-yellow/10 rounded-lg">
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-hp-white mb-2">
                  You're on the list!
                </h3>
                <p className="text-gray-400">
                  We'll notify you as soon as the trading bot launches. Check your inbox for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hp-yellow focus:border-transparent"
                    disabled={status === 'loading'}
                  />
                </div>

                {/* Info Box */}
                <div className="p-4 bg-hp-yellow/5 border border-hp-yellow/20 rounded-lg">
                  <p className="text-sm text-gray-300 text-center">
                    <span className="font-semibold text-hp-yellow">Trading Bot Waitlist:</span> Get early access to halal-compliant trading signals
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Research Chatbot waitlist coming soon
                  </p>
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>

                {/* Privacy Note */}
                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to receive updates from Honeypot AI.
                  We respect your privacy and you can unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WaitlistForm

