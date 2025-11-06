const { google } = require('googleapis')
const admin = require('firebase-admin')

// Google Sheets Configuration
const SPREADSHEET_ID = '11spN8DjWXF3tPCTLGmSrOcR2PkwRKNDPa2OpKEzApVQ'

/**
 * Initialize Google Sheets API with service account credentials
 */
const getSheetsClient = () => {
  try {
    // Use the same Firebase service account for Google Sheets API
    let credentials
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: Use base64 encoded credentials from env
      credentials = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('ascii')
      )
      console.log('🔐 [SHEETS] Using credentials from environment variable')
    } else {
      // Development: Use local service account file
      credentials = require('../config/serviceAccountKey.json')
      console.log('🔐 [SHEETS] Using credentials from serviceAccountKey.json')
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    return google.sheets({ version: 'v4', auth })
  } catch (error) {
    console.error('❌ [SHEETS] Error initializing Google Sheets client:', error)
    console.error('💡 [SHEETS] Make sure backend/config/serviceAccountKey.json exists')
    throw error
  }
}

/**
 * Get all sheet names (tabs) from the spreadsheet
 */
const getAllSheetNames = async () => {
  try {
    const sheets = getSheetsClient()
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetNames = response.data.sheets.map(sheet => sheet.properties.title)
    console.log(`📋 [SHEETS] Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`)
    
    return sheetNames
  } catch (error) {
    console.error('❌ [SHEETS] Error getting sheet names:', error)
    throw error
  }
}

/**
 * Parse cost value (handles $, commas, etc.)
 */
const parseCost = (value) => {
  if (!value) return 0
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Parse date value
 */
const parseDate = (value) => {
  if (!value) return null
  try {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  } catch (e) {
    return null
  }
}

/**
 * Fetch data from a single sheet (month tab)
 */
const getSheetData = async (sheetName) => {
  try {
    const sheets = getSheetsClient()
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:Z`,
    })

    const rows = response.data.values

    if (!rows || rows.length < 2) {
      return { sheetName, expenses: [], monthTotal: 0 }
    }

    // First row is headers
    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Find column indices
    const costIdx = headers.findIndex(h => h && h.toLowerCase().includes('cost'))
    const dateIdx = headers.findIndex(h => h && h.toLowerCase().includes('date'))
    const locationIdx = headers.findIndex(h => h && h.toLowerCase().includes('location'))
    const reasonIdx = headers.findIndex(h => h && h.toLowerCase().includes('reason'))
    const whoPaidIdx = headers.findIndex(h => h && h.toLowerCase().includes('who') && h.toLowerCase().includes('pay'))
    const refundedIdx = headers.findIndex(h => h && h.toLowerCase().includes('refund'))
    const paymentFormIdx = headers.findIndex(h => h && h.toLowerCase().includes('payment') && h.toLowerCase().includes('form'))

    const expenses = []
    let monthTotal = 0

    for (const row of dataRows) {
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue

      // Check if this is the "Month's Total" row
      if (row[0] && String(row[0]).toLowerCase().includes('month') && String(row[0]).toLowerCase().includes('total')) {
        // Extract total from this row or the next column
        const totalValue = row[1] || row[0]
        monthTotal = parseCost(totalValue)
        break // Stop processing after finding the total row
      }

      const cost = costIdx >= 0 ? parseCost(row[costIdx]) : 0
      
      // Skip if no cost
      if (cost === 0) continue

      const expense = {
        cost,
        date: dateIdx >= 0 ? row[dateIdx] : null,
        location: locationIdx >= 0 ? row[locationIdx] : null,
        reason: reasonIdx >= 0 ? row[reasonIdx] : null,
        whoPaid: whoPaidIdx >= 0 ? row[whoPaidIdx] : null,
        refunded: refundedIdx >= 0 ? (String(row[refundedIdx]).toLowerCase() === 'yes') : false,
        paymentForm: paymentFormIdx >= 0 ? row[paymentFormIdx] : null,
        month: sheetName,
      }

      expenses.push(expense)
    }

    // If no month total found in the sheet, calculate it
    if (monthTotal === 0 && expenses.length > 0) {
      monthTotal = expenses.reduce((sum, exp) => sum + exp.cost, 0)
    }

    console.log(`✅ [SHEETS] ${sheetName}: ${expenses.length} expenses, $${monthTotal.toFixed(2)} total`)

    return {
      sheetName,
      expenses,
      monthTotal,
    }
  } catch (error) {
    console.error(`❌ [SHEETS] Error fetching data from ${sheetName}:`, error)
    return {
      sheetName,
      expenses: [],
      monthTotal: 0,
    }
  }
}

/**
 * Fetch all expense data from all sheet tabs
 */
const getAllExpenseData = async () => {
  try {
    console.log('💰 [SHEETS] Fetching all expense data...')

    const sheetNames = await getAllSheetNames()
    
    // Fetch data from all sheets in parallel
    const allSheetData = await Promise.all(
      sheetNames.map(name => getSheetData(name))
    )

    // Combine all expenses
    const allExpenses = []
    const monthlyTotals = []

    allSheetData.forEach(sheetData => {
      allExpenses.push(...sheetData.expenses)
      if (sheetData.monthTotal > 0) {
        monthlyTotals.push({
          month: sheetData.sheetName,
          total: sheetData.monthTotal,
          expenseCount: sheetData.expenses.length,
        })
      }
    })

    console.log(`✅ [SHEETS] Total: ${allExpenses.length} expenses across ${sheetNames.length} months`)

    return {
      success: true,
      allExpenses,
      monthlyTotals,
      sheetCount: sheetNames.length,
    }
  } catch (error) {
    console.error('❌ [SHEETS] Error fetching all expense data:', error)
    
    // Check if it's a permission error
    if (error.message?.includes('permission') || error.message?.includes('403')) {
      return {
        success: false,
        error: 'Permission denied. Please share the Google Sheet with the service account email.',
        details: error.message,
      }
    }
    
    return {
      success: false,
      error: error.message || 'Failed to fetch expense data',
    }
  }
}

/**
 * Calculate expense metrics
 */
const calculateExpenseMetrics = (allExpenses) => {
  try {
    console.log('📊 [SHEETS] Calculating expense metrics...')

    if (!allExpenses || allExpenses.length === 0) {
      return {
        totalExpenses: 0,
        totalCount: 0,
        expensesByPerson: [],
        expensesByCategory: [],
        expensesByPaymentForm: [],
        last12MonthsExpenses: 0,
        last30DaysExpenses: 0,
        last7DaysExpenses: 0,
        averageExpense: 0,
        largestExpense: 0,
        needsReimbursement: 0,
      }
    }

    let totalExpenses = 0
    const expensesByPerson = {}
    const expensesByCategory = {}
    const expensesByPaymentForm = {}

    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last12Months = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    let last7DaysExpenses = 0
    let last30DaysExpenses = 0
    let last12MonthsExpenses = 0
    let largestExpense = 0
    let needsReimbursement = 0

    allExpenses.forEach(expense => {
      const cost = expense.cost || 0
      totalExpenses += cost

      if (cost > largestExpense) {
        largestExpense = cost
      }

      // Track expenses by person
      const person = expense.whoPaid || 'Unknown'
      if (!expensesByPerson[person]) {
        expensesByPerson[person] = { person, total: 0, count: 0 }
      }
      expensesByPerson[person].total += cost
      expensesByPerson[person].count++

      // Track expenses by category/reason
      const category = expense.reason || 'Uncategorized'
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = { category, total: 0, count: 0 }
      }
      expensesByCategory[category].total += cost
      expensesByCategory[category].count++

      // Track by payment form
      const paymentForm = expense.paymentForm || 'Unknown'
      if (paymentForm && paymentForm !== 'Unknown') {
        if (!expensesByPaymentForm[paymentForm]) {
          expensesByPaymentForm[paymentForm] = { paymentForm, total: 0, count: 0 }
        }
        expensesByPaymentForm[paymentForm].total += cost
        expensesByPaymentForm[paymentForm].count++
      }

      // Track expenses that need reimbursement
      if (!expense.refunded) {
        needsReimbursement += cost
      }

      // Time-based calculations
      const expenseDate = parseDate(expense.date)
      if (expenseDate) {
        if (expenseDate >= last7Days) {
          last7DaysExpenses += cost
        }
        if (expenseDate >= last30Days) {
          last30DaysExpenses += cost
        }
        if (expenseDate >= last12Months) {
          last12MonthsExpenses += cost
        }
      }
    })

    const averageExpense = allExpenses.length > 0 ? totalExpenses / allExpenses.length : 0

    // Convert to arrays and sort
    const expensesByPersonArray = Object.values(expensesByPerson)
      .sort((a, b) => b.total - a.total)
    
    const expensesByCategoryArray = Object.values(expensesByCategory)
      .sort((a, b) => b.total - a.total)
    
    const expensesByPaymentFormArray = Object.values(expensesByPaymentForm)
      .sort((a, b) => b.total - a.total)

    console.log(`✅ [SHEETS] Metrics calculated:`)
    console.log(`   → Total Expenses: $${totalExpenses.toFixed(2)}`)
    console.log(`   → Total Count: ${allExpenses.length}`)
    console.log(`   → Last 12 Months: $${last12MonthsExpenses.toFixed(2)}`)
    console.log(`   → Needs Reimbursement: $${needsReimbursement.toFixed(2)}`)

    return {
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      totalCount: allExpenses.length,
      expensesByPerson: expensesByPersonArray,
      expensesByCategory: expensesByCategoryArray,
      expensesByPaymentForm: expensesByPaymentFormArray,
      last12MonthsExpenses: parseFloat(last12MonthsExpenses.toFixed(2)),
      last30DaysExpenses: parseFloat(last30DaysExpenses.toFixed(2)),
      last7DaysExpenses: parseFloat(last7DaysExpenses.toFixed(2)),
      averageExpense: parseFloat(averageExpense.toFixed(2)),
      largestExpense: parseFloat(largestExpense.toFixed(2)),
      needsReimbursement: parseFloat(needsReimbursement.toFixed(2)),
    }
  } catch (error) {
    console.error('❌ [SHEETS] Error calculating metrics:', error)
    return {
      totalExpenses: 0,
      totalCount: 0,
      expensesByPerson: [],
      expensesByCategory: [],
      expensesByPaymentForm: [],
      last12MonthsExpenses: 0,
      last30DaysExpenses: 0,
      last7DaysExpenses: 0,
      averageExpense: 0,
      largestExpense: 0,
      needsReimbursement: 0,
    }
  }
}

/**
 * Get all expense data with calculated metrics
 */
const getExpenseDataWithMetrics = async () => {
  try {
    const result = await getAllExpenseData()
    
    if (!result.success) {
      return result
    }

    const metrics = calculateExpenseMetrics(result.allExpenses)

    return {
      success: true,
      expenses: result.allExpenses,
      monthlyTotals: result.monthlyTotals,
      sheetCount: result.sheetCount,
      metrics,
    }
  } catch (error) {
    console.error('❌ [SHEETS] Error getting expense data with metrics:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch data',
    }
  }
}

module.exports = {
  getAllExpenseData,
  getExpenseDataWithMetrics,
  calculateExpenseMetrics,
}
