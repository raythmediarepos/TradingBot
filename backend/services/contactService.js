const admin = require('firebase-admin')

// Use the same Firebase instance
const db = admin.firestore()

const CONTACT_COLLECTION = 'contact-messages'

/**
 * Submit a contact form message
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.firstName - First name
 * @param {string} contactData.lastName - Last name
 * @param {string} contactData.email - Email address
 * @param {string} contactData.message - Message content
 * @param {string} [contactData.subject] - Optional subject
 * @param {string} [contactData.phone] - Optional phone number
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
const submitContactMessage = async (contactData) => {
  const { firstName, lastName, email, message, subject, phone } = contactData

  // Validate required fields
  if (!firstName || !lastName || !email || !message) {
    return {
      success: false,
      message: 'First name, last name, email, and message are required',
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

  // Validate message length
  if (message.trim().length < 10) {
    return {
      success: false,
      message: 'Message must be at least 10 characters long',
    }
  }

  if (message.trim().length > 5000) {
    return {
      success: false,
      message: 'Message must be less than 5000 characters',
    }
  }

  try {
    // Create contact message document
    const contactMessageData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      subject: subject ? subject.trim() : 'General Inquiry',
      phone: phone ? phone.trim() : null,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new', // new, read, responded, archived
      priority: 'normal', // low, normal, high
      source: 'website', // website, email, discord, etc.
    }

    const docRef = await db.collection(CONTACT_COLLECTION).add(contactMessageData)

    // Send notification to admin (stubbed)
    await sendAdminNotification(contactMessageData)

    // Send confirmation to user (stubbed)
    await sendContactConfirmationEmail(contactMessageData)

    return {
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      messageId: docRef.id,
    }
  } catch (error) {
    console.error('Error submitting contact message:', error)
    return {
      success: false,
      message: 'An error occurred while submitting your message. Please try again.',
      error: error.message,
    }
  }
}

/**
 * Send notification to admin about new contact message (STUBBED)
 * @param {Object} contactData - Contact message data
 * @returns {Promise<{success: boolean}>}
 */
const sendAdminNotification = async (contactData) => {
  // TODO: Implement admin notification
  // Options:
  // 1. Email to support@honeypot.ai
  // 2. Slack notification
  // 3. Discord webhook
  // 4. SMS to admin phone

  console.log('🔔 [STUBBED] Sending admin notification')
  console.log('New contact message from:', contactData.email)
  console.log(`
    From: ${contactData.firstName} ${contactData.lastName}
    Email: ${contactData.email}
    Subject: ${contactData.subject}
    Message: ${contactData.message}
    Phone: ${contactData.phone || 'Not provided'}
  `)

  return {
    success: true,
    stubbed: true,
  }
}

/**
 * Send confirmation email to user (STUBBED)
 * @param {Object} contactData - Contact message data
 * @returns {Promise<{success: boolean}>}
 */
const sendContactConfirmationEmail = async (contactData) => {
  // TODO: Implement confirmation email

  console.log('📧 [STUBBED] Sending confirmation email to:', contactData.email)
  console.log(`
    To: ${contactData.email}
    Subject: We received your message - Honeypot AI

    Hi ${contactData.firstName},

    Thank you for reaching out to Honeypot AI!

    We've received your message and one of our team members will get back 
    to you within 24-48 hours.

    Your Message:
    Subject: ${contactData.subject}
    "${contactData.message}"

    If you have any urgent questions, please reply to this email or 
    contact us directly at support@honeypot.ai

    Best regards,
    The Honeypot AI Team 🍯
  `)

  return {
    success: true,
    stubbed: true,
  }
}

/**
 * Get all contact messages (admin only)
 * @param {Object} filters - Optional filters
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.limit] - Limit number of results
 * @returns {Promise<Array>}
 */
const getAllContactMessages = async (filters = {}) => {
  try {
    let query = db.collection(CONTACT_COLLECTION).orderBy('submittedAt', 'desc')

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const snapshot = await query.get()

    const messages = []
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return {
      success: true,
      messages,
      count: messages.length,
    }
  } catch (error) {
    console.error('Error getting contact messages:', error)
    return {
      success: false,
      error: 'Failed to retrieve contact messages',
      messages: [],
    }
  }
}

/**
 * Update contact message status (admin only)
 * @param {string} messageId - Message ID
 * @param {string} status - New status (new, read, responded, archived)
 * @returns {Promise<{success: boolean}>}
 */
const updateMessageStatus = async (messageId, status) => {
  const validStatuses = ['new', 'read', 'responded', 'archived']

  if (!validStatuses.includes(status)) {
    return {
      success: false,
      message: 'Invalid status',
    }
  }

  try {
    await db.collection(CONTACT_COLLECTION).doc(messageId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return {
      success: true,
      message: 'Status updated successfully',
    }
  } catch (error) {
    console.error('Error updating message status:', error)
    return {
      success: false,
      message: 'Failed to update status',
      error: error.message,
    }
  }
}

module.exports = {
  submitContactMessage,
  sendAdminNotification,
  sendContactConfirmationEmail,
  getAllContactMessages,
  updateMessageStatus,
}

