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

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

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

