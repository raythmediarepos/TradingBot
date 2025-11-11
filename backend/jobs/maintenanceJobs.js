const cron = require('node-cron')
const { renumberBetaPositions } = require('../services/betaUserService')

// ============================================
// MAINTENANCE JOBS
// ============================================

/**
 * Renumber beta positions to ensure accuracy
 * Runs every hour and on startup
 */
const runPositionRenumbering = async () => {
  try {
    await renumberBetaPositions()
  } catch (error) {
    console.error('❌ [MAINTENANCE] Error during position renumbering:', error.message)
  }
}

/**
 * Initialize all maintenance jobs
 */
const initializeMaintenanceJobs = async () => {
  console.log('🔧 [MAINTENANCE] Initializing maintenance jobs...')
  
  // Run position renumbering on startup
  console.log('🔢 [MAINTENANCE] Running startup position renumbering...')
  try {
    await runPositionRenumbering()
    console.log('✅ [MAINTENANCE] Startup position renumbering complete')
  } catch (error) {
    console.error('❌ [MAINTENANCE] Error during startup renumbering:', error.message)
  }
  
  // Renumber positions - Every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [MAINTENANCE] Hourly position renumbering triggered')
    await runPositionRenumbering()
  }, {
    scheduled: true,
    timezone: 'America/New_York',
  })
  console.log('   → Scheduled: Position renumbering (Every hour)')

  console.log('✅ [MAINTENANCE] All maintenance jobs initialized')
}

module.exports = {
  initializeMaintenanceJobs,
  runPositionRenumbering,
}

