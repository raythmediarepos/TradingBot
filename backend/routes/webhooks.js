const express = require('express')
const router = express.Router()
const { trackEmailEvent, checkEmailHealth } = require('../services/emailMonitoringService')

// ============================================
// RESEND WEBHOOK ENDPOINT
// ============================================

/**
 * POST /api/webhooks/resend
 * Receive email events from Resend
 * 
 * Event types:
 * - email.sent
 * - email.delivered
 * - email.delivery_delayed
 * - email.bounced
 * - email.complained
 * - email.opened
 * - email.clicked
 */
router.post('/resend', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString())

    console.log('📧 [RESEND WEBHOOK] Received event')
    console.log(`   → Type: ${event.type}`)
    
    // Track the event
    await trackEmailEvent(event)
    
    // Check email health if there's a bounce or complaint
    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      console.log('⚠️  [RESEND WEBHOOK] Bounce/Complaint detected, checking health...')
      await checkEmailHealth()
    }
    
    // Respond to Resend
    res.status(200).json({ received: true })
  } catch (error) {
    console.error('❌ [RESEND WEBHOOK] Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// ============================================
// EXPORTS
// ============================================

module.exports = router

