const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticateToken } = require('../middleware/auth')

router.get('/active', authenticateToken, (req, res, next) => userController.getActiveUsers(req, res, next))
router.get('/trends', authenticateToken, (req, res, next) => userController.getUserTrends(req, res, next))

module.exports = router
