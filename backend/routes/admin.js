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
    const totalRevenue = paidUsers * 49.99

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

module.exports = router

