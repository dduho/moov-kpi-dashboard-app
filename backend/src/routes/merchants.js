const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, (req, res, next) => merchantController.getMerchantData(req, res, next))

module.exports = router
