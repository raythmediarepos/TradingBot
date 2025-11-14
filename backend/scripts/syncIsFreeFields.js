const { admin, db } = require('../config/firebase-admin')

const FREE_SLOTS = 20

async function syncIsFreeFields() {
  console.log('')
  console.log('🔄 SYNCING isFree FIELDS')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  console.log(`📋 Rule: Position <= ${FREE_SLOTS} = FREE`)
  console.log('')

  try {
    // Get all beta users (no complex query to avoid index requirement)
    const snapshot = await db.collection('betaUsers')
      .orderBy('position', 'asc')
      .get()

    if (snapshot.empty) {
      console.log('❌ No users found!')
      process.exit(0)
    }

    // Filter out admins manually
    const users = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.role !== 'admin' && user.position)

    console.log(`📊 Found ${users.length} beta users`)
    console.log('')

    const updates = []
    const batch = db.batch()

    for (const user of users) {
      const correctIsFree = user.position <= FREE_SLOTS
      const correctPaymentStatus = correctIsFree ? 'free' : user.paymentStatus
      
      // Check if needs update
      if (user.isFree !== correctIsFree || (correctIsFree && user.paymentStatus !== 'free')) {
        const userRef = db.collection('betaUsers').doc(user.id)
        
        const updateData = {
          isFree: correctIsFree,
        }
        
        // If should be free, also update payment status
        if (correctIsFree) {
          updateData.paymentStatus = 'free'
          updateData.requiresPayment = false
        }
        
        batch.update(userRef, updateData)
        
        updates.push({
          position: user.position,
          email: user.email,
          oldIsFree: user.isFree,
          newIsFree: correctIsFree,
          oldPaymentStatus: user.paymentStatus,
          newPaymentStatus: correctIsFree ? 'free' : user.paymentStatus,
        })
      }
    }

    if (updates.length === 0) {
      console.log('✅ All users already have correct isFree values!')
      console.log('')
      process.exit(0)
    }

    console.log(`🔧 Updating ${updates.length} user(s):`)
    console.log('')

    updates.forEach(update => {
      const statusEmoji = update.newIsFree ? '🎉 FREE' : '💳 PAID'
      const changeEmoji = update.oldIsFree !== update.newIsFree ? '⚠️  STATUS CHANGED' : '✓ Fixed'
      console.log(`#${update.position}: ${update.email}`)
      console.log(`   ${changeEmoji}`)
      console.log(`   isFree: ${update.oldIsFree} → ${update.newIsFree} ${statusEmoji}`)
      if (update.oldPaymentStatus !== update.newPaymentStatus) {
        console.log(`   paymentStatus: ${update.oldPaymentStatus} → ${update.newPaymentStatus}`)
      }
      console.log('')
    })

    // Commit all updates
    await batch.commit()

    console.log('═══════════════════════════════════════════════════════════')
    console.log(`✅ Successfully synced ${updates.length} user(s)!`)
    console.log('')

    // Show Ramsey's status if present
    const ramsey = users.find(u => u.email === 'ramsey.tawfik@raythmedia.com')
    if (ramsey) {
      const correctIsFree = ramsey.position <= FREE_SLOTS
      console.log('🎯 RAMSEY\'S NEW STATUS:')
      console.log(`   Position: #${ramsey.position}`)
      console.log(`   isFree: ${correctIsFree}`)
      console.log(`   Status: ${correctIsFree ? 'FREE 🎉' : 'PAID 💳'}`)
      console.log('')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

syncIsFreeFields()

