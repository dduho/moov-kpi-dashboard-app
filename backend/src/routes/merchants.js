const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, (req, res, next) => merchantController.getMerchantData(req, res, next))

module.exports = router
