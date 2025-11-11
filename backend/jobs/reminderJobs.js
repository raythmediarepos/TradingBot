const cron = require('node-cron')
const { runAllReminders } = require('../services/emailReminderService')

// ============================================
// REMINDER JOBS
// ============================================

/**
 * Initialize and schedule all reminder cron jobs
 */
const initializeReminderJobs = () => {
  console.log('⏰ [REMINDERS] Initializing scheduled reminder jobs...')
  
  // Send email reminders - Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await runAllReminders()
  }, {
    scheduled: true,
    timezone: 'America/New_York', // Change to your timezone
  })
  console.log('   → Scheduled: Email reminders (Every 5 minutes)')

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

