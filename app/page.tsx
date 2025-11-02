import * as React from 'react'
import Header from '@/components/header'
import Hero from '@/components/hero'
import HowItWorks from '@/components/how-it-works'
import ValueCards from '@/components/value-cards'
import SignalsTable from '@/components/signals-table'
import WaitlistForm from '@/components/waitlist-form'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'
import CookieConsent from '@/components/cookie-consent'
import HoneyEffects from '@/components/honey-effects'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hp-black relative">
      <HoneyEffects />
      <Header />
      <Hero />
      <HowItWorks />
      <ValueCards />
      <SignalsTable />
      <WaitlistForm />
      <FAQ />
      <Footer />
      <CookieConsent />
    </main>
  )
}

