const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, (req, res, next) => agentController.getAgentData(req, res, next))

module.exports = router
