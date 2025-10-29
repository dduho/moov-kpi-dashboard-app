const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateToken } = require('../middleware/auth')

router.get('/daily', authenticateToken, (req, res, next) => kpiController.getDailyKpis(req, res, next))
router.get('/daily/range', authenticateToken, (req, res, next) => kpiController.getDailyKpisByDateRange(req, res, next))
router.get('/hourly', authenticateToken, (req, res, next) => kpiController.getHourlyKpis(req, res, next))
router.get('/weekly', authenticateToken, (req, res, next) => kpiController.getWeeklyKpis(req, res, next))
router.get('/active-users', authenticateToken, (req, res, next) => kpiController.getActiveUsers(req, res, next))
router.get('/hourly-performance', authenticateToken, (req, res, next) => kpiController.getHourlyPerformance(req, res, next))
router.get('/comparative-analytics', authenticateToken, (req, res, next) => kpiController.getComparativeAnalytics(req, res, next))

// New Phase 5 endpoints
router.get('/yearly-comparisons', authenticateToken, (req, res, next) => kpiController.getYearlyComparisons(req, res, next))
router.get('/yearly-trends', authenticateToken, (req, res, next) => kpiController.getYearlyTrends(req, res, next))
router.get('/monthly-yearly-comparison', authenticateToken, (req, res, next) => kpiController.getMonthlyYearlyComparison(req, res, next))
router.get('/channel-daily-stats', authenticateToken, (req, res, next) => kpiController.getChannelDailyStats(req, res, next))
router.get('/channel-monthly-stats', authenticateToken, (req, res, next) => kpiController.getChannelMonthlyStats(req, res, next))
router.get('/channel-comparison', authenticateToken, (req, res, next) => kpiController.getChannelComparison(req, res, next))

// Temporary test endpoints without auth for testing
router.get('/weekly-test', async (req, res) => {
  try {
    const { WeeklyKpis } = require('../models')
    const data = await WeeklyKpis.findAll({ limit: 5, order: [['week_start_date', 'DESC']] })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/hourly-test', async (req, res) => {
  try {
    const { HourlyPerformance } = require('../models')
    const data = await HourlyPerformance.findAll({ limit: 24, order: [['date', 'DESC'], ['hour', 'ASC']] })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/comparative-test', async (req, res) => {
  try {
    const { ComparativeAnalytics } = require('../models')
    const data = await ComparativeAnalytics.findAll({ limit: 10, order: [['date', 'DESC']] })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
