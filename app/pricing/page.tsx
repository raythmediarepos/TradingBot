import * as React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PricingTiers from '@/components/pricing-tiers'
import FAQ from '@/components/faq'

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for Helwa AI trading alerts. No performance fees, cancel anytime.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-hp-black">
      <Header />
      <div className="pt-20">
        <PricingTiers />
        <FAQ />
      </div>
      <Footer />
    </main>
  )
}

