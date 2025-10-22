#!/usr/bin/env node

/**
 * Admin Script: List Affiliate Applications
 * 
 * Usage:
 *   node scripts/listAffiliates.js [status]
 * 
 * Examples:
 *   node scripts/listAffiliates.js           # List all affiliates
 *   node scripts/listAffiliates.js pending  # List only pending
 *   node scripts/listAffiliates.js approved # List only approved
 */

require('dotenv').config()
const { admin, db } = require('../config/firebase-admin')

const args = process.argv.slice(2)
const filterStatus = args[0] || null

async function listAffiliates() {
  console.log('📋 Fetching affiliate applications...')
  console.log('')

  try {
    let query = db.collection('affiliates').orderBy('createdAt', 'desc')

    if (filterStatus) {
      query = query.where('status', '==', filterStatus)
      console.log(`Filtering by status: ${filterStatus}`)
      console.log('')
    }

    const snapshot = await query.get()

    if (snapshot.empty) {
      console.log('No affiliates found.')
      return
    }

    console.log(`Found ${snapshot.size} affiliate(s):\n`)
    console.log('─'.repeat(100))

    snapshot.forEach((doc, index) => {
      const affiliate = doc.data()
      const createdAt = affiliate.createdAt?.toDate?.() || new Date()
      const statusEmoji = {
        pending: '⏳',
        approved: '✅',
        rejected: '❌',
        suspended: '⛔'
      }[affiliate.status] || '❓'

      console.log(`${index + 1}. ${statusEmoji} ${affiliate.name}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Email: ${affiliate.email}`)
      console.log(`   Platform: ${affiliate.platform}`)
      console.log(`   Code: ${affiliate.affiliateCode}`)
      console.log(`   Status: ${affiliate.status}`)
      console.log(`   Applied: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`)
      
      if (affiliate.audienceSize) {
        console.log(`   Audience: ${affiliate.audienceSize}`)
      }
      
      if (affiliate.websiteUrl) {
        console.log(`   Website: ${affiliate.websiteUrl}`)
      }

      if (affiliate.status === 'approved') {
        console.log(`   Stats: ${affiliate.clicks || 0} clicks, ${affiliate.conversions || 0} conversions, $${(affiliate.totalEarnings || 0).toFixed(2)} earned`)
      }
      
      console.log('─'.repeat(100))
    })

    // Show summary
    console.log('')
    console.log('Summary:')
    const statusCounts = {}
    snapshot.forEach(doc => {
      const status = doc.data().status
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    Object.keys(statusCounts).forEach(status => {
      const emoji = {
        pending: '⏳',
        approved: '✅',
        rejected: '❌',
        suspended: '⛔'
      }[status] || '❓'
      console.log(`  ${emoji} ${status}: ${statusCounts[status]}`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
listAffiliates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })

