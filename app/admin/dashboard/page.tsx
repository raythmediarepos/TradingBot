'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Users, DollarSign, MessageSquare, Activity, TrendingUp, Clock,
  CheckCircle2, User, CreditCard, Loader2, RefreshCcw, AlertCircle, Receipt, Calendar, Menu
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
  const [expenseData, setExpenseData] = useState<any>(null)
  const [profitMetrics, setProfitMetrics] = useState<any>(null)
  const [stockAnomalies, setStockAnomalies] = useState<any[]>([])
  const [anomaliesLoading, setAnomaliesLoading] = useState(false)

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
      
      // Fetch dashboard stats, expenses, and stock anomalies in parallel
      const [dashboardRes, expensesRes, anomaliesRes] = await Promise.all([
        fetchWithAuth('/api/admin/dashboard'),
        fetchWithAuth('/api/admin/expenses/data'),
        fetchWithAuth('/api/admin/stock-anomalies')
      ])
      
      const dashboardResult = await dashboardRes.json()
      const expensesResult = await expensesRes.json()
      const anomaliesResult = await anomaliesRes.json()
      
      if (dashboardResult.success) {
        setStats(dashboardResult.stats)
        setRecentActivity(dashboardResult.recentActivity)
      }
      
      if (expensesResult.success) {
        setExpenseData(expensesResult)
        
        // Calculate profit metrics
        const totalRevenue = dashboardResult.stats?.revenue?.total || 0
        const totalExpenses = expensesResult.metrics?.totalExpenses || 0
        const totalProfit = totalRevenue - totalExpenses
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
        
        // Monthly profit (last 30 days)
        const last30DaysRevenue = dashboardResult.stats?.revenue?.last30Days || 0
        const last30DaysExpenses = expensesResult.metrics?.last30DaysExpenses || 0
        const monthlyProfit = last30DaysRevenue - last30DaysExpenses
        
        // Yearly profit (last 12 months)
        const yearlyExpenses = expensesResult.metrics?.last12MonthsExpenses || 0
        const yearlyProfit = totalRevenue - yearlyExpenses // Assuming all revenue is from this year
        
        setProfitMetrics({
          totalProfit,
          profitMargin,
          monthlyProfit,
          yearlyProfit,
          totalRevenue,
          totalExpenses,
          last30DaysRevenue,
          last30DaysExpenses,
          yearlyExpenses
        })
      }
      
      if (anomaliesResult.success) {
        setStockAnomalies(anomaliesResult.anomalies || [])
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
        {/* Profit Metrics */}
        {profitMetrics && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-400 mb-4 uppercase tracking-wider">Financial Performance</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Profit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-hp-gray900 border ${profitMetrics.totalProfit >= 0 ? 'border-green-500/30' : 'border-red-500/30'} rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${profitMetrics.totalProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg`}>
                    <TrendingUp className={`w-6 h-6 ${profitMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <span className={`text-xs font-semibold ${profitMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profitMetrics.profitMargin.toFixed(1)}% margin
                  </span>
                </div>
                <h3 className={`text-3xl font-bold mb-1 ${profitMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitMetrics.totalProfit >= 0 ? '+' : ''}${profitMetrics.totalProfit.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-400">Total Profit (All Time)</p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                  <span className="text-green-400">${profitMetrics.totalRevenue.toFixed(2)}</span> revenue -{' '}
                  <span className="text-red-400">${profitMetrics.totalExpenses.toFixed(2)}</span> expenses
                </div>
              </motion.div>

              {/* Monthly Profit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-hp-gray900 border ${profitMetrics.monthlyProfit >= 0 ? 'border-blue-500/30' : 'border-red-500/30'} rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${profitMetrics.monthlyProfit >= 0 ? 'bg-blue-500/20' : 'bg-red-500/20'} rounded-lg`}>
                    <Calendar className={`w-6 h-6 ${profitMetrics.monthlyProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-xs text-gray-400">Last 30 days</span>
                </div>
                <h3 className={`text-3xl font-bold mb-1 ${profitMetrics.monthlyProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {profitMetrics.monthlyProfit >= 0 ? '+' : ''}${profitMetrics.monthlyProfit.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-400">Monthly Profit</p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                  <span className="text-green-400">${profitMetrics.last30DaysRevenue.toFixed(2)}</span> -{' '}
                  <span className="text-red-400">${profitMetrics.last30DaysExpenses.toFixed(2)}</span>
                </div>
              </motion.div>

              {/* Yearly Profit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-hp-gray900 border ${profitMetrics.yearlyProfit >= 0 ? 'border-purple-500/30' : 'border-red-500/30'} rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${profitMetrics.yearlyProfit >= 0 ? 'bg-purple-500/20' : 'bg-red-500/20'} rounded-lg`}>
                    <Activity className={`w-6 h-6 ${profitMetrics.yearlyProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-xs text-gray-400">Last 12 months</span>
                </div>
                <h3 className={`text-3xl font-bold mb-1 ${profitMetrics.yearlyProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {profitMetrics.yearlyProfit >= 0 ? '+' : ''}${profitMetrics.yearlyProfit.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-400">Yearly Profit</p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                  Expenses: <span className="text-red-400">${profitMetrics.yearlyExpenses.toFixed(2)}</span>
                </div>
              </motion.div>

              {/* Total Expenses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-hp-gray900 border border-orange-500/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-400" />
                  </div>
                  <button
                    onClick={() => router.push('/admin/expenses')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    View All →
                  </button>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-orange-400">
                  ${profitMetrics.totalExpenses.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-400">Total Expenses</p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                  {expenseData?.metrics?.totalCount || 0} transactions
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Top 3 Stock Anomalies */}
        {stockAnomalies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-400 mb-4 uppercase tracking-wider">Top Anomalies Today</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stockAnomalies.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/60 transition-all"
                >
                  {/* Header with Logo and Ticker */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {anomaly.logoUrl && (
                        <img 
                          src={anomaly.logoUrl} 
                          alt={`${anomaly.ticker} logo`}
                          className="w-12 h-12 rounded-lg bg-white/5 p-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{anomaly.ticker}</h3>
                        <p className="text-xs text-gray-400">{anomaly.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${anomaly.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {anomaly.percentChange >= 0 ? '+' : ''}{anomaly.percentChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Volume</span>
                      <span className="text-sm font-semibold text-white">
                        ${(anomaly.cumulativeDollarVolume / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Price</span>
                      <span className="text-sm font-semibold text-white">
                        ${anomaly.priceAtCapture?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Sector</span>
                      <span className="text-sm font-semibold text-white">{anomaly.sector}</span>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <p className="text-xs text-gray-300 leading-relaxed">{anomaly.aiSummary}</p>
                  </div>

                  {/* Signal Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      anomaly.signal === 'BUY' 
                        ? 'bg-green-500/20 text-green-400' 
                        : anomaly.signal === 'SELL'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {anomaly.signal}
                    </span>
                    <span className="text-xs text-gray-400">{anomaly.confidence}% confidence</span>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                      Updated: {anomaly.lastUpdated ? new Date(anomaly.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
              <button
                onClick={() => router.push('/admin/expenses')}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>Company Expenses</span>
                <Receipt className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/navigation')}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-sm flex items-center justify-between"
              >
                <span>Navigation Settings</span>
                <Menu className="w-4 h-4" />
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
