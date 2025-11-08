'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Users, DollarSign, Mail, Search, Filter, Download,
  ChevronDown, ChevronUp, Eye, MoreVertical, RefreshCcw, XCircle,
  CheckCircle2, Clock, Loader2, X, MessageSquare, Ban, Crown
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface BetaUser {
  id: string
  firstName: string
  lastName: string
  email: string
  position: number
  status: string
  paymentStatus: string
  isFree: boolean
  isFoundingMember?: boolean
  emailVerified: boolean
  discordJoined: boolean
  createdAt: string
  accessExpiresAt?: string
  stripeCustomerId?: string
  stripePaymentIntentId?: string
}

interface Stats {
  total: number
  free: number
  paid: number
  foundingMembers: number
  emailVerified: number
  discordJoined: number
  active: number
  revenue: number
}

export default function AdminBetaUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<BetaUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<BetaUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedUser, setSelectedUser] = useState<BetaUser | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    fetchUsers()
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/admin/beta-users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(search) ||
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter(user => user.emailVerified)
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter(user => !user.emailVerified)
      } else if (statusFilter === 'discord_joined') {
        filtered = filtered.filter(user => user.discordJoined)
      } else if (statusFilter === 'discord_pending') {
        filtered = filtered.filter(user => !user.discordJoined)
      } else {
        filtered = filtered.filter(user => user.status === statusFilter)
      }
    }

    // Type filter
    if (typeFilter === 'free') {
      filtered = filtered.filter(user => user.isFree)
    } else if (typeFilter === 'paid') {
      filtered = filtered.filter(user => !user.isFree)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof BetaUser]
      let bVal: any = b[sortBy as keyof BetaUser]

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }

  const handleResendInvite = async (userId: string) => {
    setActionLoading(`resend-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/beta-users/${userId}/resend-invite`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        alert('Discord invite resent successfully!')
        fetchUsers()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error resending invite')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    const reason = prompt('Enter reason for revoking access:')
    if (!reason) return

    setActionLoading(`revoke-${userId}`)
    try {
      const response = await fetchWithAuth(`/api/admin/beta-users/${userId}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        alert('Access revoked successfully!')
        fetchUsers()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error revoking access')
    } finally {
      setActionLoading(null)
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Position', 'Name', 'Email', 'Type', 'Status', 'Email Verified', 'Discord Joined', 'Join Date'].join(','),
      ...filteredUsers.map(user => [
        user.position,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.isFree ? 'FREE' : 'PAID',
        user.status,
        user.emailVerified ? 'Yes' : 'No',
        user.discordJoined ? 'Yes' : 'No',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beta-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusBadge = (user: BetaUser) => {
    if (user.status === 'suspended') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">Suspended</span>
    }
    if (!user.emailVerified) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">Pending Verification</span>
    }
    if (user.paymentStatus === 'pending') {
      return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">Pending Payment</span>
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Active</span>
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
                  <Users className="w-6 h-6 text-hp-yellow" />
                  Beta Users
                </h1>
                <p className="text-sm text-gray-400">Manage beta program members</p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/admin/login'); }} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <p className="text-2xl font-bold">{stats.total}/100</p>
            </div>
            <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Free</p>
              </div>
              <p className="text-2xl font-bold">{stats.free}/20</p>
            </div>
            <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Paid</p>
              </div>
              <p className="text-2xl font-bold">{stats.paid}/80</p>
            </div>
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-hp-yellow" />
                <p className="text-xs text-gray-400">Founding</p>
              </div>
              <p className="text-2xl font-bold">{stats.foundingMembers}/20</p>
            </div>
            <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">Verified</p>
              </div>
              <p className="text-2xl font-bold">{stats.emailVerified}/{stats.total}</p>
            </div>
            <div className="bg-hp-gray900 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <p className="text-xs text-gray-400">Discord</p>
              </div>
              <p className="text-2xl font-bold">{stats.discordJoined}/{stats.total}</p>
            </div>
            <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Active</p>
              </div>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-hp-yellow" />
                <p className="text-xs text-gray-400">Total Beta Revenue</p>
              </div>
              <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-hp-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-hp-black border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Email Unverified</option>
              <option value="discord_joined">Discord Joined</option>
              <option value="discord_pending">Discord Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-hp-black border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="free">Free Users</option>
              <option value="paid">Paid Users</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hp-black border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    # {sortBy === 'position' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Discord
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                      No users found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{user.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          {user.isFoundingMember && (
                            <Crown className="w-4 h-4 text-hp-yellow" title="Founding Member" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isFree ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">FREE</span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">PAID</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.emailVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.discordJoined ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserDetails(true)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResendInvite(user.id)}
                            disabled={actionLoading === `resend-${user.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend Discord Invite"
                          >
                            {actionLoading === `resend-${user.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeAccess(user.id)}
                            disabled={actionLoading === `revoke-${user.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                            title="Revoke Access"
                          >
                            {actionLoading === `revoke-${user.id}` ? (
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
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetails && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-hp-gray900 border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-sm text-gray-400">User #{selectedUser.position}</p>
                </div>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="font-mono text-xs">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position:</span>
                      <span>#{selectedUser.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Join Date:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Account Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email Verified:</span>
                      {selectedUser.emailVerified ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" /> No
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Status:</span>
                      <span className="capitalize">{selectedUser.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>{selectedUser.isFree ? 'Free Beta Tester' : 'Paid Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className="capitalize">{selectedUser.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount Paid:</span>
                      <span>{selectedUser.isFree ? '$0 (Free)' : '$49.99'}</span>
                    </div>
                    {selectedUser.stripeCustomerId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stripe Customer:</span>
                        <a
                          href={`https://dashboard.stripe.com/customers/${selectedUser.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          View in Stripe
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Discord Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Discord Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Joined Discord:</span>
                      {selectedUser.discordJoined ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" /> No
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Access Info */}
                {selectedUser.accessExpiresAt && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      Access Period
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires:</span>
                        <span>{new Date(selectedUser.accessExpiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleResendInvite(selectedUser.id)}
                    disabled={actionLoading === `resend-${selectedUser.id}`}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `resend-${selectedUser.id}` ? 'Sending...' : 'Resend Discord Invite'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDetails(false)
                      handleRevokeAccess(selectedUser.id)
                    }}
                    disabled={actionLoading === `revoke-${selectedUser.id}`}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Revoke Access
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
