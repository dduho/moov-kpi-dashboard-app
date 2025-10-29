const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateToken } = require('../middleware/auth')


router.get('/daily', authenticateToken, kpiController.getDailyComparisons)
router.get('/hourly', authenticateToken, kpiController.getHourlyComparisons)
router.get('/', authenticateToken, kpiController.getComparisons)

module.exports = router
