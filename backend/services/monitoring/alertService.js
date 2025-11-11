const { admin, db } = require('../../config/firebase-admin')

// Discord client (will be passed from discordBotService)
let discordClient = null

/**
 * Initialize Discord client for alerts
 * @param {Object} client - Discord client instance
 */
const initializeDiscordAlerts = (client) => {
  discordClient = client
  console.log('✅ [ALERTS] Discord client initialized for alerts')
}

// We'll use the main backend's email service through API calls
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`

/**
 * Check thresholds and determine if alerts are needed
 * @param {Object} metrics - Current metrics
 * @param {Object} healthCheck - Latest health check
 * @returns {Array} - Array of alerts to send
 */
const checkThresholds = async (metrics, healthCheck) => {
  const alerts = []
  
  // Check API health
  if (healthCheck && healthCheck.overall !== 'healthy') {
    alerts.push({
      severity: 'critical',
      service: 'api',
      message: 'API is not healthy',
      details: healthCheck,
      timestamp: new Date(),
    })
  }
  
  // Check API response time
  if (metrics?.system?.averageApiResponseTime > 2000) {
    alerts.push({
      severity: 'warning',
      service: 'api',
      message: `API response time elevated: ${metrics.system.averageApiResponseTime}ms`,
      threshold: 2000,
      actual: metrics.system.averageApiResponseTime,
      timestamp: new Date(),
    })
  }
  
  // Check uptime
  if (metrics?.system?.uptimePercent < 99) {
    alerts.push({
      severity: 'warning',
      service: 'system',
      message: `Uptime below threshold: ${metrics.system.uptimePercent}%`,
      threshold: 99,
      actual: metrics.system.uptimePercent,
      timestamp: new Date(),
    })
  }
  
  // Check email bounce rate
  if (metrics?.email?.bounceRate > 5) {
    alerts.push({
      severity: 'critical',
      service: 'email',
      message: `Email bounce rate too high: ${metrics.email.bounceRate}%`,
      threshold: 5,
      actual: metrics.email.bounceRate,
      timestamp: new Date(),
    })
  }
  
  // Check email delivery rate
  if (metrics?.email?.deliveryRate < 95 && metrics?.email?.sent > 0) {
    alerts.push({
      severity: 'warning',
      service: 'email',
      message: `Email delivery rate low: ${metrics.email.deliveryRate}%`,
      threshold: 95,
      actual: metrics.email.deliveryRate,
      timestamp: new Date(),
    })
  }
  
  // Check verification rate
  if (metrics?.users?.verificationRate < 70 && metrics?.users?.totalUsers > 10) {
    alerts.push({
      severity: 'info',
      service: 'users',
      message: `Email verification rate low: ${metrics.users.verificationRate}%`,
      threshold: 70,
      actual: metrics.users.verificationRate,
      timestamp: new Date(),
    })
  }
  
  return alerts
}

/**
 * Get emoji for severity level
 * @param {string} severity - Alert severity
 * @returns {string}
 */
const getSeverityEmoji = (severity) => {
  const emojis = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return emojis[severity] || '📢'
}

/**
 * Get color for Discord embed based on severity
 * @param {string} severity - Alert severity
 * @returns {number}
 */
const getSeverityColor = (severity) => {
  const colors = {
    critical: 0xFF0000, // Red
    warning: 0xFFA500,  // Orange
    info: 0x0099FF,     // Blue
  }
  return colors[severity] || 0x808080 // Gray default
}

/**
 * Send alert to Discord
 * @param {Object} alert - Alert to send
 * @returns {Promise<void>}
 */
const sendDiscordAlert = async (alert) => {
  if (!discordClient) {
    console.log('⚠️  [ALERT] Discord client not initialized, skipping Discord alert')
    return
  }

  try {
    const channelId = process.env.DISCORD_ALERTS_CHANNEL_ID
    if (!channelId) {
      console.log('⚠️  [ALERT] DISCORD_ALERTS_CHANNEL_ID not set, skipping Discord alert')
      return
    }

    const channel = await discordClient.channels.fetch(channelId)
    if (!channel) {
      console.error('❌ [ALERT] Could not find Discord alerts channel')
      return
    }

    // Build embed
    const embed = {
      color: getSeverityColor(alert.severity),
      title: `${getSeverityEmoji(alert.severity)} System Alert`,
      description: alert.message,
      fields: [
        {
          name: '🔧 Service',
          value: alert.service.toUpperCase(),
          inline: true,
        },
        {
          name: '📊 Severity',
          value: alert.severity.toUpperCase(),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Helwa AI Monitoring System',
      },
    }

    // Add threshold and actual if present
    if (alert.threshold !== undefined && alert.actual !== undefined) {
      embed.fields.push(
        {
          name: '🎯 Threshold',
          value: String(alert.threshold),
          inline: true,
        },
        {
          name: '📈 Actual',
          value: String(alert.actual),
          inline: true,
        },
      )
    }

    // Add view dashboard link
    const dashboardUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/admin/system-health`
      : 'Check your admin dashboard'
    
    embed.fields.push({
      name: '🔗 Actions',
      value: `[View Dashboard](${dashboardUrl})`,
      inline: false,
    })

    // Build message - tag admins for critical alerts
    let messageContent = ''
    if (alert.severity === 'critical') {
      const adminIds = (process.env.DISCORD_ADMIN_IDS || '').split(',').filter(Boolean)
      if (adminIds.length > 0) {
        messageContent = adminIds.map(id => `<@${id.trim()}>`).join(' ') + ' 🚨 **CRITICAL ALERT**'
      } else {
        messageContent = '🚨 **CRITICAL ALERT**'
      }
    }

    // Send to Discord
    await channel.send({
      content: messageContent || undefined,
      embeds: [embed],
    })

    console.log(`✅ [ALERT] Discord alert sent to #${channel.name}`)
  } catch (error) {
    console.error('❌ [ALERT] Error sending Discord alert:', error.message)
  }
}

/**
 * Send alert via email (using main backend)
 * @param {Object} alert - Alert to send
 * @returns {Promise<void>}
 */
const sendAlertEmail = async (alert) => {
  console.log(`📧 [ALERT] Sending ${alert.severity} alert: ${alert.message}`)
  
  try {
    // Store alert in Firebase for history
    await db.collection('alerts').add({
      ...alert,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      acknowledged: false,
    })
    
    // Send to Discord
    await sendDiscordAlert(alert)
    
    console.log(`   → Alert stored in Firebase`)
    
  } catch (error) {
    console.error(`❌ [ALERT] Error sending alert:`, error)
  }
}

/**
 * Check for critical issues and send alerts
 * @param {Object} metrics - Current metrics
 * @param {Object} healthCheck - Latest health check
 * @returns {Promise<void>}
 */
const checkAndAlert = async (metrics, healthCheck) => {
  console.log('\n🔔 [ALERT] Checking for issues...')
  
  try {
    const alerts = await checkThresholds(metrics, healthCheck)
    
    if (alerts.length === 0) {
      console.log('   → No alerts needed ✅')
      return
    }
    
    console.log(`   → Found ${alerts.length} alert(s)`)
    
    // Check if we've already alerted for similar issues recently
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    for (const alert of alerts) {
      // Check for recent similar alerts
      const recentAlerts = await db
        .collection('alerts')
        .where('service', '==', alert.service)
        .where('message', '==', alert.message)
        .where('sentAt', '>', oneHourAgo)
        .limit(1)
        .get()
      
      if (recentAlerts.empty) {
        // No recent similar alert, send it
        await sendAlertEmail(alert)
      } else {
        console.log(`   → Suppressing duplicate alert: ${alert.message}`)
      }
    }
    
    console.log('✅ [ALERT] Alert check complete\n')
  } catch (error) {
    console.error('❌ [ALERT] Error checking alerts:', error)
  }
}

/**
 * Get recent alerts
 * @param {number} limit - Number of alerts to return
 * @returns {Promise<Array>}
 */
const getRecentAlerts = async (limit = 50) => {
  try {
    const snapshot = await db
      .collection('alerts')
      .orderBy('sentAt', 'desc')
      .limit(limit)
      .get()
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('❌ [ALERT] Error fetching recent alerts:', error)
    return []
  }
}

/**
 * Generate daily summary
 * @returns {Promise<Object>}
 */
const generateDailySummary = async () => {
  console.log('\n📊 [SUMMARY] Generating daily summary...')
  
  try {
    // Get metrics from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const metricsSnapshot = await db
      .collection('systemMetrics')
      .where('timestamp', '>', oneDayAgo)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    if (metricsSnapshot.empty) {
      console.log('   → No metrics available')
      return null
    }
    
    const latestMetrics = metricsSnapshot.docs[0].data()
    
    // Get alerts from last 24 hours
    const alertsSnapshot = await db
      .collection('alerts')
      .where('sentAt', '>', oneDayAgo)
      .get()
    
    const alertCount = alertsSnapshot.size
    const criticalAlerts = alertsSnapshot.docs.filter(
      doc => doc.data().severity === 'critical'
    ).length
    
    // Get health checks from last 24 hours
    const healthSnapshot = await db
      .collection('healthChecks')
      .where('timestamp', '>', oneDayAgo)
      .get()
    
    const totalChecks = healthSnapshot.size
    const healthyChecks = healthSnapshot.docs.filter(
      doc => doc.data().overall === 'healthy'
    ).length
    
    const uptimePercent = totalChecks > 0
      ? ((healthyChecks / totalChecks) * 100).toFixed(2)
      : 0
    
    const summary = {
      period: 'last_24_hours',
      uptime: `${uptimePercent}%`,
      totalAlerts: alertCount,
      criticalAlerts,
      metrics: {
        newSignups: latestMetrics.users?.signupsToday || 0,
        revenueToday: latestMetrics.business?.revenueToday || 0,
        activeUsers: latestMetrics.users?.activeToday || 0,
        emailsSent: latestMetrics.email?.sent || 0,
        emailDeliveryRate: latestMetrics.email?.deliveryRate || 0,
      },
      timestamp: new Date(),
    }
    
    console.log('✅ [SUMMARY] Daily summary generated')
    console.log(JSON.stringify(summary, null, 2))
    
    // Store summary
    await db.collection('dailySummaries').add({
      ...summary,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    return summary
  } catch (error) {
    console.error('❌ [SUMMARY] Error generating summary:', error)
    return null
  }
}

module.exports = {
  initializeDiscordAlerts,
  checkThresholds,
  sendAlertEmail,
  checkAndAlert,
  getRecentAlerts,
  generateDailySummary,
}

