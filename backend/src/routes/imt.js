const express = require('express')
const router = express.Router()
const imtController = require('../controllers/imtController')
const { authenticateToken } = require('../middleware/auth')

router.get('/', authenticateToken, (req, res, next) => imtController.getImtData(req, res, next))
router.get('/country/:country', authenticateToken, (req, res, next) => imtController.getImtByCountry(req, res, next))

module.exports = router
