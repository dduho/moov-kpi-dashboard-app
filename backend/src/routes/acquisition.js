const express = require('express')
const router = express.Router()
const acquisitionController = require('../controllers/acquisitionController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, acquisitionController.getAcquisitionData)

module.exports = router
