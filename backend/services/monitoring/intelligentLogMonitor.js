/**
 * Intelligent Log Monitor
 * Fetches errors from Firebase, analyzes with AI, sends Discord alerts
 */

const { fetchRecentErrors, formatErrorsForAI } = require('./firebaseErrorCollector')
const { analyzeLogsWithAI } = require('./aiLogAnalyzer')
const { sendAlertEmail } = require('./alertService')

/**
 * Run intelligent error analysis and send alerts
 */
const runIntelligentLogAnalysis = async () => {
  try {
    console.log('')
    console.log('🧠 [INTELLIGENT LOG MONITOR] Starting AI-powered error analysis...')
    console.log(`   → Time: ${new Date().toISOString()}`)
    console.log('')

    // Step 1: Fetch recent errors from Firebase
    const errors = await fetchRecentErrors(30) // Last 30 minutes

    if (!errors || errors.length === 0) {
      console.log('✅ [INTELLIGENT LOG MONITOR] No errors found - system is healthy!')
      return
    }

    // Step 2: Format errors for AI analysis
    const errorsText = formatErrorsForAI(errors)

    // Step 3: Analyze errors with OpenAI
    const actionableErrors = await analyzeLogsWithAI(errorsText, errors.length)

    if (!actionableErrors || actionableErrors.length === 0) {
      console.log('✅ [INTELLIGENT LOG MONITOR] No actionable errors - all routine/expected')
      return
    }

    // Step 4: Send Discord alerts for each unique error
    console.log(`🚨 [INTELLIGENT LOG MONITOR] Found ${actionableErrors.length} actionable error(s)`)
    
    for (const error of actionableErrors) {
      await sendIntelligentAlert(error)
    }

    console.log('✅ [INTELLIGENT LOG MONITOR] Analysis complete')
    console.log('')
  } catch (error) {
    console.error('❌ [INTELLIGENT LOG MONITOR] Analysis failed:', error.message)
  }
}

/**
 * Send Discord alert for an AI-detected error
 */
const sendIntelligentAlert = async (error) => {
  try {
    // Map severity to alert format
    const severityConfig = {
      critical: {
        emoji: '🔴',
        title: 'CRITICAL ERROR DETECTED',
        color: 0xFF0000, // Red
      },
      error: {
        emoji: '🔴',
        title: 'ERROR DETECTED',
        color: 0xFF6B6B, // Light red
      },
      warning: {
        emoji: '⚠️',
        title: 'WARNING DETECTED',
        color: 0xFFB347, // Orange
      },
    }

    const config = severityConfig[error.severity] || severityConfig.error

    const alert = {
      severity: error.severity,
      service: error.service,
      message: error.message,
      details: {
        ...error,
        source: 'AI Log Analysis',
        analyzed: true,
      },
      timestamp: new Date(),
    }

    // Send to Discord via alertService
    await sendAlertEmail(alert)

    console.log(`   ✅ Alert sent: [${error.severity}] ${error.service} - ${error.message}`)
  } catch (error) {
    console.error('   ❌ Failed to send alert:', error.message)
  }
}

/**
 * Get summary stats
 */
const getMonitorStats = () => {
  return {
    enabled: !!process.env.OPENAI_API_KEY && !!process.env.RENDER_API_KEY,
    frequency: '30 minutes',
    model: 'gpt-4o-mini',
    cost: '~$0.0001 per analysis',
  }
}

module.exports = {
  runIntelligentLogAnalysis,
  getMonitorStats,
}

