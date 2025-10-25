const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchantController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, merchantController.getMerchantData)

module.exports = router
