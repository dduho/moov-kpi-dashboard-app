const express = require('express')
const router = express.Router()
const imtController = require('../controllers/imtController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/', authenticateJWT, (req, res, next) => imtController.getImtData(req, res, next))
router.get('/country/:country', authenticateJWT, (req, res, next) => imtController.getImtByCountry(req, res, next))

module.exports = router
