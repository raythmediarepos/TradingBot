const admin = require('firebase-admin')
const db = admin.firestore()
const { getAffiliateByCode, incrementAffiliateStats } = require('./affiliateService')

const COLLECTIONS = {
  AFFILIATE_CLICKS: 'affiliateClicks',
}

/**
 * Track affiliate link click
 */
const trackClick = async (affiliateCode, ip = null, userAgent = null) => {
  try {
    // Verify affiliate exists
    const affiliateResult = await getAffiliateByCode(affiliateCode)
    if (!affiliateResult.success) {
      return {
        success: false,
        error: 'Invalid affiliate code',
      }
    }

    // Log click
    const clickData = {
      affiliateCode: affiliateCode.toUpperCase(),
      clickedAt: admin.firestore.FieldValue.serverTimestamp(),
      ip: ip,
      userAgent: userAgent,
      converted: false,
      userId: null,
      convertedAt: null,
    }

    const docRef = await db.collection(COLLECTIONS.AFFILIATE_CLICKS).add(clickData)

    // Increment affiliate click count
    await incrementAffiliateStats(affiliateCode, 'totalClicks', 1)

    console.log(`🖱️  [AFFILIATE CLICK] ${affiliateCode} - Click tracked`)

    return {
      success: true,
      clickId: docRef.id,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE CLICK] Error tracking click:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Mark click as converted (user signed up)
 */
const trackConversion = async (userId, affiliateCode) => {
  try {
    // Find the most recent unconverted click for this affiliate
    const clicksSnapshot = await db
      .collection(COLLECTIONS.AFFILIATE_CLICKS)
      .where('affiliateCode', '==', affiliateCode.toUpperCase())
      .where('converted', '==', false)
      .orderBy('clickedAt', 'desc')
      .limit(1)
      .get()

    if (!clicksSnapshot.empty) {
      const clickDoc = clicksSnapshot.docs[0]
      await clickDoc.ref.update({
        converted: true,
        userId: userId,
        convertedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`✅ [AFFILIATE CONVERSION] ${affiliateCode} - User ${userId} converted`)
    }

    // Increment affiliate signup count
    await incrementAffiliateStats(affiliateCode, 'totalSignups', 1)

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE CONVERSION] Error tracking conversion:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get click stats for affiliate
 */
const getClickStats = async (affiliateCode) => {
  try {
    const clicksSnapshot = await db
      .collection(COLLECTIONS.AFFILIATE_CLICKS)
      .where('affiliateCode', '==', affiliateCode.toUpperCase())
      .get()

    const clicks = clicksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    const totalClicks = clicks.length
    const convertedClicks = clicks.filter(c => c.converted).length
    const conversionRate = totalClicks > 0 
      ? ((convertedClicks / totalClicks) * 100).toFixed(1)
      : '0.0'

    return {
      success: true,
      stats: {
        totalClicks: totalClicks,
        convertedClicks: convertedClicks,
        unconvertedClicks: totalClicks - convertedClicks,
        conversionRate: parseFloat(conversionRate),
        recentClicks: clicks.slice(0, 10), // Last 10 clicks
      },
    }
  } catch (error) {
    console.error('❌ [AFFILIATE CLICK] Error getting click stats:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Update commission when user pays
 */
const updateCommissionOnPayment = async (userId, affiliateCode) => {
  try {
    const PAYMENT_AMOUNT = 49.99

    // Get affiliate to retrieve commission rate
    const affiliateResult = await getAffiliateByCode(affiliateCode)
    if (!affiliateResult.success) {
      return {
        success: false,
        error: 'Affiliate not found',
      }
    }

    const commissionRate = affiliateResult.affiliate.commissionRate || 25 // Default to 25%
    const commissionAmount = PAYMENT_AMOUNT * (commissionRate / 100)

    // Increment paid users count and total commission
    await incrementAffiliateStats(affiliateCode, 'paidUsers', 1)
    await incrementAffiliateStats(affiliateCode, 'totalCommission', commissionAmount)

    console.log(`💰 [AFFILIATE COMMISSION] ${affiliateCode} earned $${commissionAmount.toFixed(2)} (${commissionRate}%) from user ${userId}`)

    return {
      success: true,
      commissionAmount: commissionAmount,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE COMMISSION] Error updating commission:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Deduct commission on refund
 */
const deductCommissionOnRefund = async (userId, affiliateCode) => {
  try {
    const PAYMENT_AMOUNT = 49.99

    // Get affiliate to retrieve commission rate
    const affiliateResult = await getAffiliateByCode(affiliateCode)
    if (!affiliateResult.success) {
      return {
        success: false,
        error: 'Affiliate not found',
      }
    }

    const commissionRate = affiliateResult.affiliate.commissionRate || 25 // Default to 25%
    const commissionAmount = PAYMENT_AMOUNT * (commissionRate / 100)

    // Decrement paid users count and total commission
    await incrementAffiliateStats(affiliateCode, 'paidUsers', -1)
    await incrementAffiliateStats(affiliateCode, 'totalCommission', -commissionAmount)

    console.log(`↩️  [AFFILIATE REFUND] ${affiliateCode} commission deducted: -$${commissionAmount.toFixed(2)} (${commissionRate}%) (user ${userId})`)

    return {
      success: true,
      commissionAmount: -commissionAmount,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE REFUND] Error deducting commission:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  trackClick,
  trackConversion,
  getClickStats,
  updateCommissionOnPayment,
  deductCommissionOnRefund,
}

