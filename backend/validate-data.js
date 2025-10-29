#!/usr/bin/env node

/**
 * Data Validation Script for Moov KPI Dashboard
 * Validates KPI calculations, aggregations, and data consistency
 * Tests database directly to avoid API rate limiting
 */

const { DailyKpi, WeeklyKpis, ChannelDailyStats, RevenueByChannel } = require('./src/models')

const API_BASE_URL = 'http://localhost:3000/api'

// Test configuration
const TEST_DATE = '2025-10-22'
const START_DATE = '2025-10-20'
const END_DATE = '2025-10-22'

class DataValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  assert(condition, message, details = null) {
    if (condition) {
      this.results.passed++
      this.log(`✓ ${message}`, 'success')
      return true
    } else {
      this.results.failed++
      this.log(`✗ ${message}`, 'error')
      if (details) {
        this.log(`  Details: ${JSON.stringify(details, null, 2)}`, 'error')
      }
      this.results.errors.push({ message, details })
      return false
    }
  }

  async testDatabaseQuery(queryFunction, description) {
    try {
      this.log(`Testing ${description}...`)
      const data = await queryFunction()
      this.assert(data !== null && data !== undefined, `${description} - Query successful`)
      this.assert(Array.isArray(data) ? data.length > 0 : data, `${description} - Has data`)
      return data
    } catch (error) {
      this.assert(false, `${description} - Query failed`, {
        error: error.message
      })
      return null
    }
  }

  async validatePerformanceDashboard() {
    this.log('\n🔍 VALIDATING PERFORMANCE DASHBOARD')

    const dailyKpis = await this.testDatabaseQuery(
      () => DailyKpi.findAll({ where: { date: TEST_DATE }, order: [['business_type', 'ASC']] }),
      'Daily KPIs query'
    )

    const channelStats = await this.testDatabaseQuery(
      () => ChannelDailyStats.findAll({ where: { date: TEST_DATE }, order: [['channel', 'ASC']] }),
      'Channel stats query'
    )

    const revenueByChannel = await this.testDatabaseQuery(
      () => RevenueByChannel.findAll({ where: { date: TEST_DATE }, order: [['channel', 'ASC']] }),
      'Revenue by channel query'
    )

    if (!dailyKpis || !channelStats) return

    // Validate data structure
    this.assert(dailyKpis.length > 0, 'Performance Dashboard - Has daily KPIs data')
    this.assert(channelStats.length > 0, 'Performance Dashboard - Has channel stats data')

    // Validate business types
    const businessTypes = [...new Set(dailyKpis.map(k => k.business_type))]
    const expectedTypes = ['Bill Payment', 'Cash In', 'Cash Out', 'IMT', 'P2P']
    expectedTypes.forEach(type => {
      this.assert(businessTypes.includes(type), `Performance Dashboard - Contains ${type} business type`)
    })

    // Validate summary calculations
    const totalRevenue = dailyKpis.reduce((sum, kpi) => sum + parseFloat(kpi.revenue || 0), 0)
    const totalTransactions = dailyKpis.reduce((sum, kpi) => sum + parseInt(kpi.success_trx || 0), 0)

    this.assert(totalRevenue > 0, 'Performance Dashboard - Total revenue is positive', { totalRevenue })
    this.assert(totalTransactions > 0, 'Performance Dashboard - Total transactions is positive', { totalTransactions })

    // Validate channel data consistency
    const channelRevenue = channelStats.reduce((sum, stat) => sum + parseFloat(stat.revenue || 0), 0)
    this.assert(channelRevenue > 0, 'Performance Dashboard - Channel revenue is positive', { channelRevenue })
  }

  async validateTrendAnalysis() {
    this.log('\n🔍 VALIDATING TREND ANALYSIS')

    const dailyTrends = await this.testDatabaseQuery(
      () => DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [START_DATE, END_DATE]
          }
        },
        attributes: [
          'date',
          'business_type',
          [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total_amount'],
          [require('sequelize').fn('SUM', require('sequelize').col('revenue')), 'total_revenue'],
          [require('sequelize').fn('SUM', require('sequelize').col('success_trx')), 'total_transactions']
        ],
        group: ['date', 'business_type'],
        order: [['date', 'ASC'], ['business_type', 'ASC']]
      }),
      'Daily trends query'
    )

    if (!dailyTrends) return

    // Validate structure
    this.assert(Array.isArray(dailyTrends), 'Trend Analysis - Has daily trends array')
    this.assert(dailyTrends.length > 0, 'Trend Analysis - Has trend data')

    // Validate date range
    const dates = [...new Set(dailyTrends.map(t => t.date))]
    this.assert(dates.length >= 3, 'Trend Analysis - Has multiple dates in range', { dates })

    // Validate business types consistency
    const businessTypes = [...new Set(dailyTrends.map(t => t.business_type))]
    this.assert(businessTypes.length >= 3, 'Trend Analysis - Has multiple business types', { businessTypes })

    // Validate calculations
    dailyTrends.forEach((trend, index) => {
      this.assert(parseFloat(trend.dataValues.total_revenue || 0) >= 0, `Trend ${index} - Revenue is non-negative`)
      this.assert(parseInt(trend.dataValues.total_transactions || 0) >= 0, `Trend ${index} - Transactions is non-negative`)
    })
  }

  async validatePredictiveInsights() {
    this.log('\n🔍 VALIDATING PREDICTIVE INSIGHTS')

    // Get recent data for prediction (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const recentData = await this.testDatabaseQuery(
      () => DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [
              startDate.toISOString().split('T')[0].replace(/-/g, ''),
              endDate.toISOString().split('T')[0].replace(/-/g, '')
            ]
          }
        },
        order: [['date', 'ASC']]
      }),
      'Recent data for predictions'
    )

    if (!recentData) return

    // Validate data availability
    this.assert(recentData.length >= 7, 'Predictive Insights - Has sufficient historical data', { dataPoints: recentData.length })

    // Test prediction algorithm
    const businessTypes = [...new Set(recentData.map(d => d.business_type))]
    this.assert(businessTypes.length > 0, 'Predictive Insights - Has business types for prediction')

    // Test linear regression calculation
    for (const businessType of businessTypes.slice(0, 2)) { // Test first 2 business types
      const typeData = recentData.filter(d => d.business_type === businessType)
      if (typeData.length >= 7) {
        const revenues = typeData.map(d => parseFloat(d.revenue || 0))

        // Test linear regression
        const prediction = this.linearRegression(revenues)
        this.assert(typeof prediction === 'number' && !isNaN(prediction), `Prediction for ${businessType} - Valid prediction value`, { prediction })

        // Test confidence calculation
        const confidence = this.calculateConfidence(revenues)
        this.assert(typeof confidence === 'number' && confidence >= 0 && confidence <= 1, `Prediction for ${businessType} - Valid confidence score`, { confidence })
      }
    }
  }

  // Helper methods for predictions
  linearRegression(values) {
    const n = values.length
    if (n < 2) return 0

    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, idx) => sum + val * idx, 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predict next value
    return intercept + slope * n
  }

  calculateConfidence(values) {
    if (values.length < 2) return 0

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Simple confidence based on coefficient of variation
    return stdDev / mean
  }

  async validateDataConsistency() {
    this.log('\n🔍 VALIDATING DATA CONSISTENCY')

    // Get data from different sources
    const [dailyKpis, channelStats] = await Promise.all([
      this.testDatabaseQuery(
        () => DailyKpi.findAll({ where: { date: TEST_DATE } }),
        'Daily KPIs for consistency'
      ),
      this.testDatabaseQuery(
        () => ChannelDailyStats.findAll({ where: { date: TEST_DATE } }),
        'Channel stats for consistency'
      )
    ])

    if (!dailyKpis || !channelStats) return

    // Compare business types vs channels (they serve different purposes but should have data)
    const kpiBusinessTypes = [...new Set(dailyKpis.map(k => k.business_type))]
    const channelTypes = [...new Set(channelStats.map(c => c.channel))]

    // Check if both tables have data (different aggregation levels)
    this.assert(kpiBusinessTypes.length > 0, 'Data Consistency - Daily KPIs have business types', {
      kpiTypes: kpiBusinessTypes
    })

    this.assert(channelTypes.length > 0, 'Data Consistency - Channel stats have channel types', {
      channelTypes: channelTypes
    })

    // Compare revenue totals for consistency
    const kpiRevenue = dailyKpis.reduce((sum, kpi) => sum + parseFloat(kpi.revenue || 0), 0)
    const channelRevenue = channelStats.reduce((sum, stat) => sum + parseFloat(stat.revenue || 0), 0)

    // Revenue should be reasonably close (allowing for different aggregation methods)
    const revenueDiff = Math.abs(kpiRevenue - channelRevenue)
    const maxRevenue = Math.max(kpiRevenue, channelRevenue)
    const consistencyRatio = maxRevenue > 0 ? revenueDiff / maxRevenue : 0

    this.assert(consistencyRatio < 0.5, 'Data Consistency - Revenue totals are reasonably consistent', {
      kpiRevenue,
      channelRevenue,
      difference: revenueDiff,
      consistencyRatio: consistencyRatio.toFixed(3)
    })
  }

  async validateKPICalculations() {
    this.log('\n🔍 VALIDATING KPI CALCULATIONS')

    const dailyKpis = await this.testDatabaseQuery(
      () => DailyKpi.findAll({ where: { date: TEST_DATE } }),
      'KPI Calculations data'
    )

    if (!dailyKpis) return

    // Validate success rates
    dailyKpis.forEach((kpi, index) => {
      if (kpi.success_trx && kpi.failed_trx) {
        const total = parseInt(kpi.success_trx) + parseInt(kpi.failed_trx)
        const expectedRate = total > 0 ? parseInt(kpi.success_trx) / total : 0
        const actualRate = parseFloat(kpi.success_rate || 0)

        this.assert(Math.abs(expectedRate - actualRate) < 0.01, `KPI ${index} - Success rate calculation`, {
          business_type: kpi.business_type,
          expected: expectedRate,
          actual: actualRate,
          difference: Math.abs(expectedRate - actualRate)
        })
      }
    })

    // Validate revenue rates
    dailyKpis.forEach((kpi, index) => {
      if (kpi.revenue && kpi.amount && parseFloat(kpi.amount) > 0) {
        const expectedRate = parseFloat(kpi.revenue) / parseFloat(kpi.amount)
        const actualRate = parseFloat(kpi.revenue_rate || 0)

        this.assert(Math.abs(expectedRate - actualRate) < 0.01, `KPI ${index} - Revenue rate calculation`, {
          business_type: kpi.business_type,
          expected: expectedRate,
          actual: actualRate,
          difference: Math.abs(expectedRate - actualRate)
        })
      }
    })

    // Validate data integrity
    dailyKpis.forEach((kpi, index) => {
      this.assert(parseFloat(kpi.revenue || 0) >= 0, `KPI ${index} - Revenue is non-negative`)
      this.assert(parseInt(kpi.success_trx || 0) >= 0, `KPI ${index} - Success transactions is non-negative`)
      this.assert(parseInt(kpi.failed_trx || 0) >= 0, `KPI ${index} - Failed transactions is non-negative`)
    })
  }

  async runAllValidations() {
    this.log('🚀 STARTING DATA VALIDATION SUITE')
    this.log('=' .repeat(50))

    try {
      await this.validatePerformanceDashboard()
      await this.validateTrendAnalysis()
      await this.validatePredictiveInsights()
      await this.validateDataConsistency()
      await this.validateKPICalculations()

      this.log('\n' + '=' .repeat(50))
      this.log('📊 VALIDATION RESULTS SUMMARY')
      this.log(`✅ Passed: ${this.results.passed}`)
      this.log(`❌ Failed: ${this.results.failed}`)
      this.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`)

      if (this.results.errors.length > 0) {
        this.log('\n🔍 ERRORS DETAILS:')
        this.results.errors.forEach((error, index) => {
          this.log(`${index + 1}. ${error.message}`, 'error')
          if (error.details) {
            this.log(`   ${JSON.stringify(error.details, null, 2)}`, 'error')
          }
        })
      }

      return this.results.failed === 0

    } catch (error) {
      this.log(`💥 CRITICAL ERROR: ${error.message}`, 'error')
      return false
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DataValidator()
  validator.runAllValidations()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Validation failed with error:', error)
      process.exit(1)
    })
}

module.exports = DataValidator