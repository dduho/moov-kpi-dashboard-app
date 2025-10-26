const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/daily', authenticateJWT, (req, res, next) => kpiController.getDailyKpis(req, res, next))
router.get('/daily/range', authenticateJWT, (req, res, next) => kpiController.getDailyKpisByDateRange(req, res, next))
router.get('/hourly', authenticateJWT, (req, res, next) => kpiController.getHourlyKpis(req, res, next))
router.get('/weekly', authenticateJWT, (req, res, next) => kpiController.getWeeklyKpis(req, res, next))
router.get('/active-users', authenticateJWT, (req, res, next) => kpiController.getActiveUsers(req, res, next))
router.get('/hourly-performance', authenticateJWT, (req, res, next) => kpiController.getHourlyPerformance(req, res, next))
router.get('/comparative-analytics', authenticateJWT, (req, res, next) => kpiController.getComparativeAnalytics(req, res, next))

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
