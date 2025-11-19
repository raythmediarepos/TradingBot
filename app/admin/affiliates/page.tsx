'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, DollarSign, TrendingUp, Link as LinkIcon, Copy, Plus,
  X, Loader2, Eye, Trash2, CheckCircle, MousePointer, UserPlus,
  Mail, Download
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface Affiliate {
  id: string
  code: string
  name: string
  email: string
  status: string
  createdAt: any
  totalClicks: number
  totalSignups: number
  paidUsers: number
  freeUsers: number
  totalCommission: number
  affiliateLink: string
}

interface AffiliateStats {
  affiliate: Affiliate
  totalClicks: number
  totalSignups: number
  paidUsers: number
  freeUsers: number
  totalCommission: number
  conversionRates: {
    clickToSignup: number
    signupToPaid: number
    clickToPaid: number
  }
  referredUsers: any[]
}

export default function AffiliatesPage() {
  const router = useRouter()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null)
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    code: '',
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    code: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated() || !isAdmin()) {
        router.push('/admin/login')
        return
      }
      await fetchAffiliates()
    }
    checkAuth()
  }, [router])

  const fetchAffiliates = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/affiliates')
      const data = await response.json()

      if (data.success) {
        setAffiliates(data.data)
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAffiliateStats = async (code: string) => {
    setLoadingStats(true)
    try {
      const response = await fetchWithAuth(`/api/admin/affiliates/${code}/stats`)
      const data = await response.json()

      if (data.success) {
        setAffiliateStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching affiliate stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const errors = {
      name: formData.name ? '' : 'Name is required',
      email: formData.email ? '' : 'Email is required',
      code: formData.code ? '' : 'Code is required',
    }
    setFormErrors(errors)

    if (Object.values(errors).some(e => e)) return

    setIsSubmitting(true)

    try {
      const response = await fetchWithAuth('/api/admin/affiliates', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data.success) {
        alert('✅ Affiliate created successfully!')
        setShowCreateModal(false)
        setFormData({ name: '', email: '', code: '' })
        fetchAffiliates()
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error creating affiliate')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAffiliate = async (id: string, name: string) => {
    if (!confirm(`Delete affiliate "${name}"? This cannot be undone.`)) return

    try {
      const response = await fetchWithAuth(`/api/admin/affiliates/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        alert('✅ Affiliate deleted')
        fetchAffiliates()
        setShowDetailsModal(false)
      } else {
        alert(`Failed: ${data.message}`)
      }
    } catch (error) {
      alert('Error deleting affiliate')
    }
  }

  const handleCopyLink = (link: string, code: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(code)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleViewDetails = (code: string) => {
    setSelectedAffiliate(code)
    setShowDetailsModal(true)
    fetchAffiliateStats(code)
  }

  const handleGenerateCode = () => {
    const name = formData.name.toUpperCase().replace(/\s+/g, '')
    const random = Math.floor(Math.random() * 100)
    setFormData({ ...formData, code: `${name}${random}` })
  }

  const totalStats = {
    totalClicks: affiliates.reduce((sum, a) => sum + a.totalClicks, 0),
    totalSignups: affiliates.reduce((sum, a) => sum + a.totalSignups, 0),
    totalPaid: affiliates.reduce((sum, a) => sum + a.paidUsers, 0),
    totalCommission: affiliates.reduce((sum, a) => sum + a.totalCommission, 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎯 Affiliate Management</h1>
            <p className="text-purple-200">Track and manage your affiliate partners</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Affiliate
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalStats.totalClicks}</div>
            <div className="text-purple-200">Total Clicks</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalStats.totalSignups}</div>
            <div className="text-purple-200">Total Signups</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalStats.totalPaid}</div>
            <div className="text-purple-200">Paid Users</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalStats.totalCommission.toFixed(2)}</div>
            <div className="text-purple-200">Total Commission</div>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Affiliates ({affiliates.length})</h2>

          {affiliates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-4">No affiliates yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white transition-colors"
              >
                Create Your First Affiliate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Email</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Clicks</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Signups</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Paid</th>
                    <th className="text-right py-3 px-4 text-purple-200 font-semibold">Commission</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-semibold">{affiliate.code}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">{affiliate.name}</td>
                      <td className="py-4 px-4 text-purple-200">{affiliate.email}</td>
                      <td className="py-4 px-4 text-center text-white">{affiliate.totalClicks}</td>
                      <td className="py-4 px-4 text-center text-white">{affiliate.totalSignups}</td>
                      <td className="py-4 px-4 text-center text-green-400 font-semibold">{affiliate.paidUsers}</td>
                      <td className="py-4 px-4 text-right text-yellow-400 font-semibold">${affiliate.totalCommission.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyLink(affiliate.affiliateLink, affiliate.code)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Copy Link"
                          >
                            {copiedLink === affiliate.code ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <button
                            onClick={() => handleViewDetails(affiliate.code)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.name)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Affiliate Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Affiliate</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAffiliate} className="space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-purple-200 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="john@example.com"
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-purple-200 mb-2">Affiliate Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="JOHN25"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  {formErrors.code && <p className="text-red-400 text-sm mt-1">{formErrors.code}</p>}
                  <p className="text-purple-300 text-sm mt-1">Unique code for tracking (letters and numbers only)</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Affiliate
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affiliate Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAffiliate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : affiliateStats ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {affiliateStats.affiliate.code} - {affiliateStats.affiliate.name}
                      </h2>
                      <p className="text-purple-200">{affiliateStats.affiliate.email}</p>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Affiliate Link */}
                  <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-4 mb-6">
                    <p className="text-yellow-200 font-semibold mb-2">🔗 Affiliate Link:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={affiliateStats.affiliate.affiliateLink || ''}
                        readOnly
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => handleCopyLink(affiliateStats.affiliate.affiliateLink, selectedAffiliate)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors flex items-center gap-2"
                      >
                        {copiedLink === selectedAffiliate ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white">{affiliateStats.totalClicks}</div>
                      <div className="text-purple-200 text-sm">Total Clicks</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white">{affiliateStats.totalSignups}</div>
                      <div className="text-purple-200 text-sm">Total Signups</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-400">{affiliateStats.paidUsers}</div>
                      <div className="text-purple-200 text-sm">Paid Users</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-yellow-400">${affiliateStats.totalCommission.toFixed(2)}</div>
                      <div className="text-purple-200 text-sm">Commission</div>
                    </div>
                  </div>

                  {/* Conversion Rates */}
                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">📈 Conversion Rates</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-200">Click → Signup</span>
                          <span className="text-white font-semibold">{affiliateStats.conversionRates.clickToSignup}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.min(affiliateStats.conversionRates.clickToSignup, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-200">Signup → Paid</span>
                          <span className="text-white font-semibold">{affiliateStats.conversionRates.signupToPaid}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${Math.min(affiliateStats.conversionRates.signupToPaid, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-200">Click → Paid</span>
                          <span className="text-white font-semibold">{affiliateStats.conversionRates.clickToPaid}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${Math.min(affiliateStats.conversionRates.clickToPaid, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referred Users */}
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">👥 Referred Users ({affiliateStats.referredUsers.length})</h3>
                    {affiliateStats.referredUsers.length === 0 ? (
                      <p className="text-purple-200 text-center py-4">No users yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {affiliateStats.referredUsers.map((user: any) => (
                          <div
                            key={user.id}
                            className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <div className="text-white font-semibold">{user.firstName} {user.lastName}</div>
                              <div className="text-purple-200 text-sm">{user.email}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${user.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {user.position <= 20 ? 'FREE' : user.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                              </div>
                              <div className="text-purple-200 text-xs">Position #{user.position}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white">Failed to load affiliate stats</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

