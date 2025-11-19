const admin = require('firebase-admin')
const db = admin.firestore()

const COLLECTIONS = {
  AFFILIATES: 'affiliates',
  BETA_USERS: 'betaUsers',
  AFFILIATE_CLICKS: 'affiliateClicks',
  AFFILIATE_PAYOUTS: 'affiliatePayouts',
}

/**
 * Create a new affiliate
 */
const createAffiliate = async (name, email, code, createdBy) => {
  try {
    // Validate code uniqueness
    const existingAffiliate = await db
      .collection(COLLECTIONS.AFFILIATES)
      .where('code', '==', code.toUpperCase())
      .get()

    if (!existingAffiliate.empty) {
      return {
        success: false,
        error: 'Affiliate code already exists',
      }
    }

    // Create affiliate
    const affiliateData = {
      code: code.toUpperCase(),
      name: name,
      email: email,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy,
      
      // Stats (initialized to 0)
      totalClicks: 0,
      totalSignups: 0,
      paidUsers: 0,
      freeUsers: 0,
      totalCommission: 0.0,
    }

    const docRef = await db.collection(COLLECTIONS.AFFILIATES).add(affiliateData)

    console.log(`✅ [AFFILIATE] Created affiliate: ${code} (${name})`)

    return {
      success: true,
      affiliateId: docRef.id,
      affiliate: {
        id: docRef.id,
        ...affiliateData,
      },
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error creating affiliate:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get affiliate by code
 */
const getAffiliateByCode = async (code) => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.AFFILIATES)
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get()

    if (snapshot.empty) {
      return {
        success: false,
        error: 'Affiliate not found',
      }
    }

    const doc = snapshot.docs[0]
    return {
      success: true,
      affiliate: {
        id: doc.id,
        ...doc.data(),
      },
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error getting affiliate:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get affiliate by ID
 */
const getAffiliateById = async (affiliateId) => {
  try {
    const doc = await db.collection(COLLECTIONS.AFFILIATES).doc(affiliateId).get()

    if (!doc.exists) {
      return {
        success: false,
        error: 'Affiliate not found',
      }
    }

    return {
      success: true,
      affiliate: {
        id: doc.id,
        ...doc.data(),
      },
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error getting affiliate:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get all affiliates
 */
const getAllAffiliates = async () => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.AFFILIATES)
      .orderBy('createdAt', 'desc')
      .get()

    const affiliates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return {
      success: true,
      affiliates: affiliates,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error getting affiliates:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Update affiliate
 */
const updateAffiliate = async (affiliateId, updates) => {
  try {
    const affiliateRef = db.collection(COLLECTIONS.AFFILIATES).doc(affiliateId)
    
    await affiliateRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`✅ [AFFILIATE] Updated affiliate: ${affiliateId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error updating affiliate:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Delete affiliate
 */
const deleteAffiliate = async (affiliateId) => {
  try {
    await db.collection(COLLECTIONS.AFFILIATES).doc(affiliateId).delete()

    console.log(`✅ [AFFILIATE] Deleted affiliate: ${affiliateId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error deleting affiliate:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get detailed affiliate stats
 */
const getAffiliateStats = async (code) => {
  try {
    // Get affiliate
    const affiliateResult = await getAffiliateByCode(code)
    if (!affiliateResult.success) {
      return affiliateResult
    }

    const affiliate = affiliateResult.affiliate

    // Get all users referred by this affiliate
    const usersSnapshot = await db
      .collection(COLLECTIONS.BETA_USERS)
      .where('affiliateCode', '==', code.toUpperCase())
      .get()

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Calculate stats
    const FREE_SLOTS = 20
    let paidUsers = 0
    let freeUsers = 0
    let totalCommission = 0

    users.forEach(user => {
      const isFree = user.position <= FREE_SLOTS
      
      if (isFree) {
        freeUsers++
      } else if (user.paymentStatus === 'paid' && !user.manuallyGranted) {
        paidUsers++
        totalCommission += 12.50 // $49.99 * 0.25
      }
    })

    // Calculate conversion rates
    const clickToSignup = affiliate.totalClicks > 0 
      ? ((users.length / affiliate.totalClicks) * 100).toFixed(1)
      : '0.0'
    
    const signupToPaid = users.length > 0
      ? ((paidUsers / users.length) * 100).toFixed(1)
      : '0.0'
    
    const clickToPaid = affiliate.totalClicks > 0
      ? ((paidUsers / affiliate.totalClicks) * 100).toFixed(1)
      : '0.0'

    return {
      success: true,
      stats: {
        affiliate: affiliate,
        totalClicks: affiliate.totalClicks,
        totalSignups: users.length,
        paidUsers: paidUsers,
        freeUsers: freeUsers,
        totalCommission: totalCommission,
        conversionRates: {
          clickToSignup: parseFloat(clickToSignup),
          signupToPaid: parseFloat(signupToPaid),
          clickToPaid: parseFloat(clickToPaid),
        },
        referredUsers: users,
      },
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error getting stats:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Increment affiliate stats
 */
const incrementAffiliateStats = async (code, field, incrementBy = 1) => {
  try {
    const affiliateResult = await getAffiliateByCode(code)
    if (!affiliateResult.success) {
      return affiliateResult
    }

    const affiliateRef = db.collection(COLLECTIONS.AFFILIATES).doc(affiliateResult.affiliate.id)
    
    await affiliateRef.update({
      [field]: admin.firestore.FieldValue.increment(incrementBy),
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE] Error incrementing stats:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Generate affiliate link
 */
const generateAffiliateLink = (code, frontendUrl) => {
  return `${frontendUrl}/beta/signup?ref=${code.toUpperCase()}`
}

module.exports = {
  createAffiliate,
  getAffiliateByCode,
  getAffiliateById,
  getAllAffiliates,
  updateAffiliate,
  deleteAffiliate,
  getAffiliateStats,
  incrementAffiliateStats,
  generateAffiliateLink,
}
