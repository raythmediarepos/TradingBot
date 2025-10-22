'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, CheckCircle, XCircle, RefreshCw, LogOut, Mail, Link2, Calendar } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Affiliate {
  id: string
  name: string
  email: string
  platform: string
  audienceSize?: string
  websiteUrl?: string
  status: string
  setupCompleted: boolean
  affiliateCode?: string
  createdAt: any
}

const AdminDashboardPage = () => {
  const router = useRouter()
  const [affiliates, setAffiliates] = React.useState<Affiliate[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<'all' | 'active' | 'pending'>('all')

  React.useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem('adminAuth')
    if (!adminAuth) {
      router.push('/admin/login')
      return
    }

    const auth = JSON.parse(adminAuth)
    // Check if auth is less than 24 hours old
    const hoursSinceAuth = (Date.now() - auth.timestamp) / (1000 * 60 * 60)
    if (hoursSinceAuth > 24) {
      localStorage.removeItem('adminAuth')
      router.push('/admin/login')
      return
    }

    fetchAffiliates()
  }, [router])

  const fetchAffiliates = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tradingbot-w843.onrender.com'
      const response = await fetch(`${apiUrl}/api/affiliates/all`)
      
      if (response.ok) {
        const data = await response.json()
        setAffiliates(data.affiliates || [])
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    let date
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000)
    } else if (timestamp.toDate) {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const filteredAffiliates = affiliates.filter(affiliate => {
    if (filter === 'all') return true
    if (filter === 'active') return affiliate.setupCompleted
    if (filter === 'pending') return !affiliate.setupCompleted
    return true
  })

  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.setupCompleted).length,
    pending: affiliates.filter(a => !a.setupCompleted).length
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
      </div>

      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full">
                  <Shield className="w-6 h-6 text-hp-yellow" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-hp-white">Admin Dashboard</h1>
                  <p className="text-gray-400 text-sm">Manage affiliate applications</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Affiliates</p>
                    <p className="text-3xl font-bold text-hp-white">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-hp-yellow" />
                </div>
              </div>

              <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active</p>
                    <p className="text-3xl font-bold text-hp-white">{stats.active}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-hp-gray900 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Pending Setup</p>
                    <p className="text-3xl font-bold text-hp-white">{stats.pending}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' ? 'bg-hp-yellow text-hp-black' : 'border-hp-yellow/30 text-hp-yellow'}
              >
                All ({stats.total})
              </Button>
              <Button
                onClick={() => setFilter('active')}
                variant={filter === 'active' ? 'default' : 'outline'}
                className={filter === 'active' ? 'bg-green-500 text-white' : 'border-green-500/30 text-green-500'}
              >
                Active ({stats.active})
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                variant={filter === 'pending' ? 'default' : 'outline'}
                className={filter === 'pending' ? 'bg-orange-500 text-white' : 'border-orange-500/30 text-orange-500'}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                onClick={fetchAffiliates}
                variant="outline"
                className="border-hp-yellow/30 text-hp-yellow ml-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Affiliates List */}
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-hp-yellow animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading affiliates...</p>
                </div>
              ) : filteredAffiliates.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No affiliates found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-hp-black/50 border-b border-hp-yellow/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Affiliate
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Platform
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hp-yellow/10">
                      {filteredAffiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-hp-black/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-hp-white font-semibold">{affiliate.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3 text-gray-500" />
                                <p className="text-gray-400 text-sm">{affiliate.email}</p>
                              </div>
                              {affiliate.websiteUrl && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Link2 className="w-3 h-3 text-gray-500" />
                                  <a 
                                    href={affiliate.websiteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-hp-yellow text-xs hover:underline"
                                  >
                                    {affiliate.websiteUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-hp-white capitalize">{affiliate.platform}</p>
                              {affiliate.audienceSize && (
                                <p className="text-gray-400 text-sm">{affiliate.audienceSize}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {affiliate.setupCompleted ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-xs font-semibold">
                                <RefreshCw className="w-3 h-3" />
                                Pending Setup
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {affiliate.affiliateCode ? (
                              <span className="font-mono text-hp-yellow font-semibold">
                                {affiliate.affiliateCode}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Calendar className="w-3 h-3" />
                              {formatDate(affiliate.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AdminDashboardPage

