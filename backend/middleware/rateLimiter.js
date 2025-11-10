const rateLimit = require('express-rate-limit')

// ============================================
// RATE LIMITING CONFIGURATIONS
// ============================================

/**
 * General API rate limiter
 * Applies to all API routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

/**
 * Signup rate limiter
 * Stricter limits for signup to prevent abuse
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 signup attempts per hour
  message: {
    error: 'Too many signup attempts',
    message: 'Too many signup attempts from this IP. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
})

/**
 * Email verification rate limiter
 * Moderate limits for email verification
 */
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification attempts per 15 minutes
  message: {
    error: 'Too many verification attempts',
    message: 'Too many verification attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Payment rate limiter
 * Moderate limits for payment endpoints
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment attempts per 15 minutes
  message: {
    error: 'Too many payment attempts',
    message: 'Too many payment attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Login rate limiter
 * Prevent brute force attacks
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
})

/**
 * Admin route rate limiter
 * More lenient for admin operations
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  message: {
    error: 'Too many admin requests',
    message: 'Too many admin requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Webhook rate limiter
 * Very lenient for webhooks (they come from trusted sources)
 */
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 webhook calls per minute
  message: {
    error: 'Too many webhook requests',
    message: 'Webhook rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Create custom rate limiter with specific options
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limiter middleware
 */
const createCustomLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: {
      error: options.errorTitle || 'Too many requests',
      message: options.message || 'Rate limit exceeded. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  })
}

module.exports = {
  generalLimiter,
  signupLimiter,
  loginLimiter,
  verificationLimiter,
  paymentLimiter,
  adminLimiter,
  webhookLimiter,
  createCustomLimiter,
}

