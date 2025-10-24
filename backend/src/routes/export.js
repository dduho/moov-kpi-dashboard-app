const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const { authenticateJWT } = require('../middleware/auth')

router.get('/excel', authenticateJWT, exportController.exportToExcel)
router.get('/pdf', authenticateJWT, exportController.exportToPdf)

module.exports = router
