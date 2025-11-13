const { admin, db } = require('../../config/firebase-admin')
const { sendJarvisStatusUpdate } = require('./alertService')

/**
 * Submit a user issue report
 * @param {Object} report - Issue report data
 * @returns {Promise<Object>}
 */
const submitIssueReport = async (report) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      category,
      title,
      description,
      url,
      userAgent,
      timestamp,
    } = report

    // Validate required fields
    if (!title || !description) {
      throw new Error('Title and description are required')
    }

    // Store in Firebase
    const issueRef = await db.collection('issueReports').add({
      userId: userId || null,
      userEmail: userEmail || 'Anonymous',
      userName: userName || 'Anonymous User',
      category: category || 'general',
      title,
      description,
      url: url || null,
      userAgent: userAgent || null,
      status: 'open',
      priority: 'normal',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`📝 [ISSUE REPORT] New report submitted by ${userName} (${userEmail})`)
    console.log(`   → Category: ${category}`)
    console.log(`   → Title: ${title}`)

    // Send Jarvis notification
    await sendIssueReportToJarvis({
      issueId: issueRef.id,
      ...report,
    })

    return {
      success: true,
      issueId: issueRef.id,
      message: 'Issue report submitted successfully',
    }
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error submitting report:', error)
    throw error
  }
}

/**
 * Send issue report to Discord via Jarvis
 * @param {Object} report - Issue report with ID
 * @returns {Promise<void>}
 */
const sendIssueReportToJarvis = async (report) => {
  try {
    // Use the Jarvis status update system
    const alertService = require('./alertService')
    
    if (!alertService.sendJarvisIssueReport) {
      console.log('⚠️  [ISSUE REPORT] Jarvis issue report function not available')
      return
    }

    await alertService.sendJarvisIssueReport(report)
    console.log(`✅ [ISSUE REPORT] Jarvis notified about issue ${report.issueId}`)
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error sending to Jarvis:', error.message)
  }
}

/**
 * Get all issue reports with optional filtering
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
const getIssueReports = async (filters = {}) => {
  try {
    let query = db.collection('issueReports')

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }

    if (filters.category) {
      query = query.where('category', '==', filters.category)
    }

    if (filters.userId) {
      query = query.where('userId', '==', filters.userId)
    }

    // Order by most recent
    query = query.orderBy('createdAt', 'desc')

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const snapshot = await query.get()

    const reports = []
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      })
    })

    return reports
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error fetching reports:', error)
    throw error
  }
}

/**
 * Update issue report status
 * @param {string} issueId - Issue ID
 * @param {string} status - New status
 * @param {string} adminNote - Optional admin note
 * @returns {Promise<Object>}
 */
const updateIssueStatus = async (issueId, status, adminNote = null) => {
  try {
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (adminNote) {
      updateData.adminNote = adminNote
      updateData.resolvedAt = admin.firestore.FieldValue.serverTimestamp()
    }

    await db.collection('issueReports').doc(issueId).update(updateData)

    console.log(`✅ [ISSUE REPORT] Issue ${issueId} status updated to ${status}`)

    return {
      success: true,
      message: 'Issue status updated successfully',
    }
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error updating status:', error)
    throw error
  }
}

/**
 * Get issue statistics
 * @returns {Promise<Object>}
 */
const getIssueStats = async () => {
  try {
    const [openSnapshot, closedSnapshot, totalSnapshot] = await Promise.all([
      db.collection('issueReports').where('status', '==', 'open').get(),
      db.collection('issueReports').where('status', '==', 'closed').get(),
      db.collection('issueReports').get(),
    ])

    return {
      total: totalSnapshot.size,
      open: openSnapshot.size,
      closed: closedSnapshot.size,
      inProgress: totalSnapshot.size - openSnapshot.size - closedSnapshot.size,
    }
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error fetching stats:', error)
    throw error
  }
}

module.exports = {
  submitIssueReport,
  getIssueReports,
  updateIssueStatus,
  getIssueStats,
}

