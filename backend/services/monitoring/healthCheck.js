const axios = require('axios')
const { admin, db } = require('../../config/firebase-admin')

// Environment variables
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

/**
 * Check if API is responding
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Object>}
 */
const checkEndpoint = async (url, timeout = 5000) => {
  const startTime = Date.now()
  
  try {
    const response = await axios.get(url, {
      timeout,
      validateStatus: (status) => status < 500, // Accept anything below 500
    })
    
    const responseTime = Date.now() - startTime
    
    return {
      success: true,
      status: response.status,
      responseTime,
      healthy: response.status === 200,
      timestamp: new Date(),
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      success: false,
      status: error.response?.status || 0,
      responseTime,
      healthy: false,
      error: error.message,
      timestamp: new Date(),
    }
  }
}

/**
 * Check API health (internal checks - no HTTP calls to avoid circular dependency)
 * @returns {Promise<Object>}
 */
const checkAPIHealth = async () => {
  console.log('🏥 [HEALTH CHECK] Checking API health...')
  
  const startTime = Date.now()
  
  try {
    // Internal health check - verify API can access Firebase
    await db.collection('healthChecks').limit(1).get()
    
    const responseTime = Date.now() - startTime
    
    console.log(`   → API Internal: ✅ (${responseTime}ms)`)
    
    return {
      service: 'api',
      healthy: true,
      responseTime,
      message: 'API is operational',
      timestamp: new Date(),
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error(`   → API Internal: ❌ (${error.message})`)
    
    return {
      service: 'api',
      healthy: false,
      responseTime,
      error: error.message,
      timestamp: new Date(),
    }
  }
}

/**
 * Check Frontend health
 * @returns {Promise<Object>}
 */
const checkFrontendHealth = async () => {
  console.log('🏥 [HEALTH CHECK] Checking Frontend health...')
  
  const result = await checkEndpoint(FRONTEND_URL)
  
  console.log(`   → Frontend: ${result.healthy ? '✅' : '❌'} (${result.responseTime}ms)`)
  
  return {
    service: 'frontend',
    healthy: result.healthy,
    status: result.status,
    responseTime: result.responseTime,
    timestamp: new Date(),
  }
}

/**
 * Check Database health
 * @returns {Promise<Object>}
 */
const checkDatabaseHealth = async () => {
  console.log('🏥 [HEALTH CHECK] Checking Database health...')
  
  const startTime = Date.now()
  
  try {
    // Try to read a document from Firebase
    await db.collection('betaUsers').limit(1).get()
    
    const responseTime = Date.now() - startTime
    
    console.log(`   → Database: ✅ (${responseTime}ms)`)
    
    return {
      service: 'database',
      healthy: true,
      responseTime,
      timestamp: new Date(),
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error(`   → Database: ❌ (${error.message})`)
    
    return {
      service: 'database',
      healthy: false,
      responseTime,
      error: error.message,
      timestamp: new Date(),
    }
  }
}

/**
 * Check Discord Bot health
 * @returns {Promise<Object>}
 */
const checkDiscordBotHealth = async () => {
  console.log('🏥 [HEALTH CHECK] Checking Discord Bot health...')
  
  try {
    // Import Discord bot service to check if bot is connected
    const { isBotReady } = require('../discordBotService')
    
    const botReady = isBotReady()
    
    console.log(`   → Discord Bot: ${botReady ? '✅' : '⚠️'} ${botReady ? 'Connected' : 'Not connected'}`)
    
    return {
      service: 'discord_bot',
      healthy: botReady,
      connected: botReady,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error(`   → Discord Bot: ❌ (${error.message})`)
    
    return {
      service: 'discord_bot',
      healthy: false,
      error: error.message,
      timestamp: new Date(),
    }
  }
}

/**
 * Run all health checks
 * @returns {Promise<Object>}
 */
const runAllHealthChecks = async () => {
  console.log('\n🏥 [HEALTH CHECK] Running all health checks...')
  console.log(`   → Time: ${new Date().toISOString()}\n`)
  
  try {
    const [api, frontend, database, discordBot] = await Promise.all([
      checkAPIHealth(),
      checkFrontendHealth(),
      checkDatabaseHealth(),
      checkDiscordBotHealth(),
    ])
    
    // Core services - if any are down, system is degraded
    const coreServices = [api, database]
    const coreHealthy = coreServices.every(service => service.healthy)
    
    // Optional services - don't affect overall health
    const optionalServices = [frontend, discordBot]
    const allOptionalHealthy = optionalServices.every(service => service.healthy)
    
    // Overall status
    let overallStatus = 'healthy'
    if (!coreHealthy) {
      overallStatus = 'degraded'
    } else if (!allOptionalHealthy) {
      overallStatus = 'healthy' // Core services OK, optional services may be down
    }
    
    const result = {
      overall: overallStatus,
      services: {
        api,
        frontend,
        database,
        discordBot,
      },
      timestamp: new Date(),
    }
    
    // Store results in Firebase
    await db.collection('healthChecks').add({
      ...result,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    console.log(`\n✅ [HEALTH CHECK] Complete - Status: ${result.overall.toUpperCase()}\n`)
    
    return result
  } catch (error) {
    console.error('❌ [HEALTH CHECK] Error running health checks:', error)
    
    return {
      overall: 'error',
      error: error.message,
      timestamp: new Date(),
    }
  }
}

module.exports = {
  checkAPIHealth,
  checkFrontendHealth,
  checkDatabaseHealth,
  checkDiscordBotHealth,
  runAllHealthChecks,
}

