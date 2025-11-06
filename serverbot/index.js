require('dotenv').config()
const cron = require('node-cron')
const { initializeFirebase } = require('./config/firebase-admin')
const { initializeBot, collectAnalytics } = require('./services/discordAnalyticsCollector')

// ============================================
// SERVERBOT - Discord Analytics Collector
// ============================================

console.log('')
console.log('═'.repeat(60))
console.log('🚀 [SERVERBOT] Starting Helwa AI Analytics Collector')
console.log('═'.repeat(60))
console.log('⏰ Schedule: Every 6 hours (cron: 0 */6 * * *)')
console.log('📊 Target: Discord server analytics')
console.log('💾 Storage: Firebase (serverAnalytics/discord)')
console.log('🔄 Mode: Run immediately + scheduled')
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

// Track if collection is running
let isCollecting = false

/**
 * Run analytics collection
 */
const runCollection = async () => {
  if (isCollecting) {
    console.log('⚠️  [SERVERBOT] Collection already in progress, skipping...')
    return
  }

  isCollecting = true
  const startTime = Date.now()

  try {
    console.log('')
    console.log('═'.repeat(60))
    console.log(`📊 [SERVERBOT] Starting analytics collection`)
    console.log(`🕐 [SERVERBOT] Started at: ${new Date().toLocaleString()}`)
    console.log('═'.repeat(60))

    await collectAnalytics()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('═'.repeat(60))
    console.log(`✅ [SERVERBOT] Collection completed in ${duration}s`)
    console.log(`🕐 [SERVERBOT] Next run: ${getNextRunTime()}`)
    console.log('═'.repeat(60))
    console.log('')
  } catch (error) {
    console.error('❌ [SERVERBOT] Collection failed:', error)
    console.log('')
  } finally {
    isCollecting = false
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
    // Initialize Discord bot
    console.log('═'.repeat(60))
    console.log('🤖 [SERVERBOT] Step 1: Initializing Discord Bot')
    console.log('═'.repeat(60))
    await initializeBot()
    console.log('✅ [SERVERBOT] Discord bot ready')
    console.log('')

    // Run immediately on startup
    console.log('═'.repeat(60))
    console.log('🚀 [SERVERBOT] Step 2: Running Initial Collection')
    console.log('═'.repeat(60))
    console.log('⚡ [SERVERBOT] This will collect all analytics data now...')
    console.log('')
    await runCollection()

    // Schedule to run every 6 hours
    // Cron pattern: 0 */6 * * * = At minute 0 past every 6th hour
    console.log('═'.repeat(60))
    console.log('⏰ [SERVERBOT] Step 3: Activating Scheduler')
    console.log('═'.repeat(60))
    cron.schedule('0 */6 * * *', () => {
      runCollection()
    })

    console.log('✅ [SERVERBOT] Scheduler active - will run every 6 hours')
    console.log(`📅 [SERVERBOT] Next scheduled run: ${getNextRunTime()}`)
    console.log('💡 [SERVERBOT] The serverbot is now running in the background')
    console.log('   → Analytics will update automatically every 6 hours')
    console.log('   → Data is stored in Firebase: serverAnalytics/discord')
    console.log('   → View data at: /admin/analytics')
    console.log('')
    console.log('🛑 [SERVERBOT] Press Ctrl+C to stop the serverbot')
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

