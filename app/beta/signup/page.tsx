'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, User, CheckCircle2, AlertCircle, Check, X } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export default function BetaSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })
  const [errors, setErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [betaStats, setBetaStats] = useState({
    filled: 0,
    remaining: 0,
    total: 100,
    freeSlots: {
      remaining: 20,
    },
  })
  const [error, setError] = useState('')

  // Fetch beta stats on mount
  useEffect(() => {
    // Track page view
    analytics.betaSignupPageViewed(
      typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('source') || undefined
        : undefined
    )

    const fetchBetaStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/stats`)
        const data = await response.json()
        if (data.success) {
          setBetaStats(data.data)
          
          // Track stats viewed
          const position = data.data.filled + 1
          const isFree = position <= 20
          analytics.betaStatsViewed({
            spotsAvailable: data.data.remaining,
            position,
            isFree,
          })
        }
      } catch (err) {
        console.error('Failed to fetch beta stats:', err)
      }
    }

    fetchBetaStats()
  }, [])

  // Handle Escape key for email confirmation modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmailConfirmation) {
        setShowEmailConfirmation(false)
        // Focus on email field
        setTimeout(() => {
          document.getElementById('email')?.focus()
        }, 100)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showEmailConfirmation])

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
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter'
        if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter'
        if (!/[0-9]/.test(value)) return 'Password must contain a number'
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value
    const updatedFormData = { ...formData, [name]: fieldValue }
    setFormData(updatedFormData)
    
    // Track form start on first interaction
    if (!formData.email && !formData.firstName && !formData.lastName && value) {
      analytics.betaSignupStarted()
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    
    // If password changed, re-validate confirmPassword if it's filled
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : ''
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
    
    // If confirmPassword changed, validate against current password
    if (name === 'confirmPassword' && value && value !== updatedFormData.password) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
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

    // Validate all fields including passwords
    const newErrors = {
      email: validateField('email', formData.email),
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    }

    setErrors(newErrors)

    // Check if any errors
    if (Object.values(newErrors).some((error) => error !== '')) {
      setError('Please fix all errors before submitting')
      return
    }

    // Show email confirmation modal before submitting
    setShowEmailConfirmation(true)
  }

  const handleConfirmEmail = async () => {
    const position = betaStats.filled + 1
    const isFree = position <= 20

    // Track form submission
    analytics.betaSignupSubmitted({
      position,
      isFree,
      hasTwitter: false, // Add these fields to form if needed
      hasDiscord: false,
    })

    setIsSubmitting(true)
    setShowEmailConfirmation(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Track successful signup
        analytics.betaSignupSuccess({
          position: data.data.position,
          isFree: data.data.isFree,
          email: formData.email,
        })

        // Store user data for success page (including email send status)
        sessionStorage.setItem('betaSignup', JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          position: data.data.position,
          isFree: data.data.isFree,
          emailSent: data.data.emailSent !== false, // Default to true if not provided
        }))
        
        // Redirect to success page
        router.push('/beta/success')
      } else {
        // Track failed signup
        analytics.betaSignupFailed(data.message || 'Unknown error')
        setError(data.message || 'Failed to sign up. Please try again.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      analytics.betaSignupFailed(errorMessage)
      setError('An error occurred. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextPosition = betaStats.filled + 1
  const isFreeSlot = nextPosition <= 20

  // Password strength checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }

  // Check if form is complete and valid
  const isFormComplete = 
    formData.email.trim() !== '' &&
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.password !== '' &&
    formData.confirmPassword !== '' &&
    formData.agreedToTerms
  
  const hasErrors = Object.values(errors).some((error) => error !== '')
  const isFormValid = isFormComplete && !hasErrors

  const handleEditEmail = () => {
    setShowEmailConfirmation(false)
    // Focus on email field
    setTimeout(() => {
      document.getElementById('email')?.focus()
    }, 100)
  }

  // Track email confirmation shown
  useEffect(() => {
    if (showEmailConfirmation) {
      // Track that confirmation modal was shown
      console.log('📧 Email confirmation modal shown:', formData.email)
    }
  }, [showEmailConfirmation])

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 shadow-2xl"
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-hp-yellow/10 border border-hp-yellow/30 flex items-center justify-center">
              <Mail className="w-8 h-8 text-hp-yellow" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2">
              Confirm Your Email
            </h2>
            <p className="text-white/60 text-center mb-8">
              We'll send your verification link to this address
            </p>

            {/* Email Display */}
            <div className="mb-8 p-6 bg-hp-black border border-hp-yellow/20 rounded-xl">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-2 text-center">
                Your Email Address
              </p>
              <p className="text-xl font-bold text-hp-yellow text-center break-all">
                {formData.email}
              </p>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-hp-black/50 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/50">Name:</span>
                <span className="text-white font-medium">{formData.firstName} {formData.lastName}</span>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-hp-yellow/10 border border-hp-yellow/20 rounded-lg">
              <p className="text-xs text-white/70 text-center">
                ⚠️ Please make sure this email is correct. You'll need to access it to verify your account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEditEmail}
                className="flex-1 px-6 py-4 bg-hp-black border border-white/20 text-white rounded-xl font-semibold hover:bg-hp-gray800 transition-all"
              >
                ✏️ Edit Email
              </button>
              <button
                onClick={handleConfirmEmail}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black rounded-xl font-bold hover:shadow-lg hover:shadow-hp-yellow/20 transition-all"
              >
                ✓ Confirm & Continue
              </button>
            </div>

            {/* Keyboard Hint */}
            <p className="mt-4 text-xs text-center text-white/40">
              Press <kbd className="px-2 py-1 bg-hp-black border border-white/20 rounded text-white/60">Esc</kbd> to edit
            </p>
          </motion.div>
        </div>
      )}

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
          {/* Beta Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full mb-6">
              <span className="text-hp-yellow text-sm font-bold uppercase tracking-wider">
                Limited Beta Access
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join the Beta Program
            </h1>
            
            <p className="text-xl text-white/60 mb-8">
              {betaStats.remaining === 0 ? (
                'Beta program is currently full'
              ) : (
                <>Only <strong className="text-hp-yellow">{betaStats.remaining}</strong> spots remaining</>
              )}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/40 mb-2">
                <span>{betaStats.filled} joined</span>
                <span>{betaStats.total} total spots</span>
              </div>
              <div className="h-2 bg-hp-gray900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(betaStats.filled / betaStats.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-hp-yellow to-hp-yellow600"
                />
              </div>
            </div>

            {/* Next Position Badge */}
            {betaStats.remaining > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`inline-flex flex-col items-center gap-2 px-8 py-4 rounded-2xl border-2 ${
                  isFreeSlot
                    ? 'bg-gradient-to-br from-hp-yellow/20 to-hp-yellow600/10 border-hp-yellow'
                    : 'bg-hp-gray900 border-white/10'
                }`}
              >
                <p className="text-sm text-white/60 uppercase tracking-wide">Your Position</p>
                <p className="text-5xl font-bold text-hp-yellow">#{nextPosition}</p>
                {isFreeSlot && (
                  <div className="flex items-center gap-2 px-4 py-1 bg-hp-yellow text-hp-black rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">FREE ACCESS</span>
                  </div>
                )}
                {!isFreeSlot && (
                  <p className="text-sm text-white/60">$49.99 one-time (until Dec 31, 2025)</p>
                )}
              </motion.div>
            )}
          </motion.div>

          {betaStats.remaining === 0 ? (
            /* Full Message */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-hp-gray900 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-hp-yellow" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Beta Program Full</h2>
              <p className="text-white/60 mb-8">
                All 100 beta spots have been filled. Join our waitlist to be notified when we open more spots.
              </p>
              <a
                href="/waitlist"
                className="inline-flex items-center gap-2 px-8 py-4 bg-hp-yellow text-hp-black rounded-xl font-bold hover:bg-hp-yellow600 transition-colors"
              >
                Join Waitlist Instead
              </a>
            </motion.div>
          ) : (
            /* Signup Form */
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

                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-white/80 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-4 bg-hp-black border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.firstName
                            ? 'border-red-500/50 focus:ring-red-500/50'
                            : 'border-white/10 focus:ring-hp-yellow/50'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-white/80 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-4 bg-hp-black border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.lastName
                            ? 'border-red-500/50 focus:ring-red-500/50'
                            : 'border-white/10 focus:ring-hp-yellow/50'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
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
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-4 bg-hp-black border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? 'border-red-500/50 focus:ring-red-500/50'
                            : 'border-white/10 focus:ring-hp-yellow/50'
                        }`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-4 bg-hp-black border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-white/10 focus:ring-hp-yellow/50'
                      }`}
                      placeholder="Create a secure password"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3 p-3 bg-hp-black/50 border border-white/5 rounded-lg space-y-2">
                        <p className="text-xs text-white/50 font-semibold mb-2">Password Requirements:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`flex items-center gap-2 text-xs ${passwordChecks.length ? 'text-green-400' : 'text-white/40'}`}>
                            {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${passwordChecks.uppercase ? 'text-green-400' : 'text-white/40'}`}>
                            {passwordChecks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Uppercase letter</span>
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${passwordChecks.lowercase ? 'text-green-400' : 'text-white/40'}`}>
                            {passwordChecks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Lowercase letter</span>
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${passwordChecks.number ? 'text-green-400' : 'text-white/40'}`}>
                            {passwordChecks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Number</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/80 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-4 pr-12 bg-hp-black border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                          errors.confirmPassword
                            ? 'border-red-500/50 focus:ring-red-500/50'
                            : formData.confirmPassword && formData.confirmPassword === formData.password
                            ? 'border-green-500/50 focus:ring-green-500/50'
                            : 'border-white/10 focus:ring-hp-yellow/50'
                        }`}
                        placeholder="Confirm your password"
                      />
                      {formData.confirmPassword && formData.confirmPassword === formData.password && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                      {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                    {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                      <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Passwords match!
                      </p>
                    )}
                  </div>

                  {/* What Happens Next */}
                  <div className="p-6 bg-hp-yellow/5 border border-hp-yellow/20 rounded-xl">
                    <h3 className="text-sm font-bold text-hp-yellow mb-3 uppercase tracking-wide">
                      What Happens Next
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70">
                          We'll send a verification email to confirm your address
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70">
                          {isFreeSlot
                            ? 'Get instant access to our Discord community until Dec 31, 2025 (FREE)'
                            : 'Complete payment ($49.99 one-time) to join Discord until Dec 31, 2025'}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-hp-yellow flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70">
                          Start receiving real-time ethical trading signals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full py-4 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-hp-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining Beta...
                      </>
                    ) : (
                      <>
                        Join Beta Program →
                      </>
                    )}
                  </button>
                  
                  {!isFormValid && isFormComplete && (
                    <p className="text-sm text-red-400 text-center">
                      Please fix all errors before submitting
                    </p>
                  )}
                  
                  {!isFormComplete && (
                    <p className="text-sm text-white/40 text-center">
                      Please fill out all fields to continue
                    </p>
                  )}

                  {/* Terms of Service Agreement */}
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          name="agreedToTerms"
                          checked={formData.agreedToTerms}
                          onChange={handleChange}
                          className="w-5 h-5 bg-hp-black border-2 border-white/20 rounded cursor-pointer
                                   checked:bg-hp-yellow checked:border-hp-yellow
                                   focus:outline-none focus:ring-2 focus:ring-hp-yellow/50
                                   transition-all appearance-none
                                   checked:after:content-['✓'] checked:after:text-hp-black 
                                   checked:after:text-sm checked:after:font-bold
                                   checked:after:absolute checked:after:inset-0
                                   checked:after:flex checked:after:items-center checked:after:justify-center"
                        />
                      </div>
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                        I agree to the{' '}
                        <a 
                          href="/legal/terms" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hp-yellow hover:underline font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a 
                          href="/legal/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hp-yellow hover:underline font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                        <span className="text-red-400 ml-1">*</span>
                      </span>
                    </label>
                    
                    {!formData.agreedToTerms && isFormComplete && (
                      <p className="text-xs text-red-400 flex items-center gap-1 ml-8">
                        <AlertCircle className="w-3 h-3" />
                        You must agree to the Terms of Service to continue
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

