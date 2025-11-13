'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, CreditCard, LogOut, CheckCircle2, XCircle, Loader2, Shield, ExternalLink, Copy } from 'lucide-react'
import { fetchWithAuth, logout, getUserData } from '@/lib/auth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ReportIssueButton from '@/components/ReportIssueButton'

// Helper function to format date from various formats
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A'
  
  try {
    // Check if it's a Firestore Timestamp with seconds property
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString()
    }
    
    // Check if it's a serialized Firestore Timestamp with _seconds
    if (dateValue._seconds) {
      return new Date(dateValue._seconds * 1000).toLocaleDateString()
    }
    
    // Check if it's an ISO string or valid date string
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }
    }
    
    // Try direct Date conversion as last resort
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString()
    }
    
    return 'N/A'
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

function DashboardContent() {
  const router = useRouter()
  const user = getUserData()
  const [betaStatus, setBetaStatus] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [discordStatus, setDiscordStatus] = useState<any>(null)
  const [discordInvite, setDiscordInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pollingPaymentStatus, setPollingPaymentStatus] = useState(false)

  const fetchData = async () => {
    try {
      // First refresh the current user data from API
      const { getCurrentUser } = await import('@/lib/auth')
      await getCurrentUser()
      
      const [betaRes, subRes, discordRes] = await Promise.all([
        fetchWithAuth('/api/user/beta-status'),
        fetchWithAuth('/api/user/subscription'),
        fetchWithAuth('/api/user/discord-status'),
      ])

      const betaData = await betaRes.json()
      const subData = await subRes.json()
      const discordData = await discordRes.json()

      console.log('📊 Dashboard Data:', { betaData, subData, discordData })

      if (betaData.success) setBetaStatus(betaData.data)
      if (subData.success) setSubscription(subData.data)
      if (discordData.success) setDiscordStatus(discordData.data)
      
      return betaData
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return null
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchData()
      setLoading(false)
    }
    loadData()
  }, [])

  // Payment status polling
  useEffect(() => {
    // Only poll if user is paid (not free) and payment is not completed
    if (!betaStatus || betaStatus.isFree || betaStatus.paymentStatus === 'paid') {
      setPollingPaymentStatus(false)
      return
    }

    // Start polling for payment status
    console.log('💳 [POLL] Starting payment status polling...')
    setPollingPaymentStatus(true)

    const pollInterval = setInterval(async () => {
      console.log('💳 [POLL] Checking payment status...')
      const result = await fetchData()
      
      if (result?.success && result.data.paymentStatus === 'paid') {
        console.log('✅ [POLL] Payment confirmed! Stopping polling.')
        setPollingPaymentStatus(false)
        clearInterval(pollInterval)
        
        // Show success notification or update UI
        // You could add a toast notification here
      }
    }, 5000) // Poll every 5 seconds

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('💳 [POLL] Stopping payment status polling')
      clearInterval(pollInterval)
      setPollingPaymentStatus(false)
    }
  }, [betaStatus?.paymentStatus, betaStatus?.isFree])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const generateDiscordInvite = async () => {
    setGeneratingInvite(true)
    setInviteError(null)
    
    try {
      const response = await fetchWithAuth('/api/user/generate-discord-invite', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDiscordInvite(data.data)
      } else {
        setInviteError(data.message || 'Failed to generate Discord invite')
        if (data.redirectTo) {
          setTimeout(() => router.push(data.redirectTo), 2000)
        }
      }
    } catch (error) {
      console.error('Error generating Discord invite:', error)
      setInviteError('Failed to generate Discord invite. Please try again.')
    } finally {
      setGeneratingInvite(false)
    }
  }

  const copyInviteLink = () => {
    if (discordInvite?.inviteLink) {
      navigator.clipboard.writeText(discordInvite.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-hp-yellow/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-hp-yellow hover:text-hp-yellow600 transition-colors">
              🐝 Helwa AI
            </Link>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Link
                  href="/admin/beta-users"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Email Verification Banner */}
          {betaStatus && !betaStatus.emailVerified && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-hp-yellow/20 to-hp-yellow600/10 border-2 border-hp-yellow/50 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-hp-yellow/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-hp-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-hp-yellow mb-2">
                    ⚠️ Email Verification Required
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    Please verify your email address to activate your beta access and receive important updates.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetchWithAuth('/api/beta/resend-verification', {
                            method: 'POST',
                          })
                          const data = await res.json()
                          if (data.success) {
                            alert('✅ Verification email sent! Check your inbox.')
                          } else {
                            alert('❌ Failed to send email. Please try again.')
                          }
                        } catch (error) {
                          alert('❌ Error sending email. Please try again.')
                        }
                      }}
                      className="px-6 py-2.5 bg-hp-yellow text-hp-black rounded-lg font-bold hover:bg-hp-yellow600 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                      Resend Verification Email
                    </button>
                    <p className="text-xs text-white/60 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check your spam folder if you don't see the email
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-hp-white mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-400">Manage your beta access</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-hp-yellow animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Beta Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-hp-gray900 border border-hp-yellow/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-hp-yellow" />
                  Beta Status
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Position</p>
                    <p className="text-2xl font-bold text-hp-yellow">#{betaStatus?.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Access Type</p>
                    <p className="text-lg font-bold">
                      {betaStatus?.isFree ? (
                        <span className="text-green-500">FREE</span>
                      ) : (
                        <span className="text-blue-500">PAID</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email Status</p>
                    <p className="text-lg flex items-center gap-2">
                      {betaStatus?.emailVerified ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm">Pending</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Discord</p>
                    <p className="text-lg flex items-center gap-2">
                      {betaStatus?.discordJoined ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm">Not Connected</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Subscription Card */}
              {!betaStatus?.isFree && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-hp-gray900 border border-hp-yellow/20 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-hp-yellow" />
                    Payment Status
                  </h2>
                  {subscription?.hasSubscription || betaStatus?.paymentStatus === 'paid' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-500 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Paid
                          </p>
                          <p className="text-2xl font-bold mt-2">$49.99<span className="text-sm text-gray-400"> one-time</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Access Until</p>
                          <p className="text-green-500 font-medium">Dec 31, 2025</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-yellow-500 font-medium mb-2">Payment Required</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Complete your payment to access the Discord community
                      </p>
                      
                      {pollingPaymentStatus && (
                        <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Checking for payment...</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            If you completed payment in another tab, we'll detect it automatically
                          </p>
                        </div>
                      )}
                      
                      <Link
                        href={`/beta/payment?userId=${user?.id}`}
                        className="inline-block px-6 py-3 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black font-bold rounded-lg hover:shadow-lg hover:shadow-hp-yellow/30 transition-all"
                      >
                        {pollingPaymentStatus ? 'Return to Payment' : 'Complete Payment'}
                      </Link>
                      
                      <p className="text-xs text-gray-400 mt-3">
                        💳 $49.99 one-time • Valid until Dec 31, 2025
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Discord Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">🎮 Discord Access</h2>
                
                {/* Already Joined */}
                {discordStatus?.discordJoined ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-xl font-bold text-green-500 mb-2">Connected!</p>
                    <p className="text-gray-300 mb-4">
                      You're already a member of our Discord community
                    </p>
                    <p className="text-sm text-gray-400">
                      Discord: {discordStatus.discordUsername || 'Connected'}
                    </p>
                  </div>
                ) : discordInvite ? (
                  /* Invite Generated */
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <p className="text-green-500 font-medium flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Your Discord Invite is Ready!
                      </p>
                      <p className="text-xs text-gray-400">
                        📧 We've also sent this invite to your email as a backup
                      </p>
                    </div>
                    
                    {/* Step 1: Join Server */}
                    <div className="bg-hp-black/50 border border-indigo-500/30 rounded-lg p-4">
                      <p className="text-sm font-bold text-indigo-400 mb-3">Step 1: Join Discord Server</p>
                      <div className="flex gap-2 mb-3">
                        <a
                          href={discordInvite.inviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-center flex items-center justify-center gap-2"
                        >
                          Join Discord Server
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(discordInvite.inviteLink)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="w-full px-4 py-3 bg-hp-gray800 border border-indigo-500/30 text-indigo-300 font-semibold rounded-lg hover:bg-hp-gray700 transition-all text-center flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Invite Link
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step 2: Verification Token */}
                    <div className="bg-gradient-to-br from-hp-yellow/10 to-hp-yellow/5 border border-hp-yellow/30 rounded-lg p-4">
                      <p className="text-sm font-bold text-hp-yellow mb-3">Step 2: Send This Code to the Bot</p>
                      <p className="text-xs text-gray-400 mb-3">
                        After joining, our bot will DM you. Send this verification code:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black/50 px-4 py-3 rounded-lg text-hp-yellow font-mono text-base break-all">
                          {discordInvite.token}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(discordInvite.token)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="flex items-center gap-2 px-4 py-3 bg-hp-yellow/20 border border-hp-yellow/30 text-hp-yellow rounded-lg hover:bg-hp-yellow/30 transition-colors whitespace-nowrap"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        💡 Copy this code and paste it in the Discord DM from our bot
                      </p>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                      ⏰ Expires: {new Date(discordInvite.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  /* Generate Invite Button */
                  <div className="space-y-4">
                    {!betaStatus?.emailVerified ? (
                      <div className="text-center py-4">
                        <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-yellow-500 font-medium mb-2">Email Verification Required</p>
                        <p className="text-sm text-gray-400">
                          Please verify your email to access Discord
                        </p>
                      </div>
                    ) : betaStatus?.requiresPayment ? (
                      <div className="text-center py-4">
                        <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-yellow-500 font-medium mb-2">Payment Required</p>
                        <p className="text-sm text-gray-400 mb-4">
                          Complete your $49.99 one-time payment to unlock Discord access
                        </p>
                        <Link
                          href={`/beta/payment?userId=${user?.id}`}
                          className="inline-block px-6 py-3 bg-gradient-to-r from-hp-yellow to-hp-yellow/80 text-hp-black font-bold rounded-lg hover:shadow-lg hover:shadow-hp-yellow/30 transition-all"
                        >
                          Complete Payment
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-300 mb-4">
                          {betaStatus?.isFree 
                            ? '🎉 You have FREE access! Click below to get your Discord invite.'
                            : 'Click below to generate your Discord invite link'}
                        </p>
                        <button
                          onClick={generateDiscordInvite}
                          disabled={generatingInvite}
                          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          {generatingInvite ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              Generate Discord Invite
                              <ExternalLink className="w-5 h-5" />
                            </>
                          )}
                        </button>
                        
                        {inviteError && (
                          <p className="mt-4 text-sm text-red-400">{inviteError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-hp-gray900 border border-gray-700 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">
                      {formatDate(user?.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Report Issue Button - Fixed position */}
      <ReportIssueButton position="fixed" variant="button" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardContent />
    </ProtectedRoute>
  )
}

