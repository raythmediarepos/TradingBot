'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  DollarSign, TrendingUp, Calendar, CreditCard, AlertCircle, CheckCircle2,
  Clock, XCircle, Loader2, RefreshCcw, Download, ArrowUpDown
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  created: Date
  customer: {
    id: string
    email: string | null
    name: string | null
  } | null
  betaUser: {
    id: string
    email: string
    name: string
    position: number
    isFree: boolean
  } | null
  metadata: Record<string, string>
}

interface RevenueData {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  daily: { date: string; amount: number }[]
  weekly: { week: string; amount: number }[]
  monthly: { month: string; amount: number }[]
}

interface PaymentsData {
  payments: Payment[]
  revenue: RevenueData
  stats: {
    totalPayments: number
    successfulPayments: number
    failedPayments: number
    pendingPayments: number
  }
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PaymentsData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [refundModal, setRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('requested_by_customer')
  const [refunding, setRefunding] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'created' | 'amount'>('created')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [revenueView, setRevenueView] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

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
      
      const response = await fetchWithAuth('/api/admin/payments')
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleRefund = async () => {
    if (!selectedPayment) return

    try {
      setRefunding(true)
      
      const body: { reason: string; amount?: number } = { reason: refundReason }
      if (refundAmount && parseFloat(refundAmount) > 0) {
        body.amount = parseFloat(refundAmount)
      }

      const response = await fetchWithAuth(`/api/admin/payments/${selectedPayment.id}/refund`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Refund processed successfully!')
        setRefundModal(false)
        setSelectedPayment(null)
        setRefundAmount('')
        fetchData()
      } else {
        alert(`Refund failed: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Failed to process refund')
    } finally {
      setRefunding(false)
    }
  }

  const exportToCSV = () => {
    if (!data || !data.payments.length) return

    const headers = ['Date', 'Payment ID', 'Customer', 'Beta User', 'Amount', 'Status']
    const rows = filteredPayments.map(p => [
      new Date(p.created).toLocaleDateString(),
      p.id,
      p.customer?.email || 'N/A',
      p.betaUser?.email || 'N/A',
      `$${p.amount.toFixed(2)}`,
      p.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-hp-yellow animate-spin" />
      </div>
    )
  }

  // Filter and sort payments
  const filteredPayments = data?.payments
    .filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          p.customer?.email?.toLowerCase().includes(search) ||
          p.betaUser?.email?.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
        )
      }
      return true
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      if (sortField === 'created') {
        return (new Date(a.created).getTime() - new Date(b.created).getTime()) * direction
      } else {
        return (a.amount - b.amount) * direction
      }
    }) || []

  const getStatusBadge = (status: string) => {
    const styles = {
      succeeded: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      requires_action: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      canceled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }

    const icons = {
      succeeded: <CheckCircle2 className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      processing: <Clock className="w-3 h-3" />,
      requires_action: <AlertCircle className="w-3 h-3" />,
      canceled: <XCircle className="w-3 h-3" />,
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 w-fit ${styles[status as keyof typeof styles] || styles.processing}`}>
        {icons[status as keyof typeof icons] || <Clock className="w-3 h-3" />}
        {status.replace('_', ' ')}
      </span>
    )
  }

  const revenueChartData = data?.revenue[revenueView] || []

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
                  <DollarSign className="w-6 h-6 text-green-400" />
                  Payment Management
                </h1>
                <p className="text-sm text-gray-400">Stripe transactions and revenue tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
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
        {/* Revenue Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <p className="text-xs text-gray-400">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold">${data?.revenue.total.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <p className="text-xs text-gray-400">Today</p>
            </div>
            <p className="text-3xl font-bold">${data?.revenue.today.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-hp-gray900 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <p className="text-xs text-gray-400">This Week</p>
            </div>
            <p className="text-3xl font-bold">${data?.revenue.thisWeek.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <p className="text-xs text-gray-400">This Month</p>
            </div>
            <p className="text-3xl font-bold">${data?.revenue.thisMonth.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold">Revenue Over Time</h2>
            </div>
            <select
              value={revenueView}
              onChange={(e) => setRevenueView(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="px-3 py-1.5 bg-hp-gray800 border border-gray-700 rounded-lg text-sm text-white focus:border-green-500 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey={revenueView === 'daily' ? 'date' : revenueView === 'weekly' ? 'week' : 'month'} 
                  stroke="#888" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis stroke="#888" tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-8">No revenue data available</p>
          )}
        </div>

        {/* Payment Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-hp-gray900 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Total Payments</p>
            <p className="text-2xl font-bold">{data?.stats.totalPayments || 0}</p>
          </div>
          <div className="bg-hp-gray900 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-400">{data?.stats.successfulPayments || 0}</p>
          </div>
          <div className="bg-hp-gray900 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">{data?.stats.failedPayments || 0}</p>
          </div>
          <div className="bg-hp-gray900 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{data?.stats.pendingPayments || 0}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Transactions</h2>
              <p className="text-sm text-gray-400">{filteredPayments.length} payments</p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by email, payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-hp-gray800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-hp-gray800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
                <option value="requires_action">Requires Action</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hp-black border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => {
                      setSortField('created')
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    }} className="flex items-center gap-1 hover:text-white">
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Beta User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => {
                      setSortField('amount')
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    }} className="flex items-center gap-1 hover:text-white">
                      Amount <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(payment.created).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-medium">{payment.customer?.name || 'N/A'}</p>
                          <p className="text-gray-400 text-xs">{payment.customer?.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.betaUser ? (
                          <div className="text-sm">
                            <p className="font-medium">{payment.betaUser.name}</p>
                            <p className="text-gray-400 text-xs">#{payment.betaUser.position} {payment.betaUser.isFree && '(FREE)'}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.status === 'succeeded' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setRefundModal(true)
                            }}
                            className="text-red-400 hover:text-red-300 font-medium"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-hp-gray900 border border-red-500/30 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Process Refund
            </h3>
            
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ This will refund the payment and update the user's status to cancelled.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">Payment Amount</p>
              <p className="text-2xl font-bold">${selectedPayment.amount.toFixed(2)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Refund Amount (leave empty for full refund)
              </label>
              <input
                type="number"
                step="0.01"
                max={selectedPayment.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`$${selectedPayment.amount.toFixed(2)}`}
                className="w-full px-4 py-2 bg-hp-gray800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-2 bg-hp-gray800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              >
                <option value="requested_by_customer">Requested by customer</option>
                <option value="duplicate">Duplicate payment</option>
                <option value="fraudulent">Fraudulent</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRefundModal(false)
                  setSelectedPayment(null)
                  setRefundAmount('')
                }}
                disabled={refunding}
                className="flex-1 px-4 py-2 bg-hp-gray800 border border-gray-700 rounded-lg hover:bg-hp-gray700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {refunding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Refund'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

