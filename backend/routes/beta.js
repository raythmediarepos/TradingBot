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
  isWebhookProcessed,
  markWebhookProcessed,
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
const { notifySignup, notifyEmailVerified, notifyDiscordInviteGenerated } = require('../services/discordNotificationService')

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
    const { email, firstName, lastName, password, agreedToTerms } = req.body

    // Validate input
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, first name, last name, and password are required',
      })
    }

    // Validate TOS acceptance
    if (agreedToTerms !== true) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You must agree to the Terms of Service to continue',
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
      agreedToTerms: true,
      tosVersion: '1.0', // Track TOS version for future updates
      tosAcceptedAt: new Date(),
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

    // Send Discord notification
    await notifySignup({
      email,
      firstName,
      lastName,
      position: result.position,
      isFree: result.isFree,
    })

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
        errorType: result.errorType, // Pass error type to frontend
        userId: result.userId, // Pass user ID if available
        email: result.email, // Pass email if available (for expired tokens)
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

    // Send Discord notification
    await notifyEmailVerified({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      isFree: user.isFree,
    })

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
 * GET /api/beta/verify-discord
 * One-click Discord verification via email link
 */
router.get('/verify-discord', async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #F5C518; margin-bottom: 20px; }
            p { color: #D4D4D4; line-height: 1.6; margin-bottom: 16px; }
            a { color: #F5C518; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Missing Token</h1>
            <p>No verification token provided.</p>
            <p>Please use the link from your email or contact support@helwa.ai</p>
          </div>
        </body>
        </html>
      `)
    }

    console.log('🔗 [DISCORD VERIFY] Email link verification attempt')
    console.log(`   → Token: ${token.substring(0, 15)}...`)

    // Validate token
    const result = await validateDiscordInvite(token)

    if (!result.success) {
      const errorType = result.message && result.message.includes('expired') ? 'expired' : 
                       result.message && result.message.includes('used') ? 'used' : 'invalid'
      
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #F59E0B; margin-bottom: 20px; }
            p { color: #D4D4D4; line-height: 1.6; margin-bottom: 16px; }
            .button { display: inline-block; padding: 12px 24px; background: #F5C518; color: #0A0A0A; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 10px; }
            .button:hover { background: #D4A90E; }
            ul { text-align: left; max-width: 400px; margin: 20px auto; }
            a { color: #F5C518; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Verification ${errorType === 'expired' ? 'Link Expired' : errorType === 'used' ? 'Already Used' : 'Failed'}</h1>
            ${errorType === 'expired' ? `
              <p>This verification link has expired. Tokens are valid for 7 days.</p>
              <p><strong>To get a new token:</strong></p>
              <ul>
                <li>Open Discord and DM our bot</li>
                <li>Type: <code>resend</code></li>
                <li>Or log in to your dashboard at helwa.ai</li>
              </ul>
            ` : errorType === 'used' ? `
              <p>This token has already been used.</p>
              <p>Check if you already have the Beta Tester role in Discord.</p>
              <p>If you're having issues, type <code>resend</code> to our Discord bot.</p>
            ` : `
              <p>This verification link is invalid.</p>
              <p>Please check your email for the latest verification link or contact support.</p>
            `}
            <a href="https://helwa.ai/dashboard" class="button">Go to Dashboard</a>
            <a href="mailto:support@helwa.ai" class="button">Contact Support</a>
          </div>
        </body>
        </html>
      `)
    }

    const invite = result.invite

    // Get beta user
    const userResult = await getBetaUser(invite.userId)
    if (!userResult.success) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Account Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #EF4444; margin-bottom: 20px; }
            p { color: #D4D4D4; line-height: 1.6; margin-bottom: 16px; }
            a { display: inline-block; padding: 12px 24px; background: #F5C518; color: #0A0A0A; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Account Not Found</h1>
            <p>We couldn't find your beta registration.</p>
            <p>Please contact support with your email address.</p>
            <a href="mailto:support@helwa.ai">Contact Support</a>
          </div>
        </body>
        </html>
      `)
    }

    const user = userResult.user

    // Mark token as used
    await markDiscordInviteUsed(invite.id, {
      userId: null, // No Discord user yet
      username: 'Email Verification Link',
      verifiedViaEmail: true,
    })

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Successful!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          .success-icon { font-size: 80px; margin-bottom: 20px; }
          h1 { color: #22C55E; margin-bottom: 20px; }
          p { color: #D4D4D4; line-height: 1.6; margin-bottom: 16px; }
          .box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 28px; background: #5865F2; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
          .button:hover { background: #4752C4; }
          ul { text-align: left; max-width: 400px; margin: 20px auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Email Verified Successfully!</h1>
          <p>Hi <strong>${user.firstName}</strong>! Your email has been verified.</p>
          
          <div class="box">
            <h2 style="color: #22C55E; font-size: 20px; margin: 0 0 16px 0;">Next Steps to Get Beta Access:</h2>
            <ul>
              <li>Join our Discord server (if you haven't already)</li>
              <li>Our bot will automatically verify you when you join</li>
              <li>You'll get the Beta Tester role instantly!</li>
            </ul>
          </div>

          <a href="${process.env.DISCORD_SERVER_INVITE_URL || 'https://discord.gg/your-server'}" class="button">Join Discord Server</a>
          
          <p style="margin-top: 40px; font-size: 14px; color: #A3A3A3;">
            Questions? Email <a href="mailto:support@helwa.ai" style="color: #F5C518;">support@helwa.ai</a>
          </p>
        </div>
      </body>
      </html>
    `)

    console.log('✅ [DISCORD VERIFY] Email verification successful')
    console.log(`   → User: ${user.email}`)
  } catch (error) {
    console.error('❌ [DISCORD VERIFY] Error:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #EF4444; margin-bottom: 20px; }
          p { color: #D4D4D4; line-height: 1.6; margin-bottom: 16px; }
          a { color: #F5C518; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Verification Error</h1>
          <p>Something went wrong during verification.</p>
          <p>Please try again or contact <a href="mailto:support@helwa.ai">support@helwa.ai</a></p>
        </div>
      </body>
      </html>
    `)
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

    console.log(`🔔 [WEBHOOK] Received Stripe event: ${event.id} (${event.type})`)

    // Check if we've already processed this event (idempotency)
    const alreadyProcessed = await isWebhookProcessed(event.id)
    
    if (alreadyProcessed) {
      console.log(`✅ [WEBHOOK] Event ${event.id} already processed, skipping`)
      return res.json({ received: true, skipped: true, reason: 'already processed' })
    }

    // Handle different event types
    let handled = false
    let handlerError = null
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object)
          handled = true
          break

        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object)
          handled = true
          break

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object)
          handled = true
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object)
          handled = true
          break

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object)
          handled = true
          break

        default:
          console.log(`   → Unhandled event type: ${event.type}`)
          handled = true // Mark as handled to prevent reprocessing
      }
    } catch (error) {
      console.error(`❌ [WEBHOOK] Error handling ${event.type}:`, error)
      handlerError = error
      // Don't mark as processed if handler failed - allow retry
      throw error
    }

    // Mark event as processed (only if handler succeeded)
    if (handled && !handlerError) {
      await markWebhookProcessed(event.id, event.type, {
        customerId: event.data.object.customer || null,
        amount: event.data.object.amount_total || event.data.object.amount || null,
      })
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true, processed: true })
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
    const { reason } = req.body

    // Get user data first for notification
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    const user = userResult.user

    console.log('🚫 [ADMIN] Revoking access for', user.email, '- Reason:', reason || 'No reason provided')

    const result = await updateBetaUser(userId, {
      status: USER_STATUS.SUSPENDED,
      discordJoined: false,
    })

    if (!result.success) {
      console.error('❌ [ADMIN] Failed to revoke access')
      return res.status(400).json({
        error: 'Failed to revoke access',
        message: result.error,
      })
    }

    // Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'error',
      title: '🚫 Access Revoked (Admin)',
      description: `Admin revoked access for **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '💰 Type', value: user.isFree ? 'Free Beta' : 'Paid Beta', inline: true },
        { name: '📝 Reason', value: reason || 'No reason provided', inline: false },
        { name: '👤 Admin Action', value: 'Access Revoked', inline: true },
      ],
    })

    console.log('✅ [ADMIN] Access revoked successfully')

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
 * POST /api/beta/admin/users/:userId/resend-verification
 * Resend verification email (admin only)
 */
router.post('/admin/users/:userId/resend-verification', async (req, res) => {
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

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email already verified',
        message: 'This user has already verified their email',
      })
    }

    // Send verification email
    console.log('📧 [ADMIN] Resending verification email to', user.email)
    const emailSent = await sendBetaWelcomeEmail(
      user.email,
      user.firstName,
      user.position,
      user.isFree,
      user.emailVerificationToken
    )

    if (!emailSent) {
      console.error('❌ [ADMIN] Failed to send verification email')
      return res.status(500).json({
        error: 'Failed to send email',
        message: 'Email service unavailable',
      })
    }

    // Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'reminder',
      title: '📧 Verification Email Resent (Admin)',
      description: `Admin manually resent verification email to **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '👤 Admin Action', value: 'Manual Resend', inline: true },
      ],
    })

    console.log('✅ [ADMIN] Verification email resent successfully')

    res.json({
      success: true,
      message: 'Verification email resent successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/beta/admin/users/:userId/resend-verification:', error)
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

    console.log('🔄 [ADMIN] Resending Discord invite to', user.email)

    // Create new Discord invite
    const inviteResult = await createDiscordInvite(userId, user.email)
    
    if (!inviteResult.success) {
      console.error('❌ [ADMIN] Failed to create Discord invite')
      return res.status(500).json({
        error: 'Failed to create invite',
        message: inviteResult.error,
      })
    }

    // Send invite email
    await sendDiscordInviteEmail(user.email, user.firstName, inviteResult.token)

    // Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'discord',
      title: '🔄 Discord Invite Resent (Admin)',
      description: `Admin manually resent Discord invite to **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '👤 Admin Action', value: 'Manual Resend', inline: true },
        { name: '🔗 Invite Token', value: `\`${inviteResult.token.substring(0, 20)}...\``, inline: false },
      ],
    })

    console.log('✅ [ADMIN] Discord invite resent successfully')

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

