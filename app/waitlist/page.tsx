'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, User, CheckCircle2, AlertCircle, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export default function WaitlistPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitlistStats, setWaitlistStats] = useState({
    filled: 0,
    remaining: 0,
    total: 100,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Fetch waitlist stats on mount
  useEffect(() => {
    const fetchWaitlistStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/waitlist/stats`)
        const data = await response.json()
        if (data.success) {
          setWaitlistStats({
            filled: data.filled || 0,
            remaining: data.remaining || 100,
            total: data.total || 100,
          })
        }
      } catch (err) {
        console.error('Failed to fetch waitlist stats:', err)
      }
    }

    fetchWaitlistStats()
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email'
        return ''
      case 'firstName':
        if (!value) return 'First name is required'
        if (value.length < 2) return 'First name must be at least 2 characters'
        return ''
      case 'lastName':
        if (!value) return 'Last name is required'
        if (value.length < 2) return 'Last name must be at least 2 characters'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    
    setError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate all fields
    const newErrors = {
      email: validateField('email', formData.email),
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
    }

    setErrors(newErrors)

    // Check if there are any validation errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '')
    if (hasErrors) {
      setError('Please fix the errors above before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        analytics.waitlistJoined({
          email: formData.email,
          position: data.position,
        })
      } else {
        setError(data.message || 'Failed to join waitlist. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('Waitlist signup error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-hp-black text-hp-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-hp-gray900 rounded-2xl border border-hp-yellow/30 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3">You're on the Waitlist! 🎉</h1>
          <p className="text-gray-400 mb-6">
            Thank you for your interest in Helwa AI. We've added you to our waitlist and will notify you as soon as spots become available.
          </p>
          
          <div className="bg-hp-black rounded-lg p-6 mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Your Position</span>
              <span className="text-2xl font-bold text-hp-yellow">#{waitlistStats.filled + 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Waitlist Size</span>
              <span className="text-sm font-semibold">{waitlistStats.filled + 1}/{waitlistStats.total}</span>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-400 mb-6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Check your email for confirmation</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>We'll notify you when beta spots open up</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Early waitlist members get priority access</span>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-hp-yellow hover:bg-hp-yellow600 text-hp-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            Back to Home
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-hp-yellow/10 via-transparent to-hp-yellow/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-hp-yellow/20 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-hp-gray900/80 to-hp-black/80 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 mb-6"
          >
            <Clock className="text-orange-400 w-4 h-4" />
            <span className="text-orange-400 text-sm font-semibold">Beta Program Full</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-hp-yellow via-hp-yellow600 to-hp-yellow bg-clip-text text-transparent">
            Join the Waitlist
          </h1>
          <p className="text-lg text-gray-400 mb-2">
            The beta program is currently at capacity
          </p>
          <p className="text-sm text-gray-500">
            Join our waitlist to be notified when new spots become available
          </p>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-hp-gray900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-hp-yellow">100</div>
              <div className="text-xs text-gray-500">Beta Spots</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{waitlistStats.filled}</div>
              <div className="text-xs text-gray-500">On Waitlist</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{waitlistStats.remaining}</div>
              <div className="text-xs text-gray-500">Spots Left</div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-hp-gray900 rounded-2xl border border-white/10 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-hp-black border ${
                    errors.firstName ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-hp-yellow/50 transition-all`}
                  placeholder="John"
                  disabled={isSubmitting}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-hp-black border ${
                    errors.lastName ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-hp-yellow/50 transition-all`}
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-hp-black border ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-hp-yellow/50 transition-all`}
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 hover:from-hp-yellow600 hover:to-hp-yellow text-hp-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-hp-yellow/20 hover:shadow-xl hover:shadow-hp-yellow/30 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Joining Waitlist...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Join Waitlist</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-xs text-gray-500 text-center">
              By joining the waitlist, you'll be among the first to know when beta spots open up. 
              We'll send you an email with instructions to claim your spot.
            </p>
          </form>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-hp-yellow transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

