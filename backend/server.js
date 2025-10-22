const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const apiRoutes = require('./api/routes')

const app = express()
const PORT = process.env.PORT || 5000

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet())

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://trading-bot-dusky-two.vercel.app',
  'https://trading-bot-7fi8.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Enhanced request logging (all environments)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log('')
  console.log('📥 [REQUEST] Incoming request')
  console.log(`   → Time: ${timestamp}`)
  console.log(`   → Method: ${req.method}`)
  console.log(`   → Path: ${req.path}`)
  console.log(`   → Origin: ${req.get('origin') || 'No origin header'}`)
  console.log(`   → IP: ${req.ip}`)
  
  if (req.body && Object.keys(req.body).length > 0) {
    // Log body but hide sensitive data
    const sanitizedBody = { ...req.body }
    if (sanitizedBody.email) {
      sanitizedBody.email = sanitizedBody.email.substring(0, 3) + '***'
    }
    console.log(`   → Body:`, sanitizedBody)
  }
  
  // Log response
  const originalSend = res.send
  res.send = function(data) {
    console.log(`📤 [RESPONSE] Sending response`)
    console.log(`   → Status: ${res.statusCode}`)
    console.log(`   → Path: ${req.path}`)
    return originalSend.call(this, data)
  }
  
  next()
})

// ============================================
// ROUTES
// ============================================

// Mount API routes
app.use('/api', apiRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Honeypot AI Backend API',
    version: '1.0.0',
    endpoints: {
      waitlist: {
        remaining: 'GET /api/waitlist/remaining',
        join: 'POST /api/waitlist/join',
        all: 'GET /api/waitlist/all (admin)',
      },
      contact: {
        submit: 'POST /api/contact',
        messages: 'GET /api/contact/messages (admin)',
        updateStatus: 'PATCH /api/contact/messages/:id/status (admin)',
      },
      affiliates: {
        apply: 'POST /api/affiliates/apply',
        login: 'POST /api/affiliates/login',
        stats: 'GET /api/affiliates/stats/:affiliateId',
        trackClick: 'POST /api/affiliates/track-click',
        all: 'GET /api/affiliates/all (admin)',
        approve: 'POST /api/affiliates/approve/:affiliateId (admin)',
      },
      health: 'GET /api/health',
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
})

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Honeypot AI Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

module.exports = app

