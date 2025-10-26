const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, (req, res, next) => dashboardController.getDashboardData(req, res, next))

module.exports = router
