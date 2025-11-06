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

  // ============================================
  // COMPREHENSIVE MESSAGE ANALYTICS
  // ============================================
  
  console.log('🔍 [SERVERBOT] Calculating comprehensive message analytics...')
  
  // Basic counters
  const userMessageCount = {}
  const userEmojiCount = {}
  const userReactionCount = {}
  const channelMessageCount = {}
  const hourlyActivity = Array(24).fill(0)
  const dailyActivity = Array(7).fill(0)
  const monthlyData = {}
  
  // New: Message quality metrics
  const userMessageLengths = {}
  const userReplyCount = {}
  const userQuestionCount = {}
  const userLinkCount = {}
  const userAttachmentCount = {}
  const userFirstMessageDate = {}
  const userLastMessageDate = {}
  
  // New: Time-based tracking
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let messagesToday = 0
  let messagesYesterday = 0
  let messagesThisWeek = 0
  let messagesLastWeek = 0

  messages.forEach(msg => {
    const userId = msg.userId
    const msgDate = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
    
    // User message counts
    userMessageCount[userId] = (userMessageCount[userId] || 0) + 1

    // User emoji counts
    userEmojiCount[userId] = (userEmojiCount[userId] || 0) + (msg.emojiCount || 0)
    
    // NEW: Reaction counts
    if (msg.reactions) {
      userReactionCount[userId] = (userReactionCount[userId] || 0) + msg.reactions
    }

    // Channel message counts
    const channelKey = `${msg.channelId}|${msg.channelName}`
    channelMessageCount[channelKey] = (channelMessageCount[channelKey] || 0) + 1

    // Hourly activity
    if (msg.timestamp) {
      const hour = msgDate.getHours()
      const dayOfWeek = msgDate.getDay() // 0 = Sunday
      hourlyActivity[hour]++
      dailyActivity[dayOfWeek]++
    }

    // Monthly data
    if (msg.month) {
      if (!monthlyData[msg.month]) {
        monthlyData[msg.month] = { messages: 0, users: new Set() }
      }
      monthlyData[msg.month].messages++
      monthlyData[msg.month].users.add(userId)
    }
    
    // NEW: Message quality metrics
    if (msg.content) {
      const contentLength = msg.content.length
      if (!userMessageLengths[userId]) userMessageLengths[userId] = []
      userMessageLengths[userId].push(contentLength)
      
      // Count replies (messages starting with @mention or in thread)
      if (msg.isReply || msg.content.startsWith('@')) {
        userReplyCount[userId] = (userReplyCount[userId] || 0) + 1
      }
      
      // Count questions (messages with ?)
      if (msg.content.includes('?')) {
        userQuestionCount[userId] = (userQuestionCount[userId] || 0) + 1
      }
      
      // Count links
      if (msg.content.includes('http://') || msg.content.includes('https://')) {
        userLinkCount[userId] = (userLinkCount[userId] || 0) + 1
      }
    }
    
    // NEW: Track attachments
    if (msg.hasAttachment) {
      userAttachmentCount[userId] = (userAttachmentCount[userId] || 0) + 1
    }
    
    // NEW: Track first and last message dates
    if (!userFirstMessageDate[userId] || msgDate < userFirstMessageDate[userId]) {
      userFirstMessageDate[userId] = msgDate
    }
    if (!userLastMessageDate[userId] || msgDate > userLastMessageDate[userId]) {
      userLastMessageDate[userId] = msgDate
    }
    
    // NEW: Time-based message counts
    if (msgDate >= today) {
      messagesToday++
    } else if (msgDate >= yesterday && msgDate < today) {
      messagesYesterday++
    }
    
    if (msgDate >= sevenDaysAgo) {
      messagesThisWeek++
    }
  })
  
  console.log('✅ [SERVERBOT] Message analytics calculated')
  console.log(`   → ${messagesToday} messages today, ${messagesYesterday} yesterday`)
  console.log(`   → ${messagesThisWeek} messages this week`)

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

  console.log(`📊 [SERVERBOT] Calculated basic stats:`)
  console.log(`   → Top commenters: ${topCommenters.length}`)
  console.log(`   → Top emoji users: ${topEmojiUsers.length}`)
  console.log(`   → Channels tracked: ${channelStats.length}`)
  console.log(`   → Peak activity: ${dayNames[peakDay]} at ${peakHour}:00`)
  
  // ============================================
  // NEW: USER SEGMENTATION
  // ============================================
  
  console.log('👥 [SERVERBOT] Calculating user segmentation...')
  
  const now = new Date()
  const powerUsers = []
  const casualUsers = []
  const lurkers = []
  const newUsers = []
  const inactiveUsers = []
  const ghostMembers = []
  
  realMembers.forEach(member => {
    const userId = member.user.id
    const messageCount = userMessageCount[userId] || 0
    const joinedAt = member.joinedAt
    const daysSinceJoin = joinedAt ? Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24)) : 999
    const lastMessage = userLastMessageDate[userId]
    const daysSinceLastMessage = lastMessage ? Math.floor((now - lastMessage) / (1000 * 60 * 60 * 24)) : 999
    
    const userData = {
      userId,
      username: member.user.username,
      messageCount,
      daysSinceJoin,
      daysSinceLastMessage,
      joinedAt: joinedAt?.toISOString() || null,
    }
    
    // Power users: Top 10% by activity OR 50+ messages
    if (messageCount >= 50 || (messageCount > 0 && messageCount >= messages.length * 0.1 / realMembers.size)) {
      powerUsers.push(userData)
    }
    // Casual users: 5-49 messages
    else if (messageCount >= 5 && messageCount < 50) {
      casualUsers.push(userData)
    }
    // Lurkers: 1-4 messages
    else if (messageCount >= 1 && messageCount < 5) {
      lurkers.push(userData)
    }
    
    // New users: Joined in last 30 days
    if (daysSinceJoin <= 30) {
      newUsers.push(userData)
    }
    
    // Inactive users: No message in 30+ days (but have messaged before)
    if (messageCount > 0 && daysSinceLastMessage >= 30) {
      inactiveUsers.push(userData)
    }
    
    // Ghost members: Joined but never messaged
    if (messageCount === 0) {
      ghostMembers.push(userData)
    }
  })
  
  console.log(`✅ [SERVERBOT] User segmentation complete:`)
  console.log(`   → Power users: ${powerUsers.length}`)
  console.log(`   → Casual users: ${casualUsers.length}`)
  console.log(`   → Lurkers: ${lurkers.length}`)
  console.log(`   → New users (30d): ${newUsers.length}`)
  console.log(`   → Inactive (30d+): ${inactiveUsers.length}`)
  console.log(`   → Ghost members: ${ghostMembers.length}`)
  
  // ============================================
  // NEW: RETENTION & ENGAGEMENT METRICS
  // ============================================
  
  console.log('📈 [SERVERBOT] Calculating retention metrics...')
  
  const retentionMetrics = {
    newMembersLast7Days: 0,
    newMembersLast30Days: 0,
    avgDaysToFirstMessage: 0,
    avgDaysToTenthMessage: 0,
    retentionRate30Days: 0,
    churnRate: 0,
  }
  
  let totalDaysToFirst = 0
  let usersWithFirstMessage = 0
  let totalDaysToTenth = 0
  let usersWithTenthMessage = 0
  let joined30DaysAgo = 0
  let stillActive30Days = 0
  
  realMembers.forEach(member => {
    const userId = member.user.id
    const joinedAt = member.joinedAt
    const daysSinceJoin = joinedAt ? Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24)) : 999
    
    // Count new members
    if (daysSinceJoin <= 7) retentionMetrics.newMembersLast7Days++
    if (daysSinceJoin <= 30) retentionMetrics.newMembersLast30Days++
    
    // Calculate days to first message
    const firstMessageDate = userFirstMessageDate[userId]
    if (firstMessageDate && joinedAt) {
      const daysToFirst = Math.floor((firstMessageDate - joinedAt) / (1000 * 60 * 60 * 24))
      if (daysToFirst >= 0 && daysToFirst < 365) { // Sanity check
        totalDaysToFirst += daysToFirst
        usersWithFirstMessage++
      }
    }
    
    // Calculate retention rate (members who joined 30+ days ago and are still active)
    if (daysSinceJoin >= 30 && daysSinceJoin <= 60) {
      joined30DaysAgo++
      const lastMessage = userLastMessageDate[userId]
      if (lastMessage && (now - lastMessage) / (1000 * 60 * 60 * 24) < 30) {
        stillActive30Days++
      }
    }
  })
  
  retentionMetrics.avgDaysToFirstMessage = usersWithFirstMessage > 0 ? 
    (totalDaysToFirst / usersWithFirstMessage).toFixed(1) : 0
  retentionMetrics.retentionRate30Days = joined30DaysAgo > 0 ?
    ((stillActive30Days / joined30DaysAgo) * 100).toFixed(1) : 0
  retentionMetrics.churnRate = ((inactiveUsers.length / realMembers.size) * 100).toFixed(1)
  
  console.log(`✅ [SERVERBOT] Retention metrics calculated:`)
  console.log(`   → New members (7d): ${retentionMetrics.newMembersLast7Days}`)
  console.log(`   → New members (30d): ${retentionMetrics.newMembersLast30Days}`)
  console.log(`   → Avg days to first message: ${retentionMetrics.avgDaysToFirstMessage}`)
  console.log(`   → 30-day retention rate: ${retentionMetrics.retentionRate30Days}%`)
  
  // ============================================
  // NEW: MESSAGE QUALITY AGGREGATIONS
  // ============================================
  
  console.log('💬 [SERVERBOT] Calculating message quality metrics...')
  
  const totalMessageLength = Object.values(userMessageLengths).flat().reduce((sum, len) => sum + len, 0)
  const totalMessages = Object.values(userMessageLengths).flat().length
  const totalReplies = Object.values(userReplyCount).reduce((sum, count) => sum + count, 0)
  const totalQuestions = Object.values(userQuestionCount).reduce((sum, count) => sum + count, 0)
  const totalLinks = Object.values(userLinkCount).reduce((sum, count) => sum + count, 0)
  const totalAttachments = Object.values(userAttachmentCount).reduce((sum, count) => sum + count, 0)
  
  const messageQuality = {
    avgMessageLength: totalMessages > 0 ? Math.round(totalMessageLength / totalMessages) : 0,
    replyRate: totalMessages > 0 ? ((totalReplies / totalMessages) * 100).toFixed(1) : 0,
    questionRate: totalMessages > 0 ? ((totalQuestions / totalMessages) * 100).toFixed(1) : 0,
    linksShared: totalLinks,
    attachmentsShared: totalAttachments,
  }
  
  console.log(`✅ [SERVERBOT] Message quality metrics:`)
  console.log(`   → Avg message length: ${messageQuality.avgMessageLength} chars`)
  console.log(`   → Reply rate: ${messageQuality.replyRate}%`)
  console.log(`   → Question rate: ${messageQuality.questionRate}%`)
  
  // ============================================
  // NEW: COMPARATIVE ANALYTICS
  // ============================================
  
  console.log('📊 [SERVERBOT] Calculating comparative analytics...')
  
  const todayVsYesterday = messagesYesterday > 0 ?
    (((messagesToday - messagesYesterday) / messagesYesterday) * 100).toFixed(1) : 0
  
  const comparativeAnalytics = {
    todayVsYesterday: {
      today: messagesToday,
      yesterday: messagesYesterday,
      change: parseFloat(todayVsYesterday),
      trend: todayVsYesterday > 0 ? 'up' : todayVsYesterday < 0 ? 'down' : 'stable',
    },
    thisWeekVsLastWeek: {
      thisWeek: messagesThisWeek,
      change: 0, // Would need last week's data stored
    },
  }
  
  console.log(`✅ [SERVERBOT] Comparative analytics:`)
  console.log(`   → Today vs yesterday: ${todayVsYesterday}%`)
  
  // ============================================
  // NEW: LEADERBOARDS
  // ============================================
  
  console.log('🏆 [SERVERBOT] Generating leaderboards...')
  
  // Most active this week
  const weeklyLeaderboard = Object.entries(userMessageCount)
    .map(([userId, count]) => ({
      userId,
      username: usernames[userId] || 'Unknown',
      messageCount: count,
      isNew: newUsers.some(u => u.userId === userId),
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 10)
  
  console.log(`✅ [SERVERBOT] Leaderboards generated`)

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
    // NEW: User Segmentation
    userSegmentation: {
      powerUsers: powerUsers.slice(0, 20),
      casualUsers: casualUsers.slice(0, 20),
      lurkers: lurkers.slice(0, 20),
      newUsers: newUsers.slice(0, 20),
      inactiveUsers: inactiveUsers.slice(0, 20),
      ghostMembers: ghostMembers.slice(0, 20),
      counts: {
        powerUsers: powerUsers.length,
        casualUsers: casualUsers.length,
        lurkers: lurkers.length,
        newUsers: newUsers.length,
        inactiveUsers: inactiveUsers.length,
        ghostMembers: ghostMembers.length,
      },
    },
    // NEW: Retention Metrics
    retention: retentionMetrics,
    // NEW: Message Quality
    messageQuality,
    // NEW: Comparative Analytics
    comparative: comparativeAnalytics,
    // NEW: Leaderboards
    leaderboards: {
      weeklyTopUsers: weeklyLeaderboard,
      topReactions: Object.entries(userReactionCount)
        .map(([userId, count]) => ({
          userId,
          username: usernames[userId] || 'Unknown',
          reactionCount: count,
        }))
        .sort((a, b) => b.reactionCount - a.reactionCount)
        .slice(0, 10),
    },
    // NEW: Recent Activity Summary
    recentActivity: {
      today: {
        messages: messagesToday,
        change: comparativeAnalytics.todayVsYesterday.change,
        trend: comparativeAnalytics.todayVsYesterday.trend,
      },
      thisWeek: {
        messages: messagesThisWeek,
        newMembers: retentionMetrics.newMembersLast7Days,
      },
      yesterday: {
        messages: messagesYesterday,
      },
    },
  }

  // Save to Firebase
  console.log('💾 [SERVERBOT] Saving to Firebase: serverAnalytics/discord')
  await db.collection('serverAnalytics').doc('discord').set(analyticsData)

  console.log('✅ [SERVERBOT] Analytics saved successfully to Firebase!')
  console.log('📊 [SERVERBOT] Complete Summary:')
  console.log('')
  console.log('   📈 Core Metrics:')
  console.log(`      → ${realMembers.size} members analyzed`)
  console.log(`      → ${messages.length} messages processed (30 days)`)
  console.log(`      → ${channelStats.length} channels tracked`)
  console.log(`      → ${Object.keys(userMessageCount).length} active users`)
  console.log(`      → ${Object.keys(roleDistribution).length} roles`)
  console.log('')
  console.log('   👥 User Segmentation:')
  console.log(`      → ${powerUsers.length} power users`)
  console.log(`      → ${casualUsers.length} casual users`)
  console.log(`      → ${lurkers.length} lurkers`)
  console.log(`      → ${ghostMembers.length} ghost members`)
  console.log('')
  console.log('   🔄 Retention & Growth:')
  console.log(`      → ${retentionMetrics.newMembersLast7Days} new members (7d)`)
  console.log(`      → ${retentionMetrics.avgDaysToFirstMessage} avg days to first message`)
  console.log(`      → ${retentionMetrics.retentionRate30Days}% retention rate`)
  console.log('')
  console.log('   💬 Message Quality:')
  console.log(`      → ${messageQuality.avgMessageLength} avg chars/message`)
  console.log(`      → ${messageQuality.replyRate}% reply rate`)
  console.log(`      → ${messageQuality.questionRate}% question rate`)
  console.log('')
  console.log('   📊 Today\'s Activity:')
  console.log(`      → ${messagesToday} messages today`)
  console.log(`      → ${comparativeAnalytics.todayVsYesterday.change > 0 ? '+' : ''}${comparativeAnalytics.todayVsYesterday.change}% vs yesterday`)
  console.log('')
  console.log('🎉 [SERVERBOT] Collection complete! All data is now available in the admin dashboard.')

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

