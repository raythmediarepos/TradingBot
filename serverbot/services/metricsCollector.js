const admin = require('firebase-admin')
const db = admin.firestore()

/**
 * Collect system metrics
 * @returns {Promise<Object>}
 */
const collectSystemMetrics = async () => {
  console.log('📊 [METRICS] Collecting system metrics...')
  
  try {
    // Get health check results from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const healthChecks = await db
      .collection('healthChecks')
      .where('timestamp', '>', oneHourAgo)
      .orderBy('timestamp', 'desc')
      .get()
    
    if (healthChecks.empty) {
      console.log('   → No health checks in last hour')
      return null
    }
    
    const checks = healthChecks.docs.map(doc => doc.data())
    
    // Calculate metrics
    const totalChecks = checks.length
    const healthyChecks = checks.filter(c => c.overall === 'healthy').length
    const uptimePercent = ((healthyChecks / totalChecks) * 100).toFixed(2)
    
    // API response times
    const apiResponseTimes = checks
      .map(c => c.services?.api?.averageResponseTime)
      .filter(t => t !== undefined)
    
    const avgApiResponseTime = apiResponseTimes.length > 0
      ? Math.round(apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length)
      : 0
    
    console.log(`   → Uptime: ${uptimePercent}%`)
    console.log(`   → Avg API Response: ${avgApiResponseTime}ms`)
    
    return {
      period: 'last_hour',
      totalChecks,
      healthyChecks,
      uptimePercent: parseFloat(uptimePercent),
      averageApiResponseTime: avgApiResponseTime,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('❌ [METRICS] Error collecting system metrics:', error)
    return null
  }
}

/**
 * Collect user metrics
 * @returns {Promise<Object>}
 */
const collectUserMetrics = async () => {
  console.log('📊 [METRICS] Collecting user metrics...')
  
  try {
    // Total beta users
    const betaUsersSnapshot = await db.collection('betaUsers').get()
    const totalUsers = betaUsersSnapshot.size
    
    // Verified users
    const verifiedUsers = betaUsersSnapshot.docs.filter(
      doc => doc.data().emailVerified === true
    ).length
    
    // Paid users
    const paidUsers = betaUsersSnapshot.docs.filter(
      doc => doc.data().paymentStatus === 'paid'
    ).length
    
    // Free users
    const freeUsers = betaUsersSnapshot.docs.filter(
      doc => doc.data().isFree === true
    ).length
    
    // Discord joined
    const discordUsers = betaUsersSnapshot.docs.filter(
      doc => doc.data().discordJoined === true
    ).length
    
    // Active today (logged in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activeToday = betaUsersSnapshot.docs.filter(doc => {
      const lastLogin = doc.data().lastLoginAt
      if (!lastLogin) return false
      const loginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin)
      return loginDate > oneDayAgo
    }).length
    
    // Signups today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const signupsToday = betaUsersSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt
      if (!createdAt) return false
      const createDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
      return createDate > startOfDay
    }).length
    
    console.log(`   → Total Users: ${totalUsers}`)
    console.log(`   → Verified: ${verifiedUsers}`)
    console.log(`   → Active Today: ${activeToday}`)
    console.log(`   → Signups Today: ${signupsToday}`)
    
    return {
      totalUsers,
      verifiedUsers,
      paidUsers,
      freeUsers,
      discordUsers,
      activeToday,
      signupsToday,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
      discordJoinRate: totalUsers > 0 ? ((discordUsers / totalUsers) * 100).toFixed(2) : 0,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('❌ [METRICS] Error collecting user metrics:', error)
    return null
  }
}

/**
 * Collect business metrics
 * @returns {Promise<Object>}
 */
const collectBusinessMetrics = async () => {
  console.log('📊 [METRICS] Collecting business metrics...')
  
  try {
    // Get all paid users
    const paidUsersSnapshot = await db
      .collection('betaUsers')
      .where('paymentStatus', '==', 'paid')
      .get()
    
    const totalRevenue = paidUsersSnapshot.size * 49.99
    
    // Revenue today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const paymentsToday = paidUsersSnapshot.docs.filter(doc => {
      const paymentDate = doc.data().paymentCompletedAt
      if (!paymentDate) return false
      const date = paymentDate.toDate ? paymentDate.toDate() : new Date(paymentDate)
      return date > startOfDay
    }).length
    
    const revenueToday = paymentsToday * 49.99
    
    // Beta spots
    const betaUsersSnapshot = await db.collection('betaUsers').get()
    const spotsFilled = betaUsersSnapshot.size
    const spotsRemaining = Math.max(0, 100 - spotsFilled)
    
    // Waitlist
    const waitlistSnapshot = await db.collection('waitlist').get()
    const waitlistSize = waitlistSnapshot.size
    
    console.log(`   → Total Revenue: $${totalRevenue.toFixed(2)}`)
    console.log(`   → Revenue Today: $${revenueToday.toFixed(2)}`)
    console.log(`   → Beta Spots: ${spotsFilled}/100`)
    console.log(`   → Waitlist: ${waitlistSize}`)
    
    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      revenueToday: parseFloat(revenueToday.toFixed(2)),
      paymentsToday,
      spotsFilled,
      spotsRemaining,
      waitlistSize,
      conversionRate: spotsFilled > 0 ? ((paidUsersSnapshot.size / spotsFilled) * 100).toFixed(2) : 0,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('❌ [METRICS] Error collecting business metrics:', error)
    return null
  }
}

/**
 * Collect email metrics
 * @returns {Promise<Object>}
 */
const collectEmailMetrics = async () => {
  console.log('📊 [METRICS] Collecting email metrics...')
  
  try {
    // Get email events from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const emailEvents = await db
      .collection('emailEvents')
      .where('timestamp', '>', oneDayAgo)
      .get()
    
    if (emailEvents.empty) {
      console.log('   → No email events in last 24 hours')
      return {
        sent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        complained: 0,
        deliveryRate: 0,
        bounceRate: 0,
        openRate: 0,
        timestamp: new Date(),
      }
    }
    
    const events = emailEvents.docs.map(doc => doc.data())
    
    const sent = events.filter(e => e.eventType === 'email.sent').length
    const delivered = events.filter(e => e.eventType === 'email.delivered').length
    const bounced = events.filter(e => e.eventType === 'email.bounced').length
    const opened = events.filter(e => e.eventType === 'email.opened').length
    const clicked = events.filter(e => e.eventType === 'email.clicked').length
    const complained = events.filter(e => e.eventType === 'email.complained').length
    
    const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(2) : 0
    const bounceRate = sent > 0 ? ((bounced / sent) * 100).toFixed(2) : 0
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : 0
    
    console.log(`   → Sent: ${sent}`)
    console.log(`   → Delivered: ${delivered} (${deliveryRate}%)`)
    console.log(`   → Bounced: ${bounced} (${bounceRate}%)`)
    console.log(`   → Opened: ${opened} (${openRate}%)`)
    
    return {
      sent,
      delivered,
      bounced,
      opened,
      clicked,
      complained,
      deliveryRate: parseFloat(deliveryRate),
      bounceRate: parseFloat(bounceRate),
      openRate: parseFloat(openRate),
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('❌ [METRICS] Error collecting email metrics:', error)
    return null
  }
}

/**
 * Collect all metrics and store in Firebase
 * @returns {Promise<void>}
 */
const collectAndStoreMetrics = async () => {
  console.log('\n📊 [METRICS] Collecting all metrics...')
  console.log(`   → Time: ${new Date().toISOString()}\n`)
  
  try {
    const [system, users, business, email] = await Promise.all([
      collectSystemMetrics(),
      collectUserMetrics(),
      collectBusinessMetrics(),
      collectEmailMetrics(),
    ])
    
    const metrics = {
      system,
      users,
      business,
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }
    
    // Store in Firebase
    await db.collection('systemMetrics').add(metrics)
    
    console.log('\n✅ [METRICS] All metrics collected and stored\n')
    
    return metrics
  } catch (error) {
    console.error('❌ [METRICS] Error collecting metrics:', error)
  }
}

module.exports = {
  collectSystemMetrics,
  collectUserMetrics,
  collectBusinessMetrics,
  collectEmailMetrics,
  collectAndStoreMetrics,
}

