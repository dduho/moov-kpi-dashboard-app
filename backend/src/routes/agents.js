const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, (req, res, next) => agentController.getAgentData(req, res, next))

module.exports = router
