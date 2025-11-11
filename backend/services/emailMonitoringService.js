const admin = require('firebase-admin')
const db = admin.firestore()

// ============================================
// EMAIL MONITORING SERVICE
// ============================================

/**
 * Store email event from Resend webhook
 * @param {Object} event - Email event from Resend
 * @returns {Promise<boolean>}
 */
const trackEmailEvent = async (event) => {
  try {
    console.log(`📧 [EMAIL MONITORING] Processing email event: ${event.type}`)
    console.log(`   → Email ID: ${event.data.email_id}`)
    console.log(`   → To: ${event.data.to}`)

    // Store event in Firebase
    await db.collection('emailEvents').add({
      eventType: event.type,
      emailId: event.data.email_id || null,
      to: event.data.to || null,
      from: event.data.from || null,
      subject: event.data.subject || null,
      createdAt: event.data.created_at || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rawData: event.data, // Store full event for debugging
    })

    console.log(`✅ [EMAIL MONITORING] Event stored successfully`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL MONITORING] Error storing email event:', error)
    return false
  }
}

/**
 * Get email deliverability stats
 * @param {number} days - Number of days to look back (default 7)
 * @returns {Promise<Object>}
 */
const getEmailStats = async (days = 7) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    console.log(`📊 [EMAIL STATS] Fetching stats for last ${days} days...`)

    // Get all email events from the last N days
    const snapshot = await db
      .collection('emailEvents')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get()

    const events = snapshot.docs.map(doc => doc.data())

    // Count by event type
    const stats = {
      total: events.length,
      sent: events.filter(e => e.eventType === 'email.sent').length,
      delivered: events.filter(e => e.eventType === 'email.delivered').length,
      bounced: events.filter(e => e.eventType === 'email.bounced').length,
      complained: events.filter(e => e.eventType === 'email.complained').length,
      opened: events.filter(e => e.eventType === 'email.opened').length,
      clicked: events.filter(e => e.eventType === 'email.clicked').length,
    }

    // Calculate rates
    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(2) : 0
    const bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(2) : 0
    const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(2) : 0
    const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(2) : 0
    const complaintRate = stats.sent > 0 ? ((stats.complained / stats.sent) * 100).toFixed(2) : 0

    const result = {
      period: `Last ${days} days`,
      counts: stats,
      rates: {
        delivery: `${deliveryRate}%`,
        bounce: `${bounceRate}%`,
        open: `${openRate}%`,
        click: `${clickRate}%`,
        complaint: `${complaintRate}%`,
      },
      health: {
        status: bounceRate < 5 && complaintRate < 0.1 ? 'healthy' : 'warning',
        issues: [],
      },
    }

    // Check for issues
    if (bounceRate >= 5) {
      result.health.status = 'critical'
      result.health.issues.push(`High bounce rate: ${bounceRate}% (threshold: 5%)`)
    }
    if (complaintRate >= 0.1) {
      result.health.status = 'critical'
      result.health.issues.push(`High complaint rate: ${complaintRate}% (threshold: 0.1%)`)
    }
    if (deliveryRate < 95) {
      result.health.status = 'warning'
      result.health.issues.push(`Low delivery rate: ${deliveryRate}% (expected: >95%)`)
    }

    console.log(`✅ [EMAIL STATS] Stats calculated successfully`)
    console.log(`   → Delivery Rate: ${deliveryRate}%`)
    console.log(`   → Bounce Rate: ${bounceRate}%`)
    console.log(`   → Status: ${result.health.status}`)

    return result
  } catch (error) {
    console.error('❌ [EMAIL STATS] Error calculating stats:', error)
    throw error
  }
}

/**
 * Get recent bounced emails
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>}
 */
const getRecentBounces = async (limit = 50) => {
  try {
    const snapshot = await db
      .collection('emailEvents')
      .where('eventType', '==', 'email.bounced')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('❌ [EMAIL MONITORING] Error fetching bounces:', error)
    return []
  }
}

/**
 * Get recent spam complaints
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>}
 */
const getRecentComplaints = async (limit = 50) => {
  try {
    const snapshot = await db
      .collection('emailEvents')
      .where('eventType', '==', 'email.complained')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('❌ [EMAIL MONITORING] Error fetching complaints:', error)
    return []
  }
}

/**
 * Alert if email health is critical
 * @returns {Promise<void>}
 */
const checkEmailHealth = async () => {
  try {
    const stats = await getEmailStats(1) // Check last 24 hours

    if (stats.health.status === 'critical') {
      console.warn('🚨 [EMAIL HEALTH] CRITICAL: Email deliverability issues detected!')
      console.warn(`   → Issues: ${stats.health.issues.join(', ')}`)
      console.warn(`   → Bounce Rate: ${stats.rates.bounce}`)
      console.warn(`   → Complaint Rate: ${stats.rates.complaint}`)
      
      // TODO: Send alert email to admin
      // TODO: Send Slack/Discord notification
      
      // Store alert in database
      await db.collection('emailAlerts').add({
        severity: 'critical',
        stats: stats.counts,
        rates: stats.rates,
        issues: stats.health.issues,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })
    } else if (stats.health.status === 'warning') {
      console.warn('⚠️  [EMAIL HEALTH] WARNING: Email deliverability degraded')
      console.warn(`   → Issues: ${stats.health.issues.join(', ')}`)
    } else {
      console.log('✅ [EMAIL HEALTH] All systems healthy')
    }
  } catch (error) {
    console.error('❌ [EMAIL HEALTH] Error checking health:', error)
  }
}

module.exports = {
  trackEmailEvent,
  getEmailStats,
  getRecentBounces,
  getRecentComplaints,
  checkEmailHealth,
}

