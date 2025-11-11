const { getClient } = require('./discordBotService')

const DISCORD_NOTIFICATIONS_CHANNEL_ID = process.env.DISCORD_ALERTS_CHANNEL_ID // Reuse same channel

/**
 * Send a notification to Discord (not an alert, just info)
 */
const sendDiscordNotification = async (notification) => {
  const client = getClient()
  
  if (!client) {
    console.log('⚠️  [NOTIFICATION] Discord client not available, skipping notification')
    return
  }

  try {
    const channelId = DISCORD_NOTIFICATIONS_CHANNEL_ID
    if (!channelId) {
      console.log('⚠️  [NOTIFICATION] DISCORD_ALERTS_CHANNEL_ID not configured')
      return
    }

    const channel = await client.channels.fetch(channelId)
    if (!channel) {
      console.log('⚠️  [NOTIFICATION] Channel not found')
      return
    }

    // Color based on event type
    const colors = {
      signup: 0x00D9FF,      // Cyan
      verification: 0x00FF88, // Green
      payment: 0xFFD700,      // Gold
      discord: 0x5865F2,      // Discord purple
      reminder: 0xFFA500,     // Orange
      error: 0xFF4444,        // Red
      info: 0x808080,         // Gray
    }

    const color = colors[notification.type] || colors.info

    // Build embed
    const embed = {
      color: color,
      title: notification.title,
      description: notification.description,
      fields: notification.fields || [],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Helwa AI Operations',
      },
    }

    await channel.send({ embeds: [embed] })
    console.log(`✅ [NOTIFICATION] Sent to Discord: ${notification.title}`)
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending to Discord:', error.message)
  }
}

/**
 * User signed up
 */
const notifySignup = async (user) => {
  await sendDiscordNotification({
    type: 'signup',
    title: '🎉 New Beta Signup',
    description: `**${user.firstName} ${user.lastName}** just signed up!`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💰 Type', value: user.isFree ? 'Free Beta Tester' : 'Paid Beta', inline: true },
      { name: '⏰ Time', value: new Date().toLocaleString(), inline: false },
    ],
  })
}

/**
 * Email verified
 */
const notifyEmailVerified = async (user) => {
  await sendDiscordNotification({
    type: 'verification',
    title: '✅ Email Verified',
    description: `**${user.firstName} ${user.lastName}** verified their email!`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💰 Next Step', value: user.isFree ? 'Generate Discord Invite' : 'Complete Payment', inline: false },
    ],
  })
}

/**
 * Sending email reminder
 */
const notifyEmailReminderSent = async (user, reminderType) => {
  const reminderLabels = {
    first: '10-Minute Reminder',
    second: '1-Hour Reminder',
    final: '24-Hour Final Reminder',
  }

  await sendDiscordNotification({
    type: 'reminder',
    title: '📧 Email Verification Reminder Sent',
    description: `Sending **${reminderLabels[reminderType]}** to **${user.firstName} ${user.lastName}**`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '⏰ Time Since Signup', value: getTimeSince(user.createdAt), inline: true },
      { name: '📬 Reminder Type', value: reminderLabels[reminderType], inline: false },
    ],
  })
}

/**
 * Payment completed
 */
const notifyPaymentCompleted = async (user, amount) => {
  await sendDiscordNotification({
    type: 'payment',
    title: '💰 Payment Completed',
    description: `**${user.firstName} ${user.lastName}** completed payment!`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '💵 Amount', value: `$${amount}`, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💬 Next Step', value: 'Generate Discord Invite', inline: false },
    ],
  })
}

/**
 * Sending payment reminder
 */
const notifyPaymentReminderSent = async (user, reminderType) => {
  const reminderLabels = {
    first: '1-Hour Reminder',
    second: '24-Hour Reminder',
    final: '3-Day Final Reminder',
  }

  await sendDiscordNotification({
    type: 'reminder',
    title: '💳 Payment Reminder Sent',
    description: `Sending **${reminderLabels[reminderType]}** to **${user.firstName} ${user.lastName}**`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '⏰ Time Since Verification', value: getTimeSince(user.emailVerifiedAt), inline: true },
      { name: '📬 Reminder Type', value: reminderLabels[reminderType], inline: false },
    ],
  })
}

/**
 * Discord invite generated
 */
const notifyDiscordInviteGenerated = async (user) => {
  await sendDiscordNotification({
    type: 'discord',
    title: '🔗 Discord Invite Generated',
    description: `**${user.firstName} ${user.lastName}** generated their Discord invite!`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💬 Next Step', value: 'Join Discord & Verify', inline: false },
    ],
  })
}

/**
 * Sending Discord invite reminder
 */
const notifyDiscordInviteReminderSent = async (user, reminderType) => {
  const reminderLabels = {
    first: '1-Hour Reminder',
    second: '24-Hour Reminder',
  }

  await sendDiscordNotification({
    type: 'reminder',
    title: '🔗 Discord Invite Reminder Sent',
    description: `Sending **${reminderLabels[reminderType]}** to **${user.firstName} ${user.lastName}**`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '⏰ Time Since Payment', value: getTimeSince(user.paymentCompletedAt || user.emailVerifiedAt), inline: true },
      { name: '📬 Reminder Type', value: reminderLabels[reminderType], inline: false },
    ],
  })
}

/**
 * User joined Discord
 */
const notifyDiscordJoined = async (user) => {
  await sendDiscordNotification({
    type: 'discord',
    title: '💬 User Joined Discord',
    description: `**${user.firstName} ${user.lastName}** joined the Discord server!`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💬 Next Step', value: 'Verify with Token', inline: false },
    ],
  })
}

/**
 * Sending Discord verification reminder
 */
const notifyDiscordVerificationReminderSent = async (user, reminderType) => {
  const reminderLabels = {
    first: '30-Minute Reminder',
    second: '24-Hour Reminder',
  }

  await sendDiscordNotification({
    type: 'reminder',
    title: '🔐 Discord Verification Reminder Sent',
    description: `Sending **${reminderLabels[reminderType]}** to **${user.firstName} ${user.lastName}**`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '⏰ Time Since Invite', value: getTimeSince(user.discordInviteCreatedAt), inline: true },
      { name: '📬 Reminder Type', value: reminderLabels[reminderType], inline: false },
    ],
  })
}

/**
 * User verified in Discord (completed journey!)
 */
const notifyDiscordVerified = async (user) => {
  await sendDiscordNotification({
    type: 'discord',
    title: '🎊 User Fully Verified!',
    description: `**${user.firstName} ${user.lastName}** completed the full beta journey! 🎉`,
    fields: [
      { name: '📧 Email', value: user.email, inline: true },
      { name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true },
      { name: '💰 Type', value: user.isFree ? 'Free Beta Tester' : 'Paid Beta', inline: true },
      { name: '✅ Status', value: 'FULLY ACTIVE', inline: false },
    ],
  })
}

/**
 * Helper to get time since a date
 */
const getTimeSince = (date) => {
  if (!date) return 'N/A'
  
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  const now = new Date()
  const diff = now - dateObj
  
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
}

module.exports = {
  sendDiscordNotification,
  notifySignup,
  notifyEmailVerified,
  notifyEmailReminderSent,
  notifyPaymentCompleted,
  notifyPaymentReminderSent,
  notifyDiscordInviteGenerated,
  notifyDiscordInviteReminderSent,
  notifyDiscordJoined,
  notifyDiscordVerificationReminderSent,
  notifyDiscordVerified,
}

