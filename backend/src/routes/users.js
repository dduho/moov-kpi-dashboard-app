const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/active', authenticateJWT, (req, res, next) => userController.getActiveUsers(req, res, next))

module.exports = router
