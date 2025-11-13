'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Send, CheckCircle } from 'lucide-react'

interface ReportIssueButtonProps {
  position?: 'fixed' | 'inline'
  variant?: 'button' | 'icon' | 'link'
}

export default function ReportIssueButton({ position = 'fixed', variant = 'button' }: ReportIssueButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    category: 'general',
    title: '',
    description: '',
  })

  const categories = [
    { value: 'bug', label: '🐛 Bug Report', color: 'red' },
    { value: 'feature', label: '💡 Feature Request', color: 'blue' },
    { value: 'question', label: '❓ Question', color: 'yellow' },
    { value: 'payment', label: '💳 Payment Issue', color: 'orange' },
    { value: 'account', label: '👤 Account Issue', color: 'purple' },
    { value: 'general', label: '📝 General', color: 'gray' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Please log in to report an issue')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/issues/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          url: window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit issue report')
      }

      setIsSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
        setFormData({ category: 'general', title: '', description: '' })
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
          title="Report an issue"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      )
    }

    if (variant === 'link') {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-red-500 hover:text-red-400 underline transition-colors"
        >
          Report an issue
        </button>
      )
    }

    // Default button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
      >
        <AlertCircle className="w-5 h-5" />
        <span>Report Issue</span>
      </button>
    )
  }

  return (
    <>
      {/* Button/Trigger */}
      <div className={position === 'fixed' ? 'fixed bottom-6 right-6 z-50' : ''}>
        {renderButton()}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-hp-gray900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Report an Issue</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Help us improve by reporting problems or suggesting features
                  </p>
                </div>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Success State */}
              {isSuccess ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Report Submitted!
                  </h3>
                  <p className="text-gray-400">
                    Thank you for your feedback. Our team will review your report shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.value })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            formData.category === cat.value
                              ? 'border-hp-yellow bg-hp-yellow/10 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-sm font-medium">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Please provide as much detail as possible..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow transition-colors resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-hp-yellow hover:bg-hp-yellow/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

