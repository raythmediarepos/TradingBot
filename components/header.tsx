'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavigationItem = {
  name: string
  href: string
  badge?: string
}

const Header = () => {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation: NavigationItem[] = [
    { name: 'Beta Program', href: '/beta/signup', badge: 'LIVE' },
    { name: 'Features', href: '#features' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Affiliates', href: '/affiliates' },
    { name: 'Investors', href: '/investors' },
    { name: 'Changelog', href: '/changelog' },
  ]

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-hp-black/80 backdrop-blur-xl border-b border-hp-yellow/10 shadow-lg shadow-hp-black/50'
            : 'bg-transparent'
        )}
      >
        {/* Top Premium Bar */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-hp-yellow/10 via-hp-yellow/5 to-hp-yellow/10 border-b border-hp-yellow/20"
            >
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-center gap-2 text-xs text-hp-yellow">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-medium">
                    🐝 Beta NOW OPEN — 100 Spots (First 20 FREE)
                  </span>
                  <Link href="/beta/signup" className="underline font-semibold hover:text-hp-yellow600">
                    Join Beta →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo with Animation */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-hp-yellow to-hp-yellow600 rounded-lg flex items-center justify-center font-bold text-hp-black shadow-lg shadow-hp-yellow/20"
              >
                H
              </motion.div>
              <div className="flex flex-col">
                <span className="text-hp-white font-bold text-lg md:text-xl tracking-tight">
                  Helwa AI
                </span>
                <span className="text-[10px] text-gray-500 -mt-1 hidden md:block">
                    Ethical Trading Signals
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-4 py-2 text-gray-300 hover:text-hp-yellow transition-colors text-sm font-medium group"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.name}
                    {item.badge && (
                      <span className="text-[10px] bg-hp-yellow/20 text-hp-yellow px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {hoveredItem === item.name && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-hp-yellow/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                size="sm" 
                variant="ghost"
                asChild
                className="text-gray-300 hover:text-hp-yellow"
              >
                <Link href="#faq">
                  Learn More
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                asChild
                className="text-gray-300 hover:text-hp-yellow border-hp-yellow/20 hover:border-hp-yellow/40"
              >
                <Link href="/login">
                  Login
                </Link>
              </Button>
              <Button 
                size="sm"
                asChild
                className="shadow-lg shadow-hp-yellow/20 hover:shadow-hp-yellow/30 transition-all"
              >
                <Link href="/beta/signup" className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Join Beta
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              onClick={handleMobileMenuToggle}
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-hp-white p-2 hover:bg-hp-yellow/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
              tabIndex={0}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu with Animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-hp-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gradient-to-br from-hp-gray900 to-hp-black border-l border-hp-yellow/20 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-hp-yellow rounded-lg flex items-center justify-center font-bold text-hp-black">
                      H
                    </div>
                    <span className="text-hp-white font-semibold">Helwa AI</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-hp-white p-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-2 mb-8">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center justify-between p-4 text-gray-300 hover:text-hp-yellow hover:bg-hp-yellow/5 rounded-lg transition-all group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="text-xs bg-hp-yellow/20 text-hp-yellow px-2 py-1 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/beta/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Join Beta Program
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="w-full" asChild>
                    <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                      Learn More
                    </Link>
                  </Button>
                </motion.div>

                {/* Footer Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-8 border-t border-hp-yellow/10"
                >
                  <p className="text-sm text-gray-500 mb-4">
                    Advanced ethical trading signals powered by data
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-hp-yellow">1B+</div>
                      <div className="text-xs text-gray-500">Data Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-hp-yellow">24/7</div>
                      <div className="text-xs text-gray-500">Monitoring</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-hp-yellow">&lt;1s</div>
                      <div className="text-xs text-gray-500">Latency</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header

