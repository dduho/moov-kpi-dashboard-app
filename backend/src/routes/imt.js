const express = require('express')
const router = express.Router()
const imtController = require('../controllers/imtController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, imtController.getImtData)
router.get('/country/:country', authenticateJWT, imtController.getImtByCountry)

module.exports = router
