const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js')
const {
  getBetaUser,
  updateBetaUser,
  markDiscordInviteUsed,
  validateDiscordInvite,
  USER_STATUS,
} = require('./betaUserService')

// Track if module has been initialized to prevent multiple clients
if (global.__discordBotClient) {
  console.log('⚠️  [DISCORD BOT] Using existing Discord client (module already loaded)')
  module.exports = global.__discordBotClient
} else {
  console.log('🆕 [DISCORD BOT] Creating new Discord client...')

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
let listenersRegistered = false

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
    // Fetch the guild
    const guildId = DISCORD_CONFIG.SERVER_ID
    console.log(`   → Fetching guild: ${guildId}`)
    
    const guilds = await client.guilds.fetch()
    console.log(`   → Bot is in ${guilds.size} server(s)`)
    guilds.forEach(g => {
      console.log(`      • ${g.name} (ID: ${g.id})`)
    })
    
    guild = await client.guilds.fetch(guildId)
    
    if (!guild) {
      throw new Error(`Guild ${guildId} not found`)
    }
    
    console.log(`   → Guild: ${guild.name}`)
    
    // Fetch roles
    const roles = await guild.roles.fetch()
    betaRole = roles.find(role => role.id === DISCORD_CONFIG.BETA_ROLE_ID)
    unverifiedRole = roles.find(role => role.id === DISCORD_CONFIG.UNVERIFIED_ROLE_ID)
    
    if (!betaRole) {
      console.warn(`   ⚠️  Beta role not found (ID: ${DISCORD_CONFIG.BETA_ROLE_ID})`)
    } else {
      console.log(`   → Beta Role: ${betaRole.name}`)
    }
    
    if (!unverifiedRole) {
      console.warn(`   ⚠️  Unverified role not found (ID: ${DISCORD_CONFIG.UNVERIFIED_ROLE_ID})`)
    } else {
      console.log(`   → Unverified Role: ${unverifiedRole.name}`)
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
 * Note: Using named function to allow checking if listener already exists
 */
const handleGuildMemberAdd = async (member) => {
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
}

/**
 * Direct message handler for token verification
 * Note: Using named function to allow checking if listener already exists
 */
const handleMessageCreate = async (message) => {
  // Handle DM messages
  if (!message.guild) {
    if (message.author.bot) return

    const content = message.content.trim().toLowerCase()
    const originalContent = message.content.trim()

    // Check for resend token command
    if (content === 'resend' || content === 'resend token' || content === '!resend') {
      await handleResendToken(message)
      return
    }

    // Check for help command
    if (content === 'help' || content === '!help') {
      await message.reply({
        content: `**Helwa AI Bot Commands:**\n\n` +
          `• Send your \`discord_xxxxx\` token to verify\n` +
          `• Type \`resend\` to get a new verification token\n` +
          `• Type \`help\` to see this message\n\n` +
          `Need support? Contact an admin in the server.`,
      })
      return
    }

    // Check if message looks like a discord token
    if (originalContent.startsWith('discord_')) {
      await handleDiscordVerification(message, originalContent)
      return
    }

    // Unknown command
    await message.reply({
      content: `I didn't understand that command. Type \`help\` to see available commands.`,
    })
    return
  }

  // Handle guild messages
  if (message.author.bot) return
  
  // Only track messages in our guild
  if (message.guild.id !== DISCORD_CONFIG.SERVER_ID) return

  // Check for admin commands in alerts channel
  const content = message.content.trim().toLowerCase()
  const alertsChannelId = process.env.DISCORD_ALERTS_CHANNEL_ID
  
  if (alertsChannelId && message.channel.id === alertsChannelId) {
    // Clear spam command - delete all system advisory messages
    if (content === 'clear spam') {
      try {
        const loadingMsg = await message.reply('🧹 Clearing spam messages...')
        
        // Fetch last 100 messages
        const messages = await message.channel.messages.fetch({ limit: 100 })
        
        // Filter for system advisory/alert messages (keep signup/user updates)
        const spamMessages = messages.filter(msg => {
          if (!msg.author.bot) return false
          if (!msg.embeds || msg.embeds.length === 0) return false
          
          const embed = msg.embeds[0]
          const title = embed.title || ''
          const description = embed.description || ''
          const content = msg.content || ''
          
          // Delete system advisory/alert messages (keep user journey messages)
          const isSpam = 
            title.includes('System Advisory') || 
            description.includes('System Advisory') ||
            title.includes('SYSTEM ALERT') ||
            title.includes('CRITICAL ALERT') ||
            title.includes('URGENT SYSTEM ALERT') ||
            content.includes('🔴 CRITICAL ALERT') ||
            content.includes('🟡 System Advisory') ||
            content.includes('System Advisory') ||
            content.includes('URGENT SYSTEM ALERT')
          
          // Keep user journey messages
          const isUserMessage = 
            title.includes('Beta Signup') ||
            title.includes('Email Verified') ||
            title.includes('Payment') ||
            title.includes('Discord') ||
            description.includes('signed up') ||
            description.includes('verified their email') ||
            description.includes('joined Discord')
          
          return isSpam && !isUserMessage
        })
        
        // Bulk delete (max 100 messages at a time, must be < 14 days old)
        if (spamMessages.size > 0) {
          await message.channel.bulkDelete(spamMessages, true)
          await loadingMsg.edit(`✅ Deleted ${spamMessages.size} system advisory messages. Kept all signup/user updates.`)
          
          console.log(`🧹 [DISCORD BOT] Admin cleared ${spamMessages.size} spam messages`)
        } else {
          await loadingMsg.edit('✅ No spam messages found to delete.')
        }
        
        // Delete the command message after 5 seconds
        setTimeout(() => {
          message.delete().catch(() => {})
          setTimeout(() => loadingMsg.delete().catch(() => {}), 3000)
        }, 5000)
        
        return
      } catch (error) {
        console.error('❌ [DISCORD BOT] Error clearing spam:', error)
        await message.reply('❌ Failed to clear spam messages. Check my permissions.')
        return
      }
    }
  }

  // Track message for analytics
  await trackMessage(message)
}

/**
 * Retry role assignment with exponential backoff
 */
const assignRoleWithRetry = async (member, role, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await member.roles.add(role)
      console.log(`   → Assigned "${role.name}" role (attempt ${attempt})`)
      return true
    } catch (error) {
      console.error(`   → Failed to assign role (attempt ${attempt}/${maxRetries}):`, error.message)
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`   → Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error(`   → Max retries reached, giving up`)
        return false
      }
    }
  }
  return false
}

/**
 * Handle Discord token verification
 */
const handleDiscordVerification = async (message, token) => {
  try {
    console.log('🔐 [DISCORD BOT] Token verification attempt')
    console.log(`   → User: ${message.author.tag}`)
    console.log(`   → Token: ${token.substring(0, 16)}...`)

    // Validate the Discord invite
    const result = await validateDiscordInvite(token)
    
    if (!result.success) {
      console.log(`   → Verification failed: ${result.error}`)
      
      // Send appropriate error message
      if (result.error === 'Token already used') {
        await message.reply({
          content: `❌ **Verification Failed**\n\n` +
            `This token has already been used.\n\n` +
            `You may have already verified your account.\n\n` +
            `**Check your roles:** Do you see the **Beta Tester** role?\n\n` +
            `If not, type \`resend\` to get a new token.`,
        })
      } else if (result.error === 'Token expired') {
        await message.reply({
          content: `❌ **Verification Failed**\n\n` +
            `This token has expired.\n\n` +
            `Type \`resend\` to get a new verification token.`,
        })
      } else {
        await message.reply({
          content: `❌ **Verification Failed**\n\n` +
            `Invalid token. Please check your email for the correct token.\n\n` +
            `Format: \`discord_xxxxxxxxxx\`\n\n` +
            `Type \`resend\` if you need a new token.`,
        })
      }
      return
    }

    // Get the member object
    const member = await guild.members.fetch(message.author.id)
    
    if (!member) {
      await message.reply({
        content: `❌ **Error**\n\nCouldn't find you in the server. Please make sure you've joined the server first.`,
      })
      return
    }

    // Remove unverified role if they have it
    if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
      try {
        await member.roles.remove(unverifiedRole)
        console.log(`   → Removed "Unverified" role`)
      } catch (roleError) {
        console.error(`   → Failed to remove unverified role:`, roleError.message)
      }
    }

    // Assign beta role with retry
    if (betaRole) {
      const roleAssigned = await assignRoleWithRetry(member, betaRole)
      if (!roleAssigned) {
        await message.reply({
          content: `⚠️ **Partial Success**\n\n` +
            `Your account is verified, but I couldn't assign the Beta Tester role.\n\n` +
            `Please contact an admin for manual role assignment.`,
        })
        return
      }
    }

    // Mark the invite as used and update user
    await markDiscordInviteUsed(result.inviteId, message.author.id, message.author.tag)
    
    // Update user record with Discord info
    await updateBetaUser(result.userId, {
      discordUserId: message.author.id,
      discordUsername: message.author.tag,
      discordJoined: true,
      discordJoinedAt: new Date(),
      status: USER_STATUS.DISCORD_JOINED,
    })

    console.log('✅ [DISCORD BOT] User verified and role assigned')
    console.log(`   → Beta User ID: ${result.userId}`)
    console.log(`   → Discord User: ${message.author.tag}`)
    console.log(`   → Founding Member: ${result.isFree ? 'YES 👑' : 'NO'}`)

    // Send success message (different for founding members vs paid)
    if (result.isFree) {
      // Founding member (first 20 free users)
      await message.reply({
        content: `✅ **Verification Successful!**\n\n` +
          `👑 **FOUNDING MEMBER - LIFETIME FREE ACCESS** 👑\n\n` +
          `Welcome to the Helwa AI Beta Program! 🐝\n\n` +
          `You are one of our first 20 users! As a founding member, you have been granted **PERMANENT FREE ACCESS FOR LIFE** to Helwa AI as a thank you for being an early supporter.\n\n` +
          `🎉 **Your Benefits:**\n` +
          `• Lifetime free access - No expiration, no charges, ever\n` +
          `• Founding Member badge - Special recognition in our community\n` +
          `• Priority support - Your feedback shapes the future of Helwa AI\n` +
          `• Exclusive perks - Early access to new features and VIP treatment\n\n` +
          `You now have full access to all beta channels. Let's get started!\n\n` +
          `• Check out <#your-announcements-channel-id> for updates\n` +
          `• Head to <#your-general-channel-id> to chat with other beta testers\n` +
          `• Report bugs in <#your-bugs-channel-id>\n\n` +
          `Thank you for believing in us from the start! 🚀`,
      })
    } else {
      // Paid beta tester
      await message.reply({
        content: `✅ **Verification Successful!**\n\n` +
          `Welcome to the Helwa AI Beta Program! 🐝\n\n` +
          `You now have full access to all beta channels until December 31, 2025.\n\n` +
          `🎉 **What's Next:**\n` +
          `• Check out <#your-announcements-channel-id> for updates\n` +
          `• Head to <#your-general-channel-id> to chat with other beta testers\n` +
          `• Report bugs in <#your-bugs-channel-id>\n` +
          `• Share your feedback - it helps us improve!\n\n` +
          `Thank you for being part of our beta! 🚀`,
      })
    }

    // Send Discord notification
    try {
      const { notifyDiscordVerified } = require('./discordNotificationService')
      await notifyDiscordVerified({
        email: result.userEmail,
        firstName: result.userFirstName,
        lastName: result.userLastName,
        position: result.userPosition,
        discordUsername: message.author.tag,
        discordUserId: message.author.id,
        isFree: result.isFree,
      })
    } catch (notifyError) {
      console.error('⚠️  Failed to send Discord notification:', notifyError.message)
    }

  } catch (error) {
    console.error('❌ [DISCORD BOT] Error during verification:', error)
    await message.reply({
      content: `❌ **Error**\n\nSomething went wrong during verification. Please try again or contact an admin.`,
    })
  }
}

/**
 * Handle resend token request
 */
const handleResendToken = async (message) => {
  try {
    console.log('🔄 [DISCORD BOT] Resend token request')
    console.log(`   → User: ${message.author.tag}`)

    await message.reply({
      content: `📧 **New Token Request**\n\n` +
        `To get a new verification token:\n\n` +
        `1. Go to your dashboard at https://www.helwa.ai/dashboard\n` +
        `2. Click "Get Discord Access" to generate a new invite link\n` +
        `3. Use the new token sent to your email\n\n` +
        `If you're having trouble, contact an admin for help.`,
    })
  } catch (error) {
    console.error('❌ [DISCORD BOT] Error handling resend:', error)
  }
}

/**
 * Track message for analytics
 */
const trackMessage = async (message) => {
  try {
    const { admin, db } = require('../config/firebase-admin')
    
    // Basic message data
    const messageData = {
      messageId: message.id,
      channelId: message.channel.id,
      channelName: message.channel.name,
      authorId: message.author.id,
      authorUsername: message.author.tag,
      content: message.content.substring(0, 200), // First 200 chars only
      length: message.content.length,
      hasAttachments: message.attachments.size > 0,
      hasMentions: message.mentions.users.size > 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    }

    await db.collection('discordMessages').add(messageData)
  } catch (error) {
    // Silently fail - don't want analytics to break the bot
    console.error('Error tracking message:', error.message)
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

    // Only register event listeners once to prevent duplicates
    if (!listenersRegistered) {
      console.log('🔧 [DISCORD BOT] Registering event listeners...')
      client.on('guildMemberAdd', handleGuildMemberAdd)
      client.on('messageCreate', handleMessageCreate)
      listenersRegistered = true
      console.log('✅ [DISCORD BOT] Event listeners registered')
    } else {
      console.log('⚠️  [DISCORD BOT] Event listeners already registered, skipping')
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
      
      // Remove event listeners
      if (listenersRegistered) {
        client.removeListener('guildMemberAdd', handleGuildMemberAdd)
        client.removeListener('messageCreate', handleMessageCreate)
        listenersRegistered = false
        console.log('🔧 [DISCORD BOT] Event listeners removed')
      }
      
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
const isBotReady = () => botReady

/**
 * Get the Discord client
 * @returns {Client}
 */
const getClient = () => client

/**
 * Assign beta role to a user
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>}
 */
const assignBetaRole = async (userId) => {
  try {
    if (!botReady) {
      return { success: false, error: 'Bot not ready' }
    }

    const member = await guild.members.fetch(userId)
    
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    if (!betaRole) {
      return { success: false, error: 'Beta role not configured' }
    }

    await member.roles.add(betaRole)
    
    return { success: true }
  } catch (error) {
    console.error('Error assigning beta role:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Revoke beta role from a user
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>}
 */
const revokeBetaRole = async (userId) => {
  try {
    if (!botReady) {
      return { success: false, error: 'Bot not ready' }
    }

    const member = await guild.members.fetch(userId)
    
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    if (!betaRole) {
      return { success: false, error: 'Beta role not configured' }
    }

    await member.roles.remove(betaRole)
    
    return { success: true }
  } catch (error) {
    console.error('Error revoking beta role:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Kick a member from the server
 * @param {string} userId - Discord user ID
 * @param {string} reason - Reason for kicking
 * @returns {Promise<Object>}
 */
const kickMember = async (discordUserId, reason = 'Beta access revoked') => {
  try {
    if (!botReady) {
      return { success: false, error: 'Bot not ready' }
    }

    const member = await guild.members.fetch(discordUserId)
    
    if (!member) {
      return { success: false, error: 'Member not found in server' }
    }

    await member.kick(reason)
    
    console.log(`✅ [DISCORD BOT] Kicked user ${member.user.tag}`)
    console.log(`   → Reason: ${reason}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error kicking member:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Ban a member from the server
 * @param {string} userId - Discord user ID
 * @param {string} reason - Reason for banning
 * @returns {Promise<Object>}
 */
const banMember = async (discordUserId, reason = 'Violation of terms') => {
  try {
    if (!botReady) {
      return { success: false, error: 'Bot not ready' }
    }

    await guild.members.ban(discordUserId, { reason })
    
    console.log(`✅ [DISCORD BOT] Banned user ${discordUserId}`)
    console.log(`   → Reason: ${reason}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error banning member:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send a DM to a user
 * @param {string} userId - Discord user ID
 * @param {string} message - Message content
 * @returns {Promise<Object>}
 */
const sendDM = async (discordUserId, messageContent) => {
  try {
    if (!botReady) {
      return { success: false, error: 'Bot not ready' }
    }

    const user = await client.users.fetch(discordUserId)
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    await user.send(messageContent)
    
    console.log(`✅ [DISCORD BOT] Sent DM to ${user.tag}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error sending DM:', error)
    if (error.code === 50007) {
      return { success: false, error: 'Cannot send DM to this user (DMs disabled)' }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Get server stats
 * @returns {Promise<Object>}
 */
const getServerStats = async () => {
  try {
    if (!botReady || !guild) {
      return { success: false, error: 'Bot not ready or guild not found' }
    }

    const members = await guild.members.fetch()
    
    // Count members with beta role
    const betaMembers = betaRole 
      ? members.filter(member => member.roles.cache.has(betaRole.id))
      : []

    // Count online members
    const onlineMembers = members.filter(member => 
      member.presence && member.presence.status !== 'offline'
    )

    return {
      success: true,
      stats: {
        totalMembers: members.size,
        betaMembers: betaMembers.size,
        onlineMembers: onlineMembers.size,
        serverName: guild.name,
        serverIcon: guild.iconURL(),
      },
    }
  } catch (error) {
    console.error('Error getting server stats:', error)
    return { success: false, error: error.message }
  }
}

// Store client globally to prevent multiple instances
global.__discordBotClient = {
  client,
  DISCORD_CONFIG,
  
  // Lifecycle
  startBot,
  stopBot,
  isBotReady,
  getClient,

  // Role management
  assignBetaRole,
  revokeBetaRole,

  // Member management
  kickMember,
  banMember,
  sendDM,

  // Server info
  getServerStats,
}

module.exports = global.__discordBotClient
}
