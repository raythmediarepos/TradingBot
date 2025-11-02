const Stripe = require('stripe')
const {
  createSubscription,
  updateSubscription,
  updateBetaUser,
  getBetaUser,
  createDiscordInvite,
  USER_STATUS,
  PAYMENT_STATUS,
  BETA_PRICE,
} = require('./betaUserService')

// ============================================
// STRIPE INITIALIZATION
// ============================================

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Stripe configuration
const STRIPE_CONFIG = {
  BETA_PRICE_ID: process.env.STRIPE_BETA_PRICE_ID,
  BETA_PRODUCT_ID: process.env.STRIPE_BETA_PRODUCT_ID,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SUCCESS_URL: process.env.FRONTEND_URL + '/beta/success',
  CANCEL_URL: process.env.FRONTEND_URL + '/beta/payment',
  CUSTOMER_PORTAL_URL: process.env.FRONTEND_URL + '/beta/manage',
}

// ============================================
// CHECKOUT SESSION
// ============================================

/**
 * Create Stripe Checkout Session for beta subscription
 * @param {Object} params
 * @param {string} params.userId - Beta user ID
 * @param {string} params.email - User's email
 * @param {string} params.firstName - User's first name
 * @param {string} params.lastName - User's last name
 * @returns {Promise<Object>}
 */
const createCheckoutSession = async ({ userId, email, firstName, lastName }) => {
  try {
    console.log('💳 [STRIPE] Creating checkout session...')
    console.log(`   → User ID: ${userId}`)
    console.log(`   → Email: ${email}`)

    // Validate that user exists and requires payment
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const user = userResult.user
    if (user.isFree) {
      return {
        success: false,
        message: 'This user has a free slot and does not need to pay',
      }
    }

    if (user.paymentStatus === PAYMENT_STATUS.PAID) {
      return {
        success: false,
        message: 'This user has already paid',
      }
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      console.log('   → Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: email.toLowerCase().trim(),
        name: `${firstName} ${lastName}`,
        metadata: {
          betaUserId: userId,
          position: user.position.toString(),
          source: 'beta_program',
        },
      })
      customerId = customer.id
      console.log(`   → Customer created: ${customerId}`)

      // Update user with Stripe customer ID
      await updateBetaUser(userId, {
        stripeCustomerId: customerId,
      })
    } else {
      console.log(`   → Using existing customer: ${customerId}`)
    }

    // Create checkout session (one-time payment)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.BETA_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        betaUserId: userId,
        position: user.position.toString(),
        paymentType: 'one_time_beta_access',
      },
      success_url: `${STRIPE_CONFIG.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.CANCEL_URL,
      customer_update: {
        address: 'auto',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    console.log(`✅ [STRIPE] Checkout session created: ${session.id}`)

    return {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error creating checkout session:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Verify checkout session completion
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>}
 */
const verifyCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    })

    if (session.payment_status !== 'paid') {
      return {
        success: false,
        message: 'Payment not completed',
      }
    }

    return {
      success: true,
      session,
      paymentIntentId: session.payment_intent?.id,
      customerId: session.customer?.id || session.customer,
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error verifying checkout session:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// CUSTOMER PORTAL
// ============================================

/**
 * Create Stripe Customer Portal session
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>}
 */
const createCustomerPortalSession = async (customerId) => {
  try {
    console.log('🔐 [STRIPE] Creating customer portal session...')
    console.log(`   → Customer ID: ${customerId}`)

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: STRIPE_CONFIG.CUSTOMER_PORTAL_URL,
    })

    console.log(`✅ [STRIPE] Portal session created`)

    return {
      success: true,
      url: session.url,
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error creating portal session:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

/**
 * Handle checkout.session.completed event
 * @param {Object} session - Stripe session object
 */
const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log('🎉 [STRIPE WEBHOOK] Checkout session completed')
    console.log(`   → Session ID: ${session.id}`)

    const userId = session.metadata.betaUserId
    const subscriptionId = session.subscription
    const customerId = session.customer

    if (!userId) {
      console.error('   → Missing betaUserId in metadata')
      return
    }

    console.log(`   → Beta User ID: ${userId}`)
    console.log(`   → Subscription ID: ${subscriptionId}`)

    // Update beta user
    await updateBetaUser(userId, {
      status: USER_STATUS.ACTIVE,
      paymentStatus: PAYMENT_STATUS.PAID,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    })

    console.log(`✅ [STRIPE WEBHOOK] User ${userId} activated with subscription`)
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling checkout.session.completed:', error)
  }
}

/**
 * Handle customer.subscription.created event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionCreated = async (subscription) => {
  try {
    console.log('📝 [STRIPE WEBHOOK] Subscription created')
    console.log(`   → Subscription ID: ${subscription.id}`)

    const userId = subscription.metadata.betaUserId
    const customerId = subscription.customer

    if (!userId) {
      console.error('   → Missing betaUserId in metadata')
      return
    }

    // Get user data
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      console.error(`   → User ${userId} not found`)
      return
    }

    const user = userResult.user

    // Create subscription record in Firestore
    await createSubscription({
      userId,
      email: user.email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      amount: BETA_PRICE,
      currency: 'usd',
      interval: 'month',
    })

    console.log(`✅ [STRIPE WEBHOOK] Subscription record created for user ${userId}`)
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling customer.subscription.created:', error)
  }
}

/**
 * Handle customer.subscription.updated event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionUpdated = async (subscription) => {
  try {
    console.log('🔄 [STRIPE WEBHOOK] Subscription updated')
    console.log(`   → Subscription ID: ${subscription.id}`)
    console.log(`   → Status: ${subscription.status}`)

    const userId = subscription.metadata.betaUserId

    if (!userId) {
      console.error('   → Missing betaUserId in metadata')
      return
    }

    // Update subscription record
    await updateSubscription(subscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    })

    // Update user status based on subscription status
    if (subscription.status === 'active') {
      await updateBetaUser(userId, {
        status: USER_STATUS.ACTIVE,
        paymentStatus: PAYMENT_STATUS.PAID,
      })
    } else if (subscription.status === 'past_due') {
      await updateBetaUser(userId, {
        status: USER_STATUS.SUSPENDED,
        paymentStatus: PAYMENT_STATUS.FAILED,
      })
      // TODO: Revoke Discord access
    } else if (subscription.status === 'canceled') {
      await updateBetaUser(userId, {
        status: USER_STATUS.CANCELLED,
        paymentStatus: PAYMENT_STATUS.CANCELLED,
      })
      // TODO: Revoke Discord access
    }

    console.log(`✅ [STRIPE WEBHOOK] Subscription ${subscription.id} updated for user ${userId}`)
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling customer.subscription.updated:', error)
  }
}

/**
 * Handle customer.subscription.deleted event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionDeleted = async (subscription) => {
  try {
    console.log('🗑️  [STRIPE WEBHOOK] Subscription deleted')
    console.log(`   → Subscription ID: ${subscription.id}`)

    const userId = subscription.metadata.betaUserId

    if (!userId) {
      console.error('   → Missing betaUserId in metadata')
      return
    }

    // Update subscription record
    await updateSubscription(subscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    })

    // Update user status
    await updateBetaUser(userId, {
      status: USER_STATUS.CANCELLED,
      paymentStatus: PAYMENT_STATUS.CANCELLED,
    })

    // TODO: Revoke Discord access

    console.log(`✅ [STRIPE WEBHOOK] Subscription ${subscription.id} deleted for user ${userId}`)
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling customer.subscription.deleted:', error)
  }
}

/**
 * Handle invoice.payment_failed event
 * @param {Object} invoice - Stripe invoice object
 */
const handlePaymentFailed = async (invoice) => {
  try {
    console.log('❌ [STRIPE WEBHOOK] Payment failed')
    console.log(`   → Invoice ID: ${invoice.id}`)
    console.log(`   → Customer ID: ${invoice.customer}`)

    const subscriptionId = invoice.subscription

    if (!subscriptionId) {
      console.error('   → No subscription ID in invoice')
      return
    }

    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata.betaUserId

    if (!userId) {
      console.error('   → Missing betaUserId in subscription metadata')
      return
    }

    // Update user status
    await updateBetaUser(userId, {
      status: USER_STATUS.SUSPENDED,
      paymentStatus: PAYMENT_STATUS.FAILED,
    })

    // TODO: Send payment failed email
    // TODO: Consider grace period before revoking Discord access

    console.log(`⚠️  [STRIPE WEBHOOK] Payment failed for user ${userId}`)
  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling invoice.payment_failed:', error)
  }
}

/**
 * Construct webhook event from request
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Stripe event
 */
const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_CONFIG.WEBHOOK_SECRET
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get subscription details
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>}
 */
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error('Error getting subscription:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediately - Cancel immediately or at period end
 * @returns {Promise<Object>}
 */
const cancelSubscription = async (subscriptionId, immediately = false) => {
  try {
    let subscription

    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId)
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }

    return {
      success: true,
      subscription,
    }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  stripe,
  STRIPE_CONFIG,

  // Checkout
  createCheckoutSession,
  verifyCheckoutSession,

  // Customer Portal
  createCustomerPortalSession,

  // Webhook Handlers
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentFailed,
  constructWebhookEvent,

  // Utilities
  getSubscription,
  cancelSubscription,
}

