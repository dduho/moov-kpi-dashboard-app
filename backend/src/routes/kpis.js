const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/daily', authenticateJWT, kpiController.getDailyKpis)
router.get('/daily/range', authenticateJWT, kpiController.getDailyKpisByDateRange)
router.get('/hourly', authenticateJWT, kpiController.getHourlyKpis)

module.exports = router
