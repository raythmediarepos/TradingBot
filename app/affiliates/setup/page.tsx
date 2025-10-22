'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Rocket, CheckCircle2, User, MapPin, CreditCard, ArrowRight, AlertCircle } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const AffiliateSetupPage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')
  
  // Form state
  const [fullName, setFullName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [street, setStreet] = React.useState('')
  const [city, setCity] = React.useState('')
  const [state, setState] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [postalCode, setPostalCode] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState('')
  const [paymentDetails, setPaymentDetails] = React.useState('')

  const steps = [
    {
      number: 1,
      title: 'Profile Info',
      icon: User,
      description: 'Your personal details'
    },
    {
      number: 2,
      title: 'Address',
      icon: MapPin,
      description: 'Your mailing address'
    },
    {
      number: 3,
      title: 'Payment',
      icon: CreditCard,
      description: 'How you get paid'
    }
  ]

  React.useEffect(() => {
    // Check if user is logged in
    const affiliateAuth = localStorage.getItem('affiliateAuth')
    if (!affiliateAuth) {
      router.push('/affiliates/login')
    }
  }, [router])

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName || !phone) {
        setError('Please fill in all required fields')
        return
      }
    } else if (currentStep === 2) {
      if (!street || !city || !state || !country || !postalCode) {
        setError('Please fill in all address fields')
        return
      }
    }
    
    setError('')
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate payment info
    if (!paymentMethod || !paymentDetails) {
      setError('Please fill in all payment fields')
      setIsSubmitting(false)
      return
    }

    try {
      const affiliateAuth = localStorage.getItem('affiliateAuth')
      if (!affiliateAuth) {
        router.push('/affiliates/login')
        return
      }

      const affiliate = JSON.parse(affiliateAuth)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tradingbot-w843.onrender.com'

      const response = await fetch(`${apiUrl}/api/affiliates/complete-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliateId: affiliate.id,
          setupData: {
            fullName,
            phone,
            address: {
              street,
              city,
              state,
              country,
              postalCode
            },
            paymentInfo: {
              method: paymentMethod,
              details: paymentDetails
            }
          }
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update local storage with setup completed status
        const updatedAffiliate = {
          ...affiliate,
          setupCompleted: true,
          affiliateCode: data.affiliateCode,
          affiliateLink: data.affiliateLink
        }
        localStorage.setItem('affiliateAuth', JSON.stringify(updatedAffiliate))
        
        // Redirect to dashboard
        router.push('/affiliates/dashboard')
      } else {
        setError(data.message || 'Failed to complete setup. Please try again.')
      }
    } catch (error) {
      console.error('Setup error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                Complete Your Profile
              </h1>
              <p className="text-xl text-gray-400">
                Just a few more details to start earning commissions
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

            {/* Form */}
            <div className="bg-hp-gray900 border border-hp-yellow/30 rounded-2xl p-8 md:p-12">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Profile Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-hp-white mb-6">Personal Information</h2>
                    </div>

                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-300 mb-2">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold"
                      >
                        Next Step
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Address */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-hp-white mb-6">Mailing Address</h2>
                    </div>

                    <div>
                      <label htmlFor="street" className="block text-sm font-semibold text-gray-300 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-semibold text-gray-300 mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="country" className="block text-sm font-semibold text-gray-300 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                          placeholder="United States"
                        />
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-300 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors"
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        onClick={handleBack}
                        variant="outline"
                        className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold"
                      >
                        Next Step
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment Info */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-hp-white mb-2">Payment Information</h2>
                      <p className="text-gray-400 text-sm">How would you like to receive your commission payments?</p>
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-300 mb-2">
                        Payment Method *
                      </label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white focus:outline-none focus:border-hp-yellow/50 transition-colors"
                      >
                        <option value="">Select payment method</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank">Bank Transfer (ACH)</option>
                        <option value="wise">Wise (TransferWise)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="paymentDetails" className="block text-sm font-semibold text-gray-300 mb-2">
                        Payment Details *
                      </label>
                      <textarea
                        id="paymentDetails"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-hp-black border border-hp-yellow/20 rounded-lg text-hp-white placeholder-gray-500 focus:outline-none focus:border-hp-yellow/50 transition-colors resize-none"
                        placeholder={
                          paymentMethod === 'paypal' 
                            ? 'Enter your PayPal email address'
                            : paymentMethod === 'bank'
                            ? 'Account Number, Routing Number, Bank Name'
                            : 'Enter your payment details'
                        }
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This information is securely stored and only used for commission payments.
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        onClick={handleBack}
                        variant="outline"
                        className="border-hp-yellow/30 text-hp-yellow hover:bg-hp-yellow/10"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-hp-yellow hover:bg-hp-yellow/90 text-hp-black font-bold"
                      >
                        {isSubmitting ? 'Completing Setup...' : 'Complete Setup'}
                        {!isSubmitting && <CheckCircle2 className="w-5 h-5 ml-2" />}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default AffiliateSetupPage
