const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const { authenticateToken } = require('../middleware/auth')

router.get('/excel', authenticateToken, (req, res, next) => exportController.exportToExcel(req, res, next))
router.get('/pdf', authenticateToken, (req, res, next) => exportController.exportToPdf(req, res, next))

module.exports = router
