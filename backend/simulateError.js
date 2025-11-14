/**
 * Simulate Production Error
 * Creates a realistic error in Firebase and triggers AI analysis
 */

require('dotenv').config()
require('./config/firebase-admin')
const { admin, db } = require('./config/firebase-admin')
const { runIntelligentLogAnalysis } = require('./services/monitoring/intelligentLogMonitor')
const { getClient } = require('./services/discordBotService')
const { initializeDiscordAlerts } = require('./services/monitoring/alertService')

async function simulateError() {
  try {
    console.log('')
    console.log('🧪 SIMULATING PRODUCTION ERROR')
    console.log('═'.repeat(60))
    console.log('')
    
    // Create a realistic error
    const errorTypes = [
      {
        level: 'critical',
        service: 'payments',
        message: 'Payment processing failed: Card declined',
        stack: 'Error: Payment failed\n    at processPayment (stripe.js:45)\n    at checkout (routes/checkout.js:123)',
      },
      {
        level: 'error',
        service: 'database',
        message: 'Database connection timeout after 30 seconds',
        stack: 'Error: Connection timeout\n    at connectDB (firebase.js:89)\n    at startup (server.js:12)',
      },
      {
        level: 'critical',
        service: 'email',
        message: 'Failed to send verification email to user@example.com',
        stack: 'Error: Email delivery failed\n    at sendEmail (resend.js:34)\n    at verifyUser (auth.js:67)',
      },
    ]
    
    // Pick a random error type
    const testError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    
    console.log('📝 Creating test error in Firebase...')
    console.log(`   → Severity: ${testError.level}`)
    console.log(`   → Service: ${testError.service}`)
    console.log(`   → Message: ${testError.message}`)
    console.log('')
    
    // Add to Firebase
    await db.collection('errorLogs').add({
      ...testError,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    console.log('✅ Error created in Firebase')
    console.log('')
    console.log('⏳ Waiting 3 seconds...')
    console.log('')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('🧠 RUNNING AI ANALYSIS')
    console.log('═'.repeat(60))
    console.log('')
    
    // Initialize Discord for alerts
    console.log('⏳ Initializing Discord bot...')
    await new Promise(resolve => setTimeout(resolve, 8000))
    
    const discordClient = getClient()
    if (discordClient) {
      initializeDiscordAlerts(discordClient)
      console.log('✅ Discord alerts initialized')
    } else {
      console.log('⚠️  Discord not ready (will store in Firebase)')
    }
    console.log('')
    
    // Run the intelligent monitor
    await runIntelligentLogAnalysis()
    
    console.log('')
    console.log('═'.repeat(60))
    console.log('✅ SIMULATION COMPLETE')
    console.log('═'.repeat(60))
    console.log('')
    console.log('📱 Check your Discord #system-alerts channel!')
    console.log('')
    console.log('Expected alert:')
    console.log(`   🔴 ${testError.level.toUpperCase()} - ${testError.service}`)
    console.log(`   Message: ${testError.message}`)
    console.log('')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during simulation:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

simulateError()

