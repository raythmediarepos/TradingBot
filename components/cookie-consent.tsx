'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

const CookieConsent = () => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-hp-gray900 border-t border-hp-yellow/20 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-gray-300 text-sm">
              We use cookies to enhance your experience and analyze site usage.
              By continuing, you agree to our use of cookies.{' '}
              <a
                href="/legal/privacy"
                className="text-hp-yellow hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent

