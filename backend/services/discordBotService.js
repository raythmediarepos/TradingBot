const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js')
const {
  getBetaUser,
  updateBetaUser,
  markDiscordInviteUsed,
  validateDiscordInvite,
  USER_STATUS,
} = require('./betaUserService')

// ============================================
// DISCORD CLIENT INITIALIZATION
// ============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // For analytics - reading message content
    GatewayIntentBits.DirectMessages,
  ],
})

// Discord configuration
const DISCORD_CONFIG = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  SERVER_ID: process.env.DISCORD_SERVER_ID || process.env.DISCORD_GUILD_ID, // Support both names
  BETA_ROLE_ID: process.env.DISCORD_BETA_ROLE_ID,
  UNVERIFIED_ROLE_ID: process.env.DISCORD_UNVERIFIED_ROLE_ID, // Auto-assigned on join
  WELCOME_CHANNEL_ID: process.env.DISCORD_WELCOME_CHANNEL_ID, // Optional - Public welcome channel for instructions
}

let botReady = false
let guild = null
let betaRole = null
let unverifiedRole = null

// ============================================
// BOT EVENT HANDLERS
// ============================================

/**
 * Bot ready event
 */
client.once('clientReady', async () => {
  console.log('🤖 [DISCORD BOT] Connected successfully')
  console.log(`   → Bot User: ${client.user.tag}`)
  console.log(`   → Bot ID: ${client.user.id}`)

  try {
    // Validate SERVER_ID is provided
    if (!DISCORD_CONFIG.SERVER_ID) {
      console.error('❌ [DISCORD BOT] DISCORD_SERVER_ID or DISCORD_GUILD_ID not set in .env')
      console.error('   → Please add your Discord server ID to the .env file')
      botReady = false
      return
    }

    // Get guild (server)
    console.log(`   → Fetching guild: ${DISCORD_CONFIG.SERVER_ID}`)
    
    // List all guilds the bot is in
    const guilds = client.guilds.cache
    console.log(`   → Bot is in ${guilds.size} server(s)`)
    if (guilds.size > 0) {
      guilds.forEach(g => {
        console.log(`      • ${g.name} (ID: ${g.id})`)
      })
    } else {
      console.error('   ⚠️  Bot is not in any servers!')
      console.error('   → Invite the bot to your server using the OAuth2 URL')
      console.error('   → Go to: https://discord.com/developers/applications')
      botReady = false
      return
    }
    
    // Try to fetch the specific guild
    try {
      guild = await client.guilds.fetch(DISCORD_CONFIG.SERVER_ID)
      console.log(`   → Guild: ${guild.name}`)
    } catch (guildError) {
      console.error(`   ❌ Could not fetch guild with ID: ${DISCORD_CONFIG.SERVER_ID}`)
      console.error(`   → Error: ${guildError.message}`)
      console.error(`   → Make sure the bot is invited to the correct server`)
      console.error(`   → Make sure the DISCORD_GUILD_ID in .env matches a server ID above`)
      botReady = false
      return
    }

    // Get beta role
    try {
      betaRole = await guild.roles.fetch(DISCORD_CONFIG.BETA_ROLE_ID)
      console.log(`   → Beta Role: ${betaRole.name}`)
    } catch (roleError) {
      console.error(`   ❌ Could not fetch role with ID: ${DISCORD_CONFIG.BETA_ROLE_ID}`)
      console.error(`   → Error: ${roleError.message}`)
      console.error(`   → Make sure the Beta Tester role exists in your Discord server`)
      botReady = false
      return
    }

    // Get unverified role (optional)
    if (DISCORD_CONFIG.UNVERIFIED_ROLE_ID) {
      try {
        unverifiedRole = await guild.roles.fetch(DISCORD_CONFIG.UNVERIFIED_ROLE_ID)
        console.log(`   → Unverified Role: ${unverifiedRole.name}`)
      } catch (roleError) {
        console.warn(`   ⚠️  Could not fetch unverified role with ID: ${DISCORD_CONFIG.UNVERIFIED_ROLE_ID}`)
        console.warn(`   → Unverified role is optional but recommended for better security`)
      }
    } else {
      console.warn(`   ⚠️  DISCORD_UNVERIFIED_ROLE_ID not set - users will have @everyone permissions`)
      console.warn(`   → Create an "Unverified" role and add its ID to .env for better security`)
    }

    botReady = true
    console.log('✅ [DISCORD BOT] Ready to process requests')
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error during initialization:', error)
    botReady = false
  }
})

/**
 * New member joined event
 */
client.on('guildMemberAdd', async (member) => {
  try {
    console.log('👤 [DISCORD BOT] New member joined')
    console.log(`   → Username: ${member.user.tag}`)
    console.log(`   → User ID: ${member.user.id}`)

    // Assign unverified role immediately (if configured)
    if (unverifiedRole) {
      try {
        await member.roles.add(unverifiedRole)
        console.log(`   → Assigned "Unverified" role`)
      } catch (roleError) {
        console.error(`   → Failed to assign unverified role:`, roleError.message)
      }
    }

    // Send welcome DM with instructions
    try {
      await member.send({
        content: `Welcome to Helwa AI Beta! 🐝\n\n` +
          `To get access to the beta channels, please verify your email by sending me your unique invite token.\n\n` +
          `You should have received this token in your email. Just reply with the token here.\n\n` +
          `Format: \`discord_xxxxxxxxxx\``,
      })
      console.log('   → Welcome DM sent')
    } catch (dmError) {
      console.error('   → Failed to send DM (user may have DMs disabled)')
      
      // Try to send in welcome channel if configured
      if (DISCORD_CONFIG.WELCOME_CHANNEL_ID) {
        const welcomeChannel = await guild.channels.fetch(DISCORD_CONFIG.WELCOME_CHANNEL_ID)
        if (welcomeChannel) {
          await welcomeChannel.send({
            content: `Welcome ${member}! Please check your DMs for verification instructions. ` +
              `If you didn't receive a DM, make sure your DMs are enabled and contact an admin.`,
          })
        }
      }
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error handling new member:', error)
  }
})

/**
 * Direct message handler for token verification
 */
client.on('messageCreate', async (message) => {
  // Handle DM messages
  if (!message.guild) {
    if (message.author.bot) return

    const content = message.content.trim()

    // Check for special VIP/admin access command
    if (content === 'I am given free access. open seaseme.') {
      await handleVIPAccess(message)
      return
    }

    // Check if message looks like a Discord invite token
    if (content.startsWith('discord_')) {
      await handleTokenVerification(message, content)
    }
    return
  }

  // Handle guild messages for analytics
  if (message.author.bot) return
  
  // Only track messages in our guild
  if (message.guild.id !== DISCORD_CONFIG.SERVER_ID) return

  // Track message for analytics
  await trackMessage(message)
})

/**
 * Handle token verification from DM
 */
const handleTokenVerification = async (message, token) => {
  try {
    console.log('🔐 [DISCORD BOT] Token verification attempt')
    console.log(`   → User: ${message.author.tag}`)
    console.log(`   → Token: ${token.substring(0, 15)}...`)

    // Validate token
    const result = await validateDiscordInvite(token)

    if (!result.success) {
      await message.reply({
        content: '❌ Invalid or expired invite token. Please check your email for the correct token or contact support.',
      })
      return
    }

    const invite = result.invite

    // Get beta user
    const userResult = await getBetaUser(invite.userId)
    if (!userResult.success) {
      await message.reply({
        content: '❌ Error: Could not find your beta registration. Please contact support.',
      })
      return
    }

    const user = userResult.user

    // Check if user is in the guild
    const member = await guild.members.fetch(message.author.id).catch(() => null)

    if (!member) {
      await message.reply({
        content: '❌ You are not a member of the Helwa AI server. Please join first using the invite link from your email.',
      })
      return
    }

    // Remove unverified role and assign beta role
    if (unverifiedRole) {
      try {
        await member.roles.remove(unverifiedRole)
        console.log(`   → Removed "Unverified" role`)
      } catch (roleError) {
        console.error(`   → Failed to remove unverified role:`, roleError.message)
      }
    }
    
    await member.roles.add(betaRole)
    console.log(`   → Assigned "Beta Tester" role`)

    // Mark invite as used
    await markDiscordInviteUsed(invite.id, {
      userId: message.author.id,
      username: message.author.tag,
    })

    // Update beta user
    await updateBetaUser(invite.userId, {
      status: USER_STATUS.DISCORD_JOINED,
      discordJoined: true,
      discordUserId: message.author.id,
      discordUsername: message.author.tag,
    })

    console.log('✅ [DISCORD BOT] User verified and role assigned')
    console.log(`   → Beta User ID: ${invite.userId}`)
    console.log(`   → Discord User: ${message.author.tag}`)

    // Send success message
    await message.reply({
      content: `✅ **Verification successful!**\n\n` +
        `Welcome to the Helwa AI Beta Program! 🐝\n\n` +
        `You now have access to all beta channels. Let's get started!\n\n` +
        `• Check out <#your-announcements-channel-id> for updates\n` +
        `• Head to <#your-general-channel-id> to chat with other beta testers\n` +
        `• Report bugs in <#your-bugs-channel-id>\n\n` +
        `Enjoy!`,
    })

    // Send welcome message in welcome channel
    if (DISCORD_CONFIG.WELCOME_CHANNEL_ID) {
      try {
        const welcomeChannel = await guild.channels.fetch(DISCORD_CONFIG.WELCOME_CHANNEL_ID)
        if (welcomeChannel) {
          await welcomeChannel.send({
            content: `🎉 Welcome to the beta, ${member}! We're excited to have you here!`,
          })
        }
      } catch (error) {
        console.error('   → Failed to send welcome channel message:', error)
      }
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error during token verification:', error)
    await message.reply({
      content: '❌ An error occurred during verification. Please try again or contact support.',
    }).catch(console.error)
  }
}

/**
 * Handle VIP/Admin access with special command
 */
const handleVIPAccess = async (message) => {
  try {
    console.log('🔓 [DISCORD BOT] VIP Access Command Used')
    console.log(`   → User: ${message.author.tag}`)
    console.log(`   → User ID: ${message.author.id}`)

    // Check if bot is ready
    if (!botReady) {
      await message.reply({
        content: '❌ Bot is not ready yet. Please try again in a moment.',
      })
      return
    }

    // Check if user is in the guild
    const member = await guild.members.fetch(message.author.id).catch(() => null)

    if (!member) {
      await message.reply({
        content: '❌ You are not a member of the Helwa AI server. Please join first using the invite link: ' + 
                 (process.env.DISCORD_SERVER_INVITE_URL || 'Contact support for invite link'),
      })
      return
    }

    // Check if user already has the Beta Tester role
    if (member.roles.cache.has(betaRole.id)) {
      await message.reply({
        content: '✅ You already have Beta Tester access! Welcome back! 🐝',
      })
      return
    }

    // Remove unverified role if present
    if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
      try {
        await member.roles.remove(unverifiedRole)
        console.log(`   → Removed "Unverified" role`)
      } catch (roleError) {
        console.error(`   → Failed to remove unverified role:`, roleError.message)
      }
    }
    
    // Assign Beta Tester role
    await member.roles.add(betaRole)
    console.log(`   → Assigned "Beta Tester" role via VIP access`)

    console.log('✅ [DISCORD BOT] VIP access granted')
    console.log(`   → Discord User: ${message.author.tag}`)

    // Send success message
    await message.reply({
      content: `✅ **VIP Access Granted!**\n\n` +
        `Welcome to the Helwa AI Beta Program! 🐝\n\n` +
        `You now have full access to all beta channels.\n\n` +
        `• Check out the announcements for updates\n` +
        `• Start receiving real-time trading signals\n` +
        `• Join discussions with other beta testers\n\n` +
        `Let's get trading! 🚀`,
    })

    // Send welcome message in welcome channel
    if (DISCORD_CONFIG.WELCOME_CHANNEL_ID) {
      try {
        const welcomeChannel = await guild.channels.fetch(DISCORD_CONFIG.WELCOME_CHANNEL_ID)
        if (welcomeChannel) {
          await welcomeChannel.send({
            content: `🎉 Welcome to the beta, ${member}! VIP access granted! 👑`,
          })
        }
      } catch (error) {
        console.error('   → Failed to send welcome channel message:', error)
      }
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error during VIP access:', error)
    await message.reply({
      content: '❌ An error occurred. Please contact support.',
    }).catch(console.error)
  }
}

// ============================================
// BOT FUNCTIONS
// ============================================

/**
 * Start the Discord bot
 * @returns {Promise<void>}
 */
const startBot = async () => {
  try {
    if (!DISCORD_CONFIG.BOT_TOKEN) {
      console.warn('⚠️  [DISCORD BOT] No bot token provided, skipping Discord bot initialization')
      return
    }

    console.log('🚀 [DISCORD BOT] Starting Discord bot...')
    await client.login(DISCORD_CONFIG.BOT_TOKEN)
  } catch (error) {
    console.error('❌ [DISCORD BOT] Failed to start:', error)
    throw error
  }
}

/**
 * Stop the Discord bot
 * @returns {Promise<void>}
 */
const stopBot = async () => {
  try {
    if (client && botReady) {
      console.log('👋 [DISCORD BOT] Shutting down...')
      await client.destroy()
      botReady = false
      console.log('✅ [DISCORD BOT] Shut down successfully')
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error during shutdown:', error)
  }
}

/**
 * Check if bot is ready
 * @returns {boolean}
 */
const isBotReady = () => {
  return botReady
}

/**
 * Assign beta role to a member
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<Object>}
 */
const assignBetaRole = async (discordUserId) => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    console.log(`🎭 [DISCORD BOT] Assigning beta role to user ${discordUserId}`)

    const member = await guild.members.fetch(discordUserId)
    await member.roles.add(betaRole)

    console.log(`✅ [DISCORD BOT] Role assigned successfully`)

    return {
      success: true,
      message: 'Beta role assigned successfully',
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error assigning role:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Revoke beta role from a member
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<Object>}
 */
const revokeBetaRole = async (discordUserId) => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    console.log(`🚫 [DISCORD BOT] Revoking beta role from user ${discordUserId}`)

    const member = await guild.members.fetch(discordUserId)
    await member.roles.remove(betaRole)

    console.log(`✅ [DISCORD BOT] Role revoked successfully`)

    return {
      success: true,
      message: 'Beta role revoked successfully',
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error revoking role:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Kick a member from the server
 * @param {string} discordUserId - Discord user ID
 * @param {string} reason - Reason for kick
 * @returns {Promise<Object>}
 */
const kickMember = async (discordUserId, reason = 'Beta access revoked') => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    console.log(`👢 [DISCORD BOT] Kicking user ${discordUserId}`)

    const member = await guild.members.fetch(discordUserId)
    await member.kick(reason)

    console.log(`✅ [DISCORD BOT] User kicked successfully`)

    return {
      success: true,
      message: 'User kicked successfully',
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error kicking user:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send a DM to a user
 * @param {string} discordUserId - Discord user ID
 * @param {string} message - Message content
 * @returns {Promise<Object>}
 */
const sendDirectMessage = async (discordUserId, message) => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    console.log(`📨 [DISCORD BOT] Sending DM to user ${discordUserId}`)

    const user = await client.users.fetch(discordUserId)
    await user.send(message)

    console.log(`✅ [DISCORD BOT] DM sent successfully`)

    return {
      success: true,
      message: 'DM sent successfully',
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error sending DM:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Create a single-use invite link to the server
 * @param {number} maxAge - Max age in seconds (default: 7 days)
 * @param {number} maxUses - Max uses (default: 1)
 * @returns {Promise<Object>}
 */
const createInviteLink = async (maxAge = 604800, maxUses = 1) => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    console.log('🔗 [DISCORD BOT] Creating invite link')

    // Get first text channel or system channel
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0)
    
    if (!channel) {
      return {
        success: false,
        message: 'No suitable channel found to create invite',
      }
    }

    const invite = await channel.createInvite({
      maxAge: maxAge,
      maxUses: maxUses,
      unique: true,
      reason: 'Beta program invite',
    })

    console.log(`✅ [DISCORD BOT] Invite created: ${invite.code}`)

    return {
      success: true,
      inviteUrl: invite.url,
      inviteCode: invite.code,
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error creating invite:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get member count in guild
 * @returns {Promise<Object>}
 */
const getGuildStats = async () => {
  try {
    if (!botReady) {
      return {
        success: false,
        message: 'Bot is not ready',
      }
    }

    const memberCount = guild.memberCount
    const betaRoleMembers = betaRole.members.size

    return {
      success: true,
      stats: {
        totalMembers: memberCount,
        betaMembers: betaRoleMembers,
        guildName: guild.name,
      },
    }
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error getting guild stats:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get all members with their verification status
 */
const getAllMembers = async () => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    // Try to fetch members with a timeout, fall back to cache if it fails
    try {
      await Promise.race([
        guild.members.fetch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 5000))
      ])
    } catch (fetchError) {
      console.warn('⚠️ [DISCORD] Member fetch timed out or failed, using cache:', fetchError.message)
      // Continue with cached members
    }
    
    const members = guild.members.cache

    const memberList = members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      tag: member.user.tag,
      bot: member.user.bot,
      joinedAt: member.joinedAt,
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
      })),
      hasVerified: member.roles.cache.has(DISCORD_CONFIG.BETA_ROLE_ID),
      isUnverified: member.roles.cache.has(DISCORD_CONFIG.UNVERIFIED_ROLE_ID),
    }))

    return {
      success: true,
      members: memberList.filter(m => !m.bot), // Exclude bots
    }
  } catch (error) {
    console.error('Error getting all members:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Ban a member from the server
 */
const banMember = async (userId, reason = 'No reason provided') => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    const member = await guild.members.fetch(userId)
    if (!member) {
      return { success: false, message: 'Member not found' }
    }

    await member.ban({ reason })
    console.log(`⛔ [DISCORD] Banned user ${member.user.tag}. Reason: ${reason}`)

    return {
      success: true,
      message: `Successfully banned ${member.user.tag}`,
    }
  } catch (error) {
    console.error('Error banning member:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send announcement to a channel
 */
const sendAnnouncement = async (channelId, message, isEmbed = false) => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    const channel = await guild.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) {
      return { success: false, message: 'Channel not found or is not a text channel' }
    }

    if (isEmbed) {
      await channel.send({
        embeds: [{
          title: message.title || 'Announcement',
          description: message.description,
          color: 0xFFC107, // Yellow color
          timestamp: new Date(),
          footer: {
            text: 'Helwa AI Team',
          },
        }],
      })
    } else {
      await channel.send(message)
    }

    console.log(`📢 [DISCORD] Announcement sent to #${channel.name}`)

    return {
      success: true,
      message: `Announcement sent to #${channel.name}`,
    }
  } catch (error) {
    console.error('Error sending announcement:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all channels in the server
 */
const getChannels = async () => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    await guild.channels.fetch()
    const channels = guild.channels.cache

    const channelList = channels
      .filter(channel => channel.isTextBased())
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position,
      }))
      .sort((a, b) => a.position - b.position)

    return {
      success: true,
      channels: channelList,
    }
  } catch (error) {
    console.error('Error getting channels:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Manually assign beta role (admin override)
 */
const manuallyVerifyUser = async (userId) => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    const member = await guild.members.fetch(userId)
    if (!member) {
      return { success: false, message: 'Member not found' }
    }

    // Assign beta role
    await member.roles.add(betaRole)
    
    // Remove unverified role if they have it
    if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
      await member.roles.remove(unverifiedRole)
    }

    // Send DM
    try {
      await member.send('✅ You have been manually verified by an administrator and now have access to the Helwa AI Beta channels!')
    } catch (dmError) {
      console.log(`   ⚠️  Could not send DM to ${member.user.tag}`)
    }

    console.log(`✅ [DISCORD] Manually verified user ${member.user.tag}`)

    return {
      success: true,
      message: `Successfully verified ${member.user.tag}`,
    }
  } catch (error) {
    console.error('Error manually verifying user:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// ANALYTICS TRACKING
// ============================================

/**
 * Track message for analytics
 */
const trackMessage = async (message) => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()

    // Extract emoji count from message
    const emojiRegex = /<a?:[a-zA-Z0-9_]+:\d+>|[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
    const emojis = message.content.match(emojiRegex) || []
    
    // Store message analytics
    await db.collection('discordAnalytics').add({
      userId: message.author.id,
      username: message.author.username,
      channelId: message.channel.id,
      channelName: message.channel.name,
      messageLength: message.content.length,
      emojiCount: emojis.length,
      emojis: emojis.slice(0, 10), // Store up to 10 emojis
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD for daily aggregation
      month: new Date().toISOString().substring(0, 7), // YYYY-MM for monthly aggregation
    })
  } catch (error) {
    console.error('Error tracking message:', error.message)
    // Don't throw - analytics shouldn't break the bot
  }
}

/**
 * Get analytics data
 */
const getAnalytics = async (timeRange = '30d') => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30)
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90)
    } else {
      startDate.setFullYear(now.getFullYear() - 1) // All time
    }

    // Fetch analytics data
    const snapshot = await db.collection('discordAnalytics')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get()

    if (snapshot.empty) {
      return {
        success: true,
        data: {
          totalMessages: 0,
          topCommenters: [],
          topEmojiUsers: [],
          channelStats: [],
          monthlyGrowth: [],
        },
      }
    }

    // Process data
    const messages = []
    const userMessageCount = {}
    const userEmojiCount = {}
    const channelMessageCount = {}
    const monthlyData = {}

    snapshot.forEach(doc => {
      const data = doc.data()
      messages.push(data)

      // Count messages per user
      userMessageCount[data.userId] = (userMessageCount[data.userId] || 0) + 1

      // Count emojis per user
      userEmojiCount[data.userId] = (userEmojiCount[data.userId] || 0) + (data.emojiCount || 0)

      // Count messages per channel
      const channelKey = `${data.channelId}|${data.channelName}`
      channelMessageCount[channelKey] = (channelMessageCount[channelKey] || 0) + 1

      // Monthly data
      if (data.month) {
        if (!monthlyData[data.month]) {
          monthlyData[data.month] = { messages: 0, users: new Set() }
        }
        monthlyData[data.month].messages++
        monthlyData[data.month].users.add(data.userId)
      }
    })

    // Get usernames
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
      .slice(0, 10)

    // Top emoji users
    const topEmojiUsers = Object.entries(userEmojiCount)
      .map(([userId, count]) => ({
        userId,
        username: usernames[userId] || 'Unknown',
        emojiCount: count,
      }))
      .sort((a, b) => b.emojiCount - a.emojiCount)
      .slice(0, 10)

    // Channel stats
    const channelStats = Object.entries(channelMessageCount)
      .map(([key, count]) => {
        const [channelId, channelName] = key.split('|')
        return {
          channelId,
          channelName,
          messageCount: count,
          avgMessagesPerDay: (count / ((now - startDate) / (1000 * 60 * 60 * 24))).toFixed(1),
        }
      })
      .sort((a, b) => b.messageCount - a.messageCount)

    // Monthly growth
    const monthlyGrowth = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        messageCount: data.messages,
        activeUsers: data.users.size,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      success: true,
      data: {
        totalMessages: messages.length,
        topCommenters,
        topEmojiUsers,
        channelStats,
        monthlyGrowth,
        timeRange,
      },
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get member growth data
 */
const getMemberGrowth = async () => {
  try {
    if (!botReady || !guild) {
      return { success: false, message: 'Bot is not ready' }
    }

    // Fetch all members
    await guild.members.fetch()
    const members = guild.members.cache

    // Group by join month
    const monthlyJoins = {}
    
    members.forEach(member => {
      if (member.user.bot) return
      
      const joinDate = member.joinedAt
      if (!joinDate) return
      
      const month = joinDate.toISOString().substring(0, 7) // YYYY-MM
      monthlyJoins[month] = (monthlyJoins[month] || 0) + 1
    })

    // Convert to array and calculate cumulative
    const growthData = Object.entries(monthlyJoins)
      .map(([month, joins]) => ({ month, joins }))
      .sort((a, b) => a.month.localeCompare(b.month))

    let cumulative = 0
    const cumulativeGrowth = growthData.map(item => {
      cumulative += item.joins
      return {
        ...item,
        total: cumulative,
      }
    })

    return {
      success: true,
      data: cumulativeGrowth,
      currentTotal: members.filter(m => !m.user.bot).size,
    }
  } catch (error) {
    console.error('Error getting member growth:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  client,
  DISCORD_CONFIG,

  // Lifecycle
  startBot,
  stopBot,
  isBotReady,

  // Role management
  assignBetaRole,
  revokeBetaRole,

  // Member management
  kickMember,
  banMember,
  sendDirectMessage,
  getAllMembers,
  manuallyVerifyUser,

  // Invites
  createInviteLink,

  // Stats
  getGuildStats,

  // Announcements
  sendAnnouncement,
  getChannels,

  // Analytics
  getAnalytics,
  getMemberGrowth,

  // Getters (for admin endpoints)
  getGuild: () => guild,
  getBetaRole: () => betaRole,
  getUnverifiedRole: () => unverifiedRole,
}

