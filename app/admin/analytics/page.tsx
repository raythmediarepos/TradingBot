'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, MessageSquare, Users, Smile, Activity, Calendar,
  Loader2, RefreshCcw, Award, Clock, Hash, AlertCircle
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

const COLORS = ['#FFC107', '#9C27B0', '#2196F3', '#4CAF50', '#FF5722', '#00BCD4', '#FF9800', '#E91E63']

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [analyticsRes, growthRes] = await Promise.all([
        fetchWithAuth('/api/admin/discord/analytics'),
        fetchWithAuth('/api/admin/discord/member-growth'),
      ])

      const analyticsData = await analyticsRes.json()
      const growthData = await growthRes.json()
      
      if (analyticsData.success) {
        setAnalytics({
          ...analyticsData.data,
          memberGrowth: growthData.data || [],
          currentTotal: growthData.currentTotal || 0,
        })
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
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-hp-gray900 border border-yellow-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No Analytics Data</h2>
            <p className="text-gray-400 mb-6">The serverbot hasn't collected data yet. It runs every 6 hours automatically.</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { summary, members, messages, engagement } = analytics

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Professional Header */}
      <header className="border-b border-white/5 sticky top-0 bg-hp-black/80 backdrop-blur-xl z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/admin/dashboard')} 
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                ← Back
              </button>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Discord Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated {analytics.collectedAt ? new Date(analytics.collectedAt).toLocaleString() : 'N/A'} • {summary?.period || '30 days'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 text-sm font-medium"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => { logout(); router.push('/admin/login'); }} 
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-400 mb-6 uppercase tracking-wider">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Members</p>
              </div>
              <p className="text-3xl font-bold text-white">{summary?.totalMembers?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Messages</p>
              </div>
              <p className="text-3xl font-bold text-white">{summary?.totalMessages?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active</p>
              </div>
              <p className="text-3xl font-bold text-white">{summary?.activeUsers?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Channels</p>
              </div>
              <p className="text-3xl font-bold text-white">{summary?.totalChannels || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Roles</p>
              </div>
              <p className="text-3xl font-bold text-white">{summary?.totalRoles || 0}</p>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-400 mb-6 uppercase tracking-wider">Engagement</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Avg Messages/User</p>
              <p className="text-2xl font-bold text-purple-400">{engagement?.avgMessagesPerUser || '0'}</p>
            </div>
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Avg Messages/Day</p>
              <p className="text-2xl font-bold text-blue-400">{engagement?.avgMessagesPerDay || '0'}</p>
            </div>
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Most Active Channel</p>
              <p className="text-lg font-bold text-green-400 truncate">#{engagement?.mostActiveChannel || 'N/A'}</p>
              <p className="text-xs text-gray-600 mt-1">{engagement?.mostActiveChannelMessages || 0} messages</p>
            </div>
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Peak Activity</p>
              <p className="text-lg font-bold text-yellow-400">{messages?.peakActivity?.dayName || 'N/A'}</p>
              <p className="text-xs text-gray-600 mt-1">{messages?.peakActivity?.hourLabel || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Top Contributors */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Top Commenters</h3>
              </div>
              {messages?.topCommenters && messages.topCommenters.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={messages.topCommenters.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis 
                      dataKey="username" 
                      stroke="#6B7280" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100} 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                    />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <Bar dataKey="messageCount" fill="#9C27B0" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>

            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Smile className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold">Top Emoji Users</h3>
              </div>
              {messages?.topEmojiUsers && messages.topEmojiUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={messages.topEmojiUsers.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis 
                      dataKey="username" 
                      stroke="#6B7280" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100} 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                    />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <Bar dataKey="emojiCount" fill="#FFC107" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Activity Patterns */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Activity by Hour</h3>
              </div>
              {messages?.hourlyActivity && messages.hourlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={messages.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="label" stroke="#6B7280" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={3} dot={{ fill: '#2196F3', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>

            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Activity by Day</h3>
              </div>
              {messages?.dailyActivity && messages.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={messages.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="dayName" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <Bar dataKey="count" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Channel & Monthly */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold">Channel Distribution</h3>
              </div>
              {messages?.channelStats && messages.channelStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={messages.channelStats.slice(0, 8)}
                      dataKey="messageCount"
                      nameKey="channelName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.channelName}
                    >
                      {messages.channelStats.slice(0, 8).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>

            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Monthly Trends</h3>
              </div>
              {messages?.monthlyActivity && messages.monthlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={messages.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="messageCount" stroke="#9C27B0" name="Messages" strokeWidth={3} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#2196F3" name="Active Users" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-600">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Member Growth */}
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Member Growth Over Time</h3>
            </div>
            {analytics.memberGrowth && analytics.memberGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="joins" stroke="#FFC107" name="New Members" strokeWidth={3} />
                  <Line type="monotone" dataKey="total" stroke="#4CAF50" name="Total Members" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-600">
                No data available
              </div>
            )}
          </div>

          {/* Top Roles */}
          {members?.topRoles && members.topRoles.length > 0 && (
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold">Top Roles</h3>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={members.topRoles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis 
                    dataKey="role" 
                    stroke="#6B7280" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  />
                  <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#FF9800" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Channel Stats Table */}
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-lg font-semibold">Channel Statistics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hp-black/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      % Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {messages?.channelStats && messages.channelStats.length > 0 ? (
                    messages.channelStats.map((channel: any) => (
                      <tr key={channel.channelId} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-300"># {channel.channelName}</span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-400">
                          {channel.messageCount.toLocaleString()}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-400">
                          {((channel.messageCount / summary.totalMessages) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-gray-600">
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
    </div>
  )
}
