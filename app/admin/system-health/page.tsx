'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Shield, 
  Activity, 
  Users, 
  DollarSign, 
  Mail, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  RefreshCw
} from 'lucide-react'
import { fetchWithAuth, logout, getUserData } from '@/lib/auth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function SystemHealthContent() {
  const router = useRouter()
  const user = getUserData()
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealthData = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/system-health')
      const data = await response.json()

      if (data.success) {
        setHealthData(data.data)
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHealthData()
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'text-green-500'
      case 'degraded':
        return 'text-yellow-500'
      case 'unhealthy':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Activity className="w-6 h-6 text-gray-500" />
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
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="text-2xl font-bold text-hp-yellow flex items-center gap-2">
                <Activity className="w-6 h-6" />
                System Health
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-hp-gray900 border border-white/10 rounded-lg hover:bg-hp-gray800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-hp-yellow animate-spin" />
          </div>
        ) : !healthData ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No health data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-hp-gray900 via-hp-gray900 to-hp-gray800/50 border-2 border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden"
            >
              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 pointer-events-none ${
                healthData.overallStatus === 'healthy' 
                  ? 'bg-gradient-to-r from-green-500/5 to-transparent' 
                  : 'bg-gradient-to-r from-red-500/5 to-transparent'
              }`} />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    System Status
                  </h2>
                  <p className="text-sm text-gray-400">
                    Last checked: {healthData.lastCheck ? new Date(healthData.lastCheck).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className={`flex items-center gap-4 px-6 py-3 rounded-xl border-2 backdrop-blur-sm ${
                  healthData.overallStatus === 'healthy' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${
                    healthData.overallStatus === 'healthy' 
                      ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                      : 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50'
                  }`} />
                  {getStatusIcon(healthData.overallStatus)}
                  <span className={`text-3xl font-bold ${getStatusColor(healthData.overallStatus)}`}>
                    {healthData.overallStatus?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Uptime */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-hp-gray900 to-hp-gray800/50 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                  <span className={`text-3xl font-bold ${
                    (healthData.systemMetrics?.uptimePercent || 0) >= 99 ? 'text-green-500' :
                    (healthData.systemMetrics?.uptimePercent || 0) >= 95 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {healthData.systemMetrics?.uptimePercent?.toFixed?.(2) || '0.00'}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-300">System Uptime</p>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </motion.div>

              {/* Total Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-hp-gray900 to-hp-gray800/50 border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-blue-500">
                    {(healthData.userMetrics?.totalUsers ?? healthData.userMetrics?.total) || 0}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-300">Total Users</p>
                <p className="text-xs text-blue-400/60 mt-1">
                  +{healthData.userMetrics?.signupsToday || 0} new today
                </p>
              </motion.div>

              {/* Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-hp-gray900 to-hp-gray800/50 border border-white/10 rounded-xl p-6 hover:border-hp-yellow/30 transition-all duration-300 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-hp-yellow/10 group-hover:bg-hp-yellow/20 transition-colors">
                    <DollarSign className="w-6 h-6 text-hp-yellow" />
                  </div>
                  <span className="text-3xl font-bold text-hp-yellow">
                    ${(healthData.businessMetrics?.totalRevenue || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-xs text-hp-yellow/60 mt-1">
                  +${healthData.businessMetrics?.revenueToday || 0} today
                </p>
              </motion.div>

              {/* Email Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-hp-gray900 to-hp-gray800/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Mail className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className={`text-3xl font-bold ${
                    (healthData.emailMetrics?.deliveryRate || 0) >= 95 ? 'text-green-500' :
                    (healthData.emailMetrics?.deliveryRate || 0) >= 80 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {healthData.emailMetrics?.deliveryRate?.toFixed?.(0) || healthData.emailMetrics?.deliveryRate || 0}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-300">Email Delivery</p>
                <p className="text-xs text-gray-500 mt-1">
                  {healthData.emailMetrics?.sent || 0} sent (24h)
                </p>
              </motion.div>
            </div>

            {/* Services Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-hp-gray900 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-6">Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* API */}
                <div className="flex items-center justify-between p-4 bg-hp-black/50 rounded-lg">
                  <div>
                    <p className="font-semibold">API</p>
                    <p className="text-xs text-gray-400">
                      {healthData.services?.api?.averageResponseTime || 0}ms
                    </p>
                  </div>
                  {healthData.services?.api?.status === 'healthy' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Frontend */}
                <div className="flex items-center justify-between p-4 bg-hp-black/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Frontend</p>
                    <p className="text-xs text-gray-400">
                      {healthData.services?.frontend?.responseTime || 0}ms
                    </p>
                  </div>
                  {healthData.services?.frontend?.status === 'healthy' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Database */}
                <div className="flex items-center justify-between p-4 bg-hp-black/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Database</p>
                    <p className="text-xs text-gray-400">
                      {healthData.services?.database?.responseTime || 0}ms
                    </p>
                  </div>
                  {healthData.services?.database?.status === 'healthy' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Discord Bot */}
                <div className="flex items-center justify-between p-4 bg-hp-black/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Discord Bot</p>
                    <p className="text-xs text-gray-400">
                      {healthData.services?.discordBot?.status || 'unknown'}
                    </p>
                  </div>
                  {healthData.services?.discordBot?.status === 'healthy' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : healthData.services?.discordBot?.status === 'unknown' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Beta Program Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-hp-gray900 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-6">Beta Program</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-green-500">
                    {healthData.userMetrics?.verifiedUsers ?? healthData.userMetrics?.verified ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Discord Joined</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {healthData.userMetrics?.discordUsers ?? healthData.userMetrics?.discordJoined ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Today</p>
                  <p className="text-2xl font-bold text-hp-yellow">
                    {healthData.userMetrics?.activeToday || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Beta Spots</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {healthData.businessMetrics?.betaSpotsFilled ?? healthData.userMetrics?.totalUsers ?? 0}/100
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SystemHealthPage() {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <SystemHealthContent />
    </ProtectedRoute>
  )
}

