'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import {
  TrendingUp, MessageSquare, Users, Smile, Activity, Calendar,
  Loader2, RefreshCcw, Award, Clock, Hash, TrendingDown, AlertCircle,
  UserPlus, UserCheck, UserMinus, UserX, Zap, MessageCircle, Link2,
  FileText, Target, BarChart3
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
        <Loader2 className="w-8 h-8 text-hp-yellow animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Analytics Data Available</h2>
          <p className="text-gray-400 mb-6">The serverbot hasn't collected data yet.</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { summary, members, messages, engagement, userSegmentation, retention, messageQuality, comparative, leaderboards, recentActivity } = analytics

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
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Advanced Discord Analytics
                </h1>
                <p className="text-sm text-gray-400">
                  Last collected: {analytics.collectedAt ? new Date(analytics.collectedAt).toLocaleString() : 'N/A'} • 
                  Period: {summary?.period || '30 days'}
                </p>
              </div>
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
              <button onClick={() => { logout(); router.push('/admin/login'); }} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* NEW: Recent Activity Summary */}
        {recentActivity && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Recent Activity
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-yellow-400" />
                  <p className="text-xs text-gray-400">Today</p>
                </div>
                <p className="text-3xl font-bold">{recentActivity.today?.messages || 0}</p>
                {recentActivity.today?.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${recentActivity.today.trend === 'up' ? 'text-green-400' : recentActivity.today.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {recentActivity.today.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : recentActivity.today.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                    {recentActivity.today.change > 0 ? '+' : ''}{recentActivity.today.change}% vs yesterday
                  </div>
                )}
              </div>
              <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <p className="text-xs text-gray-400">This Week</p>
                </div>
                <p className="text-3xl font-bold">{recentActivity.thisWeek?.messages || 0}</p>
                <p className="text-xs text-gray-400 mt-2">messages</p>
              </div>
              <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  <p className="text-xs text-gray-400">New Members</p>
                </div>
                <p className="text-3xl font-bold">{recentActivity.thisWeek?.newMembers || 0}</p>
                <p className="text-xs text-gray-400 mt-2">last 7 days</p>
              </div>
              <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <p className="text-xs text-gray-400">Active Users</p>
                </div>
                <p className="text-3xl font-bold">{summary?.activeUsers || 0}</p>
                <p className="text-xs text-gray-400 mt-2">last 30 days</p>
              </div>
            </div>
          </div>
        )}

        {/* Core Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Core Metrics</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <p className="text-xs text-gray-400">Total Members</p>
              </div>
              <p className="text-3xl font-bold">{summary?.totalMembers?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <p className="text-xs text-gray-400">Total Messages</p>
              </div>
              <p className="text-3xl font-bold">{summary?.totalMessages?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <p className="text-xs text-gray-400">Active Users</p>
              </div>
              <p className="text-3xl font-bold">{summary?.activeUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-yellow-400" />
                <p className="text-xs text-gray-400">Channels</p>
              </div>
              <p className="text-3xl font-bold">{summary?.totalChannels || 0}</p>
            </div>
            <div className="bg-hp-gray900 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-orange-400" />
                <p className="text-xs text-gray-400">Roles</p>
              </div>
              <p className="text-3xl font-bold">{summary?.totalRoles || 0}</p>
            </div>
          </div>
        </div>

        {/* NEW: User Segmentation */}
        {userSegmentation && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              User Segmentation
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <p className="text-xs text-gray-400">Power Users</p>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{userSegmentation.counts?.powerUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">50+ messages or top 10%</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <p className="text-xs text-gray-400">Casual Users</p>
                </div>
                <p className="text-3xl font-bold text-blue-400">{userSegmentation.counts?.casualUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">5-49 messages</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserMinus className="w-5 h-5 text-purple-400" />
                  <p className="text-xs text-gray-400">Lurkers</p>
                </div>
                <p className="text-3xl font-bold text-purple-400">{userSegmentation.counts?.lurkers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">1-4 messages</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  <p className="text-xs text-gray-400">New Users</p>
                </div>
                <p className="text-3xl font-bold text-green-400">{userSegmentation.counts?.newUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Joined last 30 days</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="w-5 h-5 text-orange-400" />
                  <p className="text-xs text-gray-400">Inactive</p>
                </div>
                <p className="text-3xl font-bold text-orange-400">{userSegmentation.counts?.inactiveUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">No message 30+ days</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="w-5 h-5 text-gray-400" />
                  <p className="text-xs text-gray-400">Ghost Members</p>
                </div>
                <p className="text-3xl font-bold text-gray-400">{userSegmentation.counts?.ghostMembers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Never messaged</p>
              </div>
            </div>

            {/* User Segmentation Pie Chart */}
            {userSegmentation.counts && (
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Power Users', value: userSegmentation.counts.powerUsers, color: '#FFC107' },
                        { name: 'Casual Users', value: userSegmentation.counts.casualUsers, color: '#2196F3' },
                        { name: 'Lurkers', value: userSegmentation.counts.lurkers, color: '#9C27B0' },
                        { name: 'Ghost Members', value: userSegmentation.counts.ghostMembers, color: '#9CA3AF' },
                      ].filter(item => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {[
                        { name: 'Power Users', value: userSegmentation.counts.powerUsers, color: '#FFC107' },
                        { name: 'Casual Users', value: userSegmentation.counts.casualUsers, color: '#2196F3' },
                        { name: 'Lurkers', value: userSegmentation.counts.lurkers, color: '#9C27B0' },
                        { name: 'Ghost Members', value: userSegmentation.counts.ghostMembers, color: '#9CA3AF' },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* NEW: Retention & Engagement */}
        {retention && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Retention & Engagement
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">New Members (7d)</p>
                <p className="text-2xl font-bold text-green-400">{retention.newMembersLast7Days || 0}</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">New Members (30d)</p>
                <p className="text-2xl font-bold text-blue-400">{retention.newMembersLast30Days || 0}</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Avg Days to 1st Message</p>
                <p className="text-2xl font-bold text-purple-400">{retention.avgDaysToFirstMessage || '0'}</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">30-Day Retention Rate</p>
                <p className="text-2xl font-bold text-yellow-400">{retention.retentionRate30Days || '0'}%</p>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Message Quality */}
        {messageQuality && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Message Quality
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Avg Length</p>
                <p className="text-2xl font-bold text-blue-400">{messageQuality.avgMessageLength || 0}</p>
                <p className="text-xs text-gray-500">characters</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Reply Rate</p>
                <p className="text-2xl font-bold text-purple-400">{messageQuality.replyRate || '0'}%</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Question Rate</p>
                <p className="text-2xl font-bold text-green-400">{messageQuality.questionRate || '0'}%</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Links Shared</p>
                <p className="text-2xl font-bold text-yellow-400">{messageQuality.linksShared || 0}</p>
              </div>
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Attachments</p>
                <p className="text-2xl font-bold text-orange-400">{messageQuality.attachmentsShared || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Avg Messages/User</p>
            <p className="text-2xl font-bold text-purple-400">{engagement?.avgMessagesPerUser || '0'}</p>
          </div>
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Avg Messages/Day</p>
            <p className="text-2xl font-bold text-blue-400">{engagement?.avgMessagesPerDay || '0'}</p>
          </div>
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Most Active Channel</p>
            <p className="text-lg font-bold text-green-400 truncate">{engagement?.mostActiveChannel || 'N/A'}</p>
            <p className="text-xs text-gray-500">{engagement?.mostActiveChannelMessages || 0} messages</p>
          </div>
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Peak Activity</p>
            <p className="text-lg font-bold text-yellow-400">{messages?.peakActivity?.dayName || 'N/A'}</p>
            <p className="text-xs text-gray-500">{messages?.peakActivity?.hourLabel || 'N/A'}</p>
          </div>
        </div>

        {/* NEW: Leaderboards */}
        {leaderboards && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Weekly Top Users */}
            {leaderboards.weeklyTopUsers && leaderboards.weeklyTopUsers.length > 0 && (
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-bold">🏆 Weekly Top Users</h2>
                </div>
                <div className="space-y-3">
                  {leaderboards.weeklyTopUsers.slice(0, 10).map((user: any, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between bg-hp-black rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {user.username}
                            {user.isNew && <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">NEW</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-400">{user.messageCount}</p>
                        <p className="text-xs text-gray-500">messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Reactions */}
            {leaderboards.topReactions && leaderboards.topReactions.length > 0 && (
              <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smile className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold">❤️ Most Reactions Received</h2>
                </div>
                <div className="space-y-3">
                  {leaderboards.topReactions.slice(0, 10).map((user: any, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between bg-hp-black rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-pink-400">{user.reactionCount}</p>
                        <p className="text-xs text-gray-500">reactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Row 1 - Top Commenters & Emoji Users */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Commenters */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Top 10 Commenters</h2>
            </div>
            {messages?.topCommenters && messages.topCommenters.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messages.topCommenters.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="username" stroke="#888" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
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
              <h2 className="text-xl font-bold">Top 10 Emoji Users</h2>
            </div>
            {messages?.topEmojiUsers && messages.topEmojiUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messages.topEmojiUsers.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="username" stroke="#888" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
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

        {/* Charts Row 2 - Hourly & Daily Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Hourly Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold">Activity by Hour</h2>
            </div>
            {messages?.hourlyActivity && messages.hourlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={messages.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#888" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={2} dot={{ fill: '#2196F3', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>

          {/* Daily Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold">Activity by Day of Week</h2>
            </div>
            {messages?.dailyActivity && messages.dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messages.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="dayName" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="count" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Charts Row 3 - Channel Distribution & Monthly Trends */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Channel Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold">Channel Distribution</h2>
            </div>
            {messages?.channelStats && messages.channelStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-8">No data available</p>
            )}
          </div>

          {/* Monthly Activity */}
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Monthly Message Trends</h2>
            </div>
            {messages?.monthlyActivity && messages.monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={messages.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="messageCount" stroke="#9C27B0" name="Messages" strokeWidth={2} />
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
            <Users className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold">Member Growth Over Time</h2>
          </div>
          {analytics.memberGrowth && analytics.memberGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.memberGrowth}>
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

        {/* Top Roles */}
        {members?.topRoles && members.topRoles.length > 0 && (
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold">Top Roles by Member Count</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={members.topRoles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="role" stroke="#888" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

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
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {messages?.channelStats && messages.channelStats.length > 0 ? (
                  messages.channelStats.map((channel: any, index: number) => (
                    <tr key={channel.channelId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium"># {channel.channelName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {channel.messageCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {((channel.messageCount / summary.totalMessages) * 100).toFixed(1)}%
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
