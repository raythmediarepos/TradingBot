const express = require('express')
const router = express.Router()
const waitlistService = require('../services/waitlistService')
const contactService = require('../services/contactService')

// ============================================
// WAITLIST ROUTES
// ============================================

/**
 * GET /api/waitlist/remaining
 * Get the number of remaining waitlist spots
 */
router.get('/waitlist/remaining', async (req, res) => {
  try {
    const result = await waitlistService.getRemainingWaitlistSpots()
    res.json(result)
  } catch (error) {
    console.error('Error in /waitlist/remaining:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

/**
 * GET /api/waitlist/stats
 * Get waitlist statistics
 */
router.get('/waitlist/stats', async (req, res) => {
  try {
    const result = await waitlistService.getRemainingWaitlistSpots()
    res.json({
      success: true,
      filled: result.filled,
      remaining: result.remaining,
      total: result.total,
    })
  } catch (error) {
    console.error('Error in /waitlist/stats:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

/**
 * POST /api/waitlist/join
 * Add a user to the waitlist
 * Body: { email, firstName, lastName }
 */
router.post('/waitlist/join', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body

    const result = await waitlistService.addToWaitlist({
      email,
      firstName,
      lastName,
    })

    // Return appropriate status code
    if (result.success) {
      res.status(201).json(result)
    } else if (result.alreadyExists) {
      res.status(409).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in /waitlist/join:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
})

/**
 * GET /api/waitlist/all (ADMIN ONLY)
 * Get all waitlist members
 * TODO: Add authentication middleware
 */
router.get('/waitlist/all', async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    // if (!req.user || !req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Unauthorized' })
    // }

    const result = await waitlistService.getAllWaitlistMembers()
    res.json(result)
  } catch (error) {
    console.error('Error in /waitlist/all:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

// ============================================
// CONTACT ROUTES
// ============================================

/**
 * POST /api/contact
 * Submit a contact form message
 * Body: { firstName, lastName, email, message, subject?, phone? }
 */
router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message, subject, phone } = req.body

    const result = await contactService.submitContactMessage({
      firstName,
      lastName,
      email,
      message,
      subject,
      phone,
    })

    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in /contact:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
})

/**
 * GET /api/contact/messages (ADMIN ONLY)
 * Get all contact messages
 * Query params: status, limit
 */
router.get('/contact/messages', async (req, res) => {
  try {
    // TODO: Add admin authentication check

    const { status, limit } = req.query
    const filters = {}

    if (status) filters.status = status
    if (limit) filters.limit = parseInt(limit)

    const result = await contactService.getAllContactMessages(filters)
    res.json(result)
  } catch (error) {
    console.error('Error in /contact/messages:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

/**
 * PATCH /api/contact/messages/:id/status (ADMIN ONLY)
 * Update contact message status
 * Body: { status }
 */
router.patch('/contact/messages/:id/status', async (req, res) => {
  try {
    // TODO: Add admin authentication check

    const { id } = req.params
    const { status } = req.body

    const result = await contactService.updateMessageStatus(id, status)

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in /contact/messages/:id/status:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

// ============================================
// AUTHENTICATION ROUTES
// ============================================

const authRoutes = require('../routes/auth')
router.use('/auth', authRoutes)

// ============================================
// USER DASHBOARD ROUTES (Protected)
// ============================================

const userRoutes = require('../routes/user')
router.use('/user', userRoutes)

// ============================================
// BETA PROGRAM ROUTES
// ============================================

const betaRoutes = require('../routes/beta')
router.use('/beta', betaRoutes)

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

const adminRoutes = require('../routes/admin')
router.use('/admin', adminRoutes)

// ============================================
// AFFILIATE ROUTES
// ============================================

const affiliateRoutes = require('../routes/affiliate')
router.use('/affiliate', affiliateRoutes)

// ============================================
// SITE SETTINGS ROUTES
// ============================================

const siteSettingsRoutes = require('../routes/siteSettings')
router.use('/site-settings', siteSettingsRoutes)

// ============================================
// MONITORING & ALERTS
// ============================================

const { sendAlertEmail } = require('../services/monitoring/alertService')

/**
 * POST /api/test-alert
 * Trigger a test alert to Discord
 * Query params: severity (info|warning|critical)
 */
router.post('/test-alert', async (req, res) => {
  try {
    const { severity = 'warning' } = req.query
    
    // Validate severity
    if (!['info', 'warning', 'critical'].includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity. Use: info, warning, or critical',
      })
    }

    // Create test alert based on severity
    let alert
    switch (severity) {
      case 'critical':
        alert = {
          service: 'TEST',
          severity: 'critical',
          message: '🚨 TEST ALERT: This is a critical test alert!',
          details: 'This is a test of the critical alert system. Admins should be tagged!',
          threshold: 100,
          actual: 0,
        }
        break
      case 'warning':
        alert = {
          service: 'TEST',
          severity: 'warning',
          message: '⚠️ TEST ALERT: This is a warning test alert!',
          details: 'This is a test of the warning alert system.',
          threshold: 80,
          actual: 60,
        }
        break
      case 'info':
        alert = {
          service: 'TEST',
          severity: 'info',
          message: 'ℹ️ TEST ALERT: This is an info test alert!',
          details: 'This is a test of the info alert system.',
        }
        break
    }

    // Send the alert
    await sendAlertEmail(alert)

    res.json({
      success: true,
      message: `Test ${severity} alert sent to Discord!`,
      alert: {
        severity,
        message: alert.message,
        service: alert.service,
      },
    })
  } catch (error) {
    console.error('Error sending test alert:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send test alert',
      details: error.message,
    })
  }
})

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Helwa AI Backend',
  })
})

// ============================================
// ISSUE REPORTS ROUTES
// ============================================

const issueReportsRouter = require('../routes/issueReports')
router.use('/issues', issueReportsRouter)

module.exports = router

