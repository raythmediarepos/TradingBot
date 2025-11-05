/**
 * Script to create an admin user in Firestore
 * Run with: node scripts/createAdmin.js
 */

const { admin, db } = require('../config/firebase-admin')
const { hashPassword } = require('../utils/password')

const createAdminUser = async () => {
  try {
    console.log('🔐 Creating admin user...')

    // Admin credentials
    const adminEmail = 'admin@helwa.ai'
    const adminPassword = 'godisgood'
    const adminUsername = 'admin'

    // Hash the password
    const passwordHash = await hashPassword(adminPassword)

    // Check if admin already exists
    const existingAdmin = await db.collection('betaUsers')
      .where('email', '==', adminEmail)
      .limit(1)
      .get()

    if (!existingAdmin.empty) {
      console.log('⚠️  Admin user already exists!')
      console.log('   Updating password...')
      
      const adminDoc = existingAdmin.docs[0]
      await db.collection('betaUsers').doc(adminDoc.id).update({
        passwordHash,
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      
      console.log('✅ Admin password updated successfully!')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log(`   Username: ${adminUsername}`)
      process.exit(0)
      return
    }

    // Create new admin user
    const adminData = {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      passwordHash,
      role: 'admin',
      emailVerified: true,
      status: 'active',
      position: 0,
      isFree: true,
      paymentStatus: 'free',
      discordJoined: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection('betaUsers').add(adminData)

    console.log('✅ Admin user created successfully!')
    console.log(`   User ID: ${docRef.id}`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Username: ${adminUsername}`)
    console.log('')
    console.log('🔑 Login at: http://localhost:3000/admin/login')
    console.log('   Or: https://your-domain.com/admin/login')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

// Run the script
createAdminUser()

