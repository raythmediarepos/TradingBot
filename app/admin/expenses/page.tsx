'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  DollarSign, TrendingUp, Calendar, Users, Loader2, RefreshCcw, AlertCircle, Receipt, CreditCard, Tag
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

const COLORS = ['#9C27B0', '#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#00BCD4', '#FF9800', '#E91E63']

export default function AdminExpensesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expenseData, setExpenseData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      
      const response = await fetchWithAuth('/api/admin/expenses/data')
      const result = await response.json()
      
      if (result.success) {
        setExpenseData(result)
      } else {
        setError(result.message || 'Failed to fetch expense data')
      }
    } catch (err: any) {
      console.error('Error fetching expense data:', err)
      setError(err.message || 'An unexpected error occurred')
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
          <p className="text-gray-400 text-sm">Loading expense data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="bg-hp-gray900 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Data</h2>
            <p className="text-gray-400 mb-2">{error}</p>
            {error.includes('Permission denied') && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-left">
                <p className="text-sm text-yellow-200 font-semibold mb-2">🔐 Setup Required:</p>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Open your Google Sheet</li>
                  <li>Click "Share" button</li>
                  <li>Add the service account email (from Firebase)</li>
                  <li>Grant "Viewer" access</li>
                  <li>Click "Refresh" below</li>
                </ol>
              </div>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!expenseData || !expenseData.metrics) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-hp-gray900 border border-yellow-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No Expense Data</h2>
            <p className="text-gray-400 mb-6">The Google Sheet appears to be empty or no expense data was found.</p>
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

  const { metrics, expenses, monthlyTotals, sheetCount } = expenseData

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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Company Expenses
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Live data from Google Sheets • {metrics.totalCount || 0} expenses across {sheetCount} months
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
        {/* Key Metrics */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-400 mb-6 uppercase tracking-wider">Financial Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Expenses</p>
              </div>
              <p className="text-3xl font-bold text-white">${metrics.totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">{metrics.totalCount} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last 12 Months</p>
              </div>
              <p className="text-3xl font-bold text-white">${metrics.last12MonthsExpenses.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Annual</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Avg Expense</p>
              </div>
              <p className="text-3xl font-bold text-white">${metrics.averageExpense.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Needs Reimbursement</p>
              </div>
              <p className="text-3xl font-bold text-red-400">${metrics.needsReimbursement.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Not refunded</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-400 mb-6 uppercase tracking-wider">Recent Activity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Last 7 Days</p>
              <p className="text-2xl font-bold text-purple-400">${metrics.last7DaysExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Last 30 Days</p>
              <p className="text-2xl font-bold text-blue-400">${metrics.last30DaysExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-2 font-medium">Largest Expense</p>
              <p className="text-2xl font-bold text-yellow-400">${metrics.largestExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Breakdown Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Expenses by Person */}
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Expenses by Person</h3>
            </div>
            {metrics.expensesByPerson && metrics.expensesByPerson.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={metrics.expensesByPerson}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis 
                    dataKey="person" 
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
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="total" fill="#9C27B0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-600">No data</div>
            )}
          </div>

          {/* Expenses by Category */}
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Expenses by Category</h3>
            </div>
            {metrics.expensesByCategory && metrics.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={metrics.expensesByCategory.slice(0, 8)}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: $${entry.total.toFixed(0)}`}
                  >
                    {metrics.expensesByCategory.slice(0, 8).map((entry: any, index: number) => (
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
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-600">No data</div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        {monthlyTotals && monthlyTotals.length > 0 && (
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Monthly Expense Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#4CAF50" name="Total Expenses" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Methods */}
        {metrics.expensesByPaymentForm && metrics.expensesByPaymentForm.length > 0 && (
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold">Expenses by Payment Method</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={metrics.expensesByPaymentForm}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis 
                  dataKey="paymentForm" 
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
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="total" fill="#FFC107" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Expenses Table */}
        {expenses && expenses.length > 0 && (
          <div className="bg-hp-gray900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
              <p className="text-sm text-gray-500 mt-1">Showing last {Math.min(50, expenses.length)} expenses</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hp-black/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Who Paid</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Refunded</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.slice(0, 50).map((expense: any, index: number) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold text-purple-400">
                        ${expense.cost.toFixed(2)}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.date || '-'}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.reason || '-'}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.whoPaid || '-'}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.location || '-'}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.refunded ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {expense.refunded ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-400">
                        {expense.month || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

