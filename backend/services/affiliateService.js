const { admin, db } = require('../config/firebase-admin')
const emailService = require('./emailService')
const crypto = require('crypto')

/**
 * Generate a unique affiliate code
 * @returns {string} Unique 8-character code
 */
const generateAffiliateCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

/**
 * Check if affiliate code already exists
 * @param {string} code - Affiliate code to check
 * @returns {Promise<boolean>}
 */
const isCodeUnique = async (code) => {
  try {
    const snapshot = await db.collection('affiliates')
      .where('affiliateCode', '==', code)
      .limit(1)
      .get()
    
    return snapshot.empty
  } catch (error) {
    console.error('❌ [AFFILIATE] Error checking code uniqueness:', error)
    throw error
  }
}

/**
 * Generate unique affiliate code
 * @returns {Promise<string>}
 */
const generateUniqueAffiliateCode = async () => {
  let code
  let isUnique = false
  let attempts = 0
  const maxAttempts = 10

  while (!isUnique && attempts < maxAttempts) {
    code = generateAffiliateCode()
    isUnique = await isCodeUnique(code)
    attempts++
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique affiliate code')
  }

  return code
}

/**
 * Create new affiliate account (basic signup - no affiliate code yet)
 * @param {Object} affiliateData - Affiliate signup data
 * @returns {Promise<Object>}
 */
const createAffiliateAccount = async (affiliateData) => {
  console.log('🎯 [AFFILIATE] New signup started...')
  console.log(`   → Name: ${affiliateData.name}`)
  console.log(`   → Email: ${affiliateData.email}`)
  console.log(`   → Platform: ${affiliateData.platform}`)

  try {
    // Check if affiliate already exists
    console.log('   → Checking for existing affiliate...')
    const existingAffiliate = await db.collection('affiliates')
      .where('email', '==', affiliateData.email)
      .limit(1)
      .get()

    if (!existingAffiliate.empty) {
      console.log('⚠️ [AFFILIATE] Email already exists')
      throw new Error('An affiliate account with this email already exists')
    }

    // Create temporary password (will be sent via email)
    const tempPassword = crypto.randomBytes(8).toString('hex')
    console.log('   → Generated temporary password')

    // Create affiliate record - NO affiliate code yet (will be generated after setup)
    const affiliateRecord = {
      name: affiliateData.name,
      email: affiliateData.email,
      platform: affiliateData.platform,
      audienceSize: affiliateData.audienceSize || null,
      websiteUrl: affiliateData.websiteUrl || null,
      affiliateCode: null, // Generated after setup completion
      affiliateLink: null, // Generated after setup completion
      tempPassword: tempPassword, // In production, hash this!
      passwordChanged: false,
      status: 'active', // active, suspended
      setupCompleted: false,
      // Full profile info (collected during setup)
      fullName: null,
      phone: null,
      address: {
        street: null,
        city: null,
        state: null,
        country: null,
        postalCode: null
      },
      paymentInfo: {
        method: null, // paypal, bank, etc
        details: null
      },
      commissionRate: 0.10, // 10%
      totalEarnings: 0,
      totalReferrals: 0,
      activeReferrals: 0,
      clicks: 0,
      conversions: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null
    }

    console.log('   → Saving to Firebase...')
    const docRef = await db.collection('affiliates').add(affiliateRecord)
    console.log(`✅ [AFFILIATE] Account created with ID: ${docRef.id}`)

    // Send welcome email with login credentials (no affiliate code yet)
    console.log('   → Sending welcome email...')
    const emailSent = await emailService.sendAffiliateWelcomeEmail(
      affiliateData.email,
      affiliateData.name,
      tempPassword
    )

    if (emailSent) {
      console.log('✅ [AFFILIATE] Welcome email sent')
    } else {
      console.log('⚠️ [AFFILIATE] Email failed but account created')
    }

    return {
      success: true,
      affiliateId: docRef.id,
      tempPassword: tempPassword,
      status: 'active',
      setupCompleted: false,
      message: 'Account created successfully! Check your email for login credentials.'
    }

  } catch (error) {
    console.error('❌ [AFFILIATE] Error creating account:', error)
    throw error
  }
}

/**
 * Complete affiliate setup and generate affiliate code
 * @param {string} affiliateId - Affiliate document ID
 * @param {Object} setupData - Complete setup data
 * @returns {Promise<Object>}
 */
const completeAffiliateSetup = async (affiliateId, setupData) => {
  console.log('🎯 [AFFILIATE] Completing setup...')
  console.log(`   → Affiliate ID: ${affiliateId}`)

  try {
    const affiliateRef = db.collection('affiliates').doc(affiliateId)
    const doc = await affiliateRef.get()

    if (!doc.exists) {
      throw new Error('Affiliate not found')
    }

    const affiliate = doc.data()

    if (affiliate.setupCompleted) {
      throw new Error('Setup already completed')
    }

    // Generate unique affiliate code NOW
    console.log('   → Generating unique affiliate code...')
    const affiliateCode = await generateUniqueAffiliateCode()
    console.log(`   → Generated code: ${affiliateCode}`)

    // Update affiliate with complete info
    await affiliateRef.update({
      fullName: setupData.fullName,
      phone: setupData.phone,
      address: {
        street: setupData.address.street,
        city: setupData.address.city,
        state: setupData.address.state,
        country: setupData.address.country,
        postalCode: setupData.address.postalCode
      },
      paymentInfo: {
        method: setupData.paymentInfo.method,
        details: setupData.paymentInfo.details
      },
      affiliateCode: affiliateCode,
      affiliateLink: `https://helwaai.com/?ref=${affiliateCode}`,
      setupCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('✅ [AFFILIATE] Setup completed successfully')

    // Send setup completion email with affiliate code
    await emailService.sendAffiliateSetupCompleteEmail(
      affiliate.email,
      affiliate.name,
      affiliateCode
    )

    return {
      success: true,
      affiliateCode: affiliateCode,
      affiliateLink: `https://helwaai.com/?ref=${affiliateCode}`,
      message: 'Setup completed! Your affiliate code has been generated.'
    }

  } catch (error) {
    console.error('❌ [AFFILIATE] Error completing setup:', error)
    throw error
  }
}

/**
 * Approve affiliate application
 * @param {string} affiliateId - Affiliate document ID
 * @returns {Promise<Object>}
 */
const approveAffiliate = async (affiliateId) => {
  console.log(`✅ [AFFILIATE] Approving affiliate: ${affiliateId}`)

  try {
    const affiliateRef = db.collection('affiliates').doc(affiliateId)
    
    await affiliateRef.update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Get affiliate data to send approval email
    const affiliateDoc = await affiliateRef.get()
    const affiliate = affiliateDoc.data()

    // Send approval email with login credentials
    await emailService.sendAffiliateApprovalEmail(
      affiliate.email,
      affiliate.name,
      affiliate.affiliateCode,
      affiliate.tempPassword
    )

    console.log('✅ [AFFILIATE] Approved and notification sent')
    return { success: true, message: 'Affiliate approved successfully' }

  } catch (error) {
    console.error('❌ [AFFILIATE] Error approving affiliate:', error)
    throw error
  }
}

/**
 * Get affiliate by email
 * @param {string} email - Affiliate email
 * @returns {Promise<Object>}
 */
const getAffiliateByEmail = async (email) => {
  try {
    const snapshot = await db.collection('affiliates')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error fetching affiliate:', error)
    throw error
  }
}

/**
 * Track affiliate click
 * @param {string} affiliateCode - Affiliate code
 * @returns {Promise<Object>}
 */
const trackClick = async (affiliateCode) => {
  console.log(`🖱️ [AFFILIATE] Click tracked for code: ${affiliateCode}`)

  try {
    const snapshot = await db.collection('affiliates')
      .where('affiliateCode', '==', affiliateCode)
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.log('⚠️ [AFFILIATE] Invalid affiliate code')
      return { success: false, message: 'Invalid affiliate code' }
    }

    const doc = snapshot.docs[0]
    await doc.ref.update({
      clicks: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('✅ [AFFILIATE] Click recorded')
    return { success: true }

  } catch (error) {
    console.error('❌ [AFFILIATE] Error tracking click:', error)
    throw error
  }
}

/**
 * Track affiliate conversion
 * @param {string} affiliateCode - Affiliate code
 * @param {string} userId - User who converted
 * @param {number} subscriptionAmount - Monthly subscription amount
 * @returns {Promise<Object>}
 */
const trackConversion = async (affiliateCode, userId, subscriptionAmount) => {
  console.log(`💰 [AFFILIATE] Conversion tracked for code: ${affiliateCode}`)
  console.log(`   → User: ${userId}`)
  console.log(`   → Amount: $${subscriptionAmount}`)

  try {
    // Get affiliate
    const snapshot = await db.collection('affiliates')
      .where('affiliateCode', '==', affiliateCode)
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.log('⚠️ [AFFILIATE] Invalid affiliate code')
      return { success: false, message: 'Invalid affiliate code' }
    }

    const affiliateDoc = snapshot.docs[0]
    const affiliate = affiliateDoc.data()
    const commissionAmount = subscriptionAmount * affiliate.commissionRate

    // Update affiliate stats
    await affiliateDoc.ref.update({
      conversions: admin.firestore.FieldValue.increment(1),
      totalReferrals: admin.firestore.FieldValue.increment(1),
      activeReferrals: admin.firestore.FieldValue.increment(1),
      totalEarnings: admin.firestore.FieldValue.increment(commissionAmount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Create commission record
    await db.collection('commissions').add({
      affiliateId: affiliateDoc.id,
      affiliateCode: affiliateCode,
      userId: userId,
      subscriptionAmount: subscriptionAmount,
      commissionRate: affiliate.commissionRate,
      commissionAmount: commissionAmount,
      status: 'pending', // pending, paid
      type: 'recurring',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: null
    })

    console.log('✅ [AFFILIATE] Conversion recorded')
    console.log(`   → Commission: $${commissionAmount.toFixed(2)}`)

    return { 
      success: true, 
      commission: commissionAmount,
      message: 'Conversion tracked successfully'
    }

  } catch (error) {
    console.error('❌ [AFFILIATE] Error tracking conversion:', error)
    throw error
  }
}

/**
 * Get all affiliates (admin)
 * @returns {Promise<Array>}
 */
const getAllAffiliates = async () => {
  try {
    const snapshot = await db.collection('affiliates')
      .orderBy('createdAt', 'desc')
      .get()

    const affiliates = []
    snapshot.forEach(doc => {
      affiliates.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return affiliates
  } catch (error) {
    console.error('❌ [AFFILIATE] Error fetching affiliates:', error)
    throw error
  }
}

module.exports = {
  createAffiliateAccount,
  completeAffiliateSetup,
  createAffiliateApplication: createAffiliateAccount, // Alias for backward compatibility
  approveAffiliate,
  getAffiliateByEmail,
  trackClick,
  trackConversion,
  getAllAffiliates,
  generateUniqueAffiliateCode
}

