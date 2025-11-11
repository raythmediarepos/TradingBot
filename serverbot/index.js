require('dotenv').config()
const cron = require('node-cron')
const { initializeFirebase } = require('./config/firebase-admin')
const { initializeBot, collectAnalytics } = require('./services/discordAnalyticsCollector')
const { runAllHealthChecks } = require('./services/healthCheck')
const { collectAndStoreMetrics } = require('./services/metricsCollector')
const { checkAndAlert, generateDailySummary } = require('./services/alertService')

// ============================================
// SERVERBOT - Monitoring & Analytics Service
// ============================================

console.log('')
console.log('═'.repeat(60))
console.log('🚀 [SERVERBOT] Starting Helwa AI Monitoring Service')
console.log('═'.repeat(60))
console.log('📊 Functions:')
console.log('   • Health Checks: Every 5 minutes')
console.log('   • Metrics Collection: Every 15 minutes')
console.log('   • Alert Monitoring: Every 15 minutes')
console.log('   • Discord Analytics: Every 6 hours')
console.log('   • Daily Summary: Once per day (midnight)')
console.log('💾 Storage: Firebase')
console.log('🔄 Mode: Run immediately + scheduled')
console.log('💰 Cost: Completely FREE!')
console.log('═'.repeat(60))
console.log('')

// Initialize Firebase
console.log('🔧 [SERVERBOT] Initializing Firebase Admin...')
try {
  initializeFirebase()
  console.log('✅ [SERVERBOT] Firebase initialized successfully')
} catch (error) {
  console.error('❌ [SERVERBOT] Failed to initialize Firebase:', error)
  process.exit(1)
}

// Track if tasks are running
let isCollectingAnalytics = false
let isRunningHealthCheck = false
let isCollectingMetrics = false

/**
 * Run Discord analytics collection
 */
const runAnalyticsCollection = async () => {
  if (isCollectingAnalytics) {
    console.log('⚠️  [ANALYTICS] Collection already in progress, skipping...')
    return
  }

  isCollectingAnalytics = true
  const startTime = Date.now()

  try {
    console.log('')
    console.log('═'.repeat(60))
    console.log(`📊 [ANALYTICS] Starting Discord analytics collection`)
    console.log(`🕐 [ANALYTICS] Started at: ${new Date().toLocaleString()}`)
    console.log('═'.repeat(60))

    await collectAnalytics()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('═'.repeat(60))
    console.log(`✅ [ANALYTICS] Collection completed in ${duration}s`)
    console.log('═'.repeat(60))
    console.log('')
  } catch (error) {
    console.error('❌ [ANALYTICS] Collection failed:', error)
    console.log('')
  } finally {
    isCollectingAnalytics = false
  }
}

/**
 * Run health checks
 */
const runHealthChecks = async () => {
  if (isRunningHealthCheck) {
    return
  }

  isRunningHealthCheck = true

  try {
    await runAllHealthChecks()
  } catch (error) {
    console.error('❌ [HEALTH] Health check failed:', error)
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
    const admin = require('firebase-admin')
    const db = admin.firestore()
    const healthSnapshot = await db
      .collection('healthChecks')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    const latestHealth = healthSnapshot.empty ? null : healthSnapshot.docs[0].data()
    
    // Check for alerts
    await checkAndAlert(metrics, latestHealth)
  } catch (error) {
    console.error('❌ [METRICS] Metrics/alerts failed:', error)
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
    console.log(`📧 [SUMMARY] Generating daily summary`)
    console.log('═'.repeat(60))
    
    await generateDailySummary()
    
    console.log('═'.repeat(60))
    console.log(`✅ [SUMMARY] Daily summary complete`)
    console.log('═'.repeat(60))
    console.log('')
  } catch (error) {
    console.error('❌ [SUMMARY] Daily summary failed:', error)
  }
}

/**
 * Get next run time formatted
 */
const getNextRunTime = () => {
  const next = new Date()
  next.setHours(next.getHours() + 6)
  return next.toLocaleString()
}

/**
 * Main startup function
 */
const start = async () => {
  try {
    // Step 1: Initialize Discord bot
    console.log('═'.repeat(60))
    console.log('🤖 [SERVERBOT] Step 1: Initializing Discord Bot')
    console.log('═'.repeat(60))
    await initializeBot()
    console.log('✅ [SERVERBOT] Discord bot ready')
    console.log('')

    // Step 2: Run initial checks
    console.log('═'.repeat(60))
    console.log('🚀 [SERVERBOT] Step 2: Running Initial Checks')
    console.log('═'.repeat(60))
    console.log('⚡ [SERVERBOT] Running health checks...')
    await runHealthChecks()
    console.log('⚡ [SERVERBOT] Collecting metrics...')
    await runMetricsAndAlerts()
    console.log('⚡ [SERVERBOT] Collecting Discord analytics...')
    await runAnalyticsCollection()
    console.log('')

    // Step 3: Set up cron schedules
    console.log('═'.repeat(60))
    console.log('⏰ [SERVERBOT] Step 3: Activating Schedulers')
    console.log('═'.repeat(60))
    
    // Health checks every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      runHealthChecks()
    })
    console.log('✅ Scheduled: Health checks (every 5 minutes)')
    
    // Metrics collection every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      runMetricsAndAlerts()
    })
    console.log('✅ Scheduled: Metrics & alerts (every 15 minutes)')
    
    // Discord analytics every 6 hours
    cron.schedule('0 */6 * * *', () => {
      runAnalyticsCollection()
    })
    console.log('✅ Scheduled: Discord analytics (every 6 hours)')
    
    // Daily summary at midnight
    cron.schedule('0 0 * * *', () => {
      runDailySummary()
    })
    console.log('✅ Scheduled: Daily summary (midnight)')
    
    console.log('')
    console.log('═'.repeat(60))
    console.log('🎉 [SERVERBOT] All systems operational!')
    console.log('═'.repeat(60))
    console.log('💡 [SERVERBOT] The monitoring service is now running 24/7')
    console.log('')
    console.log('📊 Active Monitors:')
    console.log('   → Health checks every 5 minutes')
    console.log('   → Metrics collection every 15 minutes')
    console.log('   → Discord analytics every 6 hours')
    console.log('   → Daily summaries at midnight')
    console.log('')
    console.log('💾 Data Storage:')
    console.log('   → Firebase collections: healthChecks, systemMetrics, alerts')
    console.log('   → View in admin panel: /admin/system-health')
    console.log('')
    console.log('💰 Cost: Completely FREE!')
    console.log('   → No external services required')
    console.log('   → Using existing Firebase & Resend')
    console.log('')
    console.log('🛑 Press Ctrl+C to stop the serverbot')
    console.log('═'.repeat(60))
    console.log('')

  } catch (error) {
    console.error('═'.repeat(60))
    console.error('❌ [SERVERBOT] Startup failed!')
    console.error('═'.repeat(60))
    console.error(error)
    console.error('')
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('')
  console.log('⏹️  [SERVERBOT] Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('')
  console.log('⏹️  [SERVERBOT] Shutting down gracefully...')
  process.exit(0)
})

// Start the serverbot
start()

