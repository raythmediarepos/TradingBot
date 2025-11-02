/**
 * Utility functions for Firestore data handling
 */

/**
 * Convert Firestore Timestamp to ISO string
 * @param {FirebaseFirestore.Timestamp} timestamp - Firestore timestamp
 * @returns {string|null} ISO string or null
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null
  
  // Check if it's a Firestore Timestamp
  if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString()
  }
  
  // Check if it already has seconds (Firestore Timestamp structure)
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString()
  }
  
  return null
}

/**
 * Serialize Firestore document data to JSON-safe format
 * Converts all Timestamp fields to ISO strings
 * @param {Object} data - Firestore document data
 * @returns {Object} Serialized data
 */
const serializeFirestoreData = (data) => {
  if (!data || typeof data !== 'object') return data
  
  const serialized = {}
  
  for (const [key, value] of Object.entries(data)) {
    // Check if value is a Firestore Timestamp
    if (value && (value.toDate || value.seconds)) {
      serialized[key] = convertTimestamp(value)
    }
    // Recursively handle nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeFirestoreData(value)
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      serialized[key] = value.map(item => 
        (item && typeof item === 'object') ? serializeFirestoreData(item) : item
      )
    }
    // Keep primitive values as-is
    else {
      serialized[key] = value
    }
  }
  
  return serialized
}

/**
 * Serialize a Firestore user document for API response
 * @param {string} userId - User document ID
 * @param {Object} userData - User document data
 * @returns {Object} Serialized user object
 */
const serializeUser = (userId, userData) => {
  const serializedData = serializeFirestoreData(userData)
  
  return {
    id: userId,
    ...serializedData,
  }
}

module.exports = {
  convertTimestamp,
  serializeFirestoreData,
  serializeUser,
}

