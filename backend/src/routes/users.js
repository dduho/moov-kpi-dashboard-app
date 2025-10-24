const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/active', authenticateJWT, userController.getActiveUsers)

module.exports = router
