require('dotenv').config()
const admin = require('firebase-admin')

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const serviceAccount = require('../config/serviceAccountKey.json')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    console.log('✅ Firebase Admin initialized')
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error)
    process.exit(1)
  }
}

const db = admin.firestore()

const markFoundingMembers = async () => {
  try {
    console.log('🌟 [FOUNDING] Starting to mark founding members...')
    console.log('📋 [FOUNDING] Criteria: First 20 beta users by position\n')
    
    // Get all beta users, ordered by position
    const usersSnapshot = await db.collection('betaUsers')
      .orderBy('position', 'asc')
      .limit(20)
      .get()
    
    if (usersSnapshot.empty) {
      console.log('⚠️  [FOUNDING] No beta users found')
      process.exit(0)
    }
    
    console.log(`📊 [FOUNDING] Found ${usersSnapshot.size} users in first 20 positions\n`)
    
    const batch = db.batch()
    let updateCount = 0
    let alreadyMarkedCount = 0
    
    usersSnapshot.forEach(doc => {
      const data = doc.data()
      const currentlyMarked = data.isFoundingMember === true
      
      console.log(`👤 Position #${data.position}: ${data.firstName} ${data.lastName} (${data.email})`)
      console.log(`   → Status: ${data.status || 'N/A'}`)
      console.log(`   → Payment: ${data.paymentStatus || 'N/A'}`)
      console.log(`   → Discord Joined: ${data.discordJoined ? 'Yes' : 'No'}`)
      console.log(`   → Founding Member: ${currentlyMarked ? 'Already marked ✓' : 'Marking now... 🌟'}`)
      
      if (!currentlyMarked) {
        batch.update(doc.ref, {
          isFoundingMember: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        updateCount++
      } else {
        alreadyMarkedCount++
      }
      
      console.log('')
    })
    
    if (updateCount > 0) {
      console.log(`📝 [FOUNDING] Committing updates to ${updateCount} users...`)
      await batch.commit()
      console.log('✅ [FOUNDING] Batch update completed!')
    } else {
      console.log('✅ [FOUNDING] All users already marked as founding members')
    }
    
    console.log('')
    console.log('📊 [FOUNDING] Summary:')
    console.log(`   → Total processed: ${usersSnapshot.size}`)
    console.log(`   → Newly marked: ${updateCount}`)
    console.log(`   → Already marked: ${alreadyMarkedCount}`)
    console.log('')
    console.log('🎉 [FOUNDING] Founding members successfully marked!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ [FOUNDING] Error marking founding members:', error)
    process.exit(1)
  }
}

// Run the script
markFoundingMembers()

