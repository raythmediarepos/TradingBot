'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Save, RefreshCcw, Menu, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'
import { isAuthenticated, isAdmin, fetchWithAuth, logout } from '@/lib/auth'

interface NavSettings {
  betaProgram: boolean
  features: boolean
  faq: boolean
  affiliates: boolean
  investors: boolean
  changelog: boolean
  learnMore: boolean
  login: boolean
  joinBeta: boolean
}

const navItems = [
  { key: 'betaProgram', label: 'Beta Program', badge: 'LIVE', description: 'Beta signup link in main nav' },
  { key: 'features', label: 'Features', description: 'Features section link' },
  { key: 'faq', label: 'FAQ', description: 'FAQ section link' },
  { key: 'affiliates', label: 'Affiliates', description: 'Affiliate program page' },
  { key: 'investors', label: 'Investors', description: 'Investor relations page' },
  { key: 'changelog', label: 'Changelog', description: 'Product changelog page' },
  { key: 'learnMore', label: 'Learn More', description: 'CTA button in header' },
  { key: 'login', label: 'Login', description: 'Login button in header' },
  { key: 'joinBeta', label: 'Join Beta', description: 'Primary CTA button' },
]

export default function NavigationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NavSettings>({
    betaProgram: true,
    features: true,
    faq: true,
    affiliates: true,
    investors: true,
    changelog: true,
    learnMore: true,
    login: true,
    joinBeta: true,
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/admin/login')
      return
    }

    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site-settings/navigation`)
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching navigation settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof NavSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveStatus('idle')

      const response = await fetchWithAuth('/api/site-settings/navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving navigation settings:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hp-black text-hp-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-hp-yellow" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hp-black text-hp-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-hp-black/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Menu className="w-6 h-6 text-hp-yellow" />
                Navigation Settings
              </h1>
              <p className="text-sm text-gray-400">Manage landing page navigation visibility</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-gray-500/10 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/20 transition-all text-sm"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              saveStatus === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Navigation settings saved successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>Failed to save navigation settings. Please try again.</span>
              </>
            )}
          </motion.div>
        )}

        {/* Info Card */}
        <div className="bg-hp-gray900 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">Navigation Management</h3>
              <p className="text-sm text-gray-400">
                Control which navigation items appear on the landing page. Changes are reflected immediately
                for all visitors. At least one CTA button (Login or Join Beta) should remain visible.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="bg-hp-gray900 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold">Navigation Items</h2>
            <p className="text-sm text-gray-400 mt-1">Toggle visibility for each navigation item</p>
          </div>

          <div className="divide-y divide-white/10">
            {navItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.label}</h3>
                      {item.badge && (
                        <span className="text-xs bg-hp-yellow/20 text-hp-yellow px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggle(item.key as keyof NavSettings)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      settings[item.key as keyof NavSettings]
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {settings[item.key as keyof NavSettings] ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm font-medium">Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={fetchSettings}
            className="px-6 py-3 bg-gray-500/10 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/20 transition-all flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reset to Current
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-hp-yellow to-hp-yellow600 text-hp-black font-semibold rounded-lg hover:shadow-lg hover:shadow-hp-yellow/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

