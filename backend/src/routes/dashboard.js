const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, (req, res, next) => dashboardController.getDashboardData(req, res, next))

module.exports = router
