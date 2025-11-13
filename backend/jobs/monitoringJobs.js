const cron = require('node-cron')
const { runAllHealthChecks } = require('../services/monitoring/healthCheck')
const { collectAndStoreMetrics } = require('../services/monitoring/metricsCollector')
const { initializeDiscordAlerts, checkAndAlert, generateDailySummary, sendJarvisStatusUpdate } = require('../services/monitoring/alertService')
const { getClient } = require('../services/discordBotService')
const { admin, db } = require('../config/firebase-admin')

// Track if tasks are running
let isRunningHealthCheck = false
let isCollectingMetrics = false

/**
 * Run health checks
 */
const runHealthChecks = async () => {
  if (isRunningHealthCheck) {
    return
  }

  isRunningHealthCheck = true

  try {
    const healthCheck = await runAllHealthChecks()
    
    // Send Jarvis update if everything is healthy (once every 6 hours)
    if (healthCheck && healthCheck.overall === 'healthy') {
      const lastJarvisUpdate = global.__lastJarvisHealthUpdate || 0
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000)
      
      if (lastJarvisUpdate < sixHoursAgo) {
        // Get uptime from recent health checks
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const healthSnapshot = await db
          .collection('healthChecks')
          .where('timestamp', '>', oneDayAgo)
          .get()
        
        const totalChecks = healthSnapshot.size
        const healthyChecks = healthSnapshot.docs.filter(
          doc => doc.data().overall === 'healthy'
        ).length
        const uptime = totalChecks > 0 ? ((healthyChecks / totalChecks) * 100).toFixed(1) : 100
        
        await sendJarvisStatusUpdate('health_check', {
          uptime,
          services: {
            api: healthCheck.services?.api?.healthy,
            database: healthCheck.services?.database?.healthy,
            frontend: healthCheck.services?.frontend?.healthy,
            discord: healthCheck.services?.discordBot?.healthy,
          },
        })
        
        global.__lastJarvisHealthUpdate = Date.now()
      }
    }
  } catch (error) {
    console.error('❌ [MONITORING] Health check failed:', error)
  } finally {
    isRunningHealthCheck = false
  }
}

/**
 * Run metrics collection and alerting
 */
const runMetricsAndAlerts = async () => {
  if (isCollectingMetrics) {
    return
  }

  isCollectingMetrics = true

  try {
    // Collect metrics
    const metrics = await collectAndStoreMetrics()
    
    // Get latest health check
    const healthSnapshot = await db
      .collection('healthChecks')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    const latestHealth = healthSnapshot.empty ? null : healthSnapshot.docs[0].data()
    
    // Check for alerts
    await checkAndAlert(metrics, latestHealth)
  } catch (error) {
    console.error('❌ [MONITORING] Metrics/alerts failed:', error)
  } finally {
    isCollectingMetrics = false
  }
}

/**
 * Run daily summary
 */
const runDailySummary = async () => {
  try {
    console.log('')
    console.log('═'.repeat(60))
    console.log(`📧 [MONITORING] Generating daily summary`)
    console.log('═'.repeat(60))
    
    const summary = await generateDailySummary()
    
    // Send Jarvis daily summary
    if (summary) {
      await sendJarvisStatusUpdate('daily_summary', {
        stats: {
          uptime: parseFloat(summary.uptime) || 100,
          newUsers: summary.metrics?.newSignups || 0,
          totalUsers: summary.metrics?.activeUsers || 0,
          revenue: summary.metrics?.revenueToday || 0,
          emailsSent: summary.metrics?.emailsSent || 0,
          deliveryRate: summary.metrics?.emailDeliveryRate || 100,
          alerts: summary.totalAlerts || 0,
          criticalAlerts: summary.criticalAlerts || 0,
        },
      })
    }
    
    console.log('═'.repeat(60))
    console.log(`✅ [MONITORING] Daily summary complete`)
    console.log('═'.repeat(60))
    console.log('')
  } catch (error) {
    console.error('❌ [MONITORING] Daily summary failed:', error)
  }
}

/**
 * Initialize all monitoring jobs
 */
const initializeMonitoringJobs = () => {
  console.log('')
  console.log('═'.repeat(60))
  console.log('📊 [MONITORING] Initializing monitoring system...')
  console.log('═'.repeat(60))
  
  // Initialize Discord alerts
  try {
    const discordClient = getClient()
    if (discordClient) {
      initializeDiscordAlerts(discordClient)
      console.log('   ✅ Discord alerts enabled')
    } else {
      console.log('   ⚠️  Discord bot not available - alerts will be Firebase only')
    }
  } catch (error) {
    console.log('   ⚠️  Discord bot not available - alerts will be Firebase only')
  }
  
  // Run initial checks
  console.log('⚡ [MONITORING] Running initial health check...')
  runHealthChecks()
  
  console.log('⚡ [MONITORING] Running initial metrics collection...')
  setTimeout(() => runMetricsAndAlerts(), 30000) // Run after 30 seconds
  
  console.log('')
  console.log('⏰ [MONITORING] Setting up scheduled tasks:')
  
  // Health checks every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    runHealthChecks()
  })
  console.log('   ✅ Health checks: Every 30 minutes')
  
  // Metrics collection every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    runMetricsAndAlerts()
  })
  console.log('   ✅ Metrics & alerts: Every 30 minutes')
  
  // Daily summary at midnight
  cron.schedule('0 0 * * *', () => {
    runDailySummary()
  })
  console.log('   ✅ Daily summary: Midnight')
  
  console.log('')
  console.log('💡 [MONITORING] Monitoring system active!')
  console.log('   → Health checks: Every 30 minutes')
  console.log('   → Metrics & alerts: Every 30 minutes')
  console.log('   → Daily summaries: Midnight')
  console.log('   → Data stored in Firebase')
  console.log('   → View at: /admin/system-health')
  console.log('   → Cost: $0 (integrated with backend)')
  console.log('═'.repeat(60))
  console.log('')
  
  // Send Jarvis startup notification after a delay (wait for Discord bot to be ready)
  setTimeout(async () => {
    try {
      await sendJarvisStatusUpdate('startup')
      console.log('✅ [JARVIS] Startup notification sent')
    } catch (error) {
      console.error('⚠️  [JARVIS] Could not send startup notification:', error.message)
    }
  }, 5000) // 5 second delay
}

module.exports = {
  initializeMonitoringJobs,
  runHealthChecks,
  runMetricsAndAlerts,
  runDailySummary,
}

