const { admin, db } = require('../config/firebase-admin')

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
    // Check if waitlist is full
    const spotsInfo = await getRemainingWaitlistSpots()
    if (spotsInfo.remaining === 0) {
      return {
        success: false,
        message: 'Sorry, the waitlist is full. Please check back later.',
      }
    }

    // Check if email already exists
    const existingUser = await db
      .collection(WAITLIST_COLLECTION)
      .where('email', '==', email.toLowerCase().trim())
      .get()

    if (!existingUser.empty) {
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

    const docRef = await db.collection(WAITLIST_COLLECTION).add(waitlistData)

    // Send confirmation email (stubbed)
    await sendWaitlistConfirmationEmail({
      email: waitlistData.email,
      firstName: waitlistData.firstName,
      lastName: waitlistData.lastName,
    })

    return {
      success: true,
      message: 'Successfully added to waitlist!',
      userId: docRef.id,
      position: spotsInfo.filled + 1,
    }
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return {
      success: false,
      message: 'An error occurred while adding you to the waitlist. Please try again.',
      error: error.message,
    }
  }
}

/**
 * Send confirmation email to waitlist member (STUBBED)
 * @param {Object} userData - User data
 * @param {string} userData.email - User's email
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @returns {Promise<{success: boolean}>}
 */
const sendWaitlistConfirmationEmail = async (userData) => {
  // TODO: Implement email sending logic
  // Options:
  // 1. SendGrid API
  // 2. Mailgun API
  // 3. AWS SES
  // 4. Firebase Extensions (Trigger Email)
  // 5. Resend API

  console.log('📧 [STUBBED] Sending confirmation email to:', userData.email)
  console.log('Email content would be:')
  console.log(`
    To: ${userData.email}
    Subject: Welcome to Honeypot AI Waitlist! 🐝

    Hi ${userData.firstName},

    Thank you for joining the Honeypot AI Trading Bot waitlist!
    
    We're excited to have you as part of our early community. You'll be among 
    the first to access our halal-compliant trading signals when we launch.

    What's Next:
    • Discord Launch: November 15, 2025
    • Beta Access (First 100): December 1, 2025
    • Trading Bot v1: January 1, 2026

    We'll notify you via email as soon as spots open up.

    In the meantime:
    • Join our Discord community: [Link]
    • Follow us for updates: [Social Links]
    • Have questions? Reply to this email

    Best regards,
    The Honeypot AI Team 🍯
  `)

  // Return success for now (stubbed)
  return {
    success: true,
    stubbed: true,
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
  sendWaitlistConfirmationEmail,
  getAllWaitlistMembers,
  MAX_WAITLIST_MEMBERS,
}

