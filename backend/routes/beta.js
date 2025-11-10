const express = require('express')
const router = express.Router()
const {
  getBetaStats,
  createBetaUser,
  getBetaUser,
  getBetaUserByEmail,
  updateBetaUser,
  getAllBetaUsers,
  verifyEmailToken,
  createDiscordInvite,
  validateDiscordInvite,
  markDiscordInviteUsed,
  USER_STATUS,
  PAYMENT_STATUS,
} = require('../services/betaUserService')
const {
  signupLimiter,
  verificationLimiter,
  paymentLimiter,
  adminLimiter,
} = require('../middleware/rateLimiter')
const {
  createCheckoutSession,
  verifyCheckoutSession,
  createCustomerPortalSession,
  constructWebhookEvent,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentFailed,
} = require('../services/stripeService')
const { sendBetaWelcomeEmail, sendDiscordInviteEmail, sendPaymentConfirmationEmail } = require('../services/emailService')
const { hashPassword, validatePassword } = require('../utils/password')

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/beta/stats
 * Get beta program statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getBetaStats()
    
    if (!stats.success) {
      return res.status(500).json({
        error: 'Failed to retrieve beta stats',
        message: stats.error,
      })
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error in GET /api/beta/stats:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * GET /api/beta/user/:userId
 * Get beta user data by userId (for payment page)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    console.log(`📡 [BETA] Fetching user data for: ${userId}`)
    
    const result = await getBetaUser(userId)
    
    if (!result.success) {
      console.log(`❌ [BETA] User not found: ${userId}`)
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = result.user
    
    // Return safe user data (no password hash)
    res.json({
      success: true,
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        isFree: user.isFree || false,
        status: user.status,
        paymentStatus: user.paymentStatus,
        emailVerified: user.emailVerified || false,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/beta/user/:userId:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
    })
  }
})

/**
 * POST /api/beta/signup
 * Sign up for beta program
 */
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body

    // Validate input
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, first name, last name, and password are required',
      })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Validation error',
        message: passwordValidation.message,
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create beta user
    const result = await createBetaUser({
      email,
      firstName,
      lastName,
      passwordHash,
    })

    if (!result.success) {
      return res.status(400).json({
        error: 'Signup failed',
        message: result.message,
        alreadyExists: result.alreadyExists,
      })
    }

    // Send welcome email with verification link
    console.log('📧 [BETA SIGNUP] Sending verification email...')
    const emailSent = await sendBetaWelcomeEmail(email, firstName, result.position, result.isFree, result.emailVerificationToken)
    
    if (!emailSent) {
      console.error('❌ [BETA SIGNUP] Warning: Verification email failed to send')
      console.error(`   → User registered but email not delivered: ${email}`)
    } else {
      console.log('✅ [BETA SIGNUP] Verification email sent successfully')
    }

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        position: result.position,
        isFree: result.isFree,
        requiresPayment: result.requiresPayment,
        emailSent, // Let frontend know if email was sent
      },
    })
  } catch (error) {
    console.error('Error in POST /api/beta/signup:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * GET /api/beta/status/:email
 * Check beta status by email
 */
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params

    const result = await getBetaUserByEmail(email)

    if (!result.success) {
      return res.status(404).json({
        error: 'User not found',
        message: result.message,
      })
    }

    // Return safe user data (no sensitive tokens)
    const { user } = result
    res.json({
      success: true,
      data: {
        position: user.position,
        status: user.status,
        paymentStatus: user.paymentStatus,
        isFree: user.isFree,
        emailVerified: user.emailVerified,
        discordJoined: user.discordJoined,
        requiresPayment: !user.isFree && user.paymentStatus !== PAYMENT_STATUS.PAID,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/beta/status/:email:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * POST /api/beta/verify-email
 * Verify email with token
 */
router.post('/verify-email', verificationLimiter, async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Verification token is required',
      })
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return res.status(400).json({
        error: 'Verification failed',
        message: result.message,
      })
    }

    // Get updated user data
    const userResult = await getBetaUser(result.userId)
    if (!userResult.success) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    const user = userResult.user

    // Discord invite will be available on user dashboard after login
    // No longer sending Discord invite via email

    res.json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        isFree: user.isFree,
        requiresPayment: !user.isFree,
        status: user.status,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/beta/verify-email:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * POST /api/beta/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', verificationLimiter, async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      })
    }

    // Get user by email
    const userResult = await getBetaUserByEmail(email.toLowerCase().trim())
    
    if (!userResult.success) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists and is not verified, a new verification link has been sent.',
      })
    }

    const user = userResult.user

    // Check if already verified
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'This email address is already verified. You can log in to your dashboard.',
      })
    }

    // Call helper function to resend verification
    const { resendVerificationEmail } = require('../services/betaUserService')
    const resendResult = await resendVerificationEmail(user.id, user.email, user.firstName)

    if (!resendResult.success) {
      return res.status(500).json({
        success: false,
        message: resendResult.message || 'Failed to send verification email. Please try again later.',
      })
    }

    res.json({
      success: true,
      message: 'Verification email sent! Check your inbox (and spam folder).',
    })
  } catch (error) {
    console.error('Error in POST /api/beta/resend-verification:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    })
  }
})

/**
 * GET /api/beta/discord-invite/:token
 * Validate Discord invite token and get invite URL
 */
router.get('/discord-invite/:token', async (req, res) => {
  try {
    const { token } = req.params

    const result = await validateDiscordInvite(token)

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid invite',
        message: result.message,
      })
    }

    // Use unique invite URL if available, otherwise fallback to shared invite
    const inviteUrl = result.invite?.discordInviteUrl || 
                      process.env.DISCORD_SERVER_INVITE_URL || 
                      'https://discord.gg/your-server'

    res.json({
      success: true,
      message: 'Valid invite token',
      data: {
        inviteUrl: inviteUrl,
        token: token,
        isUniqueInvite: !!result.invite?.discordInviteUrl,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/beta/discord-invite/:token:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// ============================================
// STRIPE PAYMENT ROUTES
// ============================================

/**
 * POST /api/beta/create-checkout-session
 * Create Stripe checkout session for paid beta users
 */
router.post('/create-checkout-session', paymentLimiter, async (req, res) => {
  try {
    const { userId, email, firstName, lastName } = req.body

    // Validate input
    if (!userId || !email || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User ID, email, first name, and last name are required',
      })
    }

    const result = await createCheckoutSession({
      userId,
      email,
      firstName,
      lastName,
    })

    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to create checkout session',
        message: result.message,
      })
    }

    res.json({
      success: true,
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
    })
  } catch (error) {
    console.error('Error in POST /api/beta/create-checkout-session:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * GET /api/beta/verify-payment/:sessionId
 * Verify Stripe checkout session
 */
router.get('/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    
    console.log(`💳 [BETA] Verifying payment for session: ${sessionId}`)

    const result = await verifyCheckoutSession(sessionId)

    if (!result.success) {
      console.log(`❌ [BETA] Payment verification failed`)
      return res.status(400).json({
        error: 'Payment verification failed',
        message: result.message,
      })
    }

    console.log(`✅ [BETA] Payment verified for session: ${sessionId}`)
    console.log(`   → Payment Intent ID: ${result.paymentIntentId}`)
    console.log(`   → Customer ID: ${result.customerId}`)

    // Get userId from session metadata
    const session = result.session
    const userId = session.client_reference_id || session.metadata?.userId || session.metadata?.betaUserId

    if (userId) {
      console.log(`   → User ID: ${userId}`)
      
      // Set access expiration to December 31, 2025
      const accessExpiresAt = new Date('2025-12-31T23:59:59Z')
      
      // Update user's payment status in database
      const updateResult = await updateBetaUser(userId, {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: USER_STATUS.ACTIVE,
        stripeCustomerId: result.customerId,
        stripePaymentIntentId: result.paymentIntentId,
        accessExpiresAt: accessExpiresAt,
      })

      if (updateResult.success) {
        console.log(`✅ [BETA] User ${userId} payment status updated to ACTIVE`)
        
        // Create Discord invite for paid user
        try {
          const userResult = await getBetaUser(userId)
          if (userResult.success) {
            const discordResult = await createDiscordInvite(userId, userResult.user.email)
            if (discordResult.success) {
              console.log(`✅ [BETA] Discord invite created for user ${userId}`)
              
              // Send Discord invite email
              await sendDiscordInviteEmail(
                userResult.user.email,
                userResult.user.firstName,
                discordResult.token
              )
              console.log(`✅ [BETA] Discord invite email sent to ${userResult.user.email}`)
            }
          }
        } catch (discordError) {
          console.error(`⚠️  [BETA] Failed to create Discord invite:`, discordError)
          // Don't fail the payment verification if Discord invite fails
        }
      } else {
        console.error(`❌ [BETA] Failed to update user ${userId}:`, updateResult.error)
      }
    } else {
      console.warn(`⚠️  [BETA] No userId found in session metadata`)
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paid: true,
        paymentIntentId: result.paymentIntentId,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/beta/verify-payment/:sessionId:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * POST /api/beta/create-portal-session
 * Create Stripe customer portal session
 */
router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body

    if (!customerId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Stripe customer ID is required',
      })
    }

    const result = await createCustomerPortalSession(customerId)

    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to create portal session',
        message: result.message,
      })
    }

    res.json({
      success: true,
      url: result.url,
    })
  } catch (error) {
    console.error('Error in POST /api/beta/create-portal-session:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// ============================================
// STRIPE WEBHOOK
// ============================================

/**
 * POST /api/beta/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature']

  try {
    // Construct event from webhook
    const event = constructWebhookEvent(req.body, signature)

    console.log('🔔 [WEBHOOK] Received Stripe event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`   → Unhandled event type: ${event.type}`)
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true })
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing webhook:', error)
    res.status(400).json({
      error: 'Webhook error',
      message: error.message,
    })
  }
})

// ============================================
// ADMIN ROUTES (TODO: Add authentication middleware)
// ============================================

/**
 * GET /api/beta/admin/users
 * Get all beta users (admin only)
 */
router.get('/admin/users', adminLimiter, async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const result = await getAllBetaUsers()

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to retrieve users',
        message: result.error,
      })
    }

    res.json({
      success: true,
      data: result.users,
      count: result.count,
    })
  } catch (error) {
    console.error('Error in GET /api/beta/admin/users:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * POST /api/beta/admin/users/:userId/revoke
 * Revoke user's Discord access (admin only)
 */
router.post('/admin/users/:userId/revoke', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { userId } = req.params

    const result = await updateBetaUser(userId, {
      status: USER_STATUS.SUSPENDED,
      discordJoined: false,
    })

    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to revoke access',
        message: result.error,
      })
    }

    // TODO: Revoke Discord role via bot

    res.json({
      success: true,
      message: 'Access revoked successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/beta/admin/users/:userId/revoke:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

/**
 * POST /api/beta/admin/users/:userId/resend-invite
 * Resend Discord invite (admin only)
 */
router.post('/admin/users/:userId/resend-invite', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { userId } = req.params

    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    const user = userResult.user

    // Create new Discord invite
    const inviteResult = await createDiscordInvite(userId, user.email)
    
    if (!inviteResult.success) {
      return res.status(500).json({
        error: 'Failed to create invite',
        message: inviteResult.error,
      })
    }

    // Send invite email
    await sendDiscordInviteEmail(user.email, user.firstName, inviteResult.token)

    res.json({
      success: true,
      message: 'Discord invite resent successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/beta/admin/users/:userId/resend-invite:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

module.exports = router

