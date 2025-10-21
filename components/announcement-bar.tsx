'use client'

import * as React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-hp-yellow text-hp-black py-2 px-4 text-center text-sm font-medium relative">
      <div className="container mx-auto">
        <span>
          🎉 Research Chatbot Beta launching soon!{' '}
          <Link href="#waitlist" className="underline font-semibold">
            Join the waitlist
          </Link>
        </span>
      </div>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Close announcement"
        tabIndex={0}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default AnnouncementBar

