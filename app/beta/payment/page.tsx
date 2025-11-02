'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle2, Loader2, XCircle, Lock } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export default function BetaPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')

  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error'>('loading')
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<{
    email: string
    firstName: string
    lastName: string
    position: number
  } | null>(null)

  useEffect(() => {
    if (!userId) {
      setStatus('error')
      setError('No user ID provided')
      return
    }

    const fetchUserData = async () => {
      try {
        console.log('📡 Fetching user data for userId:', userId)
        
        // Try to get from sessionStorage first (for fresh signups)
        const signupData = sessionStorage.getItem('betaSignup')
        if (signupData) {
          console.log('✅ Found user data in sessionStorage')
          const data = JSON.parse(signupData)
          setUserData({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName || 'User',
            position: data.position,
          })
          
          // Track payment page view
          analytics.betaPaymentPageViewed(data.position)
          setStatus('ready')
          return
        }

        // If not in sessionStorage, fetch from API (for logged-in users)
        console.log('📡 Fetching from API...')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/user/${userId}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const result = await response.json()
        console.log('📦 API response:', result)

        if (result.success && result.data) {
          const user = result.data
          setUserData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName || 'User',
            position: user.position || 0,
          })
          
          // Track payment page view
          analytics.betaPaymentPageViewed(user.position || 0)
          console.log('✅ User data loaded successfully')
        } else {
          throw new Error('Invalid user data response')
        }

        setStatus('ready')
      } catch (err) {
        console.error('❌ Error fetching user data:', err)
        setStatus('error')
        setError('Failed to load user data. Please try again or contact support.')
      }
    }

    fetchUserData()
  }, [userId])

  const handleCheckout = async () => {
    console.log('🛒 Checkout button clicked')
    console.log('   → userId:', userId)
    console.log('   → userData:', userData)
    
    if (!userId || !userData) {
      const errorMsg = 'Missing required information'
      console.error('❌ Checkout error:', errorMsg)
      setError(errorMsg)
      setStatus('error')
      return
    }

    // Track payment start
    analytics.betaPaymentStarted({
      position: userData.position,
      amount: 49.99,
      currency: 'USD',
    })

    setStatus('processing')
    setError('')

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/create-checkout-session`
      console.log('📡 Calling API:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (data.success && data.sessionUrl) {
        console.log('✅ Redirecting to Stripe:', data.sessionUrl)
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl
      } else {
        console.error('❌ Checkout failed:', data)
        setStatus('error')
        setError(data.message || 'Failed to create checkout session')
        analytics.betaPaymentFailed(data.message || 'Unknown error')
      }
    } catch (err) {
      console.error('❌ Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      analytics.betaPaymentFailed(errorMessage)
      setStatus('error')
      setError(`Error: ${errorMessage}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-hp-black text-hp-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-hp-yellow animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-hp-black text-hp-white">
        <header className="border-b border-white/10">
          <div className="container mx-auto px-6 py-6">
            <a href="/" className="inline-flex items-center gap-2 text-hp-yellow hover:text-hp-yellow600 transition-colors">
              <span className="text-2xl font-bold">🐝 Helwa AI</span>
            </a>
          </div>
        </header>
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Payment Error</h1>
            <p className="text-white/60 mb-8">{error}</p>
            <a
              href="/beta/signup"
              className="inline-block px-8 py-4 bg-hp-yellow text-hp-black rounded-xl font-bold hover:bg-hp-yellow600 transition-colors"
            >
              Return to Signup
            </a>
          </div>
        </main>
      </div>
    )
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
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold mb-4">Beta Access</h1>
                <p className="text-xl text-white/60">
                  Get exclusive early access to Helwa AI trading signals
                </p>
              </div>

              {/* Position Badge */}
              {userData && (
                <div className="p-6 bg-hp-gray900 border border-white/10 rounded-2xl">
                  <p className="text-sm text-white/60 mb-2">Your Beta Position</p>
                  <p className="text-4xl font-bold text-hp-yellow">#{userData.position}</p>
                </div>
              )}

              {/* What's Included */}
              <div className="p-6 bg-hp-gray900 border border-white/10 rounded-2xl">
                <h3 className="font-bold text-xl mb-4">What's Included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Real-Time Trading Signals</p>
                      <p className="text-sm text-white/60">AI-powered buy/sell alerts delivered to Discord</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Ethical Approach</p>
                      <p className="text-sm text-white/60">All signals screened for Islamic compliance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Exclusive Beta Community</p>
                      <p className="text-sm text-white/60">Connect with fellow beta testers in Discord</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Direct Support</p>
                      <p className="text-sm text-white/60">Priority access to our team</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Cancel Anytime</p>
                      <p className="text-sm text-white/60">No long-term commitment required</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 p-4 bg-hp-yellow/5 border border-hp-yellow/20 rounded-xl">
                <Shield className="w-6 h-6 text-hp-yellow" />
                <div>
                  <p className="text-sm font-semibold">Secure Payment</p>
                  <p className="text-xs text-white/60">Powered by Stripe - Your payment info is never stored on our servers</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Payment Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-hp-gray900 border border-white/10 rounded-2xl p-8 sticky top-8">
                <h2 className="text-2xl font-bold mb-6">Payment Summary</h2>

                {/* Pricing */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/60">Beta Access</span>
                    <span className="font-bold">$49.99</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/60">Payment Type</span>
                    <span>One-Time</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Due</span>
                    <span className="text-hp-yellow">$49.99</span>
                  </div>
                </div>

                {/* User Info */}
                {userData && (
                  <div className="p-4 bg-hp-black/50 rounded-xl mb-6">
                    <p className="text-sm text-white/60 mb-2">Billing Email</p>
                    <p className="font-semibold">{userData.email}</p>
                  </div>
                )}

                {/* Error Display */}
                {error && status === 'error' && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={status === 'processing'}
                  className="w-full py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-hp-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading Checkout...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Proceed to Secure Checkout
                    </>
                  )}
                </button>

                {/* Stripe Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                  <CreditCard className="w-4 h-4" />
                  <span>Powered by Stripe</span>
                </div>

                {/* Fine Print */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <ul className="space-y-2 text-xs text-white/50">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Your access begins immediately upon payment and is valid until December 31, 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>You'll receive a Discord invite via email within minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Billing occurs monthly on the same date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Cancel anytime from your account dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>By proceeding, you agree to our{' '}
                        <a href="/legal/terms" className="text-hp-yellow hover:underline">Terms</a>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

