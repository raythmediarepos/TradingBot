const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const { hashPassword, comparePassword, validatePassword } = require('../utils/password')
const { generateToken, authenticate } = require('../middleware/auth')
const { serializeUser } = require('../utils/firestore')
const { signupLimiter, loginLimiter, adminLimiter } = require('../middleware/rateLimiter')

/**
 * POST /api/auth/signup
 * Create new user account (used during beta signup)
 */
router.post('/signup', signupLimiter, async (req, res) => {
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
 * Enhanced with better error messages and login attempt tracking
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: 'Email and password are required',
      })
    }

    const db = admin.firestore()

    // Find user by email
    const userSnapshot = await db.collection('betaUsers')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    // User not found
    if (userSnapshot.empty) {
      // Track failed login attempt
      await trackLoginAttempt(email, false, 'user_not_found')
      
      return res.status(401).json({
        success: false,
        error: 'user_not_found',
        message: 'No account found with this email address',
        action: {
          type: 'signup',
          text: 'Create an account',
          link: '/beta/signup',
        },
      })
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id

    // Check if account is locked due to too many failed attempts
    if (userData.accountLocked && userData.lockedUntil) {
      const lockedUntil = userData.lockedUntil.toDate ? userData.lockedUntil.toDate() : new Date(userData.lockedUntil)
      const now = new Date()
      
      if (now < lockedUntil) {
        const minutesLeft = Math.ceil((lockedUntil - now) / 60000)
        return res.status(423).json({
          success: false,
          error: 'account_locked',
          message: `Account temporarily locked due to multiple failed login attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
          lockedUntil: lockedUntil.toISOString(),
        })
      } else {
        // Lock expired, unlock account
        await db.collection('betaUsers').doc(userId).update({
          accountLocked: false,
          lockedUntil: null,
          failedLoginAttempts: 0,
        })
      }
    }

    // Check if password exists
    if (!userData.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'no_password',
        message: 'Please complete your signup first or reset your password',
        action: {
          type: 'reset_password',
          text: 'Reset Password',
          link: '/auth/forgot-password',
        },
      })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, userData.passwordHash)
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (userData.failedLoginAttempts || 0) + 1
      const updates = {
        failedLoginAttempts: failedAttempts,
        lastFailedLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockDuration = 15 * 60 * 1000 // 15 minutes
        updates.accountLocked = true
        updates.lockedUntil = new Date(Date.now() + lockDuration)
        
        console.log(`🔒 [AUTH] Account locked: ${email}`)
        console.log(`   → Failed attempts: ${failedAttempts}`)
        console.log(`   → Locked until: ${updates.lockedUntil.toISOString()}`)
      }

      await db.collection('betaUsers').doc(userId).update(updates)
      
      // Track failed login attempt
      await trackLoginAttempt(email, false, 'invalid_password')

      const attemptsLeft = Math.max(0, 5 - failedAttempts)
      
      return res.status(401).json({
        success: false,
        error: 'invalid_password',
        message: failedAttempts >= 5 
          ? 'Account locked due to too many failed login attempts. Try again in 15 minutes.'
          : `Incorrect password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before account lock.`,
        attemptsLeft: attemptsLeft,
        action: {
          type: 'forgot_password',
          text: 'Forgot Password?',
          link: '/auth/forgot-password',
        },
      })
    }

    // Check if email is verified
    if (!userData.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'email_not_verified',
        message: 'Please verify your email address before logging in',
        email: userData.email,
        action: {
          type: 'resend_verification',
          text: 'Resend Verification Email',
          endpoint: '/api/beta/resend-verification',
        },
      })
    }

    // Successful login - reset failed attempts
    await db.collection('betaUsers').doc(userId).update({
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Track successful login
    await trackLoginAttempt(email, true, null)

    // Generate JWT token
    const token = generateToken(userId, userData.email, userData.role || 'user')

    // Return token and user data (excluding password)
    const { passwordHash, ...userDataWithoutPassword } = userData
    const serializedUser = serializeUser(userId, userDataWithoutPassword)

    console.log(`✅ [AUTH] Login successful: ${email}`)

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
      error: 'server_error',
      message: 'Failed to login. Please try again.',
    })
  }
})

/**
 * Track login attempts for analytics and security
 */
async function trackLoginAttempt(email, success, failureReason) {
  try {
    const db = admin.firestore()
    await db.collection('loginAttempts').add({
      email: email.toLowerCase(),
      success,
      failureReason: failureReason || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: null, // Can be added from req.ip if needed
    })
  } catch (error) {
    console.error('Failed to track login attempt:', error)
    // Don't throw - logging shouldn't block login
  }
}

/**
 * POST /api/auth/admin-login
 * Login for admin users
 */
router.post('/admin-login', loginLimiter, async (req, res) => {
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
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', loginLimiter, async (req, res) => {
  try {
    const { email } = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      })
    }

    const db = admin.firestore()

    // Find user by email
    const userSnapshot = await db.collection('betaUsers')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (userSnapshot.empty) {
      console.log(`⚠️  [AUTH] Password reset requested for non-existent email: ${email}`)
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      })
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id

    // Generate password reset token (valid for 1 hour)
    const crypto = require('crypto')
    const resetToken = `reset_${crypto.randomBytes(32).toString('hex')}`
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await db.collection('betaUsers').doc(userId).update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires,
      passwordResetRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Send password reset email
    const { sendPasswordResetEmail } = require('../services/emailService')
    const emailSent = await sendPasswordResetEmail(userData.email, userData.firstName, resetToken)

    if (!emailSent) {
      console.error(`❌ [AUTH] Failed to send password reset email to: ${email}`)
      // Still return success to user (don't reveal if email failed)
    }

    console.log(`✅ [AUTH] Password reset email sent to: ${email}`)

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    })
  }
})

/**
 * POST /api/auth/reset-password
 * Verify reset token and update password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: 'Reset token and new password are required',
      })
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'weak_password',
        message: passwordValidation.message,
      })
    }

    const db = admin.firestore()

    // Find user with this reset token
    const userSnapshot = await db.collection('betaUsers')
      .where('passwordResetToken', '==', token)
      .limit(1)
      .get()

    if (userSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'invalid_token',
        message: 'Invalid or expired password reset link',
        action: {
          type: 'request_new',
          text: 'Request New Reset Link',
          link: '/auth/forgot-password',
        },
      })
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id

    // Check if token has expired
    const tokenExpires = userData.passwordResetExpires.toDate ? 
      userData.passwordResetExpires.toDate() : 
      new Date(userData.passwordResetExpires)
    const now = new Date()

    if (now > tokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'token_expired',
        message: 'Password reset link has expired. Reset links are valid for 1 hour.',
        action: {
          type: 'request_new',
          text: 'Request New Reset Link',
          link: '/auth/forgot-password',
        },
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password and clear reset token
    await db.collection('betaUsers').doc(userId).update({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordResetRequestedAt: null,
      passwordChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Reset failed login attempts
      failedLoginAttempts: 0,
      accountLocked: false,
      lockedUntil: null,
      lastFailedLoginAt: null,
    })

    console.log(`✅ [AUTH] Password reset successful for: ${userData.email}`)

    // Send confirmation email
    const { sendPasswordChangedEmail } = require('../services/emailService')
    await sendPasswordChangedEmail(userData.email, userData.firstName)

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      action: {
        type: 'login',
        text: 'Go to Login',
        link: '/login',
      },
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to reset password. Please try again.',
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

