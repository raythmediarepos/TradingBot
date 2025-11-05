'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Users, DollarSign, MessageSquare, Activity, TrendingUp, Clock,
  CheckCircle2, User, CreditCard, Loader2, RefreshCcw, AlertCircle
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout, getUserData } from '@/lib/auth'

interface DashboardStats {
  users: {
    total: number
    free: number
    paid: number
    verified: number
    discordJoined: number
    newToday: number
    newThisWeek: number
  }
  revenue: {
    total: number
    today: number
    thisWeek: number
    last7Days: { date: string; amount: number }[]
  }
  discord: {
    totalMembers: number
    verifiedMembers: number
    unverifiedMembers: number
    botOnline: boolean
  }
  analytics: {
    totalMessages: number
    activeUsers: number
  }
  signups: {
    last7Days: { date: string; count: number }[]
  }
}

interface RecentActivity {
  type: 'signup' | 'payment' | 'discord_join'
  user: {
    id: string
    email: string
    name: string
    isFree?: boolean
    discordUsername?: string
  }
  payment?: {
    id: string
    amount: number
    currency: string
  }
  timestamp: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    const userData = getUserData()
    setUser(userData)
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/admin/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.stats)
        setRecentActivity(result.recentActivity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <User className="w-4 h-4 text-blue-400" />
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-400" />
      case 'discord_join':
        return <MessageSquare className="w-4 h-4 text-purple-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'signup':
        return (
          <span>
            <strong>{activity.user.name}</strong> signed up
            {activity.user.isFree && <span className="text-green-400 ml-1">(FREE)</span>}
          </span>
        )
      case 'payment':
        return (
          <span>
            <strong>{activity.user?.name || 'User'}</strong> paid{' '}
            <span className="text-green-400 font-semibold">${activity.payment?.amount.toFixed(2)}</span>
          </span>
        )
      case 'discord_join':
        return (
          <span>
            <strong>{activity.user.name}</strong> joined Discord as{' '}
            <span className="text-purple-400">{activity.user.discordUsername}</span>
          </span>
        )
      default:
        return activity.type
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
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
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-hp-black/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">+{stats?.users.newThisWeek || 0} this week</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.users.total || 0}</h3>
            <p className="text-sm text-gray-400">Total Beta Users</p>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
              <span className="text-green-400">{stats?.users.free || 0}</span> free •{' '}
              <span className="text-purple-400">{stats?.users.paid || 0}</span> paid
            </div>
          </motion.div>

          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-gray-400">+${(stats?.revenue.thisWeek || 0).toFixed(2)} this week</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">${(stats?.revenue.total || 0).toFixed(2)}</h3>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
              Today: <span className="text-green-400">${(stats?.revenue.today || 0).toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Discord Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${stats?.discord.botOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-400">{stats?.discord.botOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.discord.totalMembers || 0}</h3>
            <p className="text-sm text-gray-400">Discord Members</p>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
              <span className="text-green-400">{stats?.discord.verifiedMembers || 0}</span> verified •{' '}
              <span className="text-yellow-400">{stats?.discord.unverifiedMembers || 0}</span> pending
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-hp-gray900 border border-orange-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.analytics.totalMessages || 0}</h3>
            <p className="text-sm text-gray-400">Discord Messages</p>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
              <span className="text-orange-400">{stats?.analytics.activeUsers || 0}</span> active users
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Revenue (Last 7 Days)
                </h3>
                <p className="text-xs text-gray-400 mt-1">Daily earnings trend</p>
              </div>
            </div>
            {stats && stats.revenue.last7Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.revenue.last7Days}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#888" tick={{ fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Signups Chart */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Signups (Last 7 Days)
                </h3>
                <p className="text-xs text-gray-400 mt-1">New user registrations</p>
              </div>
            </div>
            {stats && stats.signups.last7Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.signups.last7Days}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#888" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => [value, 'Signups']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={2} dot={{ fill: '#2196F3', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                No signup data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Recent Activity
              </h3>
              <p className="text-xs text-gray-400 mt-1">Last 15 events</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-hp-gray800 rounded-lg mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300">{getActivityText(activity)}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/beta-users')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>Manage Beta Users</span>
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/payments')}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>View Payments</span>
                <DollarSign className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/discord')}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>Discord Management</span>
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>View Analytics</span>
                <Activity className="w-4 h-4" />
              </button>
            </div>

            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold mb-3">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Discord Bot</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${stats?.discord.botOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={stats?.discord.botOnline ? 'text-green-400' : 'text-red-400'}>
                      {stats?.discord.botOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Stripe API</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Firebase</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-400">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
