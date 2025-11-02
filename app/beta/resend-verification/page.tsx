'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validate email
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setStatus('sending')

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Verification email sent! Check your inbox.')
      } else {
        setStatus('error')
        setError(data.message || 'Failed to send verification email. Please try again.')
      }
    } catch (err) {
      console.error('Resend verification error:', err)
      setStatus('error')
      setError('An error occurred. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <a href="/" className="inline-flex items-center gap-2 text-hp-yellow hover:text-hp-yellow600 transition-colors">
            <span className="text-2xl font-bold">🐝 Helwa AI</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Link
            href="/beta/signup"
            className="inline-flex items-center gap-2 text-white/60 hover:text-hp-yellow transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signup
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-hp-yellow/10 border border-hp-yellow/20 mb-6">
              <Mail className="w-10 h-10 text-hp-yellow" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Resend Verification Email
            </h1>
            <p className="text-lg text-white/60">
              Enter your email address and we'll send you a new verification link
            </p>
          </motion.div>

          {status === 'success' ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <h2 className="text-2xl font-bold text-green-500">Email Sent!</h2>
                </div>
                <p className="text-white/80 mb-4">
                  {message}
                </p>
                <p className="text-sm text-white/60">
                  Check your inbox (and spam folder) for a new verification link. The link will expire in 24 hours.
                </p>
              </div>

              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-hp-yellow">What's Next:</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <span>Check your email inbox for the verification link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <span>Click the link to verify your email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <span>Log in to your dashboard and get started!</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setStatus('idle')
                    setEmail('')
                    setMessage('')
                  }}
                  className="text-white/60 hover:text-hp-yellow text-sm underline"
                >
                  Didn't receive it? Send again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-hp-gray900 border border-white/10 rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        disabled={status === 'sending'}
                        className="w-full pl-12 pr-4 py-4 bg-hp-black border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-hp-yellow/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      Enter the email address you used to sign up for beta access
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-hp-yellow/5 border border-hp-yellow/20 rounded-xl">
                    <p className="text-sm text-white/70">
                      <strong className="text-hp-yellow">Note:</strong> If you've recently requested a verification email, you may need to wait a few minutes before requesting another one.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'sending' || !email.trim()}
                    className="w-full py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-hp-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Verification Email
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Help Section */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/40">
                  Need help?{' '}
                  <a href="mailto:support@helwa.ai" className="text-hp-yellow hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

