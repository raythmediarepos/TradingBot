/**
 * Firebase Error Collector
 * Fetches recent errors from Firebase for AI analysis
 */

const admin = require('firebase-admin')
const db = admin.firestore()

/**
 * Fetch recent errors from Firebase
 * @param {number} minutes - Number of minutes to look back (default: 30)
 * @returns {Promise<Array>} - Array of error objects
 */
const fetchRecentErrors = async (minutes = 30) => {
  try {
    console.log(`📥 [FIREBASE ERRORS] Fetching errors from last ${minutes} minutes...`)
    
    // Calculate time range
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000)
    
    // Query errorLogs collection
    const snapshot = await db.collection('errorLogs')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(cutoffTime))
      .orderBy('timestamp', 'desc')
      .limit(500) // Max errors to fetch
      .get()

    if (snapshot.empty) {
      console.log('✅ [FIREBASE ERRORS] No errors found (system is healthy)')
      return []
    }

    // Convert to array of error objects
    const errors = []
    snapshot.forEach(doc => {
      const data = doc.data()
      errors.push({
        id: doc.id,
        level: data.level || 'error',
        service: data.service || 'system',
        message: data.message || 'Unknown error',
        stack: data.stack || '',
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        ...data
      })
    })

    console.log(`✅ [FIREBASE ERRORS] Found ${errors.length} error(s)`)
    console.log(`   → Time range: ${cutoffTime.toISOString()} to now`)
    console.log(`   → Severity breakdown:`)
    
    const breakdown = errors.reduce((acc, err) => {
      acc[err.level] = (acc[err.level] || 0) + 1
      return acc
    }, {})
    
    Object.entries(breakdown).forEach(([level, count]) => {
      console.log(`      • ${level}: ${count}`)
    })

    return errors
  } catch (error) {
    console.error('❌ [FIREBASE ERRORS] Error fetching from Firebase:', error.message)
    throw error
  }
}

/**
 * Format errors for AI analysis
 * @param {Array} errors - Array of error objects
 * @returns {string} - Formatted text for AI
 */
const formatErrorsForAI = (errors) => {
  if (!errors || errors.length === 0) {
    return ''
  }

  return errors.map((err, i) => {
    return `
ERROR ${i + 1}:
Level: ${err.level}
Service: ${err.service}
Time: ${err.timestamp}
Message: ${err.message}
Stack: ${err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'N/A'}
---`
  }).join('\n')
}

/**
 * Clear old errors (cleanup)
 * @param {number} days - Delete errors older than X days
 */
const cleanupOldErrors = async (days = 7) => {
  try {
    console.log(`🧹 [FIREBASE ERRORS] Cleaning up errors older than ${days} days...`)
    
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const snapshot = await db.collection('errorLogs')
      .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffTime))
      .limit(500)
      .get()

    if (snapshot.empty) {
      console.log('✅ [FIREBASE ERRORS] No old errors to clean up')
      return 0
    }

    // Batch delete
    const batch = db.batch()
    snapshot.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    console.log(`✅ [FIREBASE ERRORS] Deleted ${snapshot.size} old error(s)`)
    return snapshot.size
  } catch (error) {
    console.error('❌ [FIREBASE ERRORS] Error during cleanup:', error.message)
    return 0
  }
}

/**
 * Get error statistics
 */
const getErrorStats = async () => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const snapshot = await db.collection('errorLogs')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(last24h))
      .get()

    const stats = {
      total: snapshot.size,
      byLevel: {},
      byService: {},
    }

    snapshot.forEach(doc => {
      const data = doc.data()
      const level = data.level || 'error'
      const service = data.service || 'system'
      
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1
      stats.byService[service] = (stats.byService[service] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('❌ [FIREBASE ERRORS] Error getting stats:', error.message)
    return { total: 0, byLevel: {}, byService: {} }
  }
}

module.exports = {
  fetchRecentErrors,
  formatErrorsForAI,
  cleanupOldErrors,
  getErrorStats,
}

