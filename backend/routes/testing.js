const express = require('express')
const router = express.Router()
const { admin, db } = require('../config/firebase-admin')
const { authenticate, requireAdmin } = require('../middleware/auth')
const bcrypt = require('bcryptjs')

/**
 * @route   POST /api/admin/testing/add-fake-users
 * @desc    Add 100 fake beta users for testing
 * @access  Admin only
 */
router.post('/add-fake-users', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('🧪 [TESTING] Adding 100 fake beta users...')
    console.log(`   → Requested by: ${req.user.email}`)

    // Get current beta stats to determine starting position
    const betaUsersSnapshot = await db.collection('betaUsers').get()
    const currentCount = betaUsersSnapshot.size
    console.log(`   → Current beta users: ${currentCount}`)

    // Generate 100 fake users
    const fakeUsers = []
    const batch = db.batch()

    for (let i = 1; i <= 100; i++) {
      const position = currentCount + i
      const email = `fakeuser${position}@test.helwa.ai`
      const firstName = `Test`
      const lastName = `User${position}`
      const passwordHash = await bcrypt.hash('FakePassword123!', 10)

      const fakeUserData = {
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'user',
        position,
        status: 'active',
        paymentStatus: position <= 20 ? 'free' : 'paid', // First 20 free, rest paid
        isFree: position <= 20,
        isFoundingMember: position <= 20,
        isFakeUser: true, // IMPORTANT: Mark as fake for easy deletion
        emailVerified: true,
        emailVerificationToken: null,
        discordJoined: false,
        discordUserId: null,
        discordUsername: null,
        stripeCustomerId: null,
        stripePaymentIntentId: null,
        accessExpiresAt: new Date('2025-12-31T23:59:59Z'),
        lastLoginAt: null,
        lastLogoutAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const docRef = db.collection('betaUsers').doc()
      batch.set(docRef, fakeUserData)
      fakeUsers.push({ id: docRef.id, ...fakeUserData })
    }

    // Commit all fake users at once
    await batch.commit()
    console.log(`✅ [TESTING] Successfully added 100 fake users`)
    console.log(`   → Total beta users now: ${currentCount + 100}`)

    res.json({
      success: true,
      message: 'Successfully added 100 fake beta users',
      count: 100,
      totalUsers: currentCount + 100,
    })
  } catch (error) {
    console.error('❌ [TESTING] Error adding fake users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add fake users',
      error: error.message,
    })
  }
})

/**
 * @route   DELETE /api/admin/testing/remove-fake-users
 * @desc    Remove all fake beta users
 * @access  Admin only
 */
router.delete('/remove-fake-users', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('🧪 [TESTING] Removing all fake beta users...')
    console.log(`   → Requested by: ${req.user.email}`)

    // Find all fake users
    const fakeUsersSnapshot = await db.collection('betaUsers')
      .where('isFakeUser', '==', true)
      .get()

    const fakeUsersCount = fakeUsersSnapshot.size
    console.log(`   → Found ${fakeUsersCount} fake users to remove`)

    if (fakeUsersCount === 0) {
      console.log('ℹ️  [TESTING] No fake users found to remove')
      return res.json({
        success: true,
        message: 'No fake users found to remove',
        count: 0,
      })
    }

    // Delete all fake users in batches of 500 (Firestore limit)
    const batches = []
    let batch = db.batch()
    let operationCount = 0

    fakeUsersSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
      operationCount++

      // Firestore batch limit is 500 operations
      if (operationCount === 500) {
        batches.push(batch)
        batch = db.batch()
        operationCount = 0
      }
    })

    // Add remaining operations
    if (operationCount > 0) {
      batches.push(batch)
    }

    // Commit all batches
    console.log(`   → Committing ${batches.length} batch(es)...`)
    await Promise.all(batches.map(b => b.commit()))

    console.log(`✅ [TESTING] Successfully removed ${fakeUsersCount} fake users`)

    res.json({
      success: true,
      message: `Successfully removed ${fakeUsersCount} fake users`,
      count: fakeUsersCount,
    })
  } catch (error) {
    console.error('❌ [TESTING] Error removing fake users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove fake users',
      error: error.message,
    })
  }
})

module.exports = router

