require('dotenv').config()
const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const serviceAccount = require('../config/serviceAccountKey.json')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    console.log('✅ Firebase Admin initialized')
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error)
    process.exit(1)
  }
}

const db = admin.firestore()

// Generate today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Dummy stock anomalies data
const dummyAnomalies = [
  {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    percentChange: 8.5,
    cumulativeDollarVolume: 245000000,
    date: getTodayDate(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    aiSummary: 'Strong momentum breakout above resistance with increased volume. RSI shows bullish divergence indicating continued upward pressure.',
    signal: 'BUY',
    confidence: 85,
    logoUrl: 'https://logo.clearbit.com/apple.com',
    rank: 1,
    isActive: true,
    anomalyScore: 9.2,
    priceAtCapture: 182.50,
    volumeChange: 245.3,
    sector: 'Technology',
  },
  {
    ticker: 'TSLA',
    companyName: 'Tesla Inc.',
    percentChange: 12.3,
    cumulativeDollarVolume: 389000000,
    date: getTodayDate(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    aiSummary: 'Massive volume spike detected with price breaking through key resistance. Institutional buying pressure evident from order flow analysis.',
    signal: 'BUY',
    confidence: 92,
    logoUrl: 'https://logo.clearbit.com/tesla.com',
    rank: 2,
    isActive: true,
    anomalyScore: 9.8,
    priceAtCapture: 245.80,
    volumeChange: 312.5,
    sector: 'Automotive',
  },
  {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    percentChange: 6.7,
    cumulativeDollarVolume: 198000000,
    date: getTodayDate(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    aiSummary: 'Bullish flag pattern forming with consolidation near all-time highs. Volume accumulation detected during consolidation phase.',
    signal: 'BUY',
    confidence: 78,
    logoUrl: 'https://logo.clearbit.com/nvidia.com',
    rank: 3,
    isActive: true,
    anomalyScore: 8.5,
    priceAtCapture: 498.20,
    volumeChange: 187.4,
    sector: 'Technology',
  },
]

const populateStockAnomalies = async () => {
  try {
    console.log('📊 [STOCKS] Starting stock anomalies population...')
    console.log(`📅 [STOCKS] Date: ${getTodayDate()}`)
    
    const collectionRef = db.collection('stockAnomalies')
    
    // Check if there are already anomalies for today
    const todayQuery = await collectionRef
      .where('date', '==', getTodayDate())
      .where('isActive', '==', true)
      .get()
    
    if (!todayQuery.empty) {
      console.log(`⚠️  [STOCKS] Found ${todayQuery.size} existing anomalies for today`)
      console.log('💡 [STOCKS] Delete them first or they will be duplicated')
      
      // Show existing anomalies
      todayQuery.forEach(doc => {
        const data = doc.data()
        console.log(`   → ${data.rank}. ${data.ticker} (${data.percentChange}%)`)
      })
      
      console.log('')
      console.log('🔄 [STOCKS] Replacing existing anomalies with dummy data...')
      
      // Delete existing documents
      const batch = db.batch()
      todayQuery.forEach(doc => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log('✅ [STOCKS] Deleted existing anomalies')
    }
    
    // Add dummy anomalies
    console.log('')
    console.log('📝 [STOCKS] Adding dummy anomalies...')
    
    for (const anomaly of dummyAnomalies) {
      const docId = `${anomaly.ticker}_${anomaly.date}_rank${anomaly.rank}`
      await collectionRef.doc(docId).set(anomaly)
      
      console.log(`✅ [STOCKS] Added: ${anomaly.rank}. ${anomaly.ticker} - ${anomaly.companyName}`)
      console.log(`   → Change: ${anomaly.percentChange > 0 ? '+' : ''}${anomaly.percentChange}%`)
      console.log(`   → Volume: $${(anomaly.cumulativeDollarVolume / 1000000).toFixed(1)}M`)
      console.log(`   → Signal: ${anomaly.signal} (${anomaly.confidence}% confidence)`)
      console.log(`   → Score: ${anomaly.anomalyScore}`)
      console.log('')
    }
    
    console.log('🎉 [STOCKS] Successfully populated stockAnomalies collection!')
    console.log(`📊 [STOCKS] Total anomalies added: ${dummyAnomalies.length}`)
    console.log('')
    console.log('📝 [STOCKS] Collection structure:')
    console.log('   stockAnomalies/')
    console.log(`   ├── ${dummyAnomalies[0].ticker}_${getTodayDate()}_rank1`)
    console.log(`   ├── ${dummyAnomalies[1].ticker}_${getTodayDate()}_rank2`)
    console.log(`   └── ${dummyAnomalies[2].ticker}_${getTodayDate()}_rank3`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ [STOCKS] Error populating stock anomalies:', error)
    process.exit(1)
  }
}

// Run the script
populateStockAnomalies()

