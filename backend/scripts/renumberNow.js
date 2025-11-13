/**
 * Renumber Beta Positions Now
 * 
 * Manually triggers the position renumbering process.
 * 
 * Usage: node backend/scripts/renumberNow.js
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'config', 'serviceAccountKey.json'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
const COLLECTIONS = {
  BETA_USERS: 'betaUsers',
  COUNTERS: 'counters',
}

const renumberBetaPositions = async () => {
  console.log('\n🔢 [RENUMBER] Starting beta position renumbering...')
  try {
    // Get all non-admin users sorted by createdAt (oldest first)
    const usersSnapshot = await db.collection(COLLECTIONS.BETA_USERS)
      .where('role', '!=', 'admin')
      .orderBy('role')
      .orderBy('createdAt', 'asc')
      .get()

    if (usersSnapshot.empty) {
      console.log('✅ [RENUMBER] No users to renumber')
      return { success: true, count: 0, changes: 0, highestPosition: 0 }
    }

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`📊 [RENUMBER] Found ${users.length} beta users`)
    console.log(`   → Sorting by createdAt (oldest first)`)

    // Sort by createdAt to ensure consistent ordering
    users.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(0)
      const timeB = b.createdAt?.toDate?.() || new Date(0)
      return timeA - timeB
    })

    // Assign sequential positions
    const batch = db.batch()
    let changes = 0
    let newPosition = 0

    for (const user of users) {
      newPosition++
      
      if (user.position !== newPosition) {
        console.log(`   → Updating ${user.email}: #${user.position || 'N/A'} → #${newPosition}`)
        batch.update(db.collection(COLLECTIONS.BETA_USERS).doc(user.id), {
          position: newPosition,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        changes++
      }
    }

    // Commit all updates
    if (changes > 0) {
      await batch.commit()
      console.log(`✅ [RENUMBER] Updated ${changes} positions`)
    } else {
      console.log(`✅ [RENUMBER] All positions already correct`)
    }

    // Update the counter to match highest position
    console.log(`🔄 [RENUMBER] Updating counter to ${newPosition}`)
    await db.collection(COLLECTIONS.COUNTERS).doc('betaPosition').set({
      value: newPosition,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`   → Updated counter to ${newPosition}`)

    console.log('✅ [RENUMBER] Complete - ' + changes + ' positions updated out of ' + users.length + ' users')
    console.log('   → Total users: ' + users.length)
    console.log('   → Highest position: ' + newPosition)
    console.log('   → Changes made: ' + changes)
    console.log('')

    return { success: true, count: users.length, changes, highestPosition: newPosition }
  } catch (error) {
    console.error('❌ [RENUMBER] Error renumbering positions:', error)
    return { success: false, error: error.message }
  }
}

// Run renumbering
renumberBetaPositions()
  .then(result => {
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

