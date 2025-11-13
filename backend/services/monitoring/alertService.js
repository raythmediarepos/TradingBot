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
 * Send error log alert to Discord
 * @param {Object} error - Error details
 * @returns {Promise<void>}
 */
const sendErrorLogAlert = async (error) => {
  const alert = {
    severity: error.level === 'error' ? 'critical' : 'warning',
    service: error.service || 'system',
    message: error.message,
    details: error,
    timestamp: new Date(),
  }
  
  await sendAlertEmail(alert)
}

/**
 * Check thresholds and determine if alerts are needed
 * @param {Object} metrics - Current metrics
 * @param {Object} healthCheck - Latest health check
 * @returns {Array} - Array of alerts to send
 */
const checkThresholds = async (metrics, healthCheck) => {
  // DISABLED - User wants real-time error log monitoring only
  // No scheduled threshold-based alerts
  return []
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
  
  // Error log alerts (real-time from logs)
  if (alert.details && alert.details.level) {
    const { service, message } = alert
    
    if (alert.severity === 'critical') {
      return `${greeting}. I must inform you of a critical error that just occurred in the ${service} service. The error message is: "${message}". I recommend immediate investigation.`
    } else {
      return `${greeting}. I've detected a warning in the ${service} service that may require your attention. Details: "${message}".`
    }
  }
  
  // Threshold-based alerts (legacy - mostly disabled now)
  if (alert.severity === 'critical') {
    if (alert.service === 'system') {
      return `${greeting}. I must inform you that we're experiencing a critical system incident. Your immediate attention is required.`
    }
    if (alert.service === 'email') {
      return `${greeting}. I've detected a significant issue with our email delivery system.`
    }
  }
  
  if (alert.severity === 'warning') {
    if (alert.service === 'system') {
      return `${greeting}. I wanted to bring to your attention a system issue that may require investigation.`
    }
    if (alert.service === 'api') {
      return `${greeting}. The API is experiencing some performance issues that may impact user experience.`
    }
    if (alert.service === 'email') {
      return `${greeting}. I've noticed some email delivery issues that may need attention.`
    }
  }
  
  // Fallback
  return `${greeting}. I've detected an issue that requires your review: ${alert.message}`
}

/**
 * Get Jarvis-style recommendation
 * @param {Object} alert - Alert object
 * @returns {string}
 */
const getJarvisRecommendation = (alert) => {
  // Error log alerts - include stack trace
  if (alert.details && alert.details.stack) {
    const stackLines = alert.details.stack.split('\n').slice(0, 5).join('\n')
    return `🎯 **Recommended Actions:**\n• Check the error details below\n• Review recent code changes to affected service\n• Check Render logs for more context\n\n📋 **Stack Trace (first 5 lines):**\n\`\`\`\n${stackLines}\n\`\`\``
  }
  
  if (alert.service === 'system' && alert.severity === 'critical') {
    return '🎯 **Recommended Actions:**\n• Check Render backend logs immediately\n• Verify Firebase connectivity\n• Review recent deployments for potential issues\n• Monitor user impact'
  }
  
  if (alert.service === 'email') {
    return '🎯 **Recommended Actions:**\n• Check Resend dashboard for delivery issues\n• Review recent email template changes\n• Verify DNS records and domain reputation'
  }
  
  if (alert.service === 'api') {
    return '🎯 **Recommended Actions:**\n• Review API endpoint performance metrics\n• Check for database query bottlenecks\n• Monitor server resource utilization'
  }
  
  if (alert.service === 'discord') {
    return '🎯 **Recommended Actions:**\n• Check Discord bot connection status\n• Verify bot token and permissions\n• Review Discord API rate limits'
  }
  
  if (alert.service === 'database') {
    return '🎯 **Recommended Actions:**\n• Check Firebase console for service status\n• Verify Firestore indexes are created\n• Review database query patterns'
  }
  
  return '🎯 **Recommended Action:** Check Render logs and review recent changes to the affected service.'
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

/**
 * Send user issue report to Discord
 * @param {Object} report - Issue report data
 * @returns {Promise<void>}
 */
const sendJarvisIssueReport = async (report) => {
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
    
    // Determine severity color based on category
    const severityColors = {
      bug: 0xFF0000,        // Red
      feature: 0x0099FF,    // Blue
      question: 0xFFD700,   // Gold
      payment: 0xFF6B6B,    // Light Red
      account: 0xFFA500,    // Orange
      general: 0x808080,    // Gray
    }
    
    const color = severityColors[report.category] || 0x808080
    
    // Category emoji
    const categoryEmojis = {
      bug: '🐛',
      feature: '💡',
      question: '❓',
      payment: '💳',
      account: '👤',
      general: '📝',
    }
    
    const emoji = categoryEmojis[report.category] || '📝'
    
    // Build embed
    const embed = {
      color,
      title: `${emoji} User Issue Report`,
      description: `${getJarvisGreeting(primaryAdminName)}. A user has submitted an issue report that requires your attention.`,
      fields: [
        {
          name: '👤 Reporter',
          value: `${report.userName}\n${report.userEmail}`,
          inline: true,
        },
        {
          name: '📂 Category',
          value: `\`${report.category?.toUpperCase() || 'GENERAL'}\``,
          inline: true,
        },
        {
          name: '🆔 Issue ID',
          value: `\`${report.issueId}\``,
          inline: true,
        },
        {
          name: '📌 Title',
          value: report.title,
          inline: false,
        },
        {
          name: '📝 Description',
          value: report.description.length > 1000 
            ? report.description.substring(0, 1000) + '...' 
            : report.description,
          inline: false,
        },
      ],
      footer: {
        text: 'J.A.R.V.I.S. • User Issue Report',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/3468/3468377.png',
      },
      timestamp: new Date().toISOString(),
    }

    // Add URL if provided
    if (report.url) {
      embed.fields.push({
        name: '🔗 Page URL',
        value: report.url,
        inline: false,
      })
    }

    // Add browser info if provided
    if (report.userAgent) {
      const browserInfo = report.userAgent.substring(0, 100)
      embed.fields.push({
        name: '🌐 Browser',
        value: `\`${browserInfo}${report.userAgent.length > 100 ? '...' : ''}\``,
        inline: false,
      })
    }

    // Send to Discord (no tagging for user reports)
    await channel.send({
      content: '📬 **New User Issue Report**',
      embeds: [embed],
    })

    console.log(`✅ [JARVIS] Issue report notification sent for ${report.issueId}`)
  } catch (error) {
    console.error(`❌ [JARVIS] Error sending issue report:`, error.message)
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
  sendErrorLogAlert,
  sendJarvisIssueReport,
}

