'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  Download,
  Shield,
  Ban,
} from 'lucide-react'

interface BetaUser {
  id: string
  email: string
  firstName: string
  lastName: string
  position: number
  status: string
  paymentStatus: string
  isFree: boolean
  emailVerified: boolean
  discordJoined: boolean
  discordUsername?: string
  createdAt: any
}

export default function AdminBetaUsersPage() {
  const [users, setUsers] = useState<BetaUser[]>([])
  const [stats, setStats] = useState({
    total: 0,
    freeSlots: { taken: 0, remaining: 0 },
    paidSlots: { taken: 0, remaining: 0 },
    statusCounts: {} as Record<string, number>,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<BetaUser | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const usersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/admin/users`
      )
      const usersData = await usersResponse.json()

      // Fetch stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/stats`
      )
      const statsData = await statsResponse.json()

      if (usersData.success) {
        setUsers(usersData.data)
      }

      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this user\'s access?')) {
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/admin/users/${userId}/revoke`,
        {
          method: 'POST',
        }
      )
      const data = await response.json()

      if (data.success) {
        alert('Access revoked successfully')
        fetchData()
      } else {
        alert(data.message || 'Failed to revoke access')
      }
    } catch (error) {
      console.error('Error revoking access:', error)
      alert('An error occurred')
    }
  }

  const handleResendInvite = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/beta/admin/users/${userId}/resend-invite`,
        {
          method: 'POST',
        }
      )
      const data = await response.json()

      if (data.success) {
        alert('Discord invite resent successfully')
      } else {
        alert(data.message || 'Failed to resend invite')
      }
    } catch (error) {
      console.error('Error resending invite:', error)
      alert('An error occurred')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || user.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'discord_joined':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'pending_email':
      case 'pending_payment':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'suspended':
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-white/60 bg-white/5 border-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'discord_joined':
        return <CheckCircle2 className="w-4 h-4" />
      case 'pending_email':
      case 'pending_payment':
        return <Clock className="w-4 h-4" />
      case 'suspended':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin/dashboard" className="text-hp-yellow hover:text-hp-yellow600 transition-colors">
                <span className="text-2xl font-bold">🐝 Admin</span>
              </a>
              <span className="text-white/40">/</span>
              <h1 className="text-xl font-bold">Beta Users</h1>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-hp-gray900 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-hp-gray900 border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Users</span>
              <Users className="w-5 h-5 text-hp-yellow" />
            </div>
            <p className="text-3xl font-bold">{stats.total}/100</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-hp-gray900 border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Free Slots</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats.freeSlots.taken}/{stats.freeSlots.taken + stats.freeSlots.remaining}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-hp-gray900 border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Paid Users</span>
              <DollarSign className="w-5 h-5 text-hp-yellow" />
            </div>
            <p className="text-3xl font-bold">
              {stats.paidSlots.taken}/{stats.paidSlots.taken + stats.paidSlots.remaining}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-hp-gray900 border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Discord Joined</span>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{stats.statusCounts.discord_joined || 0}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-hp-gray900 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-hp-yellow/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 bg-hp-gray900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-hp-yellow/50 appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="all">All Status</option>
              <option value="pending_email">Pending Email</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="active">Active</option>
              <option value="discord_joined">Discord Joined</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Discord</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-hp-yellow">#{user.position}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-white/60">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isFree ? (
                          <span className="inline-flex items-center gap-1 text-green-500 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            Free
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-hp-yellow text-sm font-semibold">
                            <DollarSign className="w-4 h-4" />
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.discordJoined ? (
                          <div>
                            <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                            {user.discordUsername && (
                              <p className="text-xs text-white/60">{user.discordUsername}</p>
                            )}
                          </div>
                        ) : (
                          <XCircle className="w-5 h-5 text-white/40" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResendInvite(user.id)}
                            className="p-2 bg-hp-yellow/10 text-hp-yellow rounded-lg hover:bg-hp-yellow/20 transition-colors"
                            title="Resend Discord Invite"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRevokeAccess(user.id)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Revoke Access"
                          >
                            <Ban className="w-4 h-4" />
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
      </main>
    </div>
  )
}

