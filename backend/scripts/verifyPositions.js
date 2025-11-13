/**
 * Verify Position Accuracy Script
 * 
 * This script checks that all beta user positions are accurate and sequential.
 * It compares the current positions with what they should be based on createdAt.
 * 
 * Usage: node backend/scripts/verifyPositions.js
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

const verifyPositions = async () => {
  try {
    console.log('\n🔍 [VERIFY] Starting position verification...\n')
    
    // Get all non-admin users sorted by createdAt
    const snapshot = await db.collection('betaUsers')
      .where('role', '!=', 'admin')
      .orderBy('role')
      .orderBy('createdAt', 'asc')
      .get()
    
    if (snapshot.empty) {
      console.log('✅ No users found')
      return
    }
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    
    console.log(`📊 Found ${users.length} beta users\n`)
    
    // Check if positions are sequential
    let errors = 0
    let warnings = 0
    
    users.forEach((user, index) => {
      const expectedPosition = index + 1
      const actualPosition = user.position
      
      const status = actualPosition === expectedPosition ? '✅' : '❌'
      const isFreeLabel = user.isFree ? '👑 FREE' : '💳 PAID'
      
      console.log(`${status} Position #${actualPosition} (Expected: #${expectedPosition})`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Type: ${isFreeLabel}`)
      console.log(`   Created: ${user.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}`)
      
      if (actualPosition !== expectedPosition) {
        console.log(`   ⚠️  MISMATCH: Should be #${expectedPosition}, currently #${actualPosition}`)
        errors++
      }
      
      // Check for missing position
      if (!actualPosition) {
        console.log(`   ⚠️  MISSING POSITION`)
        errors++
      }
      
      // Check for duplicate positions
      const duplicates = users.filter(u => u.position === actualPosition && u.id !== user.id)
      if (duplicates.length > 0) {
        console.log(`   ⚠️  DUPLICATE: ${duplicates.length} other user(s) have position #${actualPosition}`)
        warnings++
      }
      
      console.log('')
    })
    
    // Check counter document
    console.log('\n📈 Checking position counter...')
    const counterDoc = await db.collection('counters').doc('betaPosition').get()
    const counterValue = counterDoc.exists ? counterDoc.data().value : 0
    const highestPosition = Math.max(...users.map(u => u.position || 0))
    
    console.log(`   Counter value: ${counterValue}`)
    console.log(`   Highest position: ${highestPosition}`)
    console.log(`   Total users: ${users.length}`)
    
    if (counterValue !== highestPosition) {
      console.log(`   ⚠️  WARNING: Counter (${counterValue}) doesn't match highest position (${highestPosition})`)
      warnings++
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 VERIFICATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Users: ${users.length}`)
    console.log(`Errors: ${errors}`)
    console.log(`Warnings: ${warnings}`)
    
    if (errors === 0 && warnings === 0) {
      console.log('\n✅ All positions are accurate!')
    } else {
      console.log('\n⚠️  Issues found. Run renumberBetaPositions() to fix.')
      console.log('\nTo fix automatically, restart the backend server or wait for the hourly job.')
    }
    
    console.log('='.repeat(60) + '\n')
    
    process.exit(errors > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Error verifying positions:', error)
    process.exit(1)
  }
}

// Run verification
verifyPositions()

