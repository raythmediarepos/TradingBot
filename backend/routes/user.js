const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const { authenticate } = require('../middleware/auth')
const { createDiscordInvite } = require('../services/betaUserService')
const { sendDiscordInviteEmail } = require('../services/emailService')
const { serializeUser, serializeFirestoreData } = require('../utils/firestore')
const { notifyDiscordInviteGenerated } = require('../services/discordNotificationService')

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    const { passwordHash, id, ...userDataWithoutPassword } = req.user
    const serializedUser = serializeUser(id, userDataWithoutPassword)

    res.json({
      success: true,
      data: serializedUser,
    })
  } catch (error) {
    console.error('Error getting user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    })
  }
})

/**
 * PATCH /api/user/profile
 * Update user profile
 */
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName } = req.body

    // Only allow updating firstName and lastName
    const updates = {}
    if (firstName) updates.firstName = firstName.trim()
    if (lastName) updates.lastName = lastName.trim()

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp()

    const db = admin.firestore()
    await db.collection('betaUsers').doc(req.user.id).update(updates)

    // Get updated user data
    const updatedDoc = await db.collection('betaUsers').doc(req.user.id).get()
    const { passwordHash, ...userData } = updatedDoc.data()
    const serializedUser = serializeUser(req.user.id, userData)

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: serializedUser,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    })
  }
})

/**
 * GET /api/user/subscription
 * Get user's subscription information
 * IMPORTANT: Calculate isFree dynamically based on position
 */
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const db = admin.firestore()

    // CRITICAL: Calculate isFree dynamically based on position
    const FREE_SLOTS = 20
    const isFree = req.user.position <= FREE_SLOTS

    // Check if user has a subscription
    if (!req.user.stripeSubscriptionId) {
      return res.json({
        success: true,
        data: {
          hasSubscription: false,
          isFree: isFree,
          paymentStatus: req.user.paymentStatus,
        },
      })
    }

    // Get subscription details from subscriptions collection
    const subscriptionSnapshot = await db
      .collection('subscriptions')
      .where('userId', '==', req.user.id)
      .where('status', 'in', ['active', 'past_due', 'trialing'])
      .limit(1)
      .get()

    if (subscriptionSnapshot.empty) {
      return res.json({
        success: true,
        data: {
          hasSubscription: false,
          isFree: isFree,
          paymentStatus: req.user.paymentStatus,
        },
      })
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0]
    const subscriptionData = subscriptionDoc.data()
    const serializedSubscription = serializeFirestoreData(subscriptionData)

    res.json({
      success: true,
      data: {
        hasSubscription: true,
        isFree: isFree,
        subscription: {
          id: subscriptionDoc.id,
          subscriptionId: serializedSubscription.subscriptionId,
          status: serializedSubscription.status,
          currentPeriodStart: serializedSubscription.currentPeriodStart,
          currentPeriodEnd: serializedSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: serializedSubscription.cancelAtPeriodEnd,
          plan: serializedSubscription.plan,
          createdAt: serializedSubscription.createdAt,
        },
      },
    })
  } catch (error) {
    console.error('Error getting subscription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription',
    })
  }
})

/**
 * GET /api/user/payment-history
 * Get user's payment history
 */
router.get('/payment-history', authenticate, async (req, res) => {
  try {
    const db = admin.firestore()

    // Get all payment records for this user
    const paymentsSnapshot = await db
      .collection('payments')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const payments = []
    paymentsSnapshot.forEach((doc) => {
      payments.push(serializeFirestoreData({
        id: doc.id,
        ...doc.data(),
      }))
    })

    res.json({
      success: true,
      data: {
        payments,
        total: payments.length,
      },
    })
  } catch (error) {
    console.error('Error getting payment history:', error)
    
    // If the error is because the payments collection or index doesn't exist, return empty array
    if (error.code === 9 || error.message.includes('index')) {
      return res.json({
        success: true,
        data: {
          payments: [],
          total: 0,
        },
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
    })
  }
})

/**
 * GET /api/user/discord-status
 * Get user's Discord connection status
 */
router.get('/discord-status', authenticate, async (req, res) => {
  try {
    const db = admin.firestore()

    // Check if user has Discord invite
    let discordInviteData = null
    if (req.user.emailVerified) {
      const inviteSnapshot = await db
        .collection('discordInvites')
        .where('userId', '==', req.user.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

      if (!inviteSnapshot.empty) {
        const inviteDoc = inviteSnapshot.docs[0]
        discordInviteData = serializeFirestoreData({
          id: inviteDoc.id,
          ...inviteDoc.data(),
        })
      }
    }

    res.json({
      success: true,
      data: {
        discordJoined: req.user.discordJoined || false,
        discordUserId: req.user.discordUserId || null,
        discordUsername: req.user.discordUsername || null,
        hasInvite: !!discordInviteData,
        invite: discordInviteData ? {
          token: discordInviteData.token,
          used: discordInviteData.used,
          expiresAt: discordInviteData.expiresAt,
        } : null,
      },
    })
  } catch (error) {
    console.error('Error getting Discord status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get Discord status',
    })
  }
})

/**
 * GET /api/user/beta-status
 * Get comprehensive beta program status
 * IMPORTANT: Always calculate isFree dynamically based on position (position <= 20)
 */
router.get('/beta-status', authenticate, async (req, res) => {
  try {
    // CRITICAL: Calculate isFree dynamically based on current position
    // First 20 users are FREE, regardless of what's stored in database
    const FREE_SLOTS = 20
    const isFree = req.user.position <= FREE_SLOTS
    const paymentStatus = req.user.paymentStatus || (isFree ? 'free' : 'pending')
    
    console.log('📊 [BETA STATUS] User data:', {
      position: req.user.position,
      isFree: isFree,
      storedIsFree: req.user.isFree, // What's in DB (may be stale)
      calculated: `${req.user.position} <= ${FREE_SLOTS} = ${isFree}`,
      emailVerified: req.user.emailVerified,
      paymentStatus: paymentStatus,
      discordJoined: req.user.discordJoined,
    })
    
    const betaStatusData = serializeFirestoreData({
        position: req.user.position,
        isFree: isFree, // Use calculated value, not stored value
        status: req.user.status,
        paymentStatus: paymentStatus,
        emailVerified: req.user.emailVerified || false,
        discordJoined: req.user.discordJoined || false,
      requiresPayment: !isFree && paymentStatus !== 'paid' && paymentStatus !== 'free',
        createdAt: req.user.createdAt,
      accessExpiresAt: req.user.accessExpiresAt,
    })
    
    console.log('📤 [BETA STATUS] Sending data:', betaStatusData)

    res.json({
      success: true,
      data: betaStatusData,
    })
  } catch (error) {
    console.error('Error getting beta status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get beta status',
    })
  }
})

/**
 * POST /api/user/generate-discord-invite
 * Generate Discord invite link for the authenticated user
 * Requires: email verified + (isFree OR active payment)
 */
router.post('/generate-discord-invite', authenticate, async (req, res) => {
  try {
    // Check if email is verified
    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        message: 'Please verify your email before accessing Discord',
      })
    }

    // CRITICAL: Calculate isFree dynamically based on position
    const FREE_SLOTS = 20
    const isFree = req.user.position <= FREE_SLOTS
    
    // Check if user needs to pay
    const requiresPayment = !isFree && req.user.paymentStatus !== 'paid' && req.user.paymentStatus !== 'free'
    if (requiresPayment) {
      return res.status(403).json({
        success: false,
        error: 'Payment required',
        message: 'Please complete your payment to access Discord',
        redirectTo: '/beta/payment',
      })
    }

    // Check if access has expired (December 31, 2025)
    if (req.user.accessExpiresAt) {
      const expirationDate = req.user.accessExpiresAt.toDate ? req.user.accessExpiresAt.toDate() : new Date(req.user.accessExpiresAt)
      const now = new Date()
      
      if (now > expirationDate) {
        return res.status(403).json({
          success: false,
          error: 'Access expired',
          message: 'Your beta access has expired on December 31, 2025',
        })
      }
    }

    const db = admin.firestore()

    // Check if user already has a valid Discord invite
    const existingInviteSnapshot = await db
      .collection('discordInvites')
      .where('userId', '==', req.user.id)
      .where('used', '==', false)
      .where('expiresAt', '>', new Date())
      .limit(1)
      .get()

    if (!existingInviteSnapshot.empty) {
      // Return existing invite
      const inviteDoc = existingInviteSnapshot.docs[0]
      const inviteData = serializeFirestoreData(inviteDoc.data())
      
      // Use unique invite URL if available, otherwise fallback to shared invite
      const discordServerInvite = inviteData.discordInviteUrl || 
                                   process.env.DISCORD_SERVER_INVITE_URL || 
                                   'https://discord.gg/your-server'
      
      return res.json({
        success: true,
        data: {
          token: inviteData.token,
          inviteLink: discordServerInvite,
          expiresAt: inviteData.expiresAt,
          isUniqueInvite: !!inviteData.discordInviteUrl,
          message: 'Your existing Discord invite is still valid',
        },
      })
    }

    // Create new Discord invite
    const inviteResult = await createDiscordInvite(req.user.id, req.user.email)
    
    if (!inviteResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create invite',
        message: inviteResult.error || 'Could not generate Discord invite at this time',
      })
    }

    // Use unique invite URL if bot created one, otherwise fallback to shared invite
    const discordServerInvite = inviteResult.discordInviteUrl || 
                                 process.env.DISCORD_SERVER_INVITE_URL || 
                                 'https://discord.gg/your-server'

    // Send Discord invite email as backup
    console.log('📧 [DISCORD] Sending Discord invite email as backup...')
    const emailSent = await sendDiscordInviteEmail(req.user.email, req.user.firstName, inviteResult.token)
    
    if (emailSent) {
      console.log('✅ [DISCORD] Discord invite email sent successfully')
    } else {
      console.error('⚠️  [DISCORD] Discord invite email failed to send')
      console.error('   → User can still access invite from dashboard')
    }

    // Send Discord notification
    await notifyDiscordInviteGenerated({
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      position: req.user.position,
    })

    res.json({
      success: true,
      data: {
        token: inviteResult.token,
        inviteLink: discordServerInvite,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isUniqueInvite: !!inviteResult.discordInviteUrl,
        message: 'Discord invite created successfully',
        emailSent, // Let frontend know if email was sent
      },
    })
  } catch (error) {
    console.error('Error generating Discord invite:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate Discord invite',
    })
  }
})

module.exports = router

