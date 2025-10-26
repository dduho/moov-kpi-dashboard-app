const express = require('express')
const router = express.Router()
const revenueController = require('../controllers/revenueController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/by-channel', authenticateJWT, (req, res, next) => revenueController.getRevenueByChannel(req, res, next))

module.exports = router
