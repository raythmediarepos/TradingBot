const express = require('express')
const router = express.Router()
const { addToWaitlist, getRemainingWaitlistSpots, getAllWaitlistMembers, MAX_WAITLIST_MEMBERS } = require('../services/waitlistService')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { signupLimiter } = require('../middleware/rateLimiter')

/**
 * @route   POST /api/waitlist/join
 * @desc    Add user to waitlist
 * @access  Public
 */
router.post('/join', signupLimiter, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body

    const result = await addToWaitlist({ email, firstName, lastName })

    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error in waitlist signup:', error)
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    })
  }
})

/**
 * @route   GET /api/waitlist/stats
 * @desc    Get waitlist statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getRemainingWaitlistSpots()

    res.json({
      success: true,
      filled: stats.filled,
      remaining: stats.remaining,
      total: stats.total,
    })
  } catch (error) {
    console.error('Error getting waitlist stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist stats',
    })
  }
})

/**
 * @route   GET /api/waitlist/members
 * @desc    Get all waitlist members (admin only)
 * @access  Admin
 */
router.get('/members', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await getAllWaitlistMembers()

    if (result.success) {
      res.json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Error getting waitlist members:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist members',
    })
  }
})

module.exports = router

