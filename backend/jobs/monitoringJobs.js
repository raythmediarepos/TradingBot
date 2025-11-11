const cron = require('node-cron')
const { runAllHealthChecks } = require('../services/monitoring/healthCheck')
const { collectAndStoreMetrics } = require('../services/monitoring/metricsCollector')
const { checkAndAlert, generateDailySummary } = require('../services/monitoring/alertService')
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
    await runAllHealthChecks()
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
    
    await generateDailySummary()
    
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
  
  // Run initial checks
  console.log('⚡ [MONITORING] Running initial health check...')
  runHealthChecks()
  
  console.log('⚡ [MONITORING] Running initial metrics collection...')
  setTimeout(() => runMetricsAndAlerts(), 30000) // Run after 30 seconds
  
  console.log('')
  console.log('⏰ [MONITORING] Setting up scheduled tasks:')
  
  // Health checks every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    runHealthChecks()
  })
  console.log('   ✅ Health checks: Every 5 minutes')
  
  // Metrics collection every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runMetricsAndAlerts()
  })
  console.log('   ✅ Metrics & alerts: Every 15 minutes')
  
  // Daily summary at midnight
  cron.schedule('0 0 * * *', () => {
    runDailySummary()
  })
  console.log('   ✅ Daily summary: Midnight')
  
  console.log('')
  console.log('💡 [MONITORING] Monitoring system active!')
  console.log('   → Health checks: Every 5 minutes')
  console.log('   → Metrics & alerts: Every 15 minutes')
  console.log('   → Daily summaries: Midnight')
  console.log('   → Data stored in Firebase')
  console.log('   → View at: /admin/system-health')
  console.log('   → Cost: $0 (integrated with backend)')
  console.log('═'.repeat(60))
  console.log('')
}

module.exports = {
  initializeMonitoringJobs,
  runHealthChecks,
  runMetricsAndAlerts,
  runDailySummary,
}

