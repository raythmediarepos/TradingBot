// Script to clean up duplicate admin records
const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function cleanDuplicates() {
  try {
    console.log('🧹 Cleaning duplicate admin records...\n')
    
    const usersRef = db.collection('betaUsers')
    const snapshot = await usersRef.get()
    
    // Group by Discord ID
    const discordIdMap = new Map()
    
    snapshot.forEach(doc => {
      const data = doc.data()
      if (data.discordUserId) {
        if (!discordIdMap.has(data.discordUserId)) {
          discordIdMap.set(data.discordUserId, [])
        }
        discordIdMap.set(data.discordUserId, [
          ...discordIdMap.get(data.discordUserId),
          { id: doc.id, data, ref: doc.ref }
        ])
      }
    })
    
    // Find and clean duplicates
    let deletedCount = 0
    
    for (const [discordId, records] of discordIdMap.entries()) {
      if (records.length > 1) {
        console.log(`⚠️  Found ${records.length} records for Discord ID: ${discordId}`)
        console.log(`   → User: ${records[0].data.firstName} ${records[0].data.lastName}`)
        
        // Sort by markedAdminAt or createdAt, keep the most recent
        records.sort((a, b) => {
          const aTime = a.data.markedAdminAt || a.data.createdAt
          const bTime = b.data.markedAdminAt || b.data.createdAt
          if (!aTime) return 1
          if (!bTime) return -1
          const aDate = aTime.toDate ? aTime.toDate() : new Date(aTime)
          const bDate = bTime.toDate ? bTime.toDate() : new Date(bTime)
          return bDate - aDate // Most recent first
        })
        
        const keepRecord = records[0]
        const deleteRecords = records.slice(1)
        
        console.log(`   ✅ Keeping: ${keepRecord.id} (most recent)`)
        
        for (const record of deleteRecords) {
          console.log(`   ❌ Deleting: ${record.id}`)
          await record.ref.delete()
          deletedCount++
        }
        console.log()
      }
    }
    
    if (deletedCount === 0) {
      console.log('✨ No duplicates found!')
    } else {
      console.log(`✅ Cleaned up ${deletedCount} duplicate record(s)`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanDuplicates()

