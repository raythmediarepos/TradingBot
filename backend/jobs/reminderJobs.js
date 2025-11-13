const cron = require('node-cron')
const { runAllReminders } = require('../services/emailReminderService')

// ============================================
// REMINDER JOBS
// ============================================

/**
 * Initialize and schedule all reminder cron jobs
 */
const initializeReminderJobs = async () => {
  console.log('⏰ [REMINDERS] Initializing scheduled reminder jobs...')
  
  // Run immediate check on startup to catch up on any overdue reminders
  console.log('🔄 [REMINDERS] Running startup reminder check...')
  try {
    await runAllReminders()
    console.log('✅ [REMINDERS] Startup reminder check complete')
  } catch (error) {
    console.error('❌ [REMINDERS] Error during startup reminder check:', error.message)
  }
  
  // Send email reminders - Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    await runAllReminders()
  }, {
    scheduled: true,
    timezone: 'America/New_York', // Change to your timezone
  })
  console.log('   → Scheduled: Email reminders (Every 30 minutes)')

  console.log('✅ [REMINDERS] All reminder jobs initialized')
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  initializeReminderJobs,
  // Export for manual testing
  runAllReminders,
}

