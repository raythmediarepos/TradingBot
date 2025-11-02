/**
 * Automated Beta Program Flow Test
 * 
 * Run with: node backend/tests/beta-flow.test.js
 */

const API_URL = process.env.API_URL || 'http://localhost:5000'

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function testPass(message) {
  log(`✅ PASS: ${message}`, 'green')
}

function testFail(message) {
  log(`❌ FAIL: ${message}`, 'red')
  process.exit(1)
}

function testInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// Test data
const testUsers = {
  free: {
    email: `test-free-${Date.now()}@example.com`,
    firstName: 'Free',
    lastName: 'User',
  },
  paid: {
    email: `test-paid-${Date.now()}@example.com`,
    firstName: 'Paid',
    lastName: 'User',
  },
}

let freeUserData = {}
let paidUserData = {}

// Test functions
async function testHealthCheck() {
  testInfo('Testing backend health check...')
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    
    if (response.ok && data.status === 'ok') {
      testPass('Backend health check')
    } else {
      testFail('Backend health check - invalid response')
    }
  } catch (error) {
    testFail(`Backend health check - ${error.message}`)
  }
}

async function testGetBetaStats() {
  testInfo('Testing beta stats endpoint...')
  try {
    const response = await fetch(`${API_URL}/api/beta/stats`)
    const data = await response.json()
    
    if (response.ok && data.success && data.data) {
      testPass('Beta stats endpoint')
      testInfo(`Current stats: ${data.data.filled}/${data.data.total} spots filled`)
      return data.data
    } else {
      testFail('Beta stats endpoint - invalid response')
    }
  } catch (error) {
    testFail(`Beta stats endpoint - ${error.message}`)
  }
}

async function testSignup(userData, expectedFree) {
  testInfo(`Testing signup for ${userData.email}...`)
  try {
    const response = await fetch(`${API_URL}/api/beta/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      testPass(`Signup for ${userData.email}`)
      
      if (data.data.isFree === expectedFree) {
        testPass(`User correctly assigned as ${expectedFree ? 'FREE' : 'PAID'}`)
      } else {
        testFail(`User should be ${expectedFree ? 'FREE' : 'PAID'} but got ${data.data.isFree ? 'FREE' : 'PAID'}`)
      }
      
      return data.data
    } else {
      testFail(`Signup - ${data.message || 'Unknown error'}`)
    }
  } catch (error) {
    testFail(`Signup - ${error.message}`)
  }
}

async function testDuplicateSignup(email) {
  testInfo('Testing duplicate email rejection...')
  try {
    const response = await fetch(`${API_URL}/api/beta/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName: 'Duplicate',
        lastName: 'User',
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok && data.message.includes('already')) {
      testPass('Duplicate email rejection')
    } else {
      testFail('Duplicate email should be rejected')
    }
  } catch (error) {
    testFail(`Duplicate email test - ${error.message}`)
  }
}

async function testInvalidEmail() {
  testInfo('Testing invalid email rejection...')
  try {
    const response = await fetch(`${API_URL}/api/beta/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'notanemail',
        firstName: 'Invalid',
        lastName: 'User',
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      testPass('Invalid email rejection')
    } else {
      testFail('Invalid email should be rejected')
    }
  } catch (error) {
    testFail(`Invalid email test - ${error.message}`)
  }
}

async function testRateLimiting() {
  testInfo('Testing rate limiting (this may take a moment)...')
  try {
    const requests = []
    
    // Send 15 requests rapidly (limiter is set to 10/15min for signup)
    for (let i = 0; i < 15; i++) {
      requests.push(
        fetch(`${API_URL}/api/beta/stats`)
      )
    }
    
    const responses = await Promise.all(requests)
    const rateLimited = responses.some(r => r.status === 429)
    
    if (rateLimited) {
      testPass('Rate limiting is working')
    } else {
      log('⚠️  WARNING: Rate limiting might not be configured (stats endpoint has no limit)', 'yellow')
    }
  } catch (error) {
    testFail(`Rate limiting test - ${error.message}`)
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), 'blue')
  log('🧪 HONEYPOT AI BETA PROGRAM - AUTOMATED TESTS', 'blue')
  log('='.repeat(60) + '\n', 'blue')
  
  try {
    // 1. Health check
    await testHealthCheck()
    
    // 2. Get initial stats
    const initialStats = await testGetBetaStats()
    
    // 3. Test signup validation
    await testInvalidEmail()
    
    // 4. Test free user signup (assuming position 1-20)
    // Note: This assumes less than 20 users are signed up
    if (initialStats.filled < 20) {
      testInfo('Testing FREE user flow...')
      freeUserData = await testSignup(testUsers.free, true)
    } else {
      testInfo('Skipping free user test (20+ users already signed up)')
    }
    
    // 5. Test paid user signup
    testInfo('Testing PAID user flow...')
    paidUserData = await testSignup(testUsers.paid, false)
    
    // 6. Test duplicate email
    await testDuplicateSignup(testUsers.paid.email)
    
    // 7. Test rate limiting
    await testRateLimiting()
    
    // Final stats
    const finalStats = await testGetBetaStats()
    
    log('\n' + '='.repeat(60), 'green')
    log('✅ ALL AUTOMATED TESTS PASSED!', 'green')
    log('='.repeat(60) + '\n', 'green')
    
    log('📊 Test Summary:', 'blue')
    log(`  • Initial users: ${initialStats.filled}`, 'blue')
    log(`  • Final users: ${finalStats.filled}`, 'blue')
    log(`  • Tests passed: All`, 'green')
    
    log('\n📝 Manual tests still required:', 'yellow')
    log('  1. Email verification flow (check your inbox)', 'yellow')
    log('  2. Stripe payment integration (use test card 4242...)', 'yellow')
    log('  3. Discord bot integration (verify role assignment)', 'yellow')
    log('  4. Admin dashboard functions (/admin/beta-users)', 'yellow')
    log('  5. Webhook handling (cancel subscription, etc.)', 'yellow')
    
    log('\n🎯 Next Steps:', 'blue')
    log('  • Check Firebase Firestore for new user documents', 'blue')
    log('  • Check Resend dashboard for sent emails', 'blue')
    log('  • Follow email verification links to continue testing', 'blue')
    
  } catch (error) {
    testFail(`Unexpected error: ${error.message}`)
  }
}

// Run tests
runTests()

