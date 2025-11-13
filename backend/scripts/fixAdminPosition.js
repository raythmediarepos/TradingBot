/**
 * Fix Admin Position Script
 * 
 * Removes position field from admin users - they shouldn't have positions.
 * 
 * Usage: node backend/scripts/fixAdminPosition.js
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

const fixAdminPosition = async () => {
  try {
    console.log('\n🔧 [FIX] Fixing admin user positions...\n')
    
    // Get all admin users
    const snapshot = await db.collection('betaUsers')
      .where('role', '==', 'admin')
      .get()
    
    if (snapshot.empty) {
      console.log('✅ No admin users found')
      process.exit(0)
      return
    }
    
    console.log(`📊 Found ${snapshot.size} admin user(s)`)
    
    const batch = db.batch()
    let updated = 0
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.position !== undefined) {
        console.log(`🔄 Removing position from: ${data.email}`)
        batch.update(doc.ref, {
          position: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        updated++
      }
    })
    
    if (updated > 0) {
      await batch.commit()
      console.log(`✅ Removed position from ${updated} admin user(s)\n`)
    } else {
      console.log(`✅ No admin users had positions\n`)
    }
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error fixing admin positions:', error)
    process.exit(1)
  }
}

// Run fix
fixAdminPosition()

