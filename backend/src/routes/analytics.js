const express = require('express')
const router = express.Router()
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController')
const { authenticateToken } = require('../middleware/auth')

// Advanced analytics endpoints
router.get('/performance-dashboard', authenticateToken, (req, res, next) => advancedAnalyticsController.getPerformanceDashboard(req, res, next))
router.get('/trend-analysis', authenticateToken, (req, res, next) => advancedAnalyticsController.getTrendAnalysis(req, res, next))
router.get('/predictive-insights', authenticateToken, (req, res, next) => advancedAnalyticsController.getPredictiveInsights(req, res, next))
router.get('/channel-performance', authenticateToken, (req, res, next) => advancedAnalyticsController.getChannelPerformanceAnalysis(req, res, next))
router.get('/year-over-year', authenticateToken, (req, res, next) => advancedAnalyticsController.getYearOverYearComparison(req, res, next))

// Test endpoints without auth
router.get('/performance-dashboard-test', (req, res, next) => advancedAnalyticsController.getPerformanceDashboard(req, res, next))
router.get('/trend-analysis-test', (req, res, next) => advancedAnalyticsController.getTrendAnalysis(req, res, next))
router.get('/predictive-insights-test', (req, res, next) => advancedAnalyticsController.getPredictiveInsights(req, res, next))

module.exports = router