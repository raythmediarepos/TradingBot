import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DefaultSeo } from 'next-seo'
import { Analytics } from '@vercel/analytics/react'
import { defaultSEO } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Honeypot AI - Halal-First Trading Alerts',
  description: 'Real-time halal-compliant buy/sell signals with transparent rationale. No haram sectors, no options. Research Chatbot coming soon.',
  icons: {
    icon: [
      { url: '/bee-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

