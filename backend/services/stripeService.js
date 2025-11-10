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
const { sendPaymentConfirmationEmail } = require('./emailService')

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
    const paymentIntentId = session.payment_intent

    if (!userId) {
      console.error('   → Missing betaUserId in metadata')
      return
    }

    console.log(`   → Beta User ID: ${userId}`)
    console.log(`   → Payment Intent ID: ${paymentIntentId}`)
    console.log(`   → Customer ID: ${customerId}`)

    // Get user data before updating (for email)
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      console.error(`   → User ${userId} not found, cannot send confirmation email`)
      return
    }

    const user = userResult.user
    console.log(`   → User Email: ${user.email}`)
    console.log(`   → User Name: ${user.firstName}`)

    // Update beta user with payment info
    await updateBetaUser(userId, {
      status: USER_STATUS.ACTIVE,
      paymentStatus: PAYMENT_STATUS.PAID,
      stripeCustomerId: customerId,
      stripePaymentIntentId: paymentIntentId,
      accessExpiresAt: new Date('2025-12-31T23:59:59Z'), // Access until Dec 31, 2025
    })

    console.log(`✅ [STRIPE WEBHOOK] User ${userId} activated`)

    // Send payment confirmation email
    console.log('📧 [STRIPE WEBHOOK] Sending payment confirmation email...')
    const emailSent = await sendPaymentConfirmationEmail(user.email, user.firstName)
    
    if (emailSent) {
      console.log('✅ [STRIPE WEBHOOK] Payment confirmation email sent successfully')
    } else {
      console.error('⚠️  [STRIPE WEBHOOK] Payment confirmation email failed to send')
      console.error('   → User payment is still active, but they did not receive confirmation email')
    }

  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error handling checkout.session.completed:', error)
    throw error // Re-throw to prevent marking webhook as processed
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
// PAYMENT MANAGEMENT (ADMIN)
// ============================================

/**
 * Get all payment intents with customer details
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of payments to retrieve
 * @param {string} options.startingAfter - Pagination cursor
 * @returns {Promise<Object>}
 */
const getAllPayments = async ({ limit = 100, startingAfter = null } = {}) => {
  try {
    console.log('💰 [STRIPE] Fetching all payments...')
    
    const params = {
      limit,
      expand: ['data.customer'], // Only expand customer, not payment_intent (we're already listing payment intents)
    }
    
    if (startingAfter) {
      params.starting_after = startingAfter
    }

    // Get payment intents
    const paymentIntents = await stripe.paymentIntents.list(params)

    const payments = paymentIntents.data.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100, // Convert from cents
      currency: payment.currency.toUpperCase(),
      status: payment.status,
      created: new Date(payment.created * 1000),
      customer: payment.customer ? {
        id: typeof payment.customer === 'string' ? payment.customer : payment.customer.id,
        email: typeof payment.customer === 'object' ? payment.customer.email : null,
        name: typeof payment.customer === 'object' ? payment.customer.name : null,
      } : null,
      metadata: payment.metadata || {},
      description: payment.description,
      receiptEmail: payment.receipt_email,
    }))

    console.log(`✅ [STRIPE] Retrieved ${payments.length} payments`)

    return {
      success: true,
      payments,
      hasMore: paymentIntents.has_more,
      lastId: paymentIntents.data.length > 0 ? paymentIntents.data[paymentIntents.data.length - 1].id : null,
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error fetching payments:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {Object} options - Refund options
 * @param {number} options.amount - Amount to refund in cents (optional, full refund if not provided)
 * @param {string} options.reason - Reason for refund (optional)
 * @returns {Promise<Object>}
 */
const createRefund = async (paymentIntentId, { amount = null, reason = null } = {}) => {
  try {
    console.log('💸 [STRIPE] Creating refund...')
    console.log(`   → Payment Intent: ${paymentIntentId}`)
    
    const refundParams = {
      payment_intent: paymentIntentId,
    }
    
    if (amount) {
      refundParams.amount = amount // Already in cents
    }
    
    if (reason) {
      refundParams.reason = reason // 'duplicate', 'fraudulent', or 'requested_by_customer'
    }

    const refund = await stripe.refunds.create(refundParams)

    console.log(`✅ [STRIPE] Refund created: ${refund.id}`)
    console.log(`   → Amount: $${refund.amount / 100}`)
    console.log(`   → Status: ${refund.status}`)

    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        status: refund.status,
        reason: refund.reason,
        created: new Date(refund.created * 1000),
      },
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error creating refund:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get payment details
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>}
 */
const getPaymentDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['customer', 'charges.data.balance_transaction'],
    })

    return {
      success: true,
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000),
        customer: paymentIntent.customer ? {
          id: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer.id,
          email: typeof paymentIntent.customer === 'object' ? paymentIntent.customer.email : null,
          name: typeof paymentIntent.customer === 'object' ? paymentIntent.customer.name : null,
        } : null,
        charges: paymentIntent.charges?.data || [],
        metadata: paymentIntent.metadata || {},
      },
    }
  } catch (error) {
    console.error('❌ [STRIPE] Error getting payment details:', error)
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

  // Payment Management (Admin)
  getAllPayments,
  createRefund,
  getPaymentDetails,
}

