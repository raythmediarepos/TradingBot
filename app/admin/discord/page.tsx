'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, MessageSquare, Activity, Search, RefreshCcw,
  CheckCircle2, XCircle, Clock, Loader2, X, Ban, UserX, Megaphone,
  Hash, Send, AlertTriangle, Crown
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface DiscordMember {
  id: string
  username: string
  discriminator: string
  tag: string
  joinedAt: string
  hasVerified: boolean
  isUnverified: boolean
  email?: string
  betaUserId?: string
  isMarkedAdmin?: boolean
}

interface ServerOverview {
  botStatus: string
  server: {
    name: string
    id: string
    memberCount: number
  }
  roles: {
    beta: {
      name: string
      id: string
      memberCount: number
    }
    unverified: {
      name: string
      id: string
      memberCount: number
    } | null
  }
}

interface Channel {
  id: string
  name: string
  type: number
  position: number
}

export default function AdminDiscordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<ServerOverview | null>(null)
  const [members, setMembers] = useState<DiscordMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<DiscordMember[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [isEmbed, setIsEmbed] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  
  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [members, searchTerm, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview
      const overviewRes = await fetchWithAuth('/api/admin/discord/overview')
      const overviewData = await overviewRes.json()
      if (overviewData.success) {
        setOverview(overviewData.data)
      }

      // Fetch members
      const membersRes = await fetchWithAuth('/api/admin/discord/members')
      const membersData = await membersRes.json()
      if (membersData.success) {
        setMembers(membersData.data.members)
      }

      // Fetch channels
      const channelsRes = await fetchWithAuth('/api/admin/discord/channels')
      const channelsData = await channelsRes.json()
      if (channelsData.success) {
        setChannels(channelsData.channels)
      }
    } catch (error) {
      console.error('Error fetching Discord data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...members]

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(member =>
        member.username.toLowerCase().includes(search) ||
        member.tag.toLowerCase().includes(search) ||
        (member.email && member.email.toLowerCase().includes(search))
      )
    }

    // Status filter
    if (statusFilter === 'verified') {
      filtered = filtered.filter(m => m.hasVerified)
    } else if (statusFilter === 'unverified') {
      filtered = filtered.filter(m => m.isUnverified)
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(m => !m.hasVerified && !m.isUnverified)
    }

    setFilteredMembers(filtered)
  }

  const handleKickMember = async (userId: string, username: string) => {
    const reason = prompt(`Enter reason for kicking ${username}:`)
    if (!reason) return

    setActionLoading(`kick-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/discord/members/${userId}/kick`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        alert(`Successfully kicked ${username}`)
        fetchData()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error kicking member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBanMember = async (userId: string, username: string) => {
    const confirmBan = confirm(`Are you sure you want to BAN ${username}? This is permanent.`)
    if (!confirmBan) return

    const reason = prompt(`Enter reason for banning ${username}:`)
    if (!reason) return

    setActionLoading(`ban-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/discord/members/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        alert(`Successfully banned ${username}`)
        fetchData()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error banning member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleManualVerify = async (userId: string, username: string) => {
    const confirm = window.confirm(`Manually verify ${username}? They will receive Beta Tester role.`)
    if (!confirm) return

    setActionLoading(`verify-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/discord/members/${userId}/verify`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        alert(`Successfully verified ${username}`)
        fetchData()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error verifying member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAdmin = async (userId: string, username: string, discriminator: string, currentStatus: boolean) => {
    if (currentStatus) {
      const confirm = window.confirm(`Remove admin status from ${username}?`)
      if (!confirm) return
    } else {
      const confirm = window.confirm(
        `Mark ${username} as a Server Admin?\n\n` +
        `This will:\n` +
        `👑 Mark them as a co-founder/server owner\n` +
        `📝 Create admin record in system\n` +
        `📬 Send them a notification DM\n\n` +
        `This is for leadership team only.\n\n` +
        `Continue?`
      )
      if (!confirm) return
    }

    setActionLoading(`admin-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/discord/members/${userId}/toggle-admin`, {
        method: 'POST',
        body: JSON.stringify({ 
          isAdmin: !currentStatus,
          username,
          discriminator,
        }),
      })
      const data = await response.json()

      if (data.success) {
        alert(data.message)
        fetchData()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error toggling admin marker')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendAnnouncement = async () => {
    if (!selectedChannel || !announcementMessage) {
      alert('Please select a channel and enter a message')
      return
    }

    setActionLoading('announcement')
    try {
      const message = isEmbed ? {
        title: announcementTitle || 'Announcement',
        description: announcementMessage,
      } : announcementMessage

      const response = await fetchWithAuth('/api/admin/discord/announce', {
        method: 'POST',
        body: JSON.stringify({
          channelId: selectedChannel,
          message,
          isEmbed,
        }),
      })
      const data = await response.json()

      if (data.success) {
        alert('Announcement sent successfully!')
        setShowAnnouncementModal(false)
        setAnnouncementMessage('')
        setAnnouncementTitle('')
        setSelectedChannel('')
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error sending announcement')
    } finally {
      setActionLoading(null)
    }
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
                  <MessageSquare className="w-6 h-6 text-indigo-400" />
                  Discord Management
                </h1>
                <p className="text-sm text-gray-400">Manage server members and activity</p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/admin/login'); }} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Server Overview */}
        {overview && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Bot Status</p>
              </div>
              <p className="text-2xl font-bold capitalize">{overview.botStatus}</p>
              <p className="text-xs text-green-400 mt-1">● Online</p>
            </div>
            <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Total Members</p>
              </div>
              <p className="text-2xl font-bold">{overview.server.memberCount}</p>
              <p className="text-xs text-gray-400 mt-1">{overview.server.name}</p>
            </div>
            <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Beta Testers</p>
              </div>
              <p className="text-2xl font-bold">{overview.roles.beta.memberCount}</p>
              <p className="text-xs text-gray-400 mt-1">{overview.roles.beta.name}</p>
            </div>
            <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">Unverified</p>
              </div>
              <p className="text-2xl font-bold">{overview.roles.unverified?.memberCount || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Pending verification</p>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-hp-black border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Members</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>

            {/* Announcement */}
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Announce
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hp-black border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Discord User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium flex items-center gap-2">
                              {member.username}
                              {member.isMarkedAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">#{member.discriminator}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {member.email || <span className="text-gray-600">No email linked</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.hasVerified ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : member.isUnverified ? (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Unverified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {!member.hasVerified && (
                            <button
                              onClick={() => handleManualVerify(member.id, member.username)}
                              disabled={actionLoading === `verify-${member.id}`}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400 disabled:opacity-50"
                              title="Manually Verify"
                            >
                              {actionLoading === `verify-${member.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleAdmin(member.id, member.username, member.discriminator, member.isMarkedAdmin || false)}
                            disabled={actionLoading === `admin-${member.id}`}
                            className={`p-2 hover:bg-yellow-500/20 rounded-lg transition-colors ${member.isMarkedAdmin ? 'text-yellow-400' : 'text-gray-400'} disabled:opacity-50`}
                            title={member.isMarkedAdmin ? "Remove Admin Status" : "Mark as Server Admin/Co-founder"}
                          >
                            {actionLoading === `admin-${member.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Crown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleKickMember(member.id, member.username)}
                            disabled={actionLoading === `kick-${member.id}`}
                            className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-400 disabled:opacity-50"
                            title="Kick from Server"
                          >
                            {actionLoading === `kick-${member.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleBanMember(member.id, member.username)}
                            disabled={actionLoading === `ban-${member.id}`}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                            title="Ban from Server"
                          >
                            {actionLoading === `ban-${member.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAnnouncementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-hp-gray900 border border-indigo-500/30 rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-indigo-400" />
                    Send Announcement
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Broadcast a message to a Discord channel</p>
                </div>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Channel Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Select Channel
                  </label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full px-4 py-3 bg-hp-black border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Choose a channel...</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        # {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Embed Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEmbed"
                    checked={isEmbed}
                    onChange={(e) => setIsEmbed(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isEmbed" className="text-sm text-gray-300">
                    Send as Embed (with formatting)
                  </label>
                </div>

                {/* Title (if embed) */}
                {isEmbed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="e.g., Important Update"
                      className="w-full px-4 py-3 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="Type your announcement here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-300">
                    This announcement will be visible to all members who can see the selected channel.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAnnouncementModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendAnnouncement}
                    disabled={actionLoading === 'announcement'}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'announcement' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

