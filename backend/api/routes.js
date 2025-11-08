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
// AFFILIATE ROUTES
// ============================================

const affiliateRoutes = require('../routes/affiliates')
router.use('/affiliates', affiliateRoutes)

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
// SITE SETTINGS ROUTES
// ============================================

const siteSettingsRoutes = require('../routes/siteSettings')
router.use('/site-settings', siteSettingsRoutes)

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

module.exports = router

