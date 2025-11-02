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

module.exports = router

