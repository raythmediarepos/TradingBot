const cron = require('node-cron')
const { admin, db } = require('../config/firebase-admin')
const { COLLECTIONS } = require('../services/betaUserService')

// ============================================
// CLEANUP JOBS
// ============================================

/**
 * Clean up expired Discord invites
 * Runs daily at 3 AM
 */
const cleanupExpiredDiscordInvites = async () => {
  console.log('🧹 [CLEANUP] Starting Discord invite cleanup...')
  
  try {
    const now = admin.firestore.Timestamp.now()
    
    // Find expired, unused invites
    const snapshot = await db
      .collection(COLLECTIONS.DISCORD_INVITES)
      .where('used', '==', false)
      .where('expiresAt', '<', now)
      .get()

    if (snapshot.empty) {
      console.log('   → No expired invites found')
      return { deleted: 0 }
    }

    console.log(`   → Found ${snapshot.size} expired invite(s)`)

    // Delete expired invites in batches
    const batchSize = 500
    let deletedCount = 0
    let batch = db.batch()
    let batchCount = 0

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref)
      batchCount++
      deletedCount++

      if (batchCount === batchSize) {
        await batch.commit()
        batch = db.batch()
        batchCount = 0
      }
    }

    // Commit remaining deletes
    if (batchCount > 0) {
      await batch.commit()
    }

    console.log(`✅ [CLEANUP] Deleted ${deletedCount} expired Discord invite(s)`)
    
    return { deleted: deletedCount }
  } catch (error) {
    console.error('❌ [CLEANUP] Error cleaning up Discord invites:', error)
    return { error: error.message, deleted: 0 }
  }
}

/**
 * Clean up expired email verification tokens
 * Runs daily at 3:30 AM
 */
const cleanupExpiredEmailVerifications = async () => {
  console.log('🧹 [CLEANUP] Starting email verification cleanup...')
  
  try {
    const now = admin.firestore.Timestamp.now()
    
    // Find expired verifications
    const snapshot = await db
      .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
      .where('verified', '==', false)
      .where('expiresAt', '<', now)
      .get()

    if (snapshot.empty) {
      console.log('   → No expired email verifications found')
      return { deleted: 0 }
    }

    console.log(`   → Found ${snapshot.size} expired email verification(s)`)

    // Delete expired verifications in batches
    const batchSize = 500
    let deletedCount = 0
    let batch = db.batch()
    let batchCount = 0

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref)
      batchCount++
      deletedCount++

      if (batchCount === batchSize) {
        await batch.commit()
        batch = db.batch()
        batchCount = 0
      }
    }

    // Commit remaining deletes
    if (batchCount > 0) {
      await batch.commit()
    }

    console.log(`✅ [CLEANUP] Deleted ${deletedCount} expired email verification(s)`)
    
    return { deleted: deletedCount }
  } catch (error) {
    console.error('❌ [CLEANUP] Error cleaning up email verifications:', error)
    return { error: error.message, deleted: 0 }
  }
}

/**
 * Check for failed subscriptions and suspend users
 * Runs every 6 hours
 */
const checkFailedSubscriptions = async () => {
  console.log('🔍 [CLEANUP] Checking for failed subscriptions...')
  
  try {
    // Find subscriptions with failed status
    const snapshot = await db
      .collection(COLLECTIONS.SUBSCRIPTIONS)
      .where('status', 'in', ['past_due', 'unpaid'])
      .get()

    if (snapshot.empty) {
      console.log('   → No failed subscriptions found')
      return { suspended: 0 }
    }

    console.log(`   → Found ${snapshot.size} failed subscription(s)`)

    let suspendedCount = 0

    for (const doc of snapshot.docs) {
      const subscription = doc.data()
      const userId = subscription.userId

      // Get user
      const userDoc = await db.collection(COLLECTIONS.BETA_USERS).doc(userId).get()
      
      if (userDoc.exists) {
        const user = userDoc.data()
        
        // Only suspend if not already suspended or cancelled
        if (user.status !== 'suspended' && user.status !== 'cancelled') {
          await db.collection(COLLECTIONS.BETA_USERS).doc(userId).update({
            status: 'suspended',
            paymentStatus: 'failed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          
          suspendedCount++
          console.log(`   → Suspended user ${userId} (failed payment)`)
          
          // TODO: Revoke Discord access via bot
          // TODO: Send payment failed email
        }
      }
    }

    console.log(`✅ [CLEANUP] Suspended ${suspendedCount} user(s) with failed payments`)
    
    return { suspended: suspendedCount }
  } catch (error) {
    console.error('❌ [CLEANUP] Error checking failed subscriptions:', error)
    return { error: error.message, suspended: 0 }
  }
}

/**
 * Run all cleanup jobs manually (for testing)
 */
const runAllCleanupJobs = async () => {
  console.log('🚀 [CLEANUP] Running all cleanup jobs manually...\n')
  
  const results = {
    discordInvites: await cleanupExpiredDiscordInvites(),
    emailVerifications: await cleanupExpiredEmailVerifications(),
    failedSubscriptions: await checkFailedSubscriptions(),
  }
  
  console.log('\n📊 [CLEANUP] Cleanup summary:')
  console.log(`   → Discord invites deleted: ${results.discordInvites.deleted}`)
  console.log(`   → Email verifications deleted: ${results.emailVerifications.deleted}`)
  console.log(`   → Users suspended: ${results.failedSubscriptions.suspended}`)
  
  return results
}

// ============================================
// SCHEDULE JOBS
// ============================================

/**
 * Initialize and schedule all cron jobs
 */
const initializeCleanupJobs = () => {
  console.log('⏰ [CLEANUP] Initializing scheduled cleanup jobs...')
  
  // Clean up expired Discord invites - Daily at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('\n⏰ [CRON] Scheduled job: Clean expired Discord invites')
    await cleanupExpiredDiscordInvites()
  }, {
    scheduled: true,
    timezone: 'America/New_York', // Change to your timezone
  })
  console.log('   → Scheduled: Clean expired Discord invites (Daily at 3:00 AM)')

  // Clean up expired email verifications - Daily at 3:30 AM
  cron.schedule('30 3 * * *', async () => {
    console.log('\n⏰ [CRON] Scheduled job: Clean expired email verifications')
    await cleanupExpiredEmailVerifications()
  }, {
    scheduled: true,
    timezone: 'America/New_York',
  })
  console.log('   → Scheduled: Clean expired email verifications (Daily at 3:30 AM)')

  // Check for failed subscriptions - Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏰ [CRON] Scheduled job: Check failed subscriptions')
    await checkFailedSubscriptions()
  }, {
    scheduled: true,
    timezone: 'America/New_York',
  })
  console.log('   → Scheduled: Check failed subscriptions (Every 6 hours)')

  console.log('✅ [CLEANUP] All cleanup jobs initialized')
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Individual cleanup functions
  cleanupExpiredDiscordInvites,
  cleanupExpiredEmailVerifications,
  checkFailedSubscriptions,
  
  // Run all manually
  runAllCleanupJobs,
  
  // Initialize scheduled jobs
  initializeCleanupJobs,
}

