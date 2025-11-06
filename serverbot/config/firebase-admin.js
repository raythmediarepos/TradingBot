const admin = require('firebase-admin')

let firebaseInitialized = false

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  if (firebaseInitialized) {
    console.log('✅ Firebase Admin already initialized')
    return admin
  }

  try {
    // Check if running in production (using environment variable)
    const isProduction = process.env.NODE_ENV === 'production'

    let credential

    if (isProduction && process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: Use environment variable with service account JSON
      console.log('🔧 [FIREBASE] Using service account from environment variable')
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      credential = admin.credential.cert(serviceAccount)
    } else {
      // Development: Use service account key file
      console.log('🔧 [FIREBASE] Using service account from file')
      const serviceAccount = require('./serviceAccountKey.json')
      credential = admin.credential.cert(serviceAccount)
    }

    admin.initializeApp({
      credential,
    })

    firebaseInitialized = true
    console.log('✅ Firebase Admin initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message)
    console.log('📝 Make sure serviceAccountKey.json exists in the config/ directory')
    throw error
  }

  return admin
}

module.exports = {
  initializeFirebase,
  admin,
}

