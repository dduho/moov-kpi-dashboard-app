const express = require('express')
const router = express.Router()
const kpiController = require('../controllers/kpiController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, kpiController.getComparisons)

module.exports = router
