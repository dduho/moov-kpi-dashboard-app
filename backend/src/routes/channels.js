const express = require('express')
const router = express.Router()
const channelController = require('../controllers/channelController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/metrics', authenticateJWT, channelController.getChannelMetrics)

module.exports = router
