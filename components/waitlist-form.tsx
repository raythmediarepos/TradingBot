'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, Users } from 'lucide-react'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

const WaitlistForm = () => {
  const [email, setEmail] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [status, setStatus] = React.useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [position, setPosition] = React.useState<number | null>(null)
  const [remainingSpots, setRemainingSpots] = React.useState<number | null>(null)

  // Fetch remaining spots on mount
  React.useEffect(() => {
    const fetchRemainingSpots = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/waitlist/remaining`)
        const data = await response.json()
        if (data.success) {
          setRemainingSpots(data.remaining)
        }
      } catch (error) {
        console.error('Failed to fetch remaining spots:', error)
      }
    }
    fetchRemainingSpots()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to join waitlist')
      }

      setStatus('success')
      setPosition(data.position)
      setEmail('')
      setFirstName('')
      setLastName('')
      
      // Update remaining spots
      if (remainingSpots !== null) {
        setRemainingSpots(remainingSpots - 1)
      }
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
            {remainingSpots !== null && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-hp-yellow/10 border border-hp-yellow/30 rounded-full">
                <Users className="w-4 h-4 text-hp-yellow" />
                <span className="text-sm font-semibold text-hp-yellow">
                  {remainingSpots} spots remaining
                </span>
              </div>
            )}
          </div>

          <div className="p-8 bg-hp-gray900 border border-hp-yellow/10 rounded-lg">
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-hp-white mb-2">
                  You're on the list!
                </h3>
                {position && (
                  <p className="text-hp-yellow font-semibold mb-2">
                    Position #{position} in line
                  </p>
                )}
                <p className="text-gray-400">
                  We'll notify you as soon as the trading bot launches. Check your inbox for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-400 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hp-yellow focus:border-transparent"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hp-yellow focus:border-transparent"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

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

