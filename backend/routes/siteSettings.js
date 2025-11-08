const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../middleware/auth')
const { admin } = require('../config/firebase-admin')
const db = admin.firestore()

const SETTINGS_COLLECTION = 'siteSettings'
const NAV_SETTINGS_DOC = 'navigationSettings'

/**
 * @route   GET /api/site-settings/navigation
 * @desc    Get navigation visibility settings (public)
 * @access  Public
 */
router.get('/navigation', async (req, res) => {
  try {
    const settingsDoc = await db
      .collection(SETTINGS_COLLECTION)
      .doc(NAV_SETTINGS_DOC)
      .get()

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      return res.json({
        success: true,
        settings: {
          betaProgram: true,
          features: true,
          faq: true,
          affiliates: true,
          investors: true,
          changelog: true,
          learnMore: true,
          login: true,
          joinBeta: true,
        },
      })
    }

    res.json({
      success: true,
      settings: settingsDoc.data(),
    })
  } catch (error) {
    console.error('❌ [SITE SETTINGS] Error fetching navigation settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation settings',
      error: error.message,
    })
  }
})

/**
 * @route   PUT /api/site-settings/navigation
 * @desc    Update navigation visibility settings
 * @access  Admin only
 */
router.put('/navigation', authenticate, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required',
      })
    }

    // Validate settings structure
    const validKeys = [
      'betaProgram',
      'features',
      'faq',
      'affiliates',
      'investors',
      'changelog',
      'learnMore',
      'login',
      'joinBeta',
    ]

    const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key))
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings keys: ${invalidKeys.join(', ')}`,
      })
    }

    // Save to Firestore
    await db
      .collection(SETTINGS_COLLECTION)
      .doc(NAV_SETTINGS_DOC)
      .set(
        {
          ...settings,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.user.email,
        },
        { merge: true }
      )

    console.log(`✅ [SITE SETTINGS] Navigation settings updated by ${req.user.email}`)

    res.json({
      success: true,
      message: 'Navigation settings updated successfully',
      settings,
    })
  } catch (error) {
    console.error('❌ [SITE SETTINGS] Error updating navigation settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update navigation settings',
      error: error.message,
    })
  }
})

module.exports = router

