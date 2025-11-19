const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  createAffiliate,
  getAffiliateByCode,
  getAffiliateById,
  getAllAffiliates,
  updateAffiliate,
  deleteAffiliate,
  getAffiliateStats,
  generateAffiliateLink,
} = require('../services/affiliateService')
const { trackClick } = require('../services/affiliateTrackingService')

/**
 * PUBLIC ENDPOINT
 * GET /api/affiliate/track-click?ref=CODE
 * Track affiliate link click
 */
router.get('/track-click', async (req, res) => {
  try {
    const { ref } = req.query

    if (!ref) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate code required',
      })
    }

    // Get client IP and user agent
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.get('user-agent')

    const result = await trackClick(ref, ip, userAgent)

    if (result.success) {
      res.json({
        success: true,
        message: 'Click tracked',
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in GET /api/affiliate/track-click:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message,
    })
  }
})

/**
 * ADMIN ENDPOINTS
 */

/**
 * POST /api/admin/affiliates
 * Create new affiliate
 */
router.post('/admin/affiliates', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, code } = req.body

    if (!name || !email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and code are required',
      })
    }

    const result = await createAffiliate(name, email, code, req.user.email)

    if (result.success) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const affiliateLink = generateAffiliateLink(code, frontendUrl)

      res.json({
        success: true,
        message: 'Affiliate created successfully',
        data: {
          ...result.affiliate,
          affiliateLink: affiliateLink,
        },
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in POST /api/admin/affiliates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create affiliate',
      error: error.message,
    })
  }
})

/**
 * GET /api/admin/affiliates
 * Get all affiliates
 */
router.get('/admin/affiliates', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await getAllAffiliates()

    if (result.success) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      
      // Add affiliate links to each affiliate
      const affiliatesWithLinks = result.affiliates.map(affiliate => ({
        ...affiliate,
        affiliateLink: generateAffiliateLink(affiliate.code, frontendUrl),
      }))

      res.json({
        success: true,
        data: affiliatesWithLinks,
      })
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Error in GET /api/admin/affiliates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get affiliates',
      error: error.message,
    })
  }
})

/**
 * GET /api/admin/affiliates/:code
 * Get affiliate by code
 */
router.get('/admin/affiliates/:code', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params

    const result = await getAffiliateByCode(code)

    if (result.success) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      
      res.json({
        success: true,
        data: {
          ...result.affiliate,
          affiliateLink: generateAffiliateLink(code, frontendUrl),
        },
      })
    } else {
      res.status(404).json(result)
    }
  } catch (error) {
    console.error('Error in GET /api/admin/affiliates/:code:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get affiliate',
      error: error.message,
    })
  }
})

/**
 * GET /api/admin/affiliates/:code/stats
 * Get detailed affiliate stats
 */
router.get('/admin/affiliates/:code/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params

    const result = await getAffiliateStats(code)

    if (result.success) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      
      res.json({
        success: true,
        data: {
          ...result.stats,
          affiliateLink: generateAffiliateLink(code, frontendUrl),
        },
      })
    } else {
      res.status(404).json(result)
    }
  } catch (error) {
    console.error('Error in GET /api/admin/affiliates/:code/stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get affiliate stats',
      error: error.message,
    })
  }
})

/**
 * PUT /api/admin/affiliates/:id
 * Update affiliate
 */
router.put('/admin/affiliates/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Don't allow updating certain fields
    delete updates.id
    delete updates.code
    delete updates.createdAt
    delete updates.createdBy
    delete updates.totalClicks
    delete updates.totalSignups
    delete updates.paidUsers
    delete updates.freeUsers
    delete updates.totalCommission

    const result = await updateAffiliate(id, updates)

    if (result.success) {
      res.json({
        success: true,
        message: 'Affiliate updated successfully',
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in PUT /api/admin/affiliates/:id:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update affiliate',
      error: error.message,
    })
  }
})

/**
 * DELETE /api/admin/affiliates/:id
 * Delete affiliate
 */
router.delete('/admin/affiliates/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const result = await deleteAffiliate(id)

    if (result.success) {
      res.json({
        success: true,
        message: 'Affiliate deleted successfully',
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in DELETE /api/admin/affiliates/:id:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete affiliate',
      error: error.message,
    })
  }
})

/**
 * POST /api/admin/affiliates/:code/generate-payout
 * Generate monthly payout report
 */
router.post('/admin/affiliates/:code/generate-payout', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params
    const { month, year } = req.body

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      })
    }

    const statsResult = await getAffiliateStats(code)
    
    if (!statsResult.success) {
      return res.status(404).json(statsResult)
    }

    const stats = statsResult.stats

    // Calculate period dates
    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0, 23, 59, 59)

    // Filter users who paid in this period
    const usersInPeriod = stats.referredUsers.filter(user => {
      if (!user.paidAt) return false
      const paidDate = user.paidAt.toDate ? user.paidAt.toDate() : new Date(user.paidAt)
      return paidDate >= periodStart && paidDate <= periodEnd
    })

    const paidUsersCount = usersInPeriod.filter(u => u.paymentStatus === 'paid' && !u.manuallyGranted).length
    const commissionAmount = paidUsersCount * 12.50

    const payoutData = {
      affiliateCode: code.toUpperCase(),
      affiliateName: stats.affiliate.name,
      affiliateEmail: stats.affiliate.email,
      month: `${year}-${String(month).padStart(2, '0')}`,
      periodStart: periodStart,
      periodEnd: periodEnd,
      totalSignups: usersInPeriod.length,
      paidUsers: paidUsersCount,
      commissionAmount: commissionAmount,
      userIds: usersInPeriod.map(u => u.id),
      status: 'pending',
      generatedAt: new Date(),
      generatedBy: req.user.email,
    }

    res.json({
      success: true,
      message: 'Payout report generated',
      data: payoutData,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/affiliates/:code/generate-payout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate payout report',
      error: error.message,
    })
  }
})

module.exports = router

