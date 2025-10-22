'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, AlertCircle } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const AdminLoginPage = () => {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Simple password check (stored in environment variable)
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

    if (password === correctPassword) {
      // Store admin auth
      localStorage.setItem('adminAuth', JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
      }))
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-hp-yellow/5 rounded-full blur-[120px]" />
      </div>

      <section className="relative pt-32 pb-20 min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-hp-yellow" />
                </div>
                <h1 className="text-3xl font-bold text-hp-white mb-2">
                  Admin Access
                </h1>
                <p className="text-gray-400 text-sm">
                  Enter admin password to continue
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold text-lg py-6"
                >
                  {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Unauthorized access is prohibited
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AdminLoginPage

