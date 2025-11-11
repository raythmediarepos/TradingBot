const axios = require('axios')
const admin = require('firebase-admin')
const db = admin.firestore()

// Environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
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
 * Check API health
 * @returns {Promise<Object>}
 */
const checkAPIHealth = async () => {
  console.log('🏥 [HEALTH CHECK] Checking API health...')
  
  const endpoints = [
    { name: 'API Root', url: `${BACKEND_URL}/` },
    { name: 'API Health', url: `${BACKEND_URL}/api/health` },
    { name: 'Beta Stats', url: `${BACKEND_URL}/api/beta/stats` },
    { name: 'Waitlist Stats', url: `${BACKEND_URL}/api/waitlist/stats` },
  ]
  
  const results = []
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint.url)
    results.push({
      ...endpoint,
      ...result,
    })
    
    console.log(`   → ${endpoint.name}: ${result.healthy ? '✅' : '❌'} (${result.responseTime}ms)`)
  }
  
  const allHealthy = results.every(r => r.healthy)
  const avgResponseTime = Math.round(
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
  )
  
  return {
    service: 'api',
    healthy: allHealthy,
    endpoints: results,
    averageResponseTime: avgResponseTime,
    timestamp: new Date(),
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
    // Check if there are recent Discord analytics (means bot is running)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recentAnalytics = await db
      .collection('discordAnalytics')
      .where('timestamp', '>', twentyFourHoursAgo)
      .limit(1)
      .get()
    
    const hasRecentData = !recentAnalytics.empty
    
    console.log(`   → Discord Bot: ${hasRecentData ? '✅' : '⚠️'} ${hasRecentData ? '' : '(No recent data)'}`)
    
    return {
      service: 'discord_bot',
      healthy: hasRecentData,
      lastDataAt: hasRecentData ? recentAnalytics.docs[0].data().timestamp : null,
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
    
    const allHealthy = [api, frontend, database, discordBot].every(
      service => service.healthy
    )
    
    const result = {
      overall: allHealthy ? 'healthy' : 'degraded',
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

