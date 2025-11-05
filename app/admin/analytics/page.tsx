'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, MessageSquare, Users, Smile, Activity, Calendar,
  Loader2, RefreshCcw, Award
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface AnalyticsData {
  totalMessages: number
  topCommenters: { userId: string; username: string; messageCount: number }[]
  topEmojiUsers: { userId: string; username: string; emojiCount: number }[]
  channelStats: { channelId: string; channelName: string; messageCount: number; avgMessagesPerDay: string }[]
  monthlyGrowth: { month: string; messageCount: number; activeUsers: number }[]
  timeRange: string
}

interface MemberGrowthData {
  month: string
  joins: number
  total: number
}

const COLORS = ['#FFC107', '#9C27B0', '#2196F3', '#4CAF50', '#FF5722', '#00BCD4', '#FF9800', '#E91E63']

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthData[]>([])
  const [currentTotal, setCurrentTotal] = useState(0)
  const [timeRange, setTimeRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router, timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics
      const analyticsRes = await fetchWithAuth(`/api/admin/discord/analytics?timeRange=${timeRange}`)
      const analyticsData = await analyticsRes.json()
      if (analyticsData.success) {
        setAnalytics(analyticsData.data)
      }

      // Fetch member growth
      const growthRes = await fetchWithAuth('/api/admin/discord/member-growth')
      const growthData = await growthRes.json()
      if (growthData.success) {
        setMemberGrowth(growthData.data)
        setCurrentTotal(growthData.currentTotal)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
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
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-400" />
                  Discord Analytics
                </h1>
                <p className="text-sm text-gray-400">Server activity and engagement metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-hp-gray900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button onClick={() => { logout(); router.push('/admin/login'); }} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <p className="text-xs text-gray-400">Total Messages</p>
            </div>
            <p className="text-3xl font-bold">{analytics?.totalMessages.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">in {timeRange === 'all' ? 'all time' : timeRange}</p>
          </div>
          <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <p className="text-xs text-gray-400">Active Users</p>
            </div>
            <p className="text-3xl font-bold">{analytics?.topCommenters.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">with messages</p>
          </div>
          <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-5 h-5 text-yellow-400" />
              <p className="text-xs text-gray-400">Total Emojis</p>
            </div>
            <p className="text-3xl font-bold">{analytics?.topEmojiUsers.reduce((sum, u) => sum + u.emojiCount, 0).toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">sent</p>
          </div>
          <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-xs text-gray-400">Total Members</p>
            </div>
            <p className="text-3xl font-bold">{currentTotal}</p>
            <p className="text-xs text-gray-500 mt-1">server members</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Commenters */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Top Commenters</h2>
            </div>
            {analytics && analytics.topCommenters.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCommenters.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="username" stroke="#888" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="messageCount" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>

          {/* Top Emoji Users */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold">Top Emoji Users</h2>
            </div>
            {analytics && analytics.topEmojiUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topEmojiUsers.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="username" stroke="#888" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="emojiCount" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Channel Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold">Channel Activity</h2>
            </div>
            {analytics && analytics.channelStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.channelStats.slice(0, 8)}
                    dataKey="messageCount"
                    nameKey="channelName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.channelName}
                  >
                    {analytics.channelStats.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>

          {/* Monthly Message Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold">Monthly Message Activity</h2>
            </div>
            {analytics && analytics.monthlyGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="messageCount" stroke="#4CAF50" name="Messages" strokeWidth={2} />
                  <Line type="monotone" dataKey="activeUsers" stroke="#2196F3" name="Active Users" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold">Member Growth Over Time</h2>
          </div>
          {memberGrowth && memberGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="joins" stroke="#FFC107" name="New Members" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#4CAF50" name="Total Members" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-8">No data available</p>
          )}
        </div>

        {/* Channel Stats Table */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Channel Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hp-black border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Messages
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Avg/Day
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analytics && analytics.channelStats.length > 0 ? (
                  analytics.channelStats.map((channel, index) => (
                    <tr key={channel.channelId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium"># {channel.channelName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {channel.messageCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {channel.avgMessagesPerDay}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                      No channel data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

