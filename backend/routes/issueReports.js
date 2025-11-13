const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  submitIssueReport,
  getIssueReports,
  updateIssueStatus,
  getIssueStats,
} = require('../services/monitoring/issueReportService')

/**
 * POST /api/issues/submit
 * Submit a new issue report (authenticated users)
 */
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { category, title, description, url } = req.body

    // Get user info from authenticated request
    const userId = req.user.uid
    const userEmail = req.user.email
    const userName = req.user.firstName && req.user.lastName
      ? `${req.user.firstName} ${req.user.lastName}`
      : req.user.email

    const report = {
      userId,
      userEmail,
      userName,
      category: category || 'general',
      title,
      description,
      url: url || req.headers.referer,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    }

    const result = await submitIssueReport(report)

    res.json(result)
  } catch (error) {
    console.error('Error submitting issue report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit issue report',
      message: error.message,
    })
  }
})

/**
 * GET /api/issues/my-reports
 * Get all reports by the authenticated user
 */
router.get('/my-reports', authenticate, async (req, res) => {
  try {
    const userId = req.user.uid

    const reports = await getIssueReports({ userId })

    res.json({
      success: true,
      reports,
      total: reports.length,
    })
  } catch (error) {
    console.error('Error fetching user reports:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message,
    })
  }
})

/**
 * GET /api/issues/admin/all
 * Get all issue reports (admin only)
 */
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, category, limit } = req.query

    const filters = {}
    if (status) filters.status = status
    if (category) filters.category = category
    if (limit) filters.limit = parseInt(limit)

    const reports = await getIssueReports(filters)

    res.json({
      success: true,
      reports,
      total: reports.length,
    })
  } catch (error) {
    console.error('Error fetching all reports:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message,
    })
  }
})

/**
 * GET /api/issues/admin/stats
 * Get issue report statistics (admin only)
 */
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await getIssueStats()

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Error fetching issue stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    })
  }
})

/**
 * PUT /api/issues/admin/:issueId/status
 * Update issue status (admin only)
 */
router.put('/admin/:issueId/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { issueId } = req.params
    const { status, adminNote } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
      })
    }

    const validStatuses = ['open', 'in_progress', 'closed', 'resolved']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`,
      })
    }

    const result = await updateIssueStatus(issueId, status, adminNote)

    res.json(result)
  } catch (error) {
    console.error('Error updating issue status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update issue status',
      message: error.message,
    })
  }
})

module.exports = router

