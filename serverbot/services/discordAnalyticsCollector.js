const { Client, GatewayIntentBits } = require('discord.js')

// ============================================
// DISCORD CLIENT
// ============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const DISCORD_CONFIG = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.DISCORD_SERVER_ID || process.env.DISCORD_GUILD_ID,
}

let guild = null
let botReady = false

// ============================================
// BOT INITIALIZATION
// ============================================

const initializeBot = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 [SERVERBOT] Connecting to Discord...')
    
    client.once('ready', async () => {
      console.log(`🤖 [SERVERBOT] Connected as ${client.user.tag}`)
      console.log(`🆔 [SERVERBOT] Bot ID: ${client.user.id}`)
      
      try {
        console.log(`🔍 [SERVERBOT] Fetching guild with ID: ${DISCORD_CONFIG.GUILD_ID}`)
        guild = await client.guilds.fetch(DISCORD_CONFIG.GUILD_ID)
        botReady = true
        console.log(`✅ [SERVERBOT] Guild fetched successfully!`)
        console.log(`   → Name: ${guild.name}`)
        console.log(`   → ID: ${guild.id}`)
        console.log(`   → Member count: ${guild.memberCount}`)
        resolve()
      } catch (error) {
        console.error('❌ [SERVERBOT] Error fetching guild:', error)
        console.error('   → Make sure DISCORD_GUILD_ID is correct')
        reject(error)
      }
    })

    client.on('error', (error) => {
      console.error('❌ [SERVERBOT] Discord client error:', error)
    })

    console.log('🔐 [SERVERBOT] Logging in with bot token...')
    client.login(DISCORD_CONFIG.BOT_TOKEN).catch((error) => {
      console.error('❌ [SERVERBOT] Failed to login:', error)
      console.error('   → Make sure DISCORD_BOT_TOKEN is correct')
      reject(error)
    })
  })
}

// ============================================
// ANALYTICS COLLECTION
// ============================================

/**
 * Collect comprehensive Discord analytics
 */
const collectAnalytics = async () => {
  if (!botReady || !guild) {
    throw new Error('Discord bot not ready')
  }

  console.log('📊 [SERVERBOT] Starting analytics collection...')
  console.log(`🔍 [SERVERBOT] Guild: ${guild.name} (ID: ${guild.id})`)

  const admin = require('firebase-admin')
  const db = admin.firestore()

  // Fetch all members with timeout protection
  console.log('👥 [SERVERBOT] Fetching guild members...')
  let members
  try {
    await Promise.race([
      guild.members.fetch(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 10000))
    ])
    members = guild.members.cache
    console.log(`✅ [SERVERBOT] Successfully fetched ${members.size} total members`)
  } catch (fetchError) {
    console.warn('⚠️ [SERVERBOT] Member fetch timed out, using cache')
    members = guild.members.cache
    console.log(`📦 [SERVERBOT] Using cached members: ${members.size} total`)
  }

  // Filter out bots
  const realMembers = members.filter(m => !m.user.bot)
  const botCount = members.size - realMembers.size

  console.log(`👥 [SERVERBOT] Processing ${realMembers.size} real members (${botCount} bots filtered out)`)

  // ============================================
  // MEMBER ANALYTICS
  // ============================================

  console.log('📋 [SERVERBOT] Analyzing member data...')
  const memberData = []
  const roleDistribution = {}
  const joinDates = []
  
  realMembers.forEach(member => {
    const joinedAt = member.joinedAt

    memberData.push({
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      joinedAt: joinedAt ? joinedAt.toISOString() : null,
      roles: member.roles.cache.map(r => r.name).filter(name => name !== '@everyone'),
      roleCount: member.roles.cache.size - 1, // Exclude @everyone
    })

    // Count role distribution
    member.roles.cache.forEach(role => {
      if (role.name !== '@everyone') {
        roleDistribution[role.name] = (roleDistribution[role.name] || 0) + 1
      }
    })

    // Track join dates for growth analysis
    if (joinedAt) {
      const month = joinedAt.toISOString().substring(0, 7) // YYYY-MM
      joinDates.push(month)
    }
  })

  console.log(`✅ [SERVERBOT] Processed ${memberData.length} member records`)
  console.log(`📊 [SERVERBOT] Found ${Object.keys(roleDistribution).length} unique roles`)

  // Calculate monthly growth
  const monthlyGrowth = {}
  joinDates.forEach(month => {
    monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1
  })

  // Convert to cumulative
  const sortedMonths = Object.keys(monthlyGrowth).sort()
  let cumulative = 0
  const growthData = sortedMonths.map(month => {
    cumulative += monthlyGrowth[month]
    return {
      month,
      joins: monthlyGrowth[month],
      total: cumulative,
    }
  })

  // ============================================
  // MESSAGE ANALYTICS (from Firebase)
  // ============================================

  console.log('📨 [SERVERBOT] Fetching message data from Firebase...')

  // Get message data from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  console.log(`📅 [SERVERBOT] Fetching messages since: ${thirtyDaysAgo.toISOString()}`)

  const messagesSnapshot = await db.collection('discordAnalytics')
    .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
    .get()

  const messages = []
  messagesSnapshot.forEach(doc => {
    messages.push(doc.data())
  })

  console.log(`💬 [SERVERBOT] Retrieved ${messages.length} messages from last 30 days`)
  
  if (messages.length === 0) {
    console.warn('⚠️  [SERVERBOT] No messages found in discordAnalytics collection. Make sure message tracking is enabled.')
  }

  // Calculate message stats
  const userMessageCount = {}
  const userEmojiCount = {}
  const channelMessageCount = {}
  const hourlyActivity = Array(24).fill(0)
  const dailyActivity = Array(7).fill(0)
  const monthlyData = {}

  messages.forEach(msg => {
    // User message counts
    userMessageCount[msg.userId] = (userMessageCount[msg.userId] || 0) + 1

    // User emoji counts
    userEmojiCount[msg.userId] = (userEmojiCount[msg.userId] || 0) + (msg.emojiCount || 0)

    // Channel message counts
    const channelKey = `${msg.channelId}|${msg.channelName}`
    channelMessageCount[channelKey] = (channelMessageCount[channelKey] || 0) + 1

    // Hourly activity
    if (msg.timestamp) {
      const date = msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay() // 0 = Sunday
      hourlyActivity[hour]++
      dailyActivity[dayOfWeek]++
    }

    // Monthly data
    if (msg.month) {
      if (!monthlyData[msg.month]) {
        monthlyData[msg.month] = { messages: 0, users: new Set() }
      }
      monthlyData[msg.month].messages++
      monthlyData[msg.month].users.add(msg.userId)
    }
  })

  // Get usernames for user IDs
  const usernames = {}
  messages.forEach(m => {
    if (!usernames[m.userId]) {
      usernames[m.userId] = m.username
    }
  })

  // Top commenters
  const topCommenters = Object.entries(userMessageCount)
    .map(([userId, count]) => ({
      userId,
      username: usernames[userId] || 'Unknown',
      messageCount: count,
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 20)

  // Top emoji users
  const topEmojiUsers = Object.entries(userEmojiCount)
    .map(([userId, count]) => ({
      userId,
      username: usernames[userId] || 'Unknown',
      emojiCount: count,
    }))
    .sort((a, b) => b.emojiCount - a.emojiCount)
    .slice(0, 20)

  // Channel stats
  const channelStats = Object.entries(channelMessageCount)
    .map(([key, count]) => {
      const [channelId, channelName] = key.split('|')
      return {
        channelId,
        channelName,
        messageCount: count,
      }
    })
    .sort((a, b) => b.messageCount - a.messageCount)

  // Monthly activity
  const monthlyActivity = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      messageCount: data.messages,
      activeUsers: data.users.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Peak activity times
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
  const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity))
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  console.log(`📊 [SERVERBOT] Calculated stats:`)
  console.log(`   → Top commenters: ${topCommenters.length}`)
  console.log(`   → Top emoji users: ${topEmojiUsers.length}`)
  console.log(`   → Channels tracked: ${channelStats.length}`)
  console.log(`   → Peak activity: ${dayNames[peakDay]} at ${peakHour}:00`)

  // ============================================
  // SAVE TO FIREBASE
  // ============================================

  console.log('💾 [SERVERBOT] Preparing analytics data for Firebase...')

  const analyticsData = {
    collectedAt: admin.firestore.FieldValue.serverTimestamp(),
    summary: {
      totalMembers: realMembers.size,
      totalMessages: messages.length,
      totalChannels: channelStats.length,
      totalRoles: Object.keys(roleDistribution).length,
      activeUsers: Object.keys(userMessageCount).length,
      period: '30 days',
    },
    members: {
      total: realMembers.size,
      growth: growthData,
      topRoles: Object.entries(roleDistribution)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    },
    messages: {
      total: messages.length,
      topCommenters,
      topEmojiUsers,
      channelStats,
      monthlyActivity,
      hourlyActivity: hourlyActivity.map((count, hour) => ({
        hour,
        count,
        label: `${hour}:00`,
      })),
      dailyActivity: dailyActivity.map((count, day) => ({
        day,
        dayName: dayNames[day],
        count,
      })),
      peakActivity: {
        hour: peakHour,
        hourLabel: `${peakHour}:00`,
        day: dayNames[peakDay],
        dayName: dayNames[peakDay],
      },
    },
    engagement: {
      avgMessagesPerUser: (messages.length / Object.keys(userMessageCount).length || 0).toFixed(2),
      avgMessagesPerDay: (messages.length / 30).toFixed(2),
      mostActiveChannel: channelStats[0]?.channelName || 'N/A',
      mostActiveChannelMessages: channelStats[0]?.messageCount || 0,
    },
  }

  // Save to Firebase
  console.log('💾 [SERVERBOT] Saving to Firebase: serverAnalytics/discord')
  await db.collection('serverAnalytics').doc('discord').set(analyticsData)

  console.log('✅ [SERVERBOT] Analytics saved successfully to Firebase!')
  console.log('📊 [SERVERBOT] Summary:')
  console.log(`   → ${realMembers.size} members analyzed`)
  console.log(`   → ${messages.length} messages processed`)
  console.log(`   → ${channelStats.length} channels tracked`)
  console.log(`   → ${Object.keys(userMessageCount).length} active users`)
  console.log(`   → ${Object.keys(roleDistribution).length} roles`)
  console.log(`   → ${monthlyActivity.length} months of data`)
  console.log('')
  console.log('🎉 [SERVERBOT] Collection complete! Data is now available in the admin dashboard.')

  return analyticsData
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  initializeBot,
  collectAnalytics,
  getClient: () => client,
}

