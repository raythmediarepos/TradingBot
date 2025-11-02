const bcrypt = require('bcryptjs')

/**
 * Hash a password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  const isValid = minLength && hasUpperCase && hasLowerCase && hasNumber

  if (!isValid) {
    const errors = []
    if (!minLength) errors.push('at least 8 characters')
    if (!hasUpperCase) errors.push('one uppercase letter')
    if (!hasLowerCase) errors.push('one lowercase letter')
    if (!hasNumber) errors.push('one number')

    return {
      valid: false,
      message: `Password must contain ${errors.join(', ')}`,
    }
  }

  return { valid: true }
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
}

