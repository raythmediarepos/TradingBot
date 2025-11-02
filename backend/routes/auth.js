const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const { hashPassword, comparePassword, validatePassword } = require('../utils/password')
const { generateToken, authenticate } = require('../middleware/auth')
const { serializeUser } = require('../utils/firestore')

/**
 * POST /api/auth/signup
 * Create new user account (used during beta signup)
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
    }

    const db = admin.firestore()

    // Check if user already exists
    const existingUser = await db.collection('betaUsers')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // This endpoint is typically called from beta signup
    // So we return the hashed password to be stored by the beta signup process
    res.json({
      success: true,
      data: {
        passwordHash,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
    })
  }
})

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const db = admin.firestore()

    // Find user by email
    const userSnapshot = await db.collection('betaUsers')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()

    // Check if password exists
    if (!userData.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Please complete your signup first or reset your password',
      })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, userData.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const token = generateToken(userDoc.id, userData.email, userData.role || 'user')

    // Update last login time
    await db.collection('betaUsers').doc(userDoc.id).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Return token and user data (excluding password)
    const { passwordHash, ...userDataWithoutPassword } = userData
    const serializedUser = serializeUser(userDoc.id, userDataWithoutPassword)

    res.json({
      success: true,
      data: {
        token,
        user: serializedUser,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login',
    })
  }
})

/**
 * POST /api/auth/admin-login
 * Login for admin users
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const db = admin.firestore()

    // Find user by email
    const userSnapshot = await db.collection('betaUsers')
      .where('email', '==', email.toLowerCase())
      .where('role', '==', 'admin')
      .limit(1)
      .get()

    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      })
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()

    // Verify password
    const isValidPassword = await comparePassword(password, userData.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      })
    }

    // Generate JWT token
    const token = generateToken(userDoc.id, userData.email, 'admin')

    // Update last login time
    await db.collection('betaUsers').doc(userDoc.id).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Return token and user data (excluding password)
    const { passwordHash, ...userDataWithoutPassword } = userData
    const serializedUser = serializeUser(userDoc.id, userDataWithoutPassword)

    res.json({
      success: true,
      data: {
        token,
        user: serializedUser,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login',
    })
  }
})

/**
 * POST /api/auth/logout
 * Logout user (client should delete token)
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a JWT system, logout is mainly handled client-side
    // But we can track logout time if needed
    const db = admin.firestore()
    await db.collection('betaUsers').doc(req.user.id).update({
      lastLogoutAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    })
  }
})

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { passwordHash, id, ...userDataWithoutPassword } = req.user
    const serializedUser = serializeUser(id, userDataWithoutPassword)

    res.json({
      success: true,
      data: serializedUser,
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
    })
  }
})

module.exports = router

