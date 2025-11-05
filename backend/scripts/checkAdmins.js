// Script to check admin users in database
const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function checkAdmins() {
  try {
    console.log('🔍 Checking for admin users...\n')
    
    const usersRef = db.collection('betaUsers')
    const snapshot = await usersRef.where('isMarkedAdmin', '==', true).get()
    
    if (snapshot.empty) {
      console.log('❌ No admin users found in database')
      process.exit(0)
    }
    
    console.log(`✅ Found ${snapshot.size} admin user(s):\n`)
    
    snapshot.forEach(doc => {
      const data = doc.data()
      console.log(`👑 Admin: ${data.firstName} ${data.lastName}`)
      console.log(`   → ID: ${doc.id}`)
      console.log(`   → Discord ID: ${data.discordUserId}`)
      console.log(`   → Email: ${data.email}`)
      console.log(`   → isMarkedAdmin: ${data.isMarkedAdmin}`)
      console.log(`   → Marked by: ${data.markedAdminBy}`)
      console.log(`   → Marked at: ${data.markedAdminAt?.toDate()}`)
      console.log()
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkAdmins()

