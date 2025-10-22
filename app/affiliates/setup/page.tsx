'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Rocket, CheckCircle2, User, Link2, CreditCard } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const AffiliateSetupPage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)

  const steps = [
    {
      number: 1,
      title: 'Profile Setup',
      icon: User,
      description: 'Complete your affiliate profile'
    },
    {
      number: 2,
      title: 'Referral Link',
      icon: Link2,
      description: 'Get your unique referral link'
    },
    {
      number: 3,
      title: 'Payment Info',
      icon: CreditCard,
      description: 'Add payment details for commissions'
    }
  ]

  const handleComplete = () => {
    // TODO: Save setup completion status
    router.push('/affiliates/dashboard')
  }

  return (
    <main className="min-h-screen bg-hp-black relative">
      <Header />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-hp-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-hp-yellow/5 rounded-full blur-[120px]" />
      </div>

      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-hp-yellow/10 border border-hp-yellow/20 rounded-full mb-6">
                <Rocket className="w-10 h-10 text-hp-yellow" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
                Welcome! Let's Get You Set Up
              </h1>
              <p className="text-xl text-gray-400">
                Just a few quick steps to complete your affiliate account
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          currentStep >= step.number
                            ? 'bg-hp-yellow border-hp-yellow text-hp-black'
                            : 'bg-hp-gray900 border-gray-600 text-gray-400'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center hidden sm:block">
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all ${
                          currentStep > step.number ? 'bg-hp-yellow' : 'bg-gray-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content Area - Stubbed */}
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 md:p-12">
              <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-hp-white mb-4">
                  Setup Flow Coming Soon
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  This setup wizard is currently under development. For now, you can skip to your dashboard to start earning commissions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleComplete}
                    className="bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold"
                  >
                    Skip to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push('/affiliates')}
                    variant="outline"
                    className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                  >
                    Back to Affiliates
                  </Button>
                </div>

                {/* Preview of what's coming */}
                <div className="mt-12 pt-12 border-t border-gray-700">
                  <p className="text-sm text-gray-500 mb-6">What you'll be able to do here:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    {steps.map((step) => (
                      <div key={step.number} className="p-4 bg-hp-black/50 border border-gray-700 rounded-lg">
                        <step.icon className="w-6 h-6 text-hp-yellow mb-2" />
                        <h3 className="text-sm font-semibold text-hp-white mb-1">{step.title}</h3>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AffiliateSetupPage

