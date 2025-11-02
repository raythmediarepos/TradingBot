'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { login, isAuthenticated } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(redirect)
    }
  }, [router, redirect])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Redirect to dashboard or original destination
        router.push(redirect)
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Background Effects */}
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
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-hp-yellow/20 to-transparent blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-hp-yellow hover:text-hp-yellow600 transition-colors">
            <span className="text-2xl font-bold">🐝 Helwa AI</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-hp-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to access your dashboard</p>
            </div>

            {/* Login Form */}
            <div className="bg-hp-gray900 border border-hp-yellow/20 rounded-2xl p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-hp-yellow focus:outline-none focus:ring-2 focus:ring-hp-yellow/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-hp-yellow focus:outline-none focus:ring-2 focus:ring-hp-yellow/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black font-bold rounded-lg hover:shadow-lg hover:shadow-hp-yellow/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* Links */}
              <div className="space-y-3 text-center text-sm">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/beta/signup" className="text-hp-yellow hover:text-hp-yellow600 font-medium transition-colors">
                    Join Beta Program
                  </Link>
                </p>
                <p className="text-gray-500">
                  <Link href="/admin/login" className="hover:text-gray-300 transition-colors">
                    Admin Login
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-sm text-gray-500 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

