const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

/**
 * Generate JWT token for user
 */
const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    { 
      userId, 
      email,
      role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Middleware to authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Get user from database
    const db = admin.firestore()
    const userDoc = await db.collection('betaUsers').doc(decoded.userId).get()

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Attach user to request
    req.user = {
      id: userDoc.id,
      ...userDoc.data(),
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

/**
 * Middleware to check if user is admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      })
    }

    next()
  } catch (error) {
    console.error('Admin check error:', error)
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    })
  }
}

/**
 * Optional authentication - attaches user if token exists but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const db = admin.firestore()
        const userDoc = await db.collection('betaUsers').doc(decoded.userId).get()
        if (userDoc.exists) {
          req.user = {
            id: userDoc.id,
            ...userDoc.data(),
          }
        }
      }
    }

    next()
  } catch (error) {
    // Don't fail, just continue without user
    next()
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN,
}

