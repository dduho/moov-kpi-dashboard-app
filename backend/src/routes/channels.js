const express = require('express')
const router = express.Router()
const channelController = require('../controllers/channelController')
const { authenticateToken } = require('../middleware/auth')

router.get('/metrics', authenticateToken, (req, res, next) => channelController.getChannelMetrics(req, res, next))

module.exports = router
