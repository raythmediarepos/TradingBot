const express = require('express')
const router = express.Router()
const affiliateService = require('../services/affiliateService')

/**
 * POST /api/affiliates/signup
 * Create affiliate account (instant signup)
 */
router.post('/signup', async (req, res) => {
  console.log('📥 [REQUEST] Incoming affiliate signup')
  console.log(`   → Time: ${new Date().toISOString()}`)
  console.log(`   → Body:`, {
    name: req.body.name,
    email: req.body.email,
    platform: req.body.platform
  })

  try {
    // Validate required fields
    const { name, email, platform } = req.body
    
    if (!name || !email || !platform) {
      console.log('⚠️ [AFFILIATE] Missing required fields')
      return res.status(400).json({
        success: false,
        message: 'Name, email, and platform are required'
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('⚠️ [AFFILIATE] Invalid email format')
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    // Create affiliate account
    const result = await affiliateService.createAffiliateAccount(req.body)

    console.log('✅ [AFFILIATE] Signup successful')
    res.status(201).json(result)

  } catch (error) {
    console.error('❌ [AFFILIATE] Error processing signup:', error)
    
    // Check for duplicate email error
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create affiliate account. Please try again.'
    })
  }
})

// Alias for backward compatibility
router.post('/apply', async (req, res) => {
  return router.handle(req, res, '/signup')
})

/**
 * POST /api/affiliates/login
 * Affiliate login (basic authentication)
 */
router.post('/login', async (req, res) => {
  console.log('📥 [REQUEST] Affiliate login attempt')
  console.log(`   → Email: ${req.body.email}`)

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Get affiliate by email
    const affiliate = await affiliateService.getAffiliateByEmail(email)

    if (!affiliate) {
      console.log('⚠️ [AFFILIATE] Email not found')
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (affiliate.tempPassword !== password) {
      console.log('⚠️ [AFFILIATE] Invalid password')
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if affiliate is approved
    if (affiliate.status !== 'approved') {
      console.log('⚠️ [AFFILIATE] Account not approved')
      return res.status(403).json({
        success: false,
        message: 'Your affiliate application is still pending approval'
      })
    }

    console.log('✅ [AFFILIATE] Login successful')
    
    // Return affiliate data (excluding sensitive info)
    res.status(200).json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        affiliateLink: affiliate.affiliateLink,
        status: affiliate.status,
        totalEarnings: affiliate.totalEarnings,
        totalReferrals: affiliate.totalReferrals,
        activeReferrals: affiliate.activeReferrals,
        clicks: affiliate.clicks,
        conversions: affiliate.conversions,
        commissionRate: affiliate.commissionRate,
        passwordChanged: affiliate.passwordChanged
      }
    })

  } catch (error) {
    console.error('❌ [AFFILIATE] Login error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    })
  }
})

/**
 * GET /api/affiliates/stats/:affiliateId
 * Get affiliate stats and dashboard data
 */
router.get('/stats/:affiliateId', async (req, res) => {
  console.log(`📥 [REQUEST] Stats request for affiliate: ${req.params.affiliateId}`)

  try {
    const { affiliateId } = req.params
    
    // In production, verify JWT token and ensure user can only access their own data
    const affiliate = await affiliateService.getAffiliateByEmail(affiliateId)

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      })
    }

    res.status(200).json({
      success: true,
      stats: {
        totalEarnings: affiliate.totalEarnings,
        totalReferrals: affiliate.totalReferrals,
        activeReferrals: affiliate.activeReferrals,
        clicks: affiliate.clicks,
        conversions: affiliate.conversions,
        conversionRate: affiliate.clicks > 0 
          ? ((affiliate.conversions / affiliate.clicks) * 100).toFixed(2) 
          : 0,
        affiliateCode: affiliate.affiliateCode,
        affiliateLink: affiliate.affiliateLink
      }
    })

  } catch (error) {
    console.error('❌ [AFFILIATE] Error fetching stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch affiliate stats'
    })
  }
})

/**
 * POST /api/affiliates/track-click
 * Track affiliate link click
 */
router.post('/track-click', async (req, res) => {
  try {
    const { affiliateCode } = req.body

    if (!affiliateCode) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate code is required'
      })
    }

    const result = await affiliateService.trackClick(affiliateCode)
    res.status(200).json(result)

  } catch (error) {
    console.error('❌ [AFFILIATE] Error tracking click:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    })
  }
})

/**
 * GET /api/affiliates/all (Admin only)
 * Get all affiliates
 */
router.get('/all', async (req, res) => {
  console.log('📥 [REQUEST] Get all affiliates (admin)')

  try {
    // In production, add admin authentication middleware
    const affiliates = await affiliateService.getAllAffiliates()

    res.status(200).json({
      success: true,
      count: affiliates.length,
      affiliates
    })

  } catch (error) {
    console.error('❌ [AFFILIATE] Error fetching all affiliates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch affiliates'
    })
  }
})

/**
 * POST /api/affiliates/approve/:affiliateId (Admin only)
 * Approve affiliate application
 */
router.post('/approve/:affiliateId', async (req, res) => {
  console.log(`📥 [REQUEST] Approve affiliate: ${req.params.affiliateId}`)

  try {
    // In production, add admin authentication middleware
    const result = await affiliateService.approveAffiliate(req.params.affiliateId)
    res.status(200).json(result)

  } catch (error) {
    console.error('❌ [AFFILIATE] Error approving affiliate:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve affiliate'
    })
  }
})

module.exports = router

