const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, agentController.getAgentData)

module.exports = router
