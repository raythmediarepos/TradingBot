#!/usr/bin/env node

/**
 * Admin Script: Approve Affiliate Application
 * 
 * Usage:
 *   node scripts/approveAffiliate.js <affiliateId>
 *   node scripts/approveAffiliate.js --email <email>
 * 
 * Examples:
 *   node scripts/approveAffiliate.js abc123xyz
 *   node scripts/approveAffiliate.js --email john@example.com
 */

require('dotenv').config()
const admin = require('../config/firebase-admin')
const affiliateService = require('../services/affiliateService')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('❌ Missing arguments!')
  console.log('')
  console.log('Usage:')
  console.log('  node scripts/approveAffiliate.js <affiliateId>')
  console.log('  node scripts/approveAffiliate.js --email <email>')
  console.log('')
  console.log('Examples:')
  console.log('  node scripts/approveAffiliate.js abc123xyz')
  console.log('  node scripts/approveAffiliate.js --email john@example.com')
  process.exit(1)
}

async function approveByEmail(email) {
  console.log(`🔍 Looking up affiliate by email: ${email}`)
  
  try {
    const affiliate = await affiliateService.getAffiliateByEmail(email)
    
    if (!affiliate) {
      console.log('❌ No affiliate found with that email')
      process.exit(1)
    }

    console.log(`✅ Found affiliate:`)
    console.log(`   → Name: ${affiliate.name}`)
    console.log(`   → Status: ${affiliate.status}`)
    console.log(`   → Code: ${affiliate.affiliateCode}`)
    console.log('')
    
    if (affiliate.status === 'approved') {
      console.log('⚠️ This affiliate is already approved!')
      process.exit(0)
    }

    await affiliateService.approveAffiliate(affiliate.id)
    console.log('✅ Affiliate approved successfully!')
    console.log('📧 Approval email sent with login credentials')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

async function approveById(affiliateId) {
  console.log(`🔍 Looking up affiliate by ID: ${affiliateId}`)
  
  try {
    const db = admin.firestore()
    const doc = await db.collection('affiliates').doc(affiliateId).get()
    
    if (!doc.exists) {
      console.log('❌ No affiliate found with that ID')
      process.exit(1)
    }

    const affiliate = doc.data()
    console.log(`✅ Found affiliate:`)
    console.log(`   → Name: ${affiliate.name}`)
    console.log(`   → Email: ${affiliate.email}`)
    console.log(`   → Status: ${affiliate.status}`)
    console.log(`   → Code: ${affiliate.affiliateCode}`)
    console.log('')
    
    if (affiliate.status === 'approved') {
      console.log('⚠️ This affiliate is already approved!')
      process.exit(0)
    }

    await affiliateService.approveAffiliate(affiliateId)
    console.log('✅ Affiliate approved successfully!')
    console.log('📧 Approval email sent with login credentials')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

async function main() {
  if (args[0] === '--email' || args[0] === '-e') {
    if (!args[1]) {
      console.log('❌ Missing email address!')
      process.exit(1)
    }
    await approveByEmail(args[1])
  } else {
    await approveById(args[0])
  }
  
  process.exit(0)
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})

