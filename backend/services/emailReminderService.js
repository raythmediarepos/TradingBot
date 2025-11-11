const admin = require('firebase-admin')
const {
  sendEmailVerificationReminder,
  sendAbandonedPaymentReminder,
  sendDiscordInviteReminder,
  sendDiscordVerificationReminder,
} = require('./emailService')
const { getBetaStats } = require('./betaUserService')
const {
  notifyEmailReminderSent,
  notifyPaymentReminderSent,
  notifyDiscordInviteReminderSent,
  notifyDiscordVerificationReminderSent,
} = require('./discordNotificationService')

/**
 * Send email verification reminders
 * Runs every 5 minutes
 */
const sendEmailVerificationReminders = async () => {
  try {
    console.log('🕐 [REMINDER CRON] Checking for unverified email users...')
    
    const db = admin.firestore()
    const now = new Date()

    // Find unverified users
    const unverifiedUsers = await db.collection('betaUsers')
      .where('emailVerified', '==', false)
      .get()

    console.log(`   → Found ${unverifiedUsers.size} unverified users`)

    let remindersSent = 0

    for (const doc of unverifiedUsers.docs) {
      const user = doc.data()
      const userId = doc.id
      const createdAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
      const minutesSinceSignup = (now - createdAt) / 1000 / 60

      // Check if we've already sent each reminder
      const emailReminders = user.emailRemindersSent || {}

      // 10-minute reminder
      if (minutesSinceSignup >= 10 && !emailReminders.tenMinute) {
        console.log(`   📧 Sending 10-min reminder to ${user.email}`)
        await sendEmailVerificationReminder(
          user.email,
          user.firstName,
          'first',
          user.emailVerificationToken
        )
        await db.collection('betaUsers').doc(userId).update({
          'emailRemindersSent.tenMinute': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyEmailReminderSent(user, 'first')
        remindersSent++
      }

      // 1-hour reminder
      if (minutesSinceSignup >= 60 && !emailReminders.oneHour) {
        console.log(`   📧 Sending 1-hour reminder to ${user.email}`)
        await sendEmailVerificationReminder(
          user.email,
          user.firstName,
          'second',
          user.emailVerificationToken
        )
        await db.collection('betaUsers').doc(userId).update({
          'emailRemindersSent.oneHour': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyEmailReminderSent(user, 'second')
        remindersSent++
      }

      // 24-hour reminder
      if (minutesSinceSignup >= 1440 && !emailReminders.twentyFourHour) {
        console.log(`   📧 Sending 24-hour reminder to ${user.email}`)
        await sendEmailVerificationReminder(
          user.email,
          user.firstName,
          'final',
          user.emailVerificationToken
        )
        await db.collection('betaUsers').doc(userId).update({
          'emailRemindersSent.twentyFourHour': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyEmailReminderSent(user, 'final')
        remindersSent++
      }
    }

    console.log(`✅ [REMINDER CRON] Email verification reminders complete: ${remindersSent} sent`)
  } catch (error) {
    console.error('❌ [REMINDER CRON] Error sending email verification reminders:', error)
  }
}

/**
 * Send abandoned payment reminders
 * Runs every 5 minutes
 */
const sendPaymentReminders = async () => {
  try {
    console.log('🕐 [REMINDER CRON] Checking for pending payments...')
    
    const db = admin.firestore()
    const now = new Date()

    // Find users with verified email but no payment (not free)
    const pendingPaymentUsers = await db.collection('betaUsers')
      .where('emailVerified', '==', true)
      .where('isFree', '==', false)
      .where('paymentStatus', 'in', ['pending', 'unpaid'])
      .get()

    console.log(`   → Found ${pendingPaymentUsers.size} users with pending payment`)

    let remindersSent = 0

    // Get remaining spots for final reminder
    const betaStats = await getBetaStats()
    const spotsLeft = betaStats.remaining || 0

    for (const doc of pendingPaymentUsers.docs) {
      const user = doc.data()
      const userId = doc.id
      
      // Use emailVerifiedAt or createdAt as base time
      const baseTime = user.emailVerifiedAt 
        ? (user.emailVerifiedAt.toDate ? user.emailVerifiedAt.toDate() : new Date(user.emailVerifiedAt))
        : (user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt))
      
      const minutesSinceVerified = (now - baseTime) / 1000 / 60

      // Check if we've already sent each reminder
      const paymentReminders = user.paymentRemindersSent || {}

      // 1-hour reminder
      if (minutesSinceVerified >= 60 && !paymentReminders.oneHour) {
        console.log(`   📧 Sending 1-hour payment reminder to ${user.email}`)
        await sendAbandonedPaymentReminder(
          user.email,
          user.firstName,
          'first'
        )
        await db.collection('betaUsers').doc(userId).update({
          'paymentRemindersSent.oneHour': admin.firestore.FieldValue.serverTimestamp(),
          journeyStage: 'payment',
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyPaymentReminderSent(user, 'first')
        remindersSent++
      }

      // 24-hour reminder
      if (minutesSinceVerified >= 1440 && !paymentReminders.twentyFourHour) {
        console.log(`   📧 Sending 24-hour payment reminder to ${user.email}`)
        await sendAbandonedPaymentReminder(
          user.email,
          user.firstName,
          'second'
        )
        await db.collection('betaUsers').doc(userId).update({
          'paymentRemindersSent.twentyFourHour': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyPaymentReminderSent(user, 'second')
        remindersSent++
      }

      // 3-day reminder (with spots left urgency)
      if (minutesSinceVerified >= 4320 && !paymentReminders.threeDays) {
        console.log(`   📧 Sending 3-day payment reminder to ${user.email}`)
        await sendAbandonedPaymentReminder(
          user.email,
          user.firstName,
          'final',
          spotsLeft
        )
        await db.collection('betaUsers').doc(userId).update({
          'paymentRemindersSent.threeDays': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyPaymentReminderSent(user, 'final')
        remindersSent++
      }
    }

    console.log(`✅ [REMINDER CRON] Payment reminders complete: ${remindersSent} sent`)
  } catch (error) {
    console.error('❌ [REMINDER CRON] Error sending payment reminders:', error)
  }
}

/**
 * Send Discord invite generation reminders
 * Runs every 5 minutes
 */
const sendDiscordInviteReminders = async () => {
  try {
    console.log('🕐 [REMINDER CRON] Checking for users without Discord invite...')
    
    const db = admin.firestore()
    const now = new Date()

    // Find users who paid but haven't generated Discord invite
    const query1 = db.collection('betaUsers')
      .where('emailVerified', '==', true)
      .where('paymentStatus', '==', 'paid')
      .where('discordJoined', '==', false)

    const query2 = db.collection('betaUsers')
      .where('emailVerified', '==', true)
      .where('isFree', '==', true)
      .where('discordJoined', '==', false)

    const [paidUsers, freeUsers] = await Promise.all([
      query1.get(),
      query2.get(),
    ])

    const allUsers = [...paidUsers.docs, ...freeUsers.docs]
    console.log(`   → Found ${allUsers.length} users without Discord invite`)

    let remindersSent = 0

    for (const doc of allUsers) {
      const user = doc.data()
      const userId = doc.id
      
      // Check if user has generated an invite at all
      const invitesSnapshot = await db.collection('discordInvites')
        .where('userId', '==', userId)
        .limit(1)
        .get()

      // Skip if user already has an invite
      if (!invitesSnapshot.empty) continue

      // Use payment time or email verified time as base
      const baseTime = user.paymentCompletedAt 
        ? (user.paymentCompletedAt.toDate ? user.paymentCompletedAt.toDate() : new Date(user.paymentCompletedAt))
        : user.emailVerifiedAt
        ? (user.emailVerifiedAt.toDate ? user.emailVerifiedAt.toDate() : new Date(user.emailVerifiedAt))
        : (user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt))
      
      const minutesSincePayment = (now - baseTime) / 1000 / 60

      // Check if we've already sent each reminder
      const inviteReminders = user.discordInviteRemindersSent || {}

      // 1-hour reminder
      if (minutesSincePayment >= 60 && !inviteReminders.oneHour) {
        console.log(`   📧 Sending 1-hour Discord invite reminder to ${user.email}`)
        await sendDiscordInviteReminder(
          user.email,
          user.firstName,
          'first'
        )
        await db.collection('betaUsers').doc(userId).update({
          'discordInviteRemindersSent.oneHour': admin.firestore.FieldValue.serverTimestamp(),
          journeyStage: 'discord_invite',
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyDiscordInviteReminderSent(user, 'first')
        remindersSent++
      }

      // 24-hour reminder
      if (minutesSincePayment >= 1440 && !inviteReminders.twentyFourHour) {
        console.log(`   📧 Sending 24-hour Discord invite reminder to ${user.email}`)
        await sendDiscordInviteReminder(
          user.email,
          user.firstName,
          'second'
        )
        await db.collection('betaUsers').doc(userId).update({
          'discordInviteRemindersSent.twentyFourHour': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyDiscordInviteReminderSent(user, 'second')
        remindersSent++
      }
    }

    console.log(`✅ [REMINDER CRON] Discord invite reminders complete: ${remindersSent} sent`)
  } catch (error) {
    console.error('❌ [REMINDER CRON] Error sending Discord invite reminders:', error)
  }
}

/**
 * Send Discord verification reminders
 * Runs every 5 minutes
 */
const sendDiscordVerificationReminders = async () => {
  try {
    console.log('🕐 [REMINDER CRON] Checking for unverified Discord users...')
    
    const db = admin.firestore()
    const now = new Date()

    // Find users who have Discord invite but haven't joined/verified
    const invites = await db.collection('discordInvites')
      .where('used', '==', false)
      .where('expiresAt', '>', now)
      .get()

    console.log(`   → Found ${invites.size} unused Discord invites`)

    let remindersSent = 0

    for (const inviteDoc of invites.docs) {
      const invite = inviteDoc.data()
      const inviteId = inviteDoc.id
      
      // Get user details
      const userDoc = await db.collection('betaUsers').doc(invite.userId).get()
      if (!userDoc.exists) continue

      const user = userDoc.data()
      
      // Skip if already joined Discord
      if (user.discordJoined) continue

      const inviteCreatedAt = invite.createdAt.toDate ? invite.createdAt.toDate() : new Date(invite.createdAt)
      const minutesSinceInvite = (now - inviteCreatedAt) / 1000 / 60

      // Check if we've already sent each reminder
      const verificationReminders = user.discordVerificationRemindersSent || {}

      // 30-minute reminder
      if (minutesSinceInvite >= 30 && !verificationReminders.thirtyMinute) {
        console.log(`   📧 Sending 30-min Discord verification reminder to ${user.email}`)
        await sendDiscordVerificationReminder(
          user.email,
          user.firstName,
          'first',
          invite.token
        )
        await db.collection('betaUsers').doc(invite.userId).update({
          'discordVerificationRemindersSent.thirtyMinute': admin.firestore.FieldValue.serverTimestamp(),
          journeyStage: 'discord_verification',
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyDiscordVerificationReminderSent(user, 'first')
        remindersSent++
      }

      // 24-hour reminder
      if (minutesSinceInvite >= 1440 && !verificationReminders.twentyFourHour) {
        console.log(`   📧 Sending 24-hour Discord verification reminder to ${user.email}`)
        await sendDiscordVerificationReminder(
          user.email,
          user.firstName,
          'second',
          invite.token
        )
        await db.collection('betaUsers').doc(invite.userId).update({
          'discordVerificationRemindersSent.twentyFourHour': admin.firestore.FieldValue.serverTimestamp(),
          lastJourneyUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })
        await notifyDiscordVerificationReminderSent(user, 'second')
        remindersSent++
      }
    }

    console.log(`✅ [REMINDER CRON] Discord verification reminders complete: ${remindersSent} sent`)
  } catch (error) {
    console.error('❌ [REMINDER CRON] Error sending Discord verification reminders:', error)
  }
}

/**
 * Run all reminder checks
 * This is the main function that gets called by the cron job
 */
const runAllReminders = async () => {
  console.log('\n🚀 [REMINDER CRON] Starting email reminder job...')
  console.log(`   → Time: ${new Date().toISOString()}`)
  
  try {
    // Run all reminder checks in parallel
    await Promise.all([
      sendEmailVerificationReminders(),
      sendPaymentReminders(),
      sendDiscordInviteReminders(),
      sendDiscordVerificationReminders(),
    ])
    
    console.log('✅ [REMINDER CRON] All reminder checks complete!\n')
  } catch (error) {
    console.error('❌ [REMINDER CRON] Error running reminders:', error)
  }
}

module.exports = {
  runAllReminders,
  sendEmailVerificationReminders,
  sendPaymentReminders,
  sendDiscordInviteReminders,
  sendDiscordVerificationReminders,
}

