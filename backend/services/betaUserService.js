const { admin, db } = require('../config/firebase-admin')
const crypto = require('crypto')
const { retryWithBackoff, retryTransaction } = require('../utils/retry')

// ============================================
// CONSTANTS
// ============================================

const COLLECTIONS = {
  BETA_USERS: 'betaUsers',
  SUBSCRIPTIONS: 'subscriptions',
  DISCORD_INVITES: 'discordInvites',
  EMAIL_VERIFICATIONS: 'emailVerifications',
  COUNTERS: 'counters',
  WEBHOOK_EVENTS: 'webhookEvents', // For webhook idempotency
}

const MAX_BETA_USERS = 100
const FREE_SLOTS = 20
const BETA_PRICE = 49.99

const USER_STATUS = {
  PENDING_EMAIL: 'pending_email',        // Signed up, awaiting email verification
  PENDING_PAYMENT: 'pending_payment',    // Email verified, needs to pay (users 21-100)
  ACTIVE: 'active',                      // Paid/free user, has access
  DISCORD_JOINED: 'discord_joined',      // Successfully joined Discord
  SUSPENDED: 'suspended',                // Payment failed or manually suspended
  CANCELLED: 'cancelled',                // User cancelled subscription
}

const PAYMENT_STATUS = {
  FREE: 'free',                          // Position 1-20
  PENDING: 'pending',                    // Position 21-100, awaiting payment
  PAID: 'paid',                          // Successfully paid
  FAILED: 'failed',                      // Payment failed
  CANCELLED: 'cancelled',                // Subscription cancelled
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get next beta position atomically using Firestore transaction
 * This prevents race conditions where two users could get the same position
 * @returns {Promise<number>} - Next available position
 */
const getNextPosition = async () => {
  const counterRef = db.collection(COLLECTIONS.COUNTERS).doc('betaUserCounter')
  
  return await retryTransaction(async () => {
    return await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef)
      
      let currentPosition = 0
      
      if (!counterDoc.exists) {
        // Initialize counter if it doesn't exist
        console.log('🔢 [COUNTER] Initializing beta user counter...')
        transaction.set(counterRef, {
          lastPosition: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        currentPosition = 1
      } else {
        // Increment counter
        const data = counterDoc.data()
        currentPosition = (data.lastPosition || 0) + 1
        
        transaction.update(counterRef, {
          lastPosition: currentPosition,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
      
      console.log(`🔢 [COUNTER] Assigned position: #${currentPosition}`)
      return currentPosition
    })
  })
}

/**
 * Generate a unique token
 * @param {number} length - Token length
 * @returns {string}
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate unique Discord invite token
 * @returns {string}
 */
const generateDiscordInviteToken = () => {
  return `discord_${generateToken(24)}`
}

/**
 * Generate email verification token
 * @returns {string}
 */
const generateEmailVerificationToken = () => {
  return `verify_${generateToken(24)}`
}

// ============================================
// BETA USER MANAGEMENT
// ============================================

/**
 * Get current beta user stats
 * @returns {Promise<Object>}
 */
const getBetaStats = async () => {
  try {
    const snapshot = await db.collection(COLLECTIONS.BETA_USERS).get()
    const totalUsers = snapshot.size
    const remaining = Math.max(0, MAX_BETA_USERS - totalUsers)
    
    // Count free vs paid slots
    const freeSlotsTaken = Math.min(totalUsers, FREE_SLOTS)
    const freeRemainingSlots = Math.max(0, FREE_SLOTS - totalUsers)
    const paidSlotsTaken = Math.max(0, totalUsers - FREE_SLOTS)
    const paidRemainingSlots = Math.max(0, (MAX_BETA_USERS - FREE_SLOTS) - paidSlotsTaken)

    // Count by status
    let statusCounts = {
      pending_email: 0,
      pending_payment: 0,
      active: 0,
      discord_joined: 0,
      suspended: 0,
      cancelled: 0,
    }

    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status && statusCounts.hasOwnProperty(data.status)) {
        statusCounts[data.status]++
      }
    })

    return {
      success: true,
      total: MAX_BETA_USERS,
      filled: totalUsers,
      remaining,
      freeSlots: {
        total: FREE_SLOTS,
        taken: freeSlotsTaken,
        remaining: freeRemainingSlots,
      },
      paidSlots: {
        total: MAX_BETA_USERS - FREE_SLOTS,
        taken: paidSlotsTaken,
        remaining: paidRemainingSlots,
      },
      statusCounts,
    }
  } catch (error) {
    console.error('Error getting beta stats:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Check if email already exists in beta program
 * @param {string} email
 * @returns {Promise<Object>}
 */
const checkExistingUser = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const snapshot = await db
      .collection(COLLECTIONS.BETA_USERS)
      .where('email', '==', normalizedEmail)
      .get()

    if (snapshot.empty) {
      return {
        exists: false,
        user: null,
      }
    }

    const doc = snapshot.docs[0]
    return {
      exists: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    }
  } catch (error) {
    console.error('Error checking existing user:', error)
    throw error
  }
}

/**
 * Create a new beta user
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @returns {Promise<Object>}
 */
const createBetaUser = async (userData) => {
  const { email, firstName, lastName, passwordHash, agreedToTerms, tosVersion, tosAcceptedAt } = userData

  console.log('🎫 [BETA] New beta signup attempt...')
  console.log(`   → Email: ${email}`)
  console.log(`   → Name: ${firstName} ${lastName}`)

  // Validate input
  if (!email || !firstName || !lastName) {
    return {
      success: false,
      message: 'Email, first name, and last name are required',
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format',
    }
  }

  try {
    // Check if beta is full
    const stats = await getBetaStats()
    console.log(`   → Spots: ${stats.filled}/${stats.total} filled (${stats.remaining} remaining)`)
    
    if (stats.remaining === 0) {
      console.warn('⚠️  [BETA] Beta program is full!')
      return {
        success: false,
        message: 'Sorry, the beta program is full. Please check back later.',
      }
    }

    // Check if email already exists
    console.log(`   → Checking for duplicate email...`)
    const existingCheck = await checkExistingUser(email)
    
    if (existingCheck.exists) {
      console.warn(`⚠️  [BETA] Email already registered: ${email}`)
      return {
        success: false,
        message: 'This email is already registered in the beta program',
        alreadyExists: true,
        existingUser: existingCheck.user,
      }
    }

    // Get next position atomically (prevents race conditions)
    console.log(`   → Getting next position (atomic transaction)...`)
    const position = await getNextPosition()

    // Determine payment requirement
    const isFree = position <= FREE_SLOTS
    const isFoundingMember = position <= FREE_SLOTS // First 20 users are founding members
    const paymentStatus = isFree ? PAYMENT_STATUS.FREE : PAYMENT_STATUS.PENDING

    console.log(`   → Position: #${position}`)
    console.log(`   → Type: ${isFree ? 'FREE' : 'PAID ($49.99 one-time)'}`)
    console.log(`   → Founding Member: ${isFoundingMember ? 'YES 🌟' : 'NO'}`)

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken()

    // Create beta user data
    const betaUserData = {
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      passwordHash: passwordHash || null, // Store hashed password
      role: 'user', // Default role for beta users
      position,
      status: USER_STATUS.PENDING_EMAIL,
      paymentStatus,
      isFree,
      isFoundingMember, // Mark first 20 users as founding members
      emailVerified: false,
      emailVerificationToken,
      discordJoined: false,
      discordUserId: null,
      discordUsername: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      lastLoginAt: null,
      lastLogoutAt: null,
      // Terms of Service acceptance tracking
      agreedToTerms: agreedToTerms || false,
      tosVersion: tosVersion || '1.0',
      tosAcceptedAt: tosAcceptedAt || admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Save user to database with retry logic
    console.log('   → Saving to Firebase (with retry)...')
    const docRef = await retryWithBackoff(
      async () => await db.collection(COLLECTIONS.BETA_USERS).add(betaUserData),
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt, maxRetries, delay) => {
          console.log(`   → Retry ${attempt}/${maxRetries} for Firebase save...`)
        },
      }
    )
    console.log(`✅ [BETA] User saved to Firebase!`)
    console.log(`   → Document ID: ${docRef.id}`)

    // Create email verification record with retry
    await retryWithBackoff(
      async () => await createEmailVerification(docRef.id, email, emailVerificationToken),
      {
        maxRetries: 3,
        onRetry: (attempt) => {
          console.log(`   → Retry ${attempt} for email verification record...`)
        },
      }
    )

    return {
      success: true,
      message: 'Successfully registered for beta program!',
      userId: docRef.id,
      position,
      isFree,
      requiresPayment: !isFree,
      emailVerificationToken, // Will be sent via email
    }
  } catch (error) {
    console.error('❌ [BETA] Error creating beta user')
    console.error(`   → Error: ${error.message}`)
    console.error(`   → Stack:`, error.stack)
    return {
      success: false,
      message: 'An error occurred during registration. Please try again.',
      error: error.message,
    }
  }
}

/**
 * Get beta user by ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getBetaUser = async (userId) => {
  try {
    const doc = await db.collection(COLLECTIONS.BETA_USERS).doc(userId).get()
    
    if (!doc.exists) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    return {
      success: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    }
  } catch (error) {
    console.error('Error getting beta user:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get beta user by email
 * @param {string} email
 * @returns {Promise<Object>}
 */
const getBetaUserByEmail = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const snapshot = await db
      .collection(COLLECTIONS.BETA_USERS)
      .where('email', '==', normalizedEmail)
      .get()

    if (snapshot.empty) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const doc = snapshot.docs[0]
    return {
      success: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    }
  } catch (error) {
    console.error('Error getting beta user by email:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Update beta user
 * @param {string} userId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateBetaUser = async (userId, updateData) => {
  try {
    await db.collection(COLLECTIONS.BETA_USERS).doc(userId).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`✅ [BETA] User ${userId} updated`)
    return {
      success: true,
      message: 'User updated successfully',
    }
  } catch (error) {
    console.error('Error updating beta user:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get all beta users (admin)
 * @returns {Promise<Object>}
 */
const getAllBetaUsers = async () => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.BETA_USERS)
      .orderBy('position', 'asc')
      .get()

    const users = []
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      users,
      count: users.length,
    }
  } catch (error) {
    console.error('Error getting all beta users:', error)
    return {
      success: false,
      error: error.message,
      users: [],
    }
  }
}

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * Create email verification record
 * @param {string} userId
 * @param {string} email
 * @param {string} token
 * @returns {Promise<Object>}
 */
const createEmailVerification = async (userId, email, token) => {
  try {
    const verificationData = {
      userId,
      email: email.toLowerCase().trim(),
      token,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      ),
    }

    await db.collection(COLLECTIONS.EMAIL_VERIFICATIONS).add(verificationData)
    console.log(`✅ [BETA] Email verification created for user ${userId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error creating email verification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify email token
 * @param {string} token
 * @returns {Promise<Object>}
 */
const verifyEmailToken = async (token) => {
  try {
    // First, check if token exists at all (including already verified)
    const allTokensSnapshot = await db
      .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
      .where('token', '==', token)
      .get()

    if (allTokensSnapshot.empty) {
      return {
        success: false,
        errorType: 'invalid',
        message: 'Invalid verification token',
      }
    }

    // Check if already verified
    const allTokenDoc = allTokensSnapshot.docs[0]
    const allTokenData = allTokenDoc.data()

    if (allTokenData.verified) {
      return {
        success: false,
        errorType: 'already_verified',
        message: 'This email has already been verified',
        userId: allTokenData.userId,
      }
    }

    // Check if token expired
    const now = new Date()
    const expiresAt = allTokenData.expiresAt.toDate()
    
    if (now > expiresAt) {
      return {
        success: false,
        errorType: 'expired',
        message: 'Verification token has expired',
        userId: allTokenData.userId,
        email: allTokenData.email,
      }
    }

    // Token is valid and not expired - proceed with verification
    const data = allTokenData
    const doc = allTokenDoc

    // Mark as verified
    await db.collection(COLLECTIONS.EMAIL_VERIFICATIONS).doc(doc.id).update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Update user status
    const userResult = await getBetaUser(data.userId)
    if (userResult.success) {
      const user = userResult.user
      const newStatus = user.isFree 
        ? USER_STATUS.ACTIVE 
        : USER_STATUS.PENDING_PAYMENT

      // Set access expiration to December 31, 2025
      const accessExpiresAt = new Date('2025-12-31T23:59:59Z')

      const updateData = {
        emailVerified: true,
        status: newStatus,
      }

      // Add expiration date for free users who get ACTIVE status
      if (user.isFree) {
        updateData.accessExpiresAt = accessExpiresAt
      }

      await updateBetaUser(data.userId, updateData)
    }

    console.log(`✅ [BETA] Email verified for user ${data.userId}`)

    return {
      success: true,
      message: 'Email verified successfully',
      userId: data.userId,
    }
  } catch (error) {
    console.error('Error verifying email token:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Resend verification email
 * Invalidates old tokens and creates a new one
 * @param {string} userId
 * @param {string} email
 * @param {string} firstName
 * @returns {Promise<Object>}
 */
const resendVerificationEmail = async (userId, email, firstName) => {
  try {
    console.log(`🔄 [BETA] Resending verification email for user ${userId}`)

    // Invalidate all old unverified tokens for this user
    const oldTokensSnapshot = await db
      .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
      .where('userId', '==', userId)
      .where('verified', '==', false)
      .get()

    if (!oldTokensSnapshot.empty) {
      const batch = db.batch()
      oldTokensSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log(`   → Invalidated ${oldTokensSnapshot.size} old verification token(s)`)
    }

    // Create new verification token
    const token = generateEmailVerificationToken()
    const verificationResult = await createEmailVerification(userId, email, token)

    if (!verificationResult.success) {
      return {
        success: false,
        message: 'Failed to create verification token',
      }
    }

    // Send verification email
    const { sendBetaWelcomeEmail } = require('./emailService')
    const userResult = await getBetaUser(userId)
    
    if (!userResult.success) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const user = userResult.user
    
    await sendBetaWelcomeEmail(
      email,
      firstName,
      user.position,
      user.isFree,
      token
    )

    console.log(`✅ [BETA] Verification email resent to ${email}`)

    return {
      success: true,
      message: 'Verification email sent successfully',
    }
  } catch (error) {
    console.error('Error resending verification email:', error)
    return {
      success: false,
      message: error.message,
    }
  }
}

// ============================================
// DISCORD INVITE MANAGEMENT
// ============================================

/**
 * Create Discord invite for user
 * @param {string} userId
 * @param {string} email
 * @returns {Promise<Object>}
 */
const createDiscordInvite = async (userId, email) => {
  try {
    const token = generateDiscordInviteToken()
    
    // Try to create unique Discord server invite link via bot
    let discordInviteUrl = null
    let discordInviteCode = null
    
    try {
      const { createInviteLink } = require('./discordBotService')
      const inviteResult = await createInviteLink(
        604800, // 7 days
        1       // Max uses: 1 (single-use!)
      )
      
      if (inviteResult.success) {
        discordInviteUrl = inviteResult.inviteUrl
        discordInviteCode = inviteResult.inviteCode
        console.log(`   → Unique Discord invite created: ${discordInviteCode}`)
      } else {
        console.warn(`   → Could not create unique invite, will use fallback`)
      }
    } catch (botError) {
      console.warn(`   → Bot not ready, will use fallback invite: ${botError.message}`)
    }
    
    const inviteData = {
      userId,
      email: email.toLowerCase().trim(),
      token,
      used: false,
      discordInviteUrl, // Unique Discord server invite URL (if bot is ready)
      discordInviteCode, // Discord invite code (if bot is ready)
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ),
    }

    const docRef = await db.collection(COLLECTIONS.DISCORD_INVITES).add(inviteData)
    console.log(`✅ [BETA] Discord invite created for user ${userId}`)
    
    return {
      success: true,
      token,
      inviteId: docRef.id,
      discordInviteUrl,
      discordInviteCode,
    }
  } catch (error) {
    console.error('Error creating Discord invite:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Validate Discord invite token
 * @param {string} token
 * @returns {Promise<Object>}
 */
const validateDiscordInvite = async (token) => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.DISCORD_INVITES)
      .where('token', '==', token)
      .where('used', '==', false)
      .get()

    if (snapshot.empty) {
      return {
        success: false,
        message: 'Invalid or already used invite token',
      }
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    // Check if token expired
    const now = new Date()
    const expiresAt = data.expiresAt.toDate()
    
    if (now > expiresAt) {
      return {
        success: false,
        message: 'Invite token has expired',
      }
    }

    return {
      success: true,
      invite: {
        id: doc.id,
        ...data,
      },
    }
  } catch (error) {
    console.error('Error validating Discord invite:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Mark Discord invite as used
 * @param {string} inviteId
 * @param {Object} discordData
 * @returns {Promise<Object>}
 */
const markDiscordInviteUsed = async (inviteId, discordData = {}) => {
  try {
    await db.collection(COLLECTIONS.DISCORD_INVITES).doc(inviteId).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      discordUserId: discordData.userId || null,
      discordUsername: discordData.username || null,
    })

    console.log(`✅ [BETA] Discord invite ${inviteId} marked as used`)
    return { success: true }
  } catch (error) {
    console.error('Error marking Discord invite as used:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create subscription record
 * @param {Object} subscriptionData
 * @returns {Promise<Object>}
 */
const createSubscription = async (subscriptionData) => {
  try {
    const subData = {
      ...subscriptionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection(COLLECTIONS.SUBSCRIPTIONS).add(subData)
    console.log(`✅ [BETA] Subscription created: ${docRef.id}`)
    
    return {
      success: true,
      subscriptionId: docRef.id,
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Update subscription
 * @param {string} stripeSubscriptionId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateSubscription = async (stripeSubscriptionId, updateData) => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.SUBSCRIPTIONS)
      .where('stripeSubscriptionId', '==', stripeSubscriptionId)
      .get()

    if (snapshot.empty) {
      return {
        success: false,
        message: 'Subscription not found',
      }
    }

    const doc = snapshot.docs[0]
    await db.collection(COLLECTIONS.SUBSCRIPTIONS).doc(doc.id).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`✅ [BETA] Subscription ${stripeSubscriptionId} updated`)
    return { success: true }
  } catch (error) {
    console.error('Error updating subscription:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// WEBHOOK IDEMPOTENCY
// ============================================

/**
 * Check if webhook event has already been processed
 * @param {string} eventId - Stripe event ID
 * @returns {Promise<boolean>}
 */
const isWebhookProcessed = async (eventId) => {
  try {
    const doc = await db.collection(COLLECTIONS.WEBHOOK_EVENTS).doc(eventId).get()
    
    if (doc.exists) {
      const data = doc.data()
      console.log(`⚠️  [WEBHOOK] Event ${eventId} already processed at ${data.processedAt?.toDate()}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error checking webhook processed status:', error)
    // In case of error, assume not processed to avoid skipping important events
    return false
  }
}

/**
 * Mark webhook event as processed
 * @param {string} eventId - Stripe event ID
 * @param {string} eventType - Type of webhook event
 * @param {Object} metadata - Additional metadata about the event
 * @returns {Promise<Object>}
 */
const markWebhookProcessed = async (eventId, eventType, metadata = {}) => {
  try {
    await db.collection(COLLECTIONS.WEBHOOK_EVENTS).doc(eventId).set({
      eventId,
      eventType,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata,
    })
    
    console.log(`✅ [WEBHOOK] Event ${eventId} marked as processed`)
    return { success: true }
  } catch (error) {
    console.error('Error marking webhook as processed:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Constants
  COLLECTIONS,
  MAX_BETA_USERS,
  FREE_SLOTS,
  BETA_PRICE,
  USER_STATUS,
  PAYMENT_STATUS,

  // Helper functions
  generateToken,
  generateDiscordInviteToken,
  generateEmailVerificationToken,

  // Beta user management
  getBetaStats,
  checkExistingUser,
  createBetaUser,
  getBetaUser,
  getBetaUserByEmail,
  updateBetaUser,
  getAllBetaUsers,

  // Email verification
  createEmailVerification,
  verifyEmailToken,
  resendVerificationEmail,

  // Discord invites
  createDiscordInvite,
  validateDiscordInvite,
  markDiscordInviteUsed,

  // Subscriptions
  createSubscription,
  updateSubscription,

  // Webhook idempotency
  isWebhookProcessed,
  markWebhookProcessed,
}

