'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, CreditCard, Sparkles } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export default function BetaVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<{
    userId: string
    isFree: boolean
    requiresPayment: boolean
    status: string
  } | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      // Track verification start
      analytics.betaEmailVerificationStarted()

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        )

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage(data.message)
          setUserData(data.data)

          // Track successful verification
          analytics.betaEmailVerificationSuccess({
            position: data.data.position || 0,
            isFree: !data.data.requiresPayment,
          })

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
          analytics.betaEmailVerificationFailed(data.message || 'Unknown error')
        }
      } catch (err) {
        console.error('Verification error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Network error'
        analytics.betaEmailVerificationFailed(errorMessage)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [token, router])

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
        <div className="max-w-2xl mx-auto">
          {status === 'verifying' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-hp-gray900 border border-white/10 mb-6">
                <Loader2 className="w-12 h-12 text-hp-yellow animate-spin" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Verifying Your Email...</h1>
              <p className="text-white/60">
                Please wait while we confirm your email address
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-hp-yellow to-hp-yellow600 mb-6 shadow-lg shadow-hp-yellow/30"
                >
                  <CheckCircle2 className="w-12 h-12 text-hp-black" />
                </motion.div>

                <h1 className="text-4xl font-bold mb-4">Email Verified! ✓</h1>
                <p className="text-xl text-white/60 mb-8">{message}</p>
              </div>

              {userData && (
                <>
                  {userData.isFree ? (
                    /* Free User - Redirect to Dashboard */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-hp-yellow/20 to-hp-yellow600/10 border-2 border-hp-yellow rounded-2xl p-8 mb-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-hp-yellow" />
                        <h2 className="text-2xl font-bold">Free Beta Access!</h2>
                      </div>
                      <p className="text-lg text-white/80 mb-6">
                        Congratulations! You've secured one of the first 20 free spots.
                      </p>
                      <div className="p-6 bg-hp-black/30 rounded-xl border border-hp-yellow/30">
                        <h3 className="font-bold mb-3 text-hp-yellow">What's Next:</h3>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Log in to your dashboard</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Get your Discord invite link instantly (100% FREE!)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Join our Discord server and start trading!</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-center gap-3 p-4 bg-hp-yellow/10 border border-hp-yellow/30 rounded-xl mt-6">
                        <Loader2 className="w-5 h-5 text-hp-yellow animate-spin" />
                        <p className="text-sm text-white/80">
                          Redirecting to login in <strong className="text-hp-yellow">3 seconds</strong>...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* Paid User - Redirect to Login */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-hp-gray900 border border-white/10 rounded-2xl p-8 mb-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-hp-yellow" />
                        <h2 className="text-2xl font-bold">Beta Access Verified</h2>
                      </div>
                      <p className="text-lg text-white/60 mb-6">
                        Your email is verified! Log in to your dashboard to complete payment and access Discord.
                      </p>
                      
                      <div className="p-6 bg-hp-yellow/5 border border-hp-yellow/20 rounded-xl mb-6">
                        <h3 className="font-bold text-hp-yellow mb-3">What's Next:</h3>
                        <ul className="space-y-2 text-white/70">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Log in to your dashboard</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Complete your $49.99 one-time payment</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Get your Discord invite and join the community</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                            <span>Start receiving trading signals!</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-center gap-3 p-4 bg-hp-yellow/10 border border-hp-yellow/30 rounded-xl mb-6">
                        <Loader2 className="w-5 h-5 text-hp-yellow animate-spin" />
                        <p className="text-sm text-white/80">
                          Redirecting to login in <strong className="text-hp-yellow">3 seconds</strong>...
                        </p>
                      </div>

                      <button
                        onClick={() => router.push('/login?verified=true')}
                        className="w-full py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow/80 text-hp-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-hp-yellow/20 transition-all"
                      >
                        Continue to Login →
                      </button>
                    </motion.div>
                  )}

                  {/* Help Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-sm text-white/40">
                      Questions or issues?{' '}
                      <a href="mailto:support@helwaai.com" className="text-hp-yellow hover:underline">
                        Contact Support
                      </a>
                    </p>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500 mb-6">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-4xl font-bold mb-4">Verification Failed</h1>
                <p className="text-xl text-white/60 mb-8">{message}</p>
              </div>

              <div className="bg-hp-gray900 border border-white/10 rounded-2xl p-8 mb-8">
                <h3 className="font-bold text-lg mb-4">Common Issues:</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-hp-yellow mt-1">•</span>
                    <span>The verification link may have expired (links are valid for 24 hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-hp-yellow mt-1">•</span>
                    <span>The link may have already been used</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-hp-yellow mt-1">•</span>
                    <span>You may have clicked an old verification link</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/beta/resend-verification"
                  className="flex-1 py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black rounded-xl font-bold text-center hover:shadow-lg hover:shadow-hp-yellow/20 transition-all"
                >
                  Resend Verification Email
                </a>
                <a
                  href="mailto:support@helwa.ai"
                  className="flex-1 py-4 bg-hp-gray900 text-white border border-white/10 rounded-xl font-bold text-center hover:bg-white/5 transition-all"
                >
                  Contact Support
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

