'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Info, Activity, Clock, Target, Zap, Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import WhyModal from './why-modal'
import signalsData from '@/data/signals.json'

type Signal = {
  id: string
  ticker: string
  direction: 'BUY' | 'SELL' | 'HOLD'
  timestamp: string
  confidence: number
  rationale: string
  datapoints: {
    rsi: number
    volume: string
    momentum: string
    support: string
    resistance: string
  }
}

const SignalsTable = () => {
  const [selectedSignal, setSelectedSignal] = React.useState<Signal | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [liveSignalIndex, setLiveSignalIndex] = React.useState(0)
  const [betaStats, setBetaStats] = React.useState<{ filled: number; total: number; remaining: number } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)
  const [isRetrying, setIsRetrying] = React.useState(false)

  const signals = signalsData as Signal[]

  // Fetch beta program availability with retry logic
  const fetchBetaAvailability = React.useCallback(async (isRetry: boolean = false) => {
    if (isRetry) {
      setIsRetrying(true)
      setError(null)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/beta/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setBetaStats({
          filled: data.filled,
          total: data.total,
          remaining: data.remaining,
        })
        setError(null)
        setRetryCount(0)
      } else {
        throw new Error(data.message || 'Failed to fetch beta stats')
      }
    } catch (error) {
      console.error('Error fetching beta stats:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Unable to load beta status. ${errorMessage}`)
      
      // Auto-retry up to 2 times with exponential backoff
      if (retryCount < 2 && !isRetry) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchBetaAvailability(false)
        }, delay)
      }
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [retryCount])

  React.useEffect(() => {
    fetchBetaAvailability()
  }, [])

  // Simulate live signal updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveSignalIndex((prev) => (prev + 1) % signals.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [signals.length])

  const isBetaFull = betaStats && betaStats.remaining === 0

  const handleShowWhy = (signal: Signal) => {
    setSelectedSignal(signal)
    setIsModalOpen(true)
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'BUY':
        return <TrendingUp className="text-green-500" size={20} />
      case 'SELL':
        return <TrendingDown className="text-red-500" size={20} />
      default:
        return <Minus className="text-gray-500" size={20} />
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BUY':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'SELL':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="py-24 bg-hp-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-hp-gray900/50 to-hp-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-hp-yellow/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full px-4 py-2 mb-6">
            <Activity className="w-4 h-4 text-hp-yellow animate-pulse" />
            <span className="text-hp-yellow text-sm font-semibold">
              Live Signal Feed
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
            Real-time trading signals with{' '}
            <span className="bg-gradient-to-r from-hp-yellow to-hp-yellow600 bg-clip-text text-transparent">
              full transparency
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Every signal includes detailed rationale, datapoints, and confidence levels—
            no black boxes, just clear, actionable insights
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
        >
          {[
            { icon: Zap, label: 'Sub-second', value: 'Latency' },
            { icon: Target, label: '92%', value: 'Accuracy Rate' },
            { icon: Activity, label: '24/7', value: 'Monitoring' },
            { icon: Clock, label: 'Real-time', value: 'Updates' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center p-4 bg-hp-gray900/50 border border-hp-yellow/10 rounded-lg"
              >
                <Icon className="w-5 h-5 text-hp-yellow mb-2" />
                <div className="text-sm font-semibold text-hp-white">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.value}</div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-hp-yellow/20 bg-gradient-to-br from-hp-gray900/80 to-hp-black/80 backdrop-blur-sm shadow-2xl">
            <table className="w-full">
              <thead className="bg-hp-yellow/5 border-b border-hp-yellow/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Signal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Rationale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-hp-yellow uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hp-yellow/10">
                <AnimatePresence mode="popLayout">
                  {signals.map((signal, index) => (
                    <motion.tr
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group hover:bg-hp-yellow/5 transition-all duration-300 ${
                        index === liveSignalIndex ? 'bg-hp-yellow/5' : ''
                      }`}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-hp-white text-lg">
                            {signal.ticker}
                          </span>
                          {index === liveSignalIndex && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              LIVE
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-semibold ${getDirectionColor(
                            signal.direction
                          )}`}
                        >
                          {getDirectionIcon(signal.direction)}
                          <span>{signal.direction}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          {formatTimestamp(signal.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-2.5 bg-hp-gray900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${signal.confidence}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-hp-yellow to-hp-yellow600"
                            />
                          </div>
                          <span className="text-sm font-semibold text-hp-white">
                            {signal.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-md">
                        <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200">
                          {signal.rationale}
                        </p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowWhy(signal)}
                          className="hover:bg-hp-yellow/10 hover:text-hp-yellow"
                        >
                          <Info size={16} className="mr-1.5" />
                          Details
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-5 bg-gradient-to-br from-hp-gray900/80 to-hp-black/80 border rounded-xl backdrop-blur-sm ${
                  index === liveSignalIndex
                    ? 'border-hp-yellow/40 shadow-lg shadow-hp-yellow/10'
                    : 'border-hp-yellow/20'
                }`}
              >
                {index === liveSignalIndex && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="text-[10px]">
                      LIVE
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-hp-white text-xl">
                      {signal.ticker}
                    </span>
                    <div
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-sm font-semibold ${getDirectionColor(
                        signal.direction
                      )}`}
                    >
                      {getDirectionIcon(signal.direction)}
                      <span>{signal.direction}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {signal.rationale}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-hp-yellow/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-hp-gray900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hp-yellow"
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-hp-white">
                        {signal.confidence}%
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShowWhy(signal)}
                    className="text-hp-yellow hover:bg-hp-yellow/10"
                  >
                    <Info size={14} className="mr-1" />
                    Details
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(signal.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA - Dynamic based on beta availability */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            {error && !loading ? (
              // Show error state with retry
              <div className="flex flex-col items-center gap-4">
                <div className="max-w-md w-full px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-red-400 mb-1">Unable to Load Beta Status</p>
                      <p className="text-xs text-red-300/80">Check your connection</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => fetchBetaAvailability(true)}
                    disabled={isRetrying}
                    size="sm"
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </>
                    )}
                  </Button>
                </div>
                <Button size="lg" asChild className="shadow-xl shadow-hp-yellow/20 hover:shadow-hp-yellow/30 transition-all group">
                  <Link href="/beta/signup" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Continue to Beta Signup
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            ) : !loading && !error && !isBetaFull ? (
              // Show Join Beta when spots available
              <>
                <p className="text-gray-400 mb-6">
                  Ready to start trading ethically?
                </p>
                <Button size="lg" asChild className="shadow-xl shadow-hp-yellow/20 hover:shadow-hp-yellow/30 transition-all group">
                  <Link href="/beta/signup" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Join Beta Program
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                {betaStats && (
                  <p className="text-sm text-gray-500 mt-4">
                    {betaStats.remaining} spots remaining • First 20 FREE
                  </p>
                )}
              </>
            ) : !loading && !error && isBetaFull ? (
              // Show Join Waitlist when beta is full
              <>
                <p className="text-gray-400 mb-6">
                  Beta program is full. Join the waitlist!
                </p>
                <Button size="lg" asChild className="shadow-xl shadow-hp-yellow/20 hover:shadow-hp-yellow/30 transition-all group">
                  <Link href="/waitlist" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Be notified when new spots open up
                </p>
              </>
            ) : null}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {selectedSignal && (
        <WhyModal
          signal={selectedSignal}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}

export default SignalsTable

