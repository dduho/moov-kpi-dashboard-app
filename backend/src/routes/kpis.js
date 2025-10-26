const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/daily', authenticateJWT, kpiController.getDailyKpis)
router.get('/daily/range', authenticateJWT, kpiController.getDailyKpisByDateRange)
router.get('/hourly', authenticateJWT, kpiController.getHourlyKpis)
router.get('/weekly', authenticateJWT, kpiController.getWeeklyKpis)
router.get('/active-users', authenticateJWT, kpiController.getActiveUsers)
router.get('/hourly-performance', authenticateJWT, kpiController.getHourlyPerformance)
router.get('/comparative-analytics', authenticateJWT, kpiController.getComparativeAnalytics)

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
