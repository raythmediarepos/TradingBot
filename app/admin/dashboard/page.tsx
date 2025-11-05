'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Users, Settings, LogOut, Loader2 } from 'lucide-react'
import { isAuthenticated, isAdmin, logout, getUserData } from '@/lib/auth'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    const userData = getUserData()
    setUser(userData)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-hp-yellow animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-purple-500/20 to-transparent blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 border-2 border-purple-500/30 rounded-full">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hp-yellow">Helwa AI Admin</h1>
              <p className="text-sm text-gray-400">Administrator Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Welcome Back, {user?.firstName}! 👋</h2>
            <p className="text-gray-400">Manage your Helwa AI platform from this dashboard.</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Users Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-hp-gray900 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 border-2 border-blue-500/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Total Users</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </motion.div>

            {/* Beta Users Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-hp-gray900 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 border-2 border-green-500/30 rounded-full">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Beta Members</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-hp-gray900 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 border-2 border-purple-500/30 rounded-full">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-3xl font-bold">-</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Revenue</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </motion.div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-hp-gray900 border border-purple-500/30 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 border-2 border-purple-500/30 rounded-full mb-6">
              <Shield className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Dashboard Coming Soon</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We're building out comprehensive admin tools. Check back soon for user management, 
              analytics, Discord moderation, and more!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/admin/beta-users')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                View Beta Users
              </button>
              <button
                onClick={() => router.push('/admin/discord')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Discord Management
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                Analytics
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-hp-gray800 border border-gray-700 text-white font-bold rounded-lg hover:bg-hp-gray700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
