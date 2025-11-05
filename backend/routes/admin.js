const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../middleware/auth')

/**
 * @route   POST /api/admin/discord/setup
 * @desc    Manually trigger Discord server auto-setup
 * @access  Admin only
 */
router.post('/discord/setup', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('🔧 [ADMIN] Manual Discord setup triggered by:', req.user.email)
    
    const { autoSetupDiscordServer } = require('../services/discordSetupService')
    const discordBotService = require('../services/discordBotService')
    
    // Check if bot is ready
    if (!discordBotService.isBotReady()) {
      return res.status(503).json({
        success: false,
        error: 'Discord bot is not ready',
        message: 'Please wait for the bot to connect to Discord',
      })
    }

    // Get guild and beta role from bot service
    const guild = discordBotService.getGuild()
    const betaRole = discordBotService.getBetaRole()

    if (!guild || !betaRole) {
      return res.status(500).json({
        success: false,
        error: 'Could not access Discord server or role',
        message: 'Check Discord configuration',
      })
    }

    // Run auto-setup
    const setupResult = await autoSetupDiscordServer(guild, betaRole)

    if (setupResult.success) {
      return res.json({
        success: true,
        message: 'Discord server setup completed',
        data: {
          categoriesCreated: setupResult.categoriesCreated,
          channelsCreated: setupResult.channelsCreated,
          messagesPosted: setupResult.messagesPosted,
          welcomeChannelId: setupResult.welcomeChannelId,
        },
      })
    } else {
      return res.status(500).json({
        success: false,
        error: 'Setup failed',
        message: setupResult.error,
      })
    }
    
  } catch (error) {
    console.error('❌ [ADMIN] Discord setup error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to setup Discord server',
      message: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/discord/status
 * @desc    Check Discord bot status
 * @access  Admin only
 */
router.get('/discord/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    
    const isReady = discordBotService.isBotReady()
    const guild = discordBotService.getGuild()
    const betaRole = discordBotService.getBetaRole()

    res.json({
      success: true,
      data: {
        botReady: isReady,
        guildName: guild?.name || null,
        guildId: guild?.id || null,
        betaRoleName: betaRole?.name || null,
        betaRoleId: betaRole?.id || null,
        memberCount: guild?.memberCount || 0,
      },
    })
    
  } catch (error) {
    console.error('❌ [ADMIN] Discord status error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get Discord status',
      message: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/beta-users
 * @desc    Get all beta users with filtering and stats
 * @access  Admin only
 */
router.get('/beta-users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getAllBetaUsers, getBetaStats } = require('../services/betaUserService')
    const { serializeFirestoreData } = require('../utils/firestore')
    
    // Get query parameters for filtering
    const { 
      search, 
      status, 
      paymentStatus, 
      emailVerified, 
      discordJoined,
      type, // 'free' or 'paid'
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Get all users
    const usersResult = await getAllBetaUsers()
    
    if (!usersResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch beta users',
      })
    }

    let users = usersResult.users

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      users = users.filter(user => user.status === status)
    }

    if (paymentStatus) {
      users = users.filter(user => user.paymentStatus === paymentStatus)
    }

    if (emailVerified !== undefined) {
      const verified = emailVerified === 'true'
      users = users.filter(user => user.emailVerified === verified)
    }

    if (discordJoined !== undefined) {
      const joined = discordJoined === 'true'
      users = users.filter(user => user.discordJoined === joined)
    }

    if (type) {
      if (type === 'free') {
        users = users.filter(user => user.isFree === true)
      } else if (type === 'paid') {
        users = users.filter(user => user.isFree === false)
      }
    }

    // Sort users
    users.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }
      
      // Handle number sorting
      if (sortBy === 'position') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Get stats
    const stats = await getBetaStats()

    // Calculate additional stats
    const totalUsers = users.length
    const freeUsers = users.filter(u => u.isFree).length
    const paidUsers = users.filter(u => !u.isFree).length
    const verifiedEmails = users.filter(u => u.emailVerified).length
    const joinedDiscord = users.filter(u => u.discordJoined).length
    const activeUsers = users.filter(u => u.status === 'active').length
    // Revenue: Only count users who actually completed payment (paymentStatus === 'paid')
    const confirmedPaidUsers = users.filter(u => u.paymentStatus === 'paid').length
    const totalRevenue = confirmedPaidUsers * 49.99

    // Serialize user data
    const serializedUsers = users.map(user => serializeFirestoreData(user))

    res.json({
      success: true,
      data: {
        users: serializedUsers,
        stats: {
          total: totalUsers,
          free: freeUsers,
          paid: paidUsers,
          emailVerified: verifiedEmails,
          discordJoined: joinedDiscord,
          active: activeUsers,
          revenue: totalRevenue,
          programStats: stats.success ? stats : null,
        },
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching beta users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beta users',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/beta-users/:userId
 * @desc    Get detailed info for a specific beta user
 * @access  Admin only
 */
router.get('/beta-users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getBetaUser } = require('../services/betaUserService')
    const { serializeFirestoreData } = require('../utils/firestore')
    const admin = require('firebase-admin')
    const db = admin.firestore()
    
    const { userId } = req.params

    // Get user data
    const userResult = await getBetaUser(userId)
    
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Get user's Discord invites
    const invitesSnapshot = await db
      .collection('discordInvites')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const invites = invitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeFirestoreData(doc.data())
    }))

    // Get user's email verifications
    const verificationsSnapshot = await db
      .collection('emailVerifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const verifications = verificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeFirestoreData(doc.data())
    }))

    res.json({
      success: true,
      data: {
        user: serializeFirestoreData(userResult.user),
        invites,
        verifications,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching user details:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/beta-users/:userId/resend-invite
 * @desc    Resend Discord invite to a user
 * @access  Admin only
 */
router.post('/beta-users/:userId/resend-invite', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getBetaUser, createDiscordInvite } = require('../services/betaUserService')
    const { sendDiscordInviteEmail } = require('../services/emailService')
    
    const { userId } = req.params

    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = userResult.user

    // Create new Discord invite
    const inviteResult = await createDiscordInvite(userId, user.email)
    
    if (!inviteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create Discord invite',
        error: inviteResult.error,
      })
    }

    // Send invite email
    await sendDiscordInviteEmail(user.email, user.firstName, inviteResult.token)

    console.log(`✅ [ADMIN] Discord invite resent for user ${userId} by ${req.user.email}`)

    res.json({
      success: true,
      message: 'Discord invite resent successfully',
      data: {
        inviteToken: inviteResult.token,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error resending invite:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resend Discord invite',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/beta-users/:userId/revoke
 * @desc    Revoke user's access
 * @access  Admin only
 */
router.post('/beta-users/:userId/revoke', authenticate, requireAdmin, async (req, res) => {
  try {
    const { updateBetaUser } = require('../services/betaUserService')
    const { USER_STATUS } = require('../services/betaUserService')
    
    const { userId } = req.params
    const { reason } = req.body

    const result = await updateBetaUser(userId, {
      status: USER_STATUS.SUSPENDED,
      suspendedReason: reason || 'Revoked by admin',
      suspendedAt: new Date(),
      suspendedBy: req.user.email,
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to revoke access',
        error: result.error,
      })
    }

    console.log(`⛔ [ADMIN] Access revoked for user ${userId} by ${req.user.email}. Reason: ${reason}`)

    // TODO: Remove Discord role via bot

    res.json({
      success: true,
      message: 'Access revoked successfully',
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error revoking access:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to revoke access',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/discord/overview
 * @desc    Get Discord server overview and stats
 * @access  Admin only
 */
router.get('/discord/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    
    const isReady = discordBotService.isBotReady()
    if (!isReady) {
      return res.status(503).json({
        success: false,
        message: 'Discord bot is not ready',
      })
    }

    const stats = await discordBotService.getGuildStats()
    const guild = discordBotService.getGuild()
    const betaRole = discordBotService.getBetaRole()
    const unverifiedRole = discordBotService.getUnverifiedRole()

    res.json({
      success: true,
      data: {
        botStatus: 'online',
        server: {
          name: guild.name,
          id: guild.id,
          memberCount: guild.memberCount,
        },
        roles: {
          beta: {
            name: betaRole.name,
            id: betaRole.id,
            memberCount: betaRole.members.size,
          },
          unverified: unverifiedRole ? {
            name: unverifiedRole.name,
            id: unverifiedRole.id,
            memberCount: unverifiedRole.members.size,
          } : null,
        },
        stats: stats.success ? stats.data : null,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting Discord overview:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get Discord overview',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/discord/members
 * @desc    Get all Discord members with verification status
 * @access  Admin only
 */
router.get('/discord/members', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    const { getAllBetaUsers } = require('../services/betaUserService')
    
    const membersResult = await discordBotService.getAllMembers()
    if (!membersResult.success) {
      return res.status(500).json(membersResult)
    }

    // Get beta users to match Discord users with emails
    const usersResult = await getAllBetaUsers()
    const betaUsers = usersResult.success ? usersResult.users : []

    // Match Discord members with beta users
    const enrichedMembers = membersResult.members.map(member => {
      const betaUser = betaUsers.find(u => u.discordUserId === member.id)
      
      // Debug log for admin users
      if (betaUser?.isMarkedAdmin) {
        console.log(`👑 [DEBUG] Admin found: ${member.username}`)
        console.log(`   → Discord ID: ${member.id}`)
        console.log(`   → Beta User ID: ${betaUser.id}`)
        console.log(`   → isMarkedAdmin: ${betaUser.isMarkedAdmin}`)
        console.log(`   → Email: ${betaUser.email}`)
      }
      
      return {
        ...member,
        email: betaUser?.email || null,
        betaUserId: betaUser?.id || null,
        isMarkedAdmin: betaUser?.isMarkedAdmin || false,
      }
    })

    res.json({
      success: true,
      data: {
        members: enrichedMembers,
        total: enrichedMembers.length,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting Discord members:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get Discord members',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/discord/members/:userId/kick
 * @desc    Kick a member from Discord
 * @access  Admin only
 */
router.post('/discord/members/:userId/kick', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    const { userId } = req.params
    const { reason } = req.body

    const result = await discordBotService.kickMember(userId, reason || 'Kicked by admin')
    
    if (!result.success) {
      return res.status(400).json(result)
    }

    console.log(`👢 [ADMIN] ${req.user.email} kicked Discord user ${userId}`)

    res.json(result)
  } catch (error) {
    console.error('❌ [ADMIN] Error kicking member:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to kick member',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/discord/members/:userId/ban
 * @desc    Ban a member from Discord
 * @access  Admin only
 */
router.post('/discord/members/:userId/ban', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    const { userId } = req.params
    const { reason } = req.body

    const result = await discordBotService.banMember(userId, reason || 'Banned by admin')
    
    if (!result.success) {
      return res.status(400).json(result)
    }

    console.log(`⛔ [ADMIN] ${req.user.email} banned Discord user ${userId}`)

    res.json(result)
  } catch (error) {
    console.error('❌ [ADMIN] Error banning member:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to ban member',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/discord/members/:userId/verify
 * @desc    Manually verify a Discord member
 * @access  Admin only
 */
router.post('/discord/members/:userId/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    const { userId } = req.params

    const result = await discordBotService.manuallyVerifyUser(userId)
    
    if (!result.success) {
      return res.status(400).json(result)
    }

    console.log(`✅ [ADMIN] ${req.user.email} manually verified Discord user ${userId}`)

    res.json(result)
  } catch (error) {
    console.error('❌ [ADMIN] Error manually verifying member:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to manually verify member',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/discord/channels
 * @desc    Get all Discord channels
 * @access  Admin only
 */
router.get('/discord/channels', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    
    const result = await discordBotService.getChannels()
    
    if (!result.success) {
      return res.status(500).json(result)
    }

    res.json(result)
  } catch (error) {
    console.error('❌ [ADMIN] Error getting channels:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get channels',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/discord/announce
 * @desc    Send announcement to a Discord channel
 * @access  Admin only
 */
router.post('/discord/announce', authenticate, requireAdmin, async (req, res) => {
  try {
    const discordBotService = require('../services/discordBotService')
    const { channelId, message, isEmbed } = req.body

    if (!channelId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID and message are required',
      })
    }

    const result = await discordBotService.sendAnnouncement(channelId, message, isEmbed)
    
    if (!result.success) {
      return res.status(400).json(result)
    }

    console.log(`📢 [ADMIN] ${req.user.email} sent announcement to channel ${channelId}`)

    res.json(result)
  } catch (error) {
    console.error('❌ [ADMIN] Error sending announcement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send announcement',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/discord/members/:userId/toggle-admin
 * @desc    Toggle admin marker for a Discord member
 * @access  Admin only
 */
router.post('/discord/members/:userId/toggle-admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getAllBetaUsers, updateBetaUser, USER_STATUS, PAYMENT_STATUS } = require('../services/betaUserService')
    const discordBotService = require('../services/discordBotService')
    const admin = require('firebase-admin')
    const db = admin.firestore()
    const { userId } = req.params
    const { isAdmin, username, discriminator } = req.body

    // Find beta user with this Discord ID - search database directly to avoid duplicates
    const usersSnapshot = await db.collection('betaUsers').where('discordUserId', '==', userId).limit(1).get()
    
    let betaUser = null
    if (!usersSnapshot.empty) {
      const doc = usersSnapshot.docs[0]
      betaUser = { id: doc.id, ...doc.data() }
    }
    
    // If no record exists and marking as admin, create minimal admin record
    if (!betaUser && isAdmin) {
      console.log(`📝 [ADMIN] Creating admin record for Discord member ${userId}`)
      
      const userRef = db.collection('betaUsers').doc()
      const newUserData = {
        id: userRef.id,
        email: `admin_discord_${userId}@helwa.ai`, // Placeholder email for admin
        firstName: username || 'Discord',
        lastName: 'Admin',
        passwordHash: null, // No password needed
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        discordUserId: userId,
        isMarkedAdmin: true,
        markedAdminAt: new Date(),
        markedAdminBy: req.user.email,
        role: 'admin', // Server owner/admin role
      }
      
      await userRef.set(newUserData)
      betaUser = { id: userRef.id, ...newUserData }
      
      console.log(`✅ [ADMIN] Created admin record ${userRef.id} for Discord user ${userId}`)
    } else if (!betaUser && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this Discord member',
      })
    }

    // Simple admin marker toggle - no beta access stuff
    const updateData = {
      isMarkedAdmin: isAdmin,
      markedAdminAt: isAdmin ? new Date() : null,
      markedAdminBy: isAdmin ? req.user.email : null,
    }

    if (isAdmin) {
      updateData.discordUserId = userId
      updateData.role = 'admin'
    }

    // Update record in database
    const updateResult = await updateBetaUser(betaUser.id, updateData)

    if (!updateResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update admin marker',
      })
    }

    // Send Discord DM notification
    if (isAdmin) {
      const dmMessage = `👑 **You've been marked as an Admin!**\n\nYou have been designated as a **Server Admin** by ${req.user.email}.\n\nYou are now recognized as part of the Helwa AI leadership team.\n\nThank you for being a co-founder! 🚀`
      
      const dmResult = await discordBotService.sendDirectMessage(userId, dmMessage)
      if (!dmResult.success) {
        console.warn(`⚠️ [ADMIN] Could not send DM to ${userId}: ${dmResult.message}`)
      }
    }

    console.log(`👑 [ADMIN] ${req.user.email} marked Discord user ${userId} as ${isAdmin ? 'server admin' : 'removed admin'}`)

    res.json({
      success: true,
      message: `Successfully ${isAdmin ? 'marked as server admin' : 'removed admin marker'}`,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error toggling admin marker:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle admin marker',
      error: error.message,
    })
  }
})

module.exports = router

