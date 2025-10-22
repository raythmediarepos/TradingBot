const { admin, db } = require('../config/firebase-admin')
const { sendWaitlistConfirmation } = require('./emailService')

// Constants
const MAX_WAITLIST_MEMBERS = 100
const WAITLIST_COLLECTION = 'waitlist'

/**
 * Get the number of remaining waitlist spots
 * @returns {Promise<{remaining: number, total: number, filled: number}>}
 */
const getRemainingWaitlistSpots = async () => {
  try {
    const snapshot = await db.collection(WAITLIST_COLLECTION).get()
    const currentCount = snapshot.size
    const remaining = Math.max(0, MAX_WAITLIST_MEMBERS - currentCount)

    return {
      success: true,
      remaining,
      total: MAX_WAITLIST_MEMBERS,
      filled: currentCount,
    }
  } catch (error) {
    console.error('Error getting waitlist count:', error)
    return {
      success: false,
      error: 'Failed to retrieve waitlist count',
      remaining: 0,
      total: MAX_WAITLIST_MEMBERS,
      filled: 0,
    }
  }
}

/**
 * Add a user to the waitlist
 * @param {Object} userData - User data
 * @param {string} userData.email - User's email
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @returns {Promise<{success: boolean, message: string, userId?: string}>}
 */
const addToWaitlist = async (userData) => {
  const { email, firstName, lastName } = userData

  console.log('🎫 [WAITLIST] New signup attempt...')
  console.log(`   → Email: ${email}`)
  console.log(`   → Name: ${firstName} ${lastName}`)

  // Validate input
  if (!email || !firstName || !lastName) {
    console.error('❌ [WAITLIST] Validation failed: Missing required fields')
    return {
      success: false,
      message: 'Email, first name, and last name are required',
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.error(`❌ [WAITLIST] Invalid email format: ${email}`)
    return {
      success: false,
      message: 'Invalid email format',
    }
  }

  try {
    // Check if waitlist is full
    console.log('   → Checking waitlist capacity...')
    const spotsInfo = await getRemainingWaitlistSpots()
    console.log(`   → Spots: ${spotsInfo.filled}/${spotsInfo.total} filled (${spotsInfo.remaining} remaining)`)
    
    if (spotsInfo.remaining === 0) {
      console.warn('⚠️  [WAITLIST] Waitlist is full!')
      return {
        success: false,
        message: 'Sorry, the waitlist is full. Please check back later.',
      }
    }

    // Check if email already exists
    console.log(`   → Checking for duplicate email...`)
    const existingUser = await db
      .collection(WAITLIST_COLLECTION)
      .where('email', '==', email.toLowerCase().trim())
      .get()

    if (!existingUser.empty) {
      console.warn(`⚠️  [WAITLIST] Email already registered: ${email}`)
      return {
        success: false,
        message: 'This email is already on the waitlist',
        alreadyExists: true,
      }
    }

    // Add user to waitlist
    const waitlistData = {
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending', // pending, approved, notified
      listType: 'trading-bot', // trading-bot or chatbot
    }

    console.log('   → Saving to Firebase...')
    const docRef = await db.collection(WAITLIST_COLLECTION).add(waitlistData)
    console.log(`✅ [WAITLIST] User saved to Firebase!`)
    console.log(`   → Document ID: ${docRef.id}`)

    const position = spotsInfo.filled + 1
    console.log(`   → Position assigned: #${position}`)

    // Send confirmation email
    console.log('   → Initiating confirmation email...')
    const emailSent = await sendWaitlistConfirmation(
      waitlistData.email,
      waitlistData.firstName,
      waitlistData.lastName,
      position
    )
    
    if (emailSent) {
      console.log('✅ [WAITLIST] Complete with email confirmation')
    } else {
      console.warn('⚠️  [WAITLIST] Complete but email failed (user still added)')
    }

    return {
      success: true,
      message: 'Successfully added to waitlist!',
      userId: docRef.id,
      position,
    }
  } catch (error) {
    console.error('❌ [WAITLIST] Error adding to waitlist')
    console.error(`   → Error: ${error.message}`)
    console.error(`   → Stack:`, error.stack)
    return {
      success: false,
      message: 'An error occurred while adding you to the waitlist. Please try again.',
      error: error.message,
    }
  }
}

/**
 * Get all waitlist members (admin only)
 * @returns {Promise<Array>}
 */
const getAllWaitlistMembers = async () => {
  try {
    const snapshot = await db
      .collection(WAITLIST_COLLECTION)
      .orderBy('joinedAt', 'asc')
      .get()

    const members = []
    snapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      members,
      count: members.length,
    }
  } catch (error) {
    console.error('Error getting waitlist members:', error)
    return {
      success: false,
      error: 'Failed to retrieve waitlist members',
      members: [],
    }
  }
}

module.exports = {
  getRemainingWaitlistSpots,
  addToWaitlist,
  getAllWaitlistMembers,
  MAX_WAITLIST_MEMBERS,
}

