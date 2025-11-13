const { admin, db } = require('../../config/firebase-admin')

let alertService = null
let isInitialized = false

// Track recent errors to prevent duplicates
const recentErrors = new Map()
const DUPLICATE_WINDOW = 60000 // 1 minute

/**
 * Initialize log monitoring
 * @param {Object} alerts - Alert service instance
 */
const initializeLogMonitoring = (alerts) => {
  if (isInitialized) {
    console.log('⚠️  [LOG MONITOR] Already initialized')
    return
  }

  alertService = alerts
  
  // Store original console methods
  const originalError = console.error
  const originalWarn = console.warn

  /**
   * Check if error should be ignored
   */
  const shouldIgnoreError = (message) => {
    const ignoredPatterns = [
      // Routine operations
      'Firebase Admin initialized',
      'Health check',
      'Metrics collection',
      'Reminder check',
      'Position renumbering',
      
      // Discord configuration issues (expected on test/no token)
      'No bot token provided',
      'Discord bot not available',
      'Discord client not initialized',
      'Expected token to be set for this request',
      '[DISCORD BOT]',
      '[JARVIS]',
      '[ALERT] Error sending Discord alert',
      'Error sending health_check update',
      'Error sending startup update',
      
      // Firebase quota issues (expected on free tier)
      'Quota exceeded',
      'RESOURCE_EXHAUSTED',
      'Authentication error',
      
      // Log monitor self-referential errors (prevent feedback loop)
      '[LOG MONITOR]',
      'Jarvis alerted',
      'Alert stored in Firebase',
      
      // Render/deployment routine messages
      'Downloaded',
      'Uploading build',
      'Build successful',
      'Deploying',
      'Your service is live',
    ]
    
    return ignoredPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  /**
   * Check if this is a duplicate error
   */
  const isDuplicateError = (errorHash) => {
    const lastSeen = recentErrors.get(errorHash)
    const now = Date.now()
    
    if (lastSeen && (now - lastSeen) < DUPLICATE_WINDOW) {
      return true
    }
    
    recentErrors.set(errorHash, now)
    
    // Clean up old entries
    for (const [hash, timestamp] of recentErrors.entries()) {
      if (now - timestamp > DUPLICATE_WINDOW) {
        recentErrors.delete(hash)
      }
    }
    
    return false
  }

  /**
   * Create error hash for duplicate detection
   */
  const createErrorHash = (message, stack) => {
    const content = message + (stack || '')
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  }

  /**
   * Send error to Jarvis
   */
  const sendErrorToJarvis = async (level, message, stack) => {
    // Skip if routine log or ignored
    if (shouldIgnoreError(message)) {
      return
    }

    // Check for duplicates
    const errorHash = createErrorHash(message, stack)
    if (isDuplicateError(errorHash)) {
      return
    }

    try {
      // Extract service name from message if possible
      let service = 'system'
      if (message.includes('API')) service = 'api'
      else if (message.includes('Database') || message.includes('Firebase')) service = 'database'
      else if (message.includes('Discord')) service = 'discord'
      else if (message.includes('Email') || message.includes('Resend')) service = 'email'

      const errorData = {
        level,
        service,
        message,
        stack: stack || new Error().stack,
        timestamp: new Date().toISOString(),
      }

      // Store in Firebase (only if not a Discord/Jarvis internal error)
      if (!message.includes('JARVIS') && !message.includes('ALERT')) {
        try {
          await db.collection('errorLogs').add({
            ...errorData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          })
        } catch (dbError) {
          // Silently fail if Firebase is down/quota exceeded
          if (!dbError.message.includes('Quota exceeded')) {
            originalError('[LOG MONITOR] Failed to store error:', dbError.message)
          }
        }
      }

      // Send Jarvis alert (only if alert service is available)
      if (alertService && alertService.sendErrorLogAlert && !message.includes('JARVIS') && !message.includes('ALERT')) {
        try {
          await alertService.sendErrorLogAlert(errorData)
          originalError(`✅ [LOG MONITOR] Jarvis alerted: ${level} - ${message.substring(0, 50)}...`)
        } catch (alertError) {
          // Silently fail - don't create feedback loop
        }
      }
    } catch (error) {
      // Don't create infinite loop if alert fails - silently ignore
    }
  }

  // Override console.error
  console.error = (...args) => {
    originalError(...args)
    
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')
    
    const stack = args.find(arg => arg instanceof Error)?.stack
    
    // Send to Jarvis asynchronously (don't block)
    setImmediate(() => sendErrorToJarvis('error', message, stack))
  }

  // Override console.warn
  console.warn = (...args) => {
    originalWarn(...args)
    
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')
    
    const stack = args.find(arg => arg instanceof Error)?.stack
    
    // Send to Jarvis asynchronously (don't block)
    setImmediate(() => sendErrorToJarvis('warning', message, stack))
  }

  // Global uncaught exception handler
  process.on('uncaughtException', (error) => {
    originalError('💥 [UNCAUGHT EXCEPTION]', error)
    sendErrorToJarvis('error', `Uncaught Exception: ${error.message}`, error.stack)
  })

  // Global unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    originalError('💥 [UNHANDLED REJECTION]', reason)
    const message = reason instanceof Error ? reason.message : String(reason)
    const stack = reason instanceof Error ? reason.stack : undefined
    sendErrorToJarvis('error', `Unhandled Rejection: ${message}`, stack)
  })

  isInitialized = true
  console.log('🔍 [LOG MONITOR] Real-time error monitoring active')
  console.log('   → Jarvis will be alerted on any errors or warnings')
  console.log('   → Duplicate errors suppressed for 1 minute')
  console.log('')
}

/**
 * Manually send a log event to Jarvis (for testing)
 */
const testLogMonitoring = async (level, message) => {
  await sendErrorToJarvis(level, message, new Error().stack)
}

module.exports = {
  initializeLogMonitoring,
  testLogMonitoring,
}

