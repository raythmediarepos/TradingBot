'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, ArrowRight, Sparkles, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export default function BetaSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [userData, setUserData] = useState<{
    email: string
    firstName: string
    position: number
    isFree: boolean
    emailSent?: boolean
  } | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    const loadUserData = async () => {
      // Try to get signup data from session storage first (for fresh signups)
      const signupData = sessionStorage.getItem('betaSignup')
      if (signupData) {
        const data = JSON.parse(signupData)
        setUserData(data)
        
        // Track success page view
        analytics.betaSuccessPageViewed(data.position)
        
        // If this is a paid user (has session_id), redirect to dashboard after 5 seconds
        if (sessionId) {
          startRedirectCountdown()
        }
        return
      }

      // If no sessionStorage but we have session_id, this is a logged-in user completing payment
      if (sessionId) {
        console.log('✅ Payment successful, verifying payment...')
        
        // Verify the payment with backend
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/verify-payment/${sessionId}`
          )
          const result = await response.json()
          console.log('📦 Payment verification result:', result)
          
          if (result.success) {
            console.log('✅ Payment verified! Redirecting to dashboard...')
          } else {
            console.error('❌ Payment verification failed:', result.message)
          }
        } catch (error) {
          console.error('❌ Error verifying payment:', error)
        }
        
        // Redirect to dashboard after verification attempt
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        return
      }

      // No data at all - redirect to signup
      console.log('No user data found, redirecting to signup...')
      router.push('/beta/signup')
    }

    const startRedirectCountdown = () => {
      setRedirecting(true)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    loadUserData()
  }, [router, sessionId])

  const handleResendEmail = async () => {
    if (!userData?.email) return
    
    setResendStatus('sending')
    setResendMessage('')

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userData.email }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setResendStatus('success')
        setResendMessage(data.message || 'Verification email sent! Check your inbox.')
        // Update userData to reflect email was sent
        setUserData(prev => prev ? { ...prev, emailSent: true } : null)
      } else {
        setResendStatus('error')
        setResendMessage(data.message || 'Failed to send email. Please try again.')
      }
    } catch (error) {
      setResendStatus('error')
      setResendMessage('Network error. Please check your connection and try again.')
      console.error('Error resending email:', error)
    }
  }

  // Show loading/redirecting screen for logged-in users with no userData
  if (!userData && sessionId) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-hp-yellow to-hp-yellow/80 mb-6 shadow-lg shadow-hp-yellow/30"
          >
            <CheckCircle2 className="w-12 h-12 text-hp-black" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h2>
          <p className="text-white/60">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-hp-yellow/20 to-transparent blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-6 py-6">
          <a href="/" className="inline-flex items-center gap-2 text-hp-yellow hover:text-hp-yellow/80 transition-colors">
            <span className="text-2xl font-bold">🐝 Helwa AI</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Redirect Banner for Paid Users */}
          {redirecting && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-hp-yellow/10 border-2 border-hp-yellow rounded-xl text-center"
            >
              <p className="text-hp-yellow font-bold mb-2">
                🎉 Payment Successful!
              </p>
              <p className="text-white/80 text-sm">
                Redirecting to your dashboard in <span className="font-bold text-hp-yellow">{countdown}</span> seconds...
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-6 py-2 bg-hp-yellow text-hp-black rounded-lg font-bold hover:bg-hp-yellow/90 transition-colors"
              >
                Go to Dashboard Now →
              </button>
            </motion.div>
          )}
        

          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-hp-yellow to-hp-yellow/80 mb-6 shadow-lg shadow-hp-yellow/30"
            >
              <CheckCircle2 className="w-12 h-12 text-hp-black" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              You&apos;re In! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/60"
            >
              Welcome to the Helwa AI Beta Program, {userData.firstName}!
            </motion.p>
          </motion.div>

          {/* Position Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className={`p-8 rounded-2xl border-2 text-center ${
              userData.isFree
                ? 'bg-gradient-to-br from-hp-yellow/20 to-hp-yellow/10 border-hp-yellow'
                : 'bg-hp-gray/10 border-white/10'
            }`}>
              <p className="text-sm text-white/60 uppercase tracking-wide mb-2">Your Beta Position</p>
              <p className="text-6xl font-bold text-hp-yellow mb-4">#{userData.position}</p>
              {userData.isFree && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-hp-yellow text-hp-black rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase">FREE ACCESS</span>
                </div>
              )}
              {!userData.isFree && (
                <p className="text-white/60">$49.99 one-time payment required (access until Dec 31, 2025)</p>
              )}
            </div>
          </motion.div>

          {/* Email Status Warning */}
          {userData.emailSent === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-6"
            >
              <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-400 mb-1">
                      Verification Email Failed to Send
                    </h3>
                    <p className="text-sm text-red-300/80 mb-3">
                      We encountered an issue sending your verification email. Don&apos;t worry - your account is created!
                    </p>
                    <button
                      onClick={handleResendEmail}
                      disabled={resendStatus === 'sending'}
                      className="w-full sm:w-auto px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resendStatus === 'sending' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Resend Verification Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Resend Success/Error Messages */}
          {resendMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className={`p-4 rounded-xl border-2 ${
                resendStatus === 'success'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <p className={`text-sm ${
                  resendStatus === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {resendMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* Next Steps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Mail className="w-6 h-6 text-hp-yellow" />
                Check Your Email
              </h2>
              {userData.emailSent !== false && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendStatus === 'sending' || resendStatus === 'success'}
                  className="text-sm text-hp-yellow hover:text-hp-yellow/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Resend verification email"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hp-yellow/20 border-2 border-hp-yellow flex items-center justify-center">
                  <span className="text-sm font-bold text-hp-yellow">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Open Your Inbox</h3>
                  <p className="text-white/60">
                    We sent a verification email to{' '}
                    <span className="text-hp-yellow font-mono">{userData.email}</span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hp-yellow/20 border-2 border-hp-yellow flex items-center justify-center">
                  <span className="text-sm font-bold text-hp-yellow">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Verify Your Email</h3>
                  <p className="text-white/60">
                    Click the verification link in the email (check spam if you don&apos;t see it)
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hp-yellow/20 border-2 border-hp-yellow flex items-center justify-center">
                  <span className="text-sm font-bold text-hp-yellow">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Log In to Dashboard</h3>
                  <p className="text-white/60">
                    After email verification, log in to access your personal dashboard
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hp-yellow/20 border-2 border-hp-yellow flex items-center justify-center">
                  <span className="text-sm font-bold text-hp-yellow">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {userData.isFree ? 'Get Discord Invite (FREE!)' : 'Complete Payment & Join Discord'}
                  </h3>
                  <p className="text-white/60">
                    {userData.isFree
                      ? 'Generate your Discord invite link from your dashboard and join our community'
                      : 'Complete your $49.99 one-time payment and get your Discord invite instantly'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Important Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-hp-yellow/5 border border-hp-yellow/20 rounded-xl mb-8"
          >
            <h3 className="text-sm font-bold text-hp-yellow mb-3 uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-hp-yellow mt-0.5">•</span>
                <span>Your verification link expires in <strong className="text-white">24 hours</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hp-yellow mt-0.5">•</span>
                <span>Check your spam folder if you don&apos;t see the email within 5 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hp-yellow mt-0.5">•</span>
                <span>After verification, log in with your email and password to access your dashboard</span>
              </li>
              {!userData.isFree && (
                <li className="flex items-start gap-2">
                  <span className="text-hp-yellow mt-0.5">•</span>
                  <span>Your access is valid until December 31, 2025 - no recurring charges!</span>
                </li>
              )}
            </ul>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Return to Homepage
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center space-y-3"
          >
            <div className="p-4 bg-hp-yellow/5 border border-hp-yellow/20 rounded-lg inline-block">
              <p className="text-sm text-white/70 mb-2">
                <strong className="text-hp-yellow">Didn&apos;t receive email?</strong>
              </p>
              <ul className="text-sm text-white/60 space-y-1 text-left">
                <li>• Check your spam/junk folder</li>
                <li>• Click the "Resend" button above</li>
                <li>• Wait a few minutes and check again</li>
                <li>• Contact us if issues persist</li>
              </ul>
            </div>
            <p className="text-sm text-white/40">
              Need help? Email us at{' '}
              <a href="mailto:support@helwa.ai" className="text-hp-yellow hover:underline font-semibold">
                support@helwa.ai
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
