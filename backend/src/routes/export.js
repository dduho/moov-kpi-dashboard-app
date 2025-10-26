const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/excel', authenticateJWT, (req, res, next) => exportController.exportToExcel(req, res, next))
router.get('/pdf', authenticateJWT, (req, res, next) => exportController.exportToPdf(req, res, next))

module.exports = router
