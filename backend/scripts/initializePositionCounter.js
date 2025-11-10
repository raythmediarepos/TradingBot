/**
 * Initialize Position Counter
 * 
 * This script initializes the betaUserCounter in Firebase
 * based on the highest position currently in the betaUsers collection.
 * 
 * Run this ONCE after deploying the new transaction-based signup:
 * node backend/scripts/initializePositionCounter.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { admin, db } = require('../config/firebase-admin')

const COLLECTIONS = {
  BETA_USERS: 'betaUsers',
  COUNTERS: 'counters',
}

async function initializeCounter() {
  try {
    console.log('🔢 [INIT] Initializing beta user position counter...\n')

    // Get all beta users ordered by position
    const usersSnapshot = await db
      .collection(COLLECTIONS.BETA_USERS)
      .orderBy('position', 'desc')
      .limit(1)
      .get()

    let maxPosition = 0

    if (!usersSnapshot.empty) {
      const highestUser = usersSnapshot.docs[0].data()
      maxPosition = highestUser.position || 0
      console.log(`📊 [INIT] Found ${highestUser.email} at position #${maxPosition}`)
    } else {
      console.log(`📊 [INIT] No existing users found`)
    }

    // Set or update the counter
    const counterRef = db.collection(COLLECTIONS.COUNTERS).doc('betaUserCounter')
    const counterDoc = await counterRef.get()

    if (counterDoc.exists) {
      const existingCounter = counterDoc.data()
      console.log(`\n⚠️  [INIT] Counter already exists!`)
      console.log(`   → Current value: ${existingCounter.lastPosition}`)
      console.log(`   → Max position in DB: ${maxPosition}`)

      // Use the higher of the two
      const newPosition = Math.max(existingCounter.lastPosition || 0, maxPosition)
      
      if (newPosition !== existingCounter.lastPosition) {
        await counterRef.update({
          lastPosition: newPosition,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`\n✅ [INIT] Counter updated to ${newPosition}`)
      } else {
        console.log(`\n✅ [INIT] Counter is already up to date (${newPosition})`)
      }
    } else {
      await counterRef.set({
        lastPosition: maxPosition,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        initializedFrom: 'migration',
      })
      console.log(`\n✅ [INIT] Counter created and set to ${maxPosition}`)
    }

    console.log(`\n🎉 [INIT] Position counter initialized successfully!`)
    console.log(`   → Next signup will get position #${maxPosition + 1}`)
    console.log(`\n✅ [INIT] Safe to deploy new signup system!`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ [INIT] Error initializing counter:')
    console.error(`   → ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the migration
initializeCounter()

