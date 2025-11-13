/**
 * Fix Position Counter Script
 * 
 * Updates the betaPosition counter to match the highest position in the database.
 * 
 * Usage: node backend/scripts/fixCounter.js
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

const fixCounter = async () => {
  try {
    console.log('\n🔧 [FIX] Fixing position counter...\n')
    
    // Get all non-admin users
    const snapshot = await db.collection('betaUsers')
      .where('role', '!=', 'admin')
      .orderBy('role')
      .get()
    
    if (snapshot.empty) {
      console.log('✅ No users found, setting counter to 0')
      await db.collection('counters').doc('betaPosition').set({ value: 0 })
      process.exit(0)
      return
    }
    
    // Find highest position
    let highestPosition = 0
    snapshot.docs.forEach(doc => {
      const position = doc.data().position || 0
      if (position > highestPosition) {
        highestPosition = position
      }
    })
    
    console.log(`📊 Highest position: ${highestPosition}`)
    console.log(`📊 Total users: ${snapshot.size}`)
    console.log(`🔄 Updating counter...`)
    
    await db.collection('counters').doc('betaPosition').set({
      value: highestPosition,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    console.log(`✅ Counter updated to ${highestPosition}\n`)
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error fixing counter:', error)
    process.exit(1)
  }
}

// Run fix
fixCounter()

