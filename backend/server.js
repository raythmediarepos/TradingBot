const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const apiRoutes = require('./api/routes')
const webhookRoutes = require('./routes/webhooks')
const { startBot, stopBot } = require('./services/discordBotService')
const { initializeCleanupJobs } = require('./jobs/cleanupJobs')
const { initializeReminderJobs } = require('./jobs/reminderJobs')
const { initializeMonitoringJobs } = require('./jobs/monitoringJobs')
const { initializeMaintenanceJobs } = require('./jobs/maintenanceJobs')

const app = express()
const PORT = process.env.PORT || 5000

// ============================================
// MIDDLEWARE
// ============================================

// Trust proxy - Required for rate limiting and accurate IP detection when behind Render proxy
// Use specific trust proxy value for Render (1 hop) to avoid permissive trust
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://trading-bot-dusky-two.vercel.app',
  'https://trading-bot-7fi8.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    }
    // Allow all Vercel preview deployments
    else if (origin && origin.match(/https:\/\/.*\.vercel\.app$/)) {
      callback(null, true)
    }
    // Allow helwa.ai custom domain
    else if (origin && origin.match(/https:\/\/(www\.)?helwa\.ai$/)) {
      callback(null, true)
    }
    else {
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

// Cookie parsing
app.use(cookieParser())

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

// Mount webhook routes (with raw body for signature verification)
app.use('/api/webhooks', webhookRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Helwa AI Backend API',
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

app.listen(PORT, async () => {
  console.log(`🚀 Helwa AI Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  
  // Start Discord bot
  try {
    await startBot()
  } catch (error) {
    console.error('⚠️  Failed to start Discord bot (continuing without bot):', error.message)
  }
  
  // Initialize cleanup jobs
  try {
    initializeCleanupJobs()
  } catch (error) {
    console.error('⚠️  Failed to initialize cleanup jobs:', error.message)
  }
  
  // Initialize reminder jobs (with immediate startup check)
  try {
    await initializeReminderJobs()
  } catch (error) {
    console.error('⚠️  Failed to initialize reminder jobs:', error.message)
  }
  
  // Initialize monitoring jobs
  try {
    initializeMonitoringJobs()
  } catch (error) {
    console.error('⚠️  Failed to initialize monitoring jobs:', error.message)
  }
  
  // Initialize maintenance jobs (with immediate startup renumbering)
  try {
    await initializeMaintenanceJobs()
  } catch (error) {
    console.error('⚠️  Failed to initialize maintenance jobs:', error.message)
  }
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await stopBot()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await stopBot()
  process.exit(0)
})

module.exports = app

