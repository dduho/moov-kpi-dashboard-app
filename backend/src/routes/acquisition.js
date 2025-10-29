const express = require('express')
const router = express.Router()
const acquisitionController = require('../controllers/acquisitionController')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, (req, res, next) => acquisitionController.getAcquisitionData(req, res, next))

module.exports = router
