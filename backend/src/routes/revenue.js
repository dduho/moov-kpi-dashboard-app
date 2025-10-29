const express = require('express')
const router = express.Router()
const revenueController = require('../controllers/revenueController')
const { authenticateToken } = require('../middleware/auth')

router.get('/by-channel', authenticateToken, (req, res, next) => revenueController.getRevenueByChannel(req, res, next))

module.exports = router
