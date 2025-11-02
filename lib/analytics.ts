/**
 * Analytics Tracking Utility
 * 
 * Tracks user events throughout the beta signup funnel.
 * Events are sent to console in development and can be easily
 * integrated with GA4, Mixpanel, or PostHog in production.
 */

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp: string
}

class Analytics {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Track a generic event
   */
  track(event: string, properties?: Record<string, any>) {
    const eventData: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
    }

    if (this.isDevelopment) {
      console.log('📊 Analytics Event:', eventData)
    }

    // Send to your analytics provider
    // Example integrations below:

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties)
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event, properties)
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(event, properties)
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', event, properties)
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (this.isDevelopment) {
      console.log('👤 User Identified:', { userId, traits })
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.identify(userId)
      if (traits) {
        (window as any).mixpanel.people.set(traits)
      }
    }

    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.identify(userId, traits)
    }
  }

  /**
   * Track page view
   */
  pageView(pagePath: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page_path: pagePath,
      ...properties,
    })
  }

  // === Beta Program Specific Events ===

  /**
   * User landed on beta signup page
   */
  betaSignupPageViewed(source?: string) {
    this.track('beta_signup_page_viewed', {
      source: source || 'direct',
    })
  }

  /**
   * User viewed current beta stats
   */
  betaStatsViewed(stats: { spotsAvailable: number; position: number; isFree: boolean }) {
    this.track('beta_stats_viewed', stats)
  }

  /**
   * User started filling out the form
   */
  betaSignupStarted() {
    this.track('beta_signup_started')
  }

  /**
   * User submitted the signup form
   */
  betaSignupSubmitted(data: {
    position: number
    isFree: boolean
    hasTwitter: boolean
    hasDiscord: boolean
  }) {
    this.track('beta_signup_submitted', data)
  }

  /**
   * Signup was successful
   */
  betaSignupSuccess(data: {
    position: number
    isFree: boolean
    email: string
  }) {
    this.track('beta_signup_success', {
      ...data,
      email: this.hashEmail(data.email), // Hash email for privacy
    })

    // Identify user
    this.identify(`beta_user_${data.position}`, {
      position: data.position,
      is_free: data.isFree,
      signup_date: new Date().toISOString(),
    })
  }

  /**
   * Signup failed
   */
  betaSignupFailed(error: string) {
    this.track('beta_signup_failed', { error })
  }

  /**
   * User landed on success page
   */
  betaSuccessPageViewed(position: number) {
    this.track('beta_success_page_viewed', { position })
  }

  /**
   * User clicked email verification link
   */
  betaEmailVerificationStarted() {
    this.track('beta_email_verification_started')
  }

  /**
   * Email verification succeeded
   */
  betaEmailVerificationSuccess(data: {
    position: number
    isFree: boolean
  }) {
    this.track('beta_email_verification_success', data)
  }

  /**
   * Email verification failed
   */
  betaEmailVerificationFailed(error: string) {
    this.track('beta_email_verification_failed', { error })
  }

  /**
   * User landed on payment page
   */
  betaPaymentPageViewed(position: number) {
    this.track('beta_payment_page_viewed', { position })
  }

  /**
   * User initiated Stripe checkout
   */
  betaPaymentStarted(data: {
    position: number
    amount: number
    currency: string
  }) {
    this.track('beta_payment_started', data)
  }

  /**
   * Payment was successful
   */
  betaPaymentSuccess(data: {
    position: number
    amount: number
    subscriptionId: string
  }) {
    this.track('beta_payment_success', data)

    // Also track as purchase for conversion tracking
    this.track('purchase', {
      value: data.amount,
      currency: 'USD',
      transaction_id: data.subscriptionId,
    })
  }

  /**
   * Payment failed
   */
  betaPaymentFailed(error: string) {
    this.track('beta_payment_failed', { error })
  }

  /**
   * User clicked Discord invite link
   */
  betaDiscordInviteClicked(position: number) {
    this.track('beta_discord_invite_clicked', { position })
  }

  /**
   * Discord invite was validated
   */
  betaDiscordInviteValidated(data: {
    position: number
    isFree: boolean
  }) {
    this.track('beta_discord_invite_validated', data)
  }

  /**
   * User successfully joined Discord
   */
  betaDiscordJoined(position: number) {
    this.track('beta_discord_joined', { position })

    // Track as conversion
    this.track('conversion', {
      type: 'beta_onboarding_complete',
      position,
    })
  }

  // === Conversion Funnel Helpers ===

  /**
   * Calculate funnel drop-off rates
   * Call this on the admin dashboard
   */
  async getFunnelMetrics() {
    // This would query your analytics provider's API
    // For now, we'll just track the structure

    return {
      signupPageViews: 0,
      signupStarted: 0,
      signupSubmitted: 0,
      signupSuccess: 0,
      emailVerified: 0,
      paymentStarted: 0,
      paymentSuccess: 0,
      discordJoined: 0,

      // Conversion rates
      signupToVerification: 0,
      verificationToPayment: 0,
      paymentToDiscord: 0,
      overallConversion: 0,
    }
  }

  // === Utility Functions ===

  /**
   * Hash email for privacy-compliant tracking
   */
  private hashEmail(email: string): string {
    if (typeof window === 'undefined') return ''

    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `email_${Math.abs(hash)}`
  }

  /**
   * Track error globally
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    })

    // Send to error tracking service (Sentry, Rollbar, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context })
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Export for convenience
export default analytics

