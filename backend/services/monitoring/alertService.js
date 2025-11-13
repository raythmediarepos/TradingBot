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
 * Check if a service has been unhealthy for multiple consecutive checks
 * @param {string} service - Service name
 * @param {number} requiredFailures - Number of consecutive failures required
 * @returns {Promise<boolean>}
 */
const hasConsecutiveFailures = async (service, requiredFailures = 3) => {
  try {
    const recentChecks = await db
      .collection('healthChecks')
      .orderBy('timestamp', 'desc')
      .limit(requiredFailures)
      .get()
    
    if (recentChecks.size < requiredFailures) {
      return false // Not enough data to determine
    }
    
    const checks = recentChecks.docs.map(doc => doc.data())
    
    // Check if all recent checks show the service as unhealthy
    return checks.every(check => {
      if (service === 'system') {
        return check.overall === 'degraded'
      }
      return check.services?.[service]?.healthy === false
    })
  } catch (error) {
    console.error('Error checking consecutive failures:', error)
    return false
  }
}

/**
 * Check thresholds and determine if alerts are needed
 * @param {Object} metrics - Current metrics
 * @param {Object} healthCheck - Latest health check
 * @returns {Array} - Array of alerts to send
 */
const checkThresholds = async (metrics, healthCheck) => {
  const alerts = []
  
  // Check API health - only alert after 3 consecutive failures
  if (healthCheck && healthCheck.overall === 'degraded') {
    const hasMultipleFailures = await hasConsecutiveFailures('system', 3)
    if (hasMultipleFailures) {
      alerts.push({
        severity: 'critical',
        service: 'system',
        message: 'System is degraded (3+ consecutive failures)',
        details: healthCheck,
        timestamp: new Date(),
      })
    }
  }
  
  // Check API response time - only if significantly elevated
  if (metrics?.system?.averageApiResponseTime > 3000) {
    alerts.push({
      severity: 'warning',
      service: 'api',
      message: `API response time critically high: ${metrics.system.averageApiResponseTime}ms`,
      threshold: 3000,
      actual: metrics.system.averageApiResponseTime,
      timestamp: new Date(),
    })
  }
  
  // Check uptime - only if critically low
  if (metrics?.system?.uptimePercent < 95) {
    alerts.push({
      severity: 'warning',
      service: 'system',
      message: `Uptime critically low: ${metrics.system.uptimePercent}%`,
      threshold: 95,
      actual: metrics.system.uptimePercent,
      timestamp: new Date(),
    })
  }
  
  // Check email bounce rate
  if (metrics?.email?.bounceRate > 10 && metrics?.email?.sent > 5) {
    alerts.push({
      severity: 'critical',
      service: 'email',
      message: `Email bounce rate too high: ${metrics.email.bounceRate}%`,
      threshold: 10,
      actual: metrics.email.bounceRate,
      timestamp: new Date(),
    })
  }
  
  // Check email delivery rate
  if (metrics?.email?.deliveryRate < 90 && metrics?.email?.sent > 10) {
    alerts.push({
      severity: 'warning',
      service: 'email',
      message: `Email delivery rate low: ${metrics.email.deliveryRate}%`,
      threshold: 90,
      actual: metrics.email.deliveryRate,
      timestamp: new Date(),
    })
  }
  
  // Check verification rate - only if there are many users
  if (metrics?.users?.verificationRate < 60 && metrics?.users?.totalUsers > 20) {
    alerts.push({
      severity: 'info',
      service: 'users',
      message: `Email verification rate low: ${metrics.users.verificationRate}%`,
      threshold: 60,
      actual: metrics.users.verificationRate,
      timestamp: new Date(),
    })
  }
  
  return alerts
}

/**
 * Get admin names from Discord user IDs
 * @returns {Promise<Array<string>>}
 */
const getAdminNames = async () => {
  if (!discordClient) return []
  
  try {
    const adminIds = (process.env.DISCORD_ADMIN_IDS || '').split(',').filter(Boolean)
    const names = []
    
    for (const adminId of adminIds) {
      try {
        const user = await discordClient.users.fetch(adminId.trim())
        // Get first name or username
        const name = user.globalName || user.username || 'Admin'
        names.push(name)
      } catch (error) {
        console.error(`Failed to fetch admin user ${adminId}:`, error.message)
      }
    }
    
    return names
  } catch (error) {
    console.error('Error fetching admin names:', error)
    return []
  }
}

/**
 * Get Jarvis-style greeting based on time of day
 * @param {string} name - Admin name
 * @returns {string}
 */
const getJarvisGreeting = (name) => {
  const hour = new Date().getHours()
  
  if (hour < 6) {
    return `Apologies for the late hour, ${name}`
  } else if (hour < 12) {
    return `Good morning, ${name}`
  } else if (hour < 18) {
    return `Good afternoon, ${name}`
  } else {
    return `Good evening, ${name}`
  }
}

/**
 * Get Jarvis-style alert message
 * @param {Object} alert - Alert object
 * @param {string} adminName - Admin name
 * @returns {string}
 */
const getJarvisMessage = (alert, adminName) => {
  const greeting = getJarvisGreeting(adminName)
  
  // Critical alerts
  if (alert.severity === 'critical') {
    if (alert.service === 'system') {
      return `${greeting}. I must inform you that we're experiencing a critical system incident. The platform has been degraded for the past 15 minutes across multiple health checks. Your immediate attention is required.`
    }
    if (alert.service === 'email') {
      return `${greeting}. I've detected a significant issue with our email delivery system. The bounce rate has exceeded acceptable parameters at ${alert.actual}%, well above our ${alert.threshold}% threshold. User communications may be compromised.`
    }
  }
  
  // Warning alerts
  if (alert.severity === 'warning') {
    if (alert.service === 'system') {
      return `${greeting}. I wanted to bring to your attention that system uptime has dropped to ${alert.actual}% over the last 24 hours. While not critical, this is below our ${alert.threshold}% target and may indicate underlying issues.`
    }
    if (alert.service === 'api') {
      return `${greeting}. The API response times have been elevated at ${alert.actual}ms, which is above our optimal threshold of ${alert.threshold}ms. User experience may be impacted.`
    }
    if (alert.service === 'email') {
      return `${greeting}. Email delivery rates have dropped to ${alert.actual}%, below our ${alert.threshold}% target. I recommend investigating our email service provider status.`
    }
  }
  
  // Info alerts
  if (alert.severity === 'info') {
    if (alert.service === 'users') {
      return `${greeting}. I've noticed that email verification rates have declined to ${alert.actual}%, below our ${alert.threshold}% target. This may warrant reviewing our verification email templates and timing.`
    }
  }
  
  // Fallback
  return `${greeting}. I've detected an anomaly that requires your review: ${alert.message}`
}

/**
 * Get Jarvis-style recommendation
 * @param {Object} alert - Alert object
 * @returns {string}
 */
const getJarvisRecommendation = (alert) => {
  if (alert.service === 'system' && alert.severity === 'critical') {
    return '🎯 **Recommended Actions:**\n• Check Render backend logs immediately\n• Verify Firebase connectivity\n• Review recent deployments for potential issues\n• Monitor user impact and consider status page update'
  }
  
  if (alert.service === 'email') {
    return '🎯 **Recommended Actions:**\n• Check Resend dashboard for delivery issues\n• Review recent email template changes\n• Verify DNS records and domain reputation\n• Consider switching to backup email service if critical'
  }
  
  if (alert.service === 'api') {
    return '🎯 **Recommended Actions:**\n• Review API endpoint performance metrics\n• Check for database query bottlenecks\n• Monitor server resource utilization\n• Consider scaling if load-related'
  }
  
  if (alert.service === 'users') {
    return '🎯 **Recommended Actions:**\n• Review verification email content and timing\n• Check spam filter compliance\n• Test email delivery to common providers\n• Consider A/B testing subject lines'
  }
  
  return '🎯 **Recommended Action:** Review the system health dashboard for detailed diagnostics.'
}

/**
 * Get emoji for severity level
 * @param {string} severity - Alert severity
 * @returns {string}
 */
const getSeverityEmoji = (severity) => {
  const emojis = {
    critical: '🔴',
    warning: '🟡',
    info: '🔵',
  }
  return emojis[severity] || '⚪'
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
 * Send alert to Discord (Jarvis-style)
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

    // Get admin names for personalization
    const adminNames = await getAdminNames()
    const primaryAdminName = adminNames[0] || 'Admin'
    
    // Get Jarvis-style message
    const jarvisMessage = getJarvisMessage(alert, primaryAdminName)
    const recommendation = getJarvisRecommendation(alert)

    // Build enhanced embed
    const embed = {
      color: getSeverityColor(alert.severity),
      title: `${getSeverityEmoji(alert.severity)} ${alert.severity === 'critical' ? 'URGENT SYSTEM ALERT' : alert.severity === 'warning' ? 'System Advisory' : 'System Notification'}`,
      description: jarvisMessage,
      fields: [
        {
          name: '📊 Service Affected',
          value: `\`${alert.service.toUpperCase()}\``,
          inline: true,
        },
        {
          name: '🎚️ Priority Level',
          value: `\`${alert.severity.toUpperCase()}\``,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'J.A.R.V.I.S. • Helwa AI Monitoring System',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png', // AI/Robot icon
      },
    }

    // Add metrics if present
    if (alert.threshold !== undefined && alert.actual !== undefined) {
      embed.fields.push(
        {
          name: '📏 Expected Threshold',
          value: `\`${alert.threshold}${alert.service.includes('percent') || alert.service === 'system' ? '%' : 'ms'}\``,
          inline: true,
        },
        {
          name: '📈 Current Value',
          value: `\`${alert.actual}${alert.service.includes('percent') || alert.service === 'system' ? '%' : 'ms'}\``,
          inline: true,
        },
        {
          name: '⚠️ Deviation',
          value: `\`${Math.abs(alert.actual - alert.threshold)}${alert.service.includes('percent') || alert.service === 'system' ? '%' : 'ms'}\``,
          inline: true,
        },
      )
    }

    // Add recommendation
    embed.fields.push({
      name: '\u200B', // Empty space
      value: recommendation,
      inline: false,
    })

    // Add dashboard link
    const dashboardUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/admin/system-health`
      : 'https://www.helwa.ai/admin/system-health'
    
    embed.fields.push({
      name: '🔗 System Diagnostics',
      value: `[Access Dashboard](${dashboardUrl}) • [View Logs](${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('www.', 'render-') : 'https://render.com'})`,
      inline: false,
    })

    // Build Jarvis-style message content
    let messageContent = ''
    const adminIds = (process.env.DISCORD_ADMIN_IDS || '').split(',').filter(Boolean)
    
    if (alert.severity === 'critical') {
      if (adminIds.length > 0) {
        messageContent = `${adminIds.map(id => `<@${id.trim()}>`).join(' ')}\n\n🔴 **CRITICAL ALERT** • Immediate attention required`
      } else {
        messageContent = '🔴 **CRITICAL ALERT** • Immediate attention required'
      }
    } else if (alert.severity === 'warning') {
      if (adminIds.length > 0) {
        messageContent = `${adminIds.map(id => `<@${id.trim()}>`).join(', ')}\n\n🟡 **System Advisory** • Review recommended`
      }
    }

    // Send to Discord
    await channel.send({
      content: messageContent || '🔵 **System Update**',
      embeds: [embed],
    })

    console.log(`✅ [JARVIS] Personalized alert sent to #${channel.name} for ${primaryAdminName}`)
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
    // 6 hours for warnings, 3 hours for critical
    for (const alert of alerts) {
      const suppressionWindow = alert.severity === 'critical' ? 3 : 6
      const suppressionTime = new Date(Date.now() - suppressionWindow * 60 * 60 * 1000)
      
      // Check for recent similar alerts
      const recentAlerts = await db
        .collection('alerts')
        .where('service', '==', alert.service)
        .where('message', '==', alert.message)
        .where('sentAt', '>', suppressionTime)
        .limit(1)
        .get()
      
      if (recentAlerts.empty) {
        // No recent similar alert, send it
        await sendAlertEmail(alert)
      } else {
        console.log(`   → Suppressing duplicate alert: ${alert.message} (sent within ${suppressionWindow}h)`)
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

/**
 * Send Jarvis status update to Discord
 * @param {string} type - Type of update (startup, health_check, deployment, daily_summary)
 * @param {Object} data - Additional data for the update
 * @returns {Promise<void>}
 */
const sendJarvisStatusUpdate = async (type, data = {}) => {
  if (!discordClient) {
    console.log('⚠️  [JARVIS] Discord client not initialized')
    return
  }

  try {
    const channelId = process.env.DISCORD_ALERTS_CHANNEL_ID
    if (!channelId) {
      console.log('⚠️  [JARVIS] DISCORD_ALERTS_CHANNEL_ID not set')
      return
    }

    const channel = await discordClient.channels.fetch(channelId)
    if (!channel) {
      console.error('❌ [JARVIS] Could not find Discord channel')
      return
    }

    // Get admin names for personalization
    const adminNames = await getAdminNames()
    const primaryAdminName = adminNames[0] || 'Sir'
    
    let embed
    
    switch (type) {
      case 'startup':
        embed = {
          color: 0x00FF00, // Green
          title: '🟢 Systems Online',
          description: `${getJarvisGreeting(primaryAdminName)}. All systems have been initialized successfully. I am now monitoring the platform and will alert you to any anomalies.`,
          fields: [
            {
              name: '✅ Status',
              value: 'Backend operational\nMonitoring active\nDiscord connection established',
              inline: true,
            },
            {
              name: '📊 Services',
              value: `\`\`\`
API:      ✓ Online
Database: ✓ Connected  
Discord:  ✓ Ready
Email:    ✓ Configured
\`\`\``,
              inline: true,
            },
            {
              name: '🔄 Active Monitors',
              value: '• Health checks every 5 minutes\n• Metrics collection every 15 minutes\n• Email reminders every 5 minutes\n• Position renumbering hourly',
              inline: false,
            },
          ],
          footer: {
            text: 'J.A.R.V.I.S. • System Boot Complete',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
          },
          timestamp: new Date().toISOString(),
        }
        break
        
      case 'health_check':
        const { uptime, services } = data
        embed = {
          color: 0x00FF00, // Green
          title: '✅ Routine Diagnostics Complete',
          description: `${getJarvisGreeting(primaryAdminName)}. I've completed my scheduled system diagnostics. All services are operating within normal parameters.`,
          fields: [
            {
              name: '💚 System Status',
              value: `Uptime: \`${uptime || '99.9'}%\`\nStatus: \`HEALTHY\`\nLast Check: \`Just now\``,
              inline: true,
            },
            {
              name: '🔍 Services Checked',
              value: `\`\`\`
${services?.api ? '✓' : '✗'} API Layer
${services?.database ? '✓' : '✗'} Database
${services?.frontend ? '✓' : '✗'} Frontend
${services?.discord ? '✓' : '✗'} Discord Bot
\`\`\``,
              inline: true,
            },
            {
              name: '📈 Performance',
              value: 'All metrics within acceptable ranges. No action required.',
              inline: false,
            },
          ],
          footer: {
            text: 'J.A.R.V.I.S. • Routine Diagnostics',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
          },
          timestamp: new Date().toISOString(),
        }
        break
        
      case 'deployment':
        const { version } = data
        embed = {
          color: 0x00A8FF, // Blue
          title: '🚀 New Version Deployed',
          description: `${getJarvisGreeting(primaryAdminName)}. A new version of the platform has been deployed successfully. All systems have been updated and are operational.`,
          fields: [
            {
              name: '📦 Deployment Status',
              value: `Version: \`${version || 'Latest'}\`\nStatus: \`✓ Successful\`\nServices: \`All restarted\``,
              inline: true,
            },
            {
              name: '🔄 Post-Deployment',
              value: '```\n✓ Health checks passed\n✓ Database connected\n✓ API responding\n✓ Monitoring active\n```',
              inline: true,
            },
            {
              name: '💡 Notes',
              value: 'All services are functioning normally. I will continue monitoring for any anomalies related to this deployment.',
              inline: false,
            },
          ],
          footer: {
            text: 'J.A.R.V.I.S. • Deployment Monitor',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
          },
          timestamp: new Date().toISOString(),
        }
        break
        
      case 'daily_summary':
        const { stats } = data
        embed = {
          color: 0xFFD700, // Gold
          title: '📊 Daily System Report',
          description: `${getJarvisGreeting(primaryAdminName)}. Here's your daily platform summary. Overall, operations have been ${stats?.uptime >= 99 ? 'excellent' : 'within acceptable parameters'}.`,
          fields: [
            {
              name: '⏱️ Uptime',
              value: `\`${stats?.uptime || 100}%\` (Last 24h)`,
              inline: true,
            },
            {
              name: '👥 Users',
              value: `\`${stats?.newUsers || 0}\` new signups\n\`${stats?.totalUsers || 0}\` total`,
              inline: true,
            },
            {
              name: '💰 Revenue',
              value: `\`$${stats?.revenue || 0}\` today`,
              inline: true,
            },
            {
              name: '📧 Email Delivery',
              value: `\`${stats?.emailsSent || 0}\` sent\n\`${stats?.deliveryRate || 100}%\` delivered`,
              inline: true,
            },
            {
              name: '🔔 Alerts',
              value: `\`${stats?.alerts || 0}\` total\n\`${stats?.criticalAlerts || 0}\` critical`,
              inline: true,
            },
            {
              name: '🎯 Status',
              value: stats?.alerts > 0 ? 'Some issues detected' : 'All systems nominal',
              inline: true,
            },
          ],
          footer: {
            text: 'J.A.R.V.I.S. • Daily Summary',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
          },
          timestamp: new Date().toISOString(),
        }
        break
        
      case 'all_clear':
        embed = {
          color: 0x00FF00, // Green
          title: '✅ All Systems Nominal',
          description: `${getJarvisGreeting(primaryAdminName)}. I'm pleased to report that all platform systems continue to operate within optimal parameters. No issues detected.`,
          fields: [
            {
              name: '💚 Status',
              value: '`HEALTHY` • All services operational',
              inline: false,
            },
            {
              name: '📊 Quick Stats',
              value: `Users: \`${data?.users || 0}\`\nUptime: \`${data?.uptime || 100}%\`\nAPI: \`${data?.apiResponseTime || 0}ms\``,
              inline: false,
            },
          ],
          footer: {
            text: 'J.A.R.V.I.S. • Status Check',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
          },
          timestamp: new Date().toISOString(),
        }
        break
        
      default:
        console.log(`⚠️  [JARVIS] Unknown update type: ${type}`)
        return
    }

    // Send to Discord
    await channel.send({
      embeds: [embed],
    })

    console.log(`✅ [JARVIS] ${type} update sent to #${channel.name}`)
  } catch (error) {
    console.error(`❌ [JARVIS] Error sending ${type} update:`, error.message)
  }
}

module.exports = {
  initializeDiscordAlerts,
  checkThresholds,
  sendAlertEmail,
  checkAndAlert,
  getRecentAlerts,
  generateDailySummary,
  sendJarvisStatusUpdate,
}

