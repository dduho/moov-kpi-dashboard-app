const express = require('express')
const router = express.Router()
const revenueController = require('../controllers/revenueController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/by-channel', authenticateJWT, revenueController.getRevenueByChannel)

module.exports = router
