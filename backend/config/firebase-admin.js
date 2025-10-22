const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin SDK
let initialized = false

const initializeFirebase = () => {
  if (initialized) {
    return admin
  }

  try {
    // For local development: use serviceAccountKey.json
    // For production: use environment variables or default credentials
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Use environment variable with service account JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
      } else {
        // Use Google Cloud default credentials (if deployed on GCP)
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        })
      }
    } else {
      // Development: Use serviceAccountKey.json file
      const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json')
      const serviceAccount = require(serviceAccountPath)
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    }

    initialized = true
    console.log('✅ Firebase Admin initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message)
    console.error('📝 Make sure serviceAccountKey.json exists in the backend/ directory')
    process.exit(1)
  }

  return admin
}

// Initialize on import
initializeFirebase()

// Export Firebase Admin instance and Firestore
module.exports = {
  admin,
  db: admin.firestore(),
}

