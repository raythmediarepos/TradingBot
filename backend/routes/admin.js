const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  getEmailStats,
  getRecentBounces,
  getRecentComplaints,
  checkEmailHealth,
} = require('../services/emailMonitoringService')

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

// ============================================
// DASHBOARD OVERVIEW
// ============================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard overview with all stats
 * @access  Admin only
 */
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getAllBetaUsers } = require('../services/betaUserService')
    const stripeService = require('../services/stripeService')
    const discordBotService = require('../services/discordBotService')

    // Fetch all data in parallel
    const [usersResult, paymentsResult, discordStatsResult, analyticsResult] = await Promise.all([
      getAllBetaUsers(),
      stripeService.getAllPayments({ limit: 100 }),
      discordBotService.getGuildStats(),
      discordBotService.getAnalytics('7d'),
    ])

    const users = usersResult.success ? usersResult.users : []
    const payments = paymentsResult.success ? paymentsResult.payments : []

    // Calculate user stats
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - 7)

    // CRITICAL: Calculate isFree dynamically for accurate stats
    const FREE_SLOTS = 20
    
    const userStats = {
      total: users.length,
      free: users.filter(u => u.position <= FREE_SLOTS).length,
      paid: users.filter(u => u.position > FREE_SLOTS && u.paymentStatus === 'paid').length,
      verified: users.filter(u => u.emailVerified).length,
      discordJoined: users.filter(u => u.discordJoined).length,
      newToday: users.filter(u => {
        const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        return created >= startOfToday
      }).length,
      newThisWeek: users.filter(u => {
        const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        return created >= startOfWeek
      }).length,
    }

    // Calculate revenue stats
    const successfulPayments = payments.filter(p => p.status === 'succeeded')
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
    const todayRevenue = successfulPayments
      .filter(p => new Date(p.created) >= startOfToday)
      .reduce((sum, p) => sum + p.amount, 0)
    const weekRevenue = successfulPayments
      .filter(p => new Date(p.created) >= startOfWeek)
      .reduce((sum, p) => sum + p.amount, 0)

    // Last 7 days revenue for mini chart
    const last7DaysRevenue = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startOfToday)
      date.setDate(startOfToday.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayRevenue = successfulPayments
        .filter(p => {
          const paymentDate = new Date(p.created).toISOString().split('T')[0]
          return paymentDate === dateStr
        })
        .reduce((sum, p) => sum + p.amount, 0)
      
      last7DaysRevenue.push({
        date: dateStr,
        amount: dayRevenue,
      })
    }

    // Last 7 days user signups for mini chart
    const last7DaysSignups = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startOfToday)
      date.setDate(startOfToday.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySignups = users.filter(u => {
        const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        const createdStr = created.toISOString().split('T')[0]
        return createdStr === dateStr
      }).length
      
      last7DaysSignups.push({
        date: dateStr,
        count: daySignups,
      })
    }

    // Discord stats
    const discordStats = discordStatsResult.success ? {
      totalMembers: discordStatsResult.stats.totalMembers,
      verifiedMembers: discordStatsResult.stats.verifiedMembers,
      unverifiedMembers: discordStatsResult.stats.unverifiedMembers,
      botOnline: discordStatsResult.stats.botOnline,
    } : {
      totalMembers: 0,
      verifiedMembers: 0,
      unverifiedMembers: 0,
      botOnline: false,
    }

    // Analytics stats
    const analyticsStats = analyticsResult.success ? {
      totalMessages: analyticsResult.data.totalMessages,
      activeUsers: analyticsResult.data.topCommenters.length,
    } : {
      totalMessages: 0,
      activeUsers: 0,
    }

    // Recent activity - last 10 signups
    const recentSignups = users
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })
      .slice(0, 10)
      .map(u => ({
        type: 'signup',
        user: {
          id: u.id,
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          isFree: u.isFree,
        },
        timestamp: u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt),
      }))

    // Recent payments - last 10
    const recentPayments = successfulPayments
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 10)
      .map(p => {
        const user = users.find(u => u.stripePaymentIntentId === p.id || u.stripeCustomerId === p.customer?.id)
        return {
          type: 'payment',
          payment: {
            id: p.id,
            amount: p.amount,
            currency: p.currency,
          },
          user: user ? {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
          } : null,
          timestamp: new Date(p.created),
        }
      })

    // Recent Discord joins - last 10
    const recentDiscordJoins = users
      .filter(u => u.discordJoined)
      .sort((a, b) => {
        const dateA = a.discordJoinedAt?.toDate ? a.discordJoinedAt.toDate() : new Date(a.discordJoinedAt || 0)
        const dateB = b.discordJoinedAt?.toDate ? b.discordJoinedAt.toDate() : new Date(b.discordJoinedAt || 0)
        return dateB - dateA
      })
      .slice(0, 10)
      .map(u => ({
        type: 'discord_join',
        user: {
          id: u.id,
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          discordUsername: u.discordUsername,
        },
        timestamp: u.discordJoinedAt?.toDate ? u.discordJoinedAt.toDate() : new Date(u.discordJoinedAt || 0),
      }))

    // Combine and sort all recent activity
    const recentActivity = [...recentSignups, ...recentPayments, ...recentDiscordJoins]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15)

    console.log(`✅ [ADMIN] Dashboard data retrieved`)

    res.json({
      success: true,
      stats: {
        users: userStats,
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          thisWeek: weekRevenue,
          last7Days: last7DaysRevenue,
        },
        discord: discordStats,
        analytics: analyticsStats,
        signups: {
          last7Days: last7DaysSignups,
        },
      },
      recentActivity,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting dashboard data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message,
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

    // CRITICAL: Calculate isFree dynamically for filtering
    const FREE_SLOTS = 20
    
    if (type) {
      if (type === 'free') {
        users = users.filter(user => user.position <= FREE_SLOTS)
      } else if (type === 'paid') {
        users = users.filter(user => user.position > FREE_SLOTS)
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
    // CRITICAL: Calculate isFree dynamically based on position
    const totalUsers = users.length
    const freeUsers = users.filter(u => u.position <= 20).length
    const paidUsers = users.filter(u => u.position > 20).length
    const foundingMembers = users.filter(u => u.isFoundingMember === true).length
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
          foundingMembers: foundingMembers,
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
 * @route   POST /api/admin/beta-users/:userId/resend-verification
 * @desc    Resend email verification
 * @access  Admin only
 */
router.post('/beta-users/:userId/resend-verification', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getBetaUser } = require('../services/betaUserService')
    const { sendBetaWelcomeEmail } = require('../services/emailService')
    
    const { userId } = req.params

    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = userResult.user

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      })
    }

    console.log(`📧 [ADMIN] Resending verification email to ${user.email} by ${req.user.email}`)

    // Send verification email
    const emailSent = await sendBetaWelcomeEmail(
      user.email,
      user.firstName,
      user.position,
      user.isFree,
      user.emailVerificationToken
    )

    if (!emailSent) {
      console.error('❌ [ADMIN] Failed to send verification email')
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      })
    }

    // Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'reminder',
      title: '📧 Verification Email Resent (Admin)',
      description: `**${req.user.email}** manually resent verification email to **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '👤 Admin', value: req.user.email, inline: true },
      ],
    })

    console.log(`✅ [ADMIN] Verification email resent for user ${userId}`)

    res.json({
      success: true,
      message: 'Verification email resent successfully',
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error resending verification:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
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

    // Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'discord',
      title: '🔄 Discord Invite Resent (Admin)',
      description: `**${req.user.email}** manually resent Discord invite to **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '👤 Admin', value: req.user.email, inline: true },
        { name: '🔗 Invite Token', value: `\`${inviteResult.token.substring(0, 20)}...\``, inline: false },
      ],
    })

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
    const { updateBetaUser, getBetaUser } = require('../services/betaUserService')
    const { USER_STATUS } = require('../services/betaUserService')
    
    const { userId } = req.params
    const { reason } = req.body

    // Get user data first for notification
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = userResult.user

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

    // Send Discord notification
    if (user) {
      const { sendDiscordNotification } = require('../services/discordNotificationService')
      await sendDiscordNotification({
        type: 'error',
        title: '🚫 Access Revoked (Admin)',
        description: `**${req.user.email}** revoked access for **${user.firstName} ${user.lastName}**`,
        fields: [
          { name: '📧 Email', value: user.email, inline: true },
          { name: '📍 Position', value: `#${user.position}`, inline: true },
          { name: '💰 Type', value: user.isFree ? 'Free Beta' : 'Paid Beta', inline: true },
          { name: '📝 Reason', value: reason || 'No reason provided', inline: false },
          { name: '👤 Admin', value: req.user.email, inline: true },
        ],
      })
    }

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
 * DELETE /api/admin/beta-users/:userId/delete
 * Permanently delete a user and kick from Discord
 */
router.delete('/beta-users/:userId/delete', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body
    
    // Import required services
    const { getBetaUser, renumberBetaPositions } = require('../services/betaUserService')
    const admin = require('firebase-admin')

    console.log(`🗑️  [ADMIN] Attempting to delete user ${userId} by ${req.user.email}`)

    // Get user data first for Discord kick and notification
    const userResult = await getBetaUser(userId)
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = userResult.user
    const discordUserId = user.discordUserId

    // Step 1: Kick from Discord if they joined
    if (discordUserId) {
      console.log(`   → Kicking user from Discord: ${user.discordUsername || discordUserId}`)
      try {
        const discordBotService = require('../services/discordBotService')
        const kickResult = await discordBotService.kickMemberFromServer(discordUserId, reason || 'Account deleted by admin')
        
        if (kickResult.success) {
          console.log(`   ✅ User kicked from Discord`)
        } else {
          console.log(`   ⚠️  Could not kick from Discord: ${kickResult.message}`)
        }
      } catch (discordError) {
        console.error(`   ❌ Discord kick error:`, discordError.message)
        // Continue with deletion even if Discord kick fails
      }
    }

    // Step 2: Delete all related data from Firebase
    const db = admin.firestore()
    const batch = db.batch()

    // Delete user record
    batch.delete(db.collection('betaUsers').doc(userId))

    // Delete Discord invites
    const invitesSnapshot = await db.collection('discordInvites')
      .where('userId', '==', userId)
      .get()
    invitesSnapshot.forEach(doc => batch.delete(doc.ref))

    // Delete email verifications
    const verificationsSnapshot = await db.collection('emailVerifications')
      .where('userId', '==', userId)
      .get()
    verificationsSnapshot.forEach(doc => batch.delete(doc.ref))

    // Delete payments (keep for records, but mark as deleted)
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .get()
    paymentsSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: req.user.email,
        deletedReason: reason || 'User deleted by admin',
      })
    })

    // Commit all deletions
    await batch.commit()

    console.log(`✅ [ADMIN] User ${userId} deleted successfully`)

    // Step 3: Trigger position renumbering to fill the gap
    setImmediate(async () => {
      try {
        await renumberBetaPositions()
        console.log('✅ [ADMIN] Position renumbering triggered after deletion')
      } catch (error) {
        console.error('❌ [ADMIN] Error renumbering positions:', error.message)
      }
    })

    // Step 4: Send Discord notification
    const { sendDiscordNotification } = require('../services/discordNotificationService')
    await sendDiscordNotification({
      type: 'error',
      title: '🗑️  User Permanently Deleted',
      description: `**${req.user.email}** permanently deleted user **${user.firstName} ${user.lastName}**`,
      fields: [
        { name: '📧 Email', value: user.email, inline: true },
        { name: '📍 Position', value: `#${user.position}`, inline: true },
        { name: '💰 Type', value: user.position <= 20 ? 'Free Beta' : 'Paid Beta', inline: true },
        { name: '🎮 Discord', value: discordUserId ? `Kicked (${user.discordUsername || 'Unknown'})` : 'Not joined', inline: false },
        { name: '📝 Reason', value: reason || 'No reason provided', inline: false },
        { name: '👤 Admin', value: req.user.email, inline: true },
      ],
    })

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          position: user.position,
        },
        kickedFromDiscord: !!discordUserId,
      },
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/beta-users/:userId/delete:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
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

/**
 * @route   GET /api/admin/discord/analytics
 * @desc    Get Discord analytics data from Firebase (collected by serverbot)
 * @access  Admin only
 */
router.get('/discord/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()

    // Get analytics data from Firebase (populated by serverbot)
    const analyticsDoc = await db.collection('serverAnalytics').doc('discord').get()

    if (!analyticsDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'No analytics data available yet. Serverbot may not have run.',
      })
    }

    const data = analyticsDoc.data()

    // Convert Firestore timestamp to ISO string
    if (data.collectedAt) {
      data.collectedAt = data.collectedAt.toDate ? data.collectedAt.toDate().toISOString() : data.collectedAt
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting Discord analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get Discord analytics',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/discord/member-growth
 * @desc    Get Discord member growth data from Firebase (collected by serverbot)
 * @access  Admin only
 */
router.get('/discord/member-growth', authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()

    // Get analytics data from Firebase
    const analyticsDoc = await db.collection('serverAnalytics').doc('discord').get()

    if (!analyticsDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'No analytics data available yet. Serverbot may not have run.',
      })
    }

    const data = analyticsDoc.data()

    // Return member growth data
    res.json({
      success: true,
      data: data.members?.growth || [],
      currentTotal: data.summary?.totalMembers || 0,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting member growth:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get member growth',
      error: error.message,
    })
  }
})

// ============================================
// PAYMENT MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with revenue breakdown
 * @access  Admin only
 */
router.get('/payments', authenticate, requireAdmin, async (req, res) => {
  try {
    const stripeService = require('../services/stripeService')
    const { getAllBetaUsers } = require('../services/betaUserService')
    
    // Get all payments from Stripe
    const stripeResult = await stripeService.getAllPayments({ limit: 100 })
    
    if (!stripeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payments from Stripe',
        error: stripeResult.error,
      })
    }

    // Get all beta users for matching
    const usersResult = await getAllBetaUsers()
    const betaUsers = usersResult.success ? usersResult.users : []

    // Match payments with beta users
    const paymentsWithUsers = stripeResult.payments.map(payment => {
      const betaUser = betaUsers.find(u => 
        u.stripePaymentIntentId === payment.id || 
        u.stripeCustomerId === payment.customer?.id
      )

      return {
        ...payment,
        betaUser: betaUser ? {
          id: betaUser.id,
          email: betaUser.email,
          name: `${betaUser.firstName} ${betaUser.lastName}`,
          position: betaUser.position,
          isFree: betaUser.isFree,
        } : null,
      }
    })

    // Calculate revenue breakdown
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const revenueStats = {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byDay: {},
      byWeek: {},
      byMonth: {},
    }

    const successfulPayments = paymentsWithUsers.filter(p => p.status === 'succeeded')

    successfulPayments.forEach(payment => {
      const amount = payment.amount
      const date = new Date(payment.created)
      const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      const weekKey = getWeekKey(date)
      const monthKey = date.toISOString().substring(0, 7) // YYYY-MM

      // Total
      revenueStats.total += amount

      // Today
      if (date >= startOfToday) {
        revenueStats.today += amount
      }

      // This week
      if (date >= startOfWeek) {
        revenueStats.thisWeek += amount
      }

      // This month
      if (date >= startOfMonth) {
        revenueStats.thisMonth += amount
      }

      // By day
      revenueStats.byDay[dayKey] = (revenueStats.byDay[dayKey] || 0) + amount

      // By week
      revenueStats.byWeek[weekKey] = (revenueStats.byWeek[weekKey] || 0) + amount

      // By month
      revenueStats.byMonth[monthKey] = (revenueStats.byMonth[monthKey] || 0) + amount
    })

    // Convert to arrays and sort
    const dailyRevenue = Object.entries(revenueStats.byDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const weeklyRevenue = Object.entries(revenueStats.byWeek)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week))

    const monthlyRevenue = Object.entries(revenueStats.byMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))

    console.log(`✅ [ADMIN] Retrieved ${paymentsWithUsers.length} payments`)

    res.json({
      success: true,
      payments: paymentsWithUsers,
      revenue: {
        total: revenueStats.total,
        today: revenueStats.today,
        thisWeek: revenueStats.thisWeek,
        thisMonth: revenueStats.thisMonth,
        daily: dailyRevenue,
        weekly: weeklyRevenue,
        monthly: monthlyRevenue,
      },
      stats: {
        totalPayments: paymentsWithUsers.length,
        successfulPayments: successfulPayments.length,
        failedPayments: paymentsWithUsers.filter(p => p.status === 'failed').length,
        pendingPayments: paymentsWithUsers.filter(p => p.status === 'processing' || p.status === 'requires_action').length,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting payments:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message,
    })
  }
})

/**
 * Helper function to get week key (YYYY-WW)
 */
function getWeekKey(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

/**
 * @route   POST /api/admin/payments/:paymentId/refund
 * @desc    Create a refund for a payment
 * @access  Admin only
 */
router.post('/payments/:paymentId/refund', authenticate, requireAdmin, async (req, res) => {
  try {
    const stripeService = require('../services/stripeService')
    const { updateBetaUser, getAllBetaUsers } = require('../services/betaUserService')
    const { paymentId } = req.params
    const { amount, reason } = req.body

    console.log(`💸 [ADMIN] ${req.user.email} initiating refund for payment ${paymentId}`)

    // Create refund in Stripe
    const refundParams = {}
    if (amount) {
      refundParams.amount = Math.round(amount * 100) // Convert to cents
    }
    if (reason) {
      refundParams.reason = reason
    }

    const result = await stripeService.createRefund(paymentId, refundParams)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create refund',
        error: result.error,
      })
    }

    // Find and update beta user if applicable
    const usersResult = await getAllBetaUsers()
    if (usersResult.success) {
      const betaUser = usersResult.users.find(u => u.stripePaymentIntentId === paymentId)
      
      if (betaUser) {
        await updateBetaUser(betaUser.id, {
          paymentStatus: 'refunded',
          status: 'cancelled',
        })
        console.log(`   → Updated beta user ${betaUser.id} to refunded status`)
      }
    }

    console.log(`✅ [ADMIN] Refund successful: ${result.refund.id}`)

    res.json({
      success: true,
      refund: result.refund,
      message: 'Refund created successfully',
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error creating refund:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create refund',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/payments/:paymentId
 * @desc    Get payment details
 * @access  Admin only
 */
router.get('/payments/:paymentId', authenticate, requireAdmin, async (req, res) => {
  try {
    const stripeService = require('../services/stripeService')
    const { paymentId } = req.params

    const result = await stripeService.getPaymentDetails(paymentId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
        error: result.error,
      })
    }

    res.json({
      success: true,
      payment: result.payment,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error getting payment details:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message,
    })
  }
})

// ============================================
// GOOGLE SHEETS / EXPENSE DATA ENDPOINTS
// ============================================

/**
 * @route   GET /api/admin/expenses/data
 * @desc    Get expense data from Google Sheets with calculated metrics
 * @access  Admin only
 */
router.get('/expenses/data', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('💰 [ADMIN] Fetching expense data from Google Sheets...')
    
    const { getExpenseDataWithMetrics } = require('../services/googleSheetsService')
    
    const result = await getExpenseDataWithMetrics()
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch expense data',
        details: result.details,
      })
    }

    res.json({
      success: true,
      expenses: result.expenses,
      monthlyTotals: result.monthlyTotals,
      sheetCount: result.sheetCount,
      metrics: result.metrics,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching expense data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense data',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/stock-anomalies
 * @desc    Get top 3 stock anomalies for today
 * @access  Admin only
 */
router.get('/stock-anomalies', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('📊 [ADMIN] Fetching stock anomalies...')
    
    const { admin } = require('../config/firebase-admin')
    const db = admin.firestore()
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Query for today's active anomalies, ordered by rank
    const anomaliesSnapshot = await db.collection('stockAnomalies')
      .where('date', '==', today)
      .where('isActive', '==', true)
      .orderBy('rank', 'asc')
      .limit(3)
      .get()
    
    if (anomaliesSnapshot.empty) {
      console.log('⚠️  [ADMIN] No stock anomalies found for today')
      return res.json({
        success: true,
        anomalies: [],
        message: 'No anomalies available for today',
      })
    }
    
    const anomalies = []
    anomaliesSnapshot.forEach(doc => {
      const data = doc.data()
      anomalies.push({
        id: doc.id,
        ticker: data.ticker,
        companyName: data.companyName,
        percentChange: data.percentChange,
        cumulativeDollarVolume: data.cumulativeDollarVolume,
        date: data.date,
        timestamp: data.timestamp?.toDate?.() || null,
        lastUpdated: data.lastUpdated?.toDate?.() || null,
        aiSummary: data.aiSummary,
        signal: data.signal,
        confidence: data.confidence,
        logoUrl: data.logoUrl,
        rank: data.rank,
        anomalyScore: data.anomalyScore,
        priceAtCapture: data.priceAtCapture,
        volumeChange: data.volumeChange,
        sector: data.sector,
      })
    })
    
    console.log(`✅ [ADMIN] Found ${anomalies.length} stock anomalies`)
    anomalies.forEach(a => {
      console.log(`   → ${a.rank}. ${a.ticker}: ${a.percentChange > 0 ? '+' : ''}${a.percentChange}%`)
    })
    
    res.json({
      success: true,
      anomalies,
      count: anomalies.length,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching stock anomalies:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock anomalies',
      error: error.message,
    })
  }
})

// ============================================
// EMAIL MONITORING ROUTES
// ============================================

/**
 * @route   GET /api/admin/email-stats
 * @desc    Get email deliverability statistics
 * @access  Admin only
 * @query   days - Number of days to look back (default 7)
 */
router.get('/email-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('📊 [ADMIN] Fetching email stats...')
    
    const days = parseInt(req.query.days) || 7
    const stats = await getEmailStats(days)
    
    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching email stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/email-bounces
 * @desc    Get recent bounced emails
 * @access  Admin only
 * @query   limit - Number of results to return (default 50)
 */
router.get('/email-bounces', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('📊 [ADMIN] Fetching recent bounces...')
    
    const limit = parseInt(req.query.limit) || 50
    const bounces = await getRecentBounces(limit)
    
    res.json({
      success: true,
      count: bounces.length,
      data: bounces,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching bounces:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bounced emails',
      error: error.message,
    })
  }
})

/**
 * @route   GET /api/admin/email-complaints
 * @desc    Get recent spam complaints
 * @access  Admin only
 * @query   limit - Number of results to return (default 50)
 */
router.get('/email-complaints', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('📊 [ADMIN] Fetching spam complaints...')
    
    const limit = parseInt(req.query.limit) || 50
    const complaints = await getRecentComplaints(limit)
    
    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching complaints:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spam complaints',
      error: error.message,
    })
  }
})

/**
 * @route   POST /api/admin/email-health-check
 * @desc    Manually trigger email health check
 * @access  Admin only
 */
router.post('/email-health-check', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('🏥 [ADMIN] Manual email health check triggered')
    
    await checkEmailHealth()
    const stats = await getEmailStats(1) // Get last 24 hours
    
    res.json({
      success: true,
      message: 'Email health check completed',
      data: stats,
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error in health check:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to run health check',
      error: error.message,
    })
  }
})

// ============================================
// TESTING ROUTES
// ============================================

const testingRoutes = require('./testing')
router.use('/testing', testingRoutes)

/**
 * @route   GET /api/admin/system-health
 * @desc    Get system health and metrics data
 * @access  Admin only
 */
router.get('/system-health', authenticate, requireAdmin, async (req, res) => {
  try {
    const { admin: adminSdk, db } = require('../config/firebase-admin')
    
    // Get latest health check
    const latestHealthCheck = await db
      .collection('healthChecks')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    let healthCheckData = null
    if (!latestHealthCheck.empty) {
      healthCheckData = latestHealthCheck.docs[0].data()
    }
    
    // Get latest metrics
    const latestMetrics = await db
      .collection('systemMetrics')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    
    let metricsData = null
    if (!latestMetrics.empty) {
      metricsData = latestMetrics.docs[0].data()
    }
    
    // Serialize Firestore timestamps
    const serialize = (obj) => {
      if (!obj) return null
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value && typeof value === 'object' && value._seconds) {
          return new Date(value._seconds * 1000).toISOString()
        }
        return value
      }))
    }
    
    // Convert timestamp to ISO string
    const lastCheckTime = healthCheckData?.timestamp
    const lastCheckISO = lastCheckTime && lastCheckTime.toDate
      ? lastCheckTime.toDate().toISOString()
      : lastCheckTime && lastCheckTime._seconds
      ? new Date(lastCheckTime._seconds * 1000).toISOString()
      : new Date().toISOString()
    
    const healthData = {
      lastCheck: lastCheckISO,
      overallStatus: healthCheckData?.overall || 'unknown',
      services: healthCheckData?.services || {},
      systemMetrics: serialize(metricsData?.system) || {},
      userMetrics: serialize(metricsData?.users) || {},
      businessMetrics: serialize(metricsData?.business) || {},
      emailMetrics: serialize(metricsData?.email) || {},
    }
    
    res.json({
      success: true,
      data: healthData,
    })
  } catch (error) {
    console.error('Error fetching system health:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system health data',
      message: error.message,
    })
  }
})

/**
 * POST /api/admin/test-jarvis-alert
 * Test Jarvis-style alerts (admin only)
 */
router.post('/test-jarvis-alert', authenticate, requireAdmin, async (req, res) => {
  try {
    const { severity, service } = req.body
    
    // Validate inputs
    const validSeverities = ['critical', 'warning', 'info']
    const validServices = ['system', 'api', 'email', 'users']
    
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity. Must be: critical, warning, or info',
      })
    }
    
    if (!validServices.includes(service)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service. Must be: system, api, email, or users',
      })
    }
    
    // Create test alert
    const testAlert = {
      severity,
      service,
      message: `Test ${severity} alert for ${service} service`,
      threshold: service === 'system' ? 95 : service === 'api' ? 3000 : service === 'email' ? 90 : 60,
      actual: service === 'system' ? 85 : service === 'api' ? 4500 : service === 'email' ? 75 : 45,
      timestamp: new Date(),
    }
    
    // Send to Discord using Jarvis format
    const { sendAlertEmail } = require('../services/monitoring/alertService')
    await sendAlertEmail(testAlert)
    
    res.json({
      success: true,
      message: 'Test Jarvis alert sent successfully',
      alert: testAlert,
    })
  } catch (error) {
    console.error('Error sending test alert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send test alert',
      message: error.message,
    })
  }
})

/**
 * POST /api/admin/test-error-log
 * Test error log monitoring (admin only)
 */
router.post('/test-error-log', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level, message } = req.body
    
    if (!level || !message) {
      return res.status(400).json({
        success: false,
        error: 'level and message are required',
      })
    }
    
    // Trigger the error/warning
    if (level === 'error') {
      console.error(`[TEST ERROR] ${message}`)
    } else if (level === 'warning') {
      console.warn(`[TEST WARNING] ${message}`)
    } else {
      return res.status(400).json({
        success: false,
        error: 'level must be "error" or "warning"',
      })
    }
    
    res.json({
      success: true,
      message: `Test ${level} logged - Jarvis will be alerted`,
      level,
      testMessage: message,
    })
  } catch (error) {
    console.error('Error testing error log:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to test error log',
      message: error.message,
    })
  }
})

/**
 * POST /api/admin/test-discord-alert
 * Send a test Discord alert (admin only)
 */
router.post('/test-discord-alert', authenticate, requireAdmin, async (req, res) => {
  try {
    const { sendAlertEmail } = require('../services/monitoring/alertService')
    
    const testAlert = {
      severity: 'warning',
      service: 'system',
      message: '🧪 Test Alert from Intelligent Log Monitor',
      details: {
        analyzed: true,
        source: 'Admin Test',
        description: 'This is a test alert triggered manually to verify Discord integration.',
        recommendation: 'If you see this message, the Intelligent Log Monitor is working correctly!',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    }

    await sendAlertEmail(testAlert)

    res.json({
      success: true,
      message: 'Test alert sent to Discord',
      alert: testAlert,
    })
  } catch (error) {
    console.error('Error sending test alert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send test alert',
      message: error.message,
    })
  }
})

/**
 * POST /api/admin/test-ai-monitor
 * Create test error and run AI analysis (admin only)
 */
router.post('/test-ai-monitor', authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()
    
    console.log('🧪 [ADMIN] Creating test error for AI analysis...')
    
    // Create a realistic test error
    const errorTypes = [
      {
        level: 'critical',
        service: 'payments',
        message: '🧪 TEST: Payment processing failed - Card declined',
        stack: 'Error: Payment failed\n    at processPayment (stripe.js:45)\n    at checkout (routes/checkout.js:123)',
      },
      {
        level: 'error',
        service: 'email',
        message: '🧪 TEST: Failed to send verification email',
        stack: 'Error: Email delivery failed\n    at sendEmail (resend.js:34)\n    at verifyUser (auth.js:67)',
      },
      {
        level: 'warning',
        service: 'api',
        message: '🧪 TEST: API rate limit approaching',
        stack: 'Warning: Rate limit at 90%\n    at checkRateLimit (middleware.js:23)',
      },
    ]
    
    // Pick a random error or use specified type
    const errorIndex = req.body.errorType || Math.floor(Math.random() * errorTypes.length)
    const testError = errorTypes[errorIndex]
    
    // Add to Firebase
    await db.collection('errorLogs').add({
      ...testError,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    console.log(`✅ [ADMIN] Test error created: ${testError.message}`)
    
    // Trigger AI analysis immediately
    const { runIntelligentLogAnalysis } = require('../services/monitoring/intelligentLogMonitor')
    
    // Run in background (don't wait for response)
    setImmediate(async () => {
      try {
        console.log('🧠 [ADMIN] Running AI analysis...')
        await runIntelligentLogAnalysis()
        console.log('✅ [ADMIN] AI analysis complete')
      } catch (error) {
        console.error('❌ [ADMIN] AI analysis failed:', error.message)
      }
    })
    
    res.json({
      success: true,
      message: 'Test error created and AI analysis triggered',
      testError: {
        level: testError.level,
        service: testError.service,
        message: testError.message,
      },
      note: 'Check Discord #system-alerts channel in ~10 seconds',
    })
  } catch (error) {
    console.error('❌ [ADMIN] Error in test-ai-monitor:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create test error',
      message: error.message,
    })
  }
})

/**
 * GET /api/admin/test-discord-ai
 * Simple URL to test AI monitor and Discord alerts (no auth for easy testing)
 */
router.get('/test-discord-ai', async (req, res) => {
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()
    
    console.log('🧪 [TEST URL] Creating test error for AI analysis...')
    
    // Create a random test error
    const errorTypes = [
      {
        level: 'critical',
        service: 'payments',
        message: '🧪 TEST: Payment processing failed - Card declined',
        stack: 'Error: Payment failed\n    at processPayment (stripe.js:45)\n    at checkout (routes/checkout.js:123)',
      },
      {
        level: 'error',
        service: 'email',
        message: '🧪 TEST: Failed to send verification email',
        stack: 'Error: Email delivery failed\n    at sendEmail (resend.js:34)\n    at verifyUser (auth.js:67)',
      },
      {
        level: 'warning',
        service: 'database',
        message: '🧪 TEST: Database connection slow (>5s response time)',
        stack: 'Warning: Slow query\n    at queryDB (firebase.js:89)\n    at fetchUsers (users.js:23)',
      },
    ]
    
    const testError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    
    // Add to Firebase
    await db.collection('errorLogs').add({
      ...testError,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    console.log(`✅ [TEST URL] Test error created: ${testError.message}`)
    
    // Trigger AI analysis in background
    const { runIntelligentLogAnalysis } = require('../services/monitoring/intelligentLogMonitor')
    
    setImmediate(async () => {
      try {
        console.log('🧠 [TEST URL] Running AI analysis...')
        await runIntelligentLogAnalysis()
        console.log('✅ [TEST URL] AI analysis complete - check Discord!')
      } catch (error) {
        console.error('❌ [TEST URL] AI analysis failed:', error.message)
      }
    })
    
    // Send nice HTML response
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Monitor Test</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            h1 { margin-top: 0; font-size: 32px; }
            .status { font-size: 60px; margin: 20px 0; }
            .error-box {
              background: rgba(0, 0, 0, 0.2);
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .note {
              background: rgba(255, 255, 255, 0.2);
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
              font-size: 14px;
            }
            a {
              color: #ffd700;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="status">✅</div>
            <h1>AI Monitor Test Triggered!</h1>
            <p><strong>Test error created and AI analysis running...</strong></p>
            
            <div class="error-box">
              <strong>🔴 ${testError.level.toUpperCase()}</strong><br>
              <strong>Service:</strong> ${testError.service}<br>
              <strong>Message:</strong> ${testError.message}
            </div>
            
            <div class="note">
              <strong>📱 Check your Discord #system-alerts channel in ~10 seconds!</strong><br><br>
              You should see a Jarvis alert with:
              <ul>
                <li>Error severity and service</li>
                <li>AI-analyzed details</li>
                <li>Recommended actions</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
              🧠 Powered by OpenAI GPT-4o-mini<br>
              Cost: ~$0.0007 per analysis
            </p>
            
            <p style="margin-top: 20px;">
              <a href="/test-discord-ai">🔄 Test Again</a>
            </p>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('❌ [TEST URL] Error:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 40px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Test Failed</h1>
            <p>${error.message}</p>
            <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
              Check Render logs for details
            </p>
          </div>
        </body>
      </html>
    `)
  }
})

/**
 * POST /api/admin/test-jarvis-status
 * Test Jarvis status updates (admin only)
 */
router.post('/test-jarvis-status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type } = req.body
    
    // Validate input
    const validTypes = ['startup', 'health_check', 'deployment', 'daily_summary', 'all_clear']
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be: startup, health_check, deployment, daily_summary, or all_clear',
      })
    }
    
    // Prepare test data based on type
    let testData = {}
    
    switch (type) {
      case 'health_check':
        testData = {
          uptime: 99.5,
          services: {
            api: true,
            database: true,
            frontend: true,
            discord: true,
          },
        }
        break
      case 'deployment':
        testData = {
          version: 'v1.2.3',
        }
        break
      case 'daily_summary':
        testData = {
          stats: {
            uptime: 99.8,
            newUsers: 5,
            totalUsers: 16,
            revenue: 149.97,
            emailsSent: 12,
            deliveryRate: 100,
            alerts: 0,
            criticalAlerts: 0,
          },
        }
        break
      case 'all_clear':
        testData = {
          users: 16,
          uptime: 99.9,
          apiResponseTime: 145,
        }
        break
    }
    
    // Send Jarvis status update
    const { sendJarvisStatusUpdate } = require('../services/monitoring/alertService')
    await sendJarvisStatusUpdate(type, testData)
    
    res.json({
      success: true,
      message: `Test Jarvis ${type} update sent successfully`,
      type,
      data: testData,
    })
  } catch (error) {
    console.error('Error sending test status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send test status update',
      message: error.message,
    })
  }
})

module.exports = router

