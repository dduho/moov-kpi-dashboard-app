const DailyKpi = require('../models/DailyKpi')
const HourlyKpi = require('../models/HourlyKpi')
const ImtTransaction = require('../models/ImtTransaction')
const RevenueByChannel = require('../models/RevenueByChannel')
const ActiveUsers = require('../models/ActiveUsers')
const KpiComparisons = require('../models/KpiComparisons')
const KpiAggregates = require('../models/KpiAggregates')
const logger = require('../utils/logger')

class KpiCalculatorService {
  async calculateDailyAggregates(date) {
    try {
      logger.info(`Calculating daily aggregates for date: ${date}`)

      await Promise.all([
        this.calculateDailyKpiAggregates(date),
        this.calculateImtAggregates(date),
        this.calculateRevenueAggregates(date),
        this.calculateComparisons(date)
      ])

      logger.info(`Successfully calculated daily aggregates for date: ${date}`)
    } catch (error) {
      logger.error(`Error calculating daily aggregates for date ${date}:`, error)
      throw error
    }
  }

  async calculateDailyKpiAggregates(date) {
    const dailyKpis = await DailyKpi.findAll({ where: { date } })

    // Calculate business type aggregates
    const businessAggregates = {}
    dailyKpis.forEach(kpi => {
      if (!businessAggregates[kpi.business_type]) {
        businessAggregates[kpi.business_type] = {
          totalTransactions: 0,
          totalSuccess: 0,
          totalFailed: 0,
          totalAmount: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalTax: 0
        }
      }

      const agg = businessAggregates[kpi.business_type]
      agg.totalSuccess += kpi.success_trx
      agg.totalFailed += kpi.failed_trx || 0
      agg.totalTransactions = agg.totalSuccess + agg.totalFailed
      agg.totalAmount += parseFloat(kpi.amount || 0)
      agg.totalRevenue += parseFloat(kpi.revenue || 0)
      agg.totalCommission += parseFloat(kpi.commission || 0)
      agg.totalTax += parseFloat(kpi.tax || 0)
    })

    // Save aggregated data to database
    const aggregateRecords = []
    for (const [businessType, agg] of Object.entries(businessAggregates)) {
      const successRate = agg.totalTransactions > 0
        ? (agg.totalSuccess / agg.totalTransactions * 100).toFixed(2)
        : 0

      aggregateRecords.push({
        date,
        aggregate_type: 'business_type',
        aggregate_key: businessType,
        total_transactions: agg.totalTransactions,
        total_success: agg.totalSuccess,
        total_failed: agg.totalFailed,
        total_amount: agg.totalAmount,
        total_revenue: agg.totalRevenue,
        total_commission: agg.totalCommission,
        total_tax: agg.totalTax,
        success_rate: successRate
      })
    }

    if (aggregateRecords.length > 0) {
      await KpiAggregates.bulkCreate(aggregateRecords, {
        updateOnDuplicate: [
          'total_transactions', 'total_success', 'total_failed',
          'total_amount', 'total_revenue', 'total_commission',
          'total_tax', 'success_rate', 'updated_at'
        ]
      })
      logger.info(`Saved ${aggregateRecords.length} business type aggregates for date ${date}`)
    }
  }

  async calculateImtAggregates(date) {
    const imtData = await ImtTransaction.findAll({ where: { date } })

    // Calculate country aggregates
    const countryAggregates = {}
    imtData.forEach(item => {
      if (!countryAggregates[item.country]) {
        countryAggregates[item.country] = {
          totalSuccess: 0,
          totalFailed: 0,
          totalTransactions: 0,
          totalAmount: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalTax: 0
        }
      }

      const agg = countryAggregates[item.country]
      agg.totalSuccess += item.total_success
      agg.totalFailed += item.total_failed
      agg.totalTransactions = agg.totalSuccess + agg.totalFailed
      agg.totalAmount += parseFloat(item.amount || 0)
      agg.totalRevenue += parseFloat(item.revenue || 0)
      agg.totalCommission += parseFloat(item.commission || 0)
      agg.totalTax += parseFloat(item.tax || 0)
    })

    // Save aggregated data to database
    const aggregateRecords = []
    for (const [country, agg] of Object.entries(countryAggregates)) {
      const successRate = agg.totalTransactions > 0
        ? (agg.totalSuccess / agg.totalTransactions * 100).toFixed(2)
        : 0

      aggregateRecords.push({
        date,
        aggregate_type: 'country',
        aggregate_key: country,
        total_transactions: agg.totalTransactions,
        total_success: agg.totalSuccess,
        total_failed: agg.totalFailed,
        total_amount: agg.totalAmount,
        total_revenue: agg.totalRevenue,
        total_commission: agg.totalCommission,
        total_tax: agg.totalTax,
        success_rate: successRate
      })
    }

    if (aggregateRecords.length > 0) {
      await KpiAggregates.bulkCreate(aggregateRecords, {
        updateOnDuplicate: [
          'total_transactions', 'total_success', 'total_failed',
          'total_amount', 'total_revenue', 'total_commission',
          'total_tax', 'success_rate', 'updated_at'
        ]
      })
      logger.info(`Saved ${aggregateRecords.length} country aggregates for date ${date}`)
    }
  }

  async calculateRevenueAggregates(date) {
    const revenueData = await RevenueByChannel.findAll({ where: { date } })

    // Calculate channel aggregates
    const channelAggregates = {}
    revenueData.forEach(item => {
      if (!channelAggregates[item.channel]) {
        channelAggregates[item.channel] = {
          totalRevenue: 0,
          totalCommission: 0,
          totalTax: 0,
          totalAmount: 0,
          transactionCount: 0
        }
      }

      const agg = channelAggregates[item.channel]
      agg.totalRevenue += parseFloat(item.revenue || 0)
      agg.totalCommission += parseFloat(item.commission || 0)
      agg.totalTax += parseFloat(item.tax || 0)
      agg.totalAmount += parseFloat(item.amount || 0)
      agg.transactionCount += item.transaction_count
    })

    // Save aggregated data to database
    const aggregateRecords = []
    for (const [channel, agg] of Object.entries(channelAggregates)) {
      aggregateRecords.push({
        date,
        aggregate_type: 'channel',
        aggregate_key: channel,
        total_transactions: agg.transactionCount,
        total_amount: agg.totalAmount,
        total_revenue: agg.totalRevenue,
        total_commission: agg.totalCommission,
        total_tax: agg.totalTax,
        metadata: {
          net_revenue: agg.totalRevenue - agg.totalCommission - agg.totalTax
        }
      })
    }

    if (aggregateRecords.length > 0) {
      await KpiAggregates.bulkCreate(aggregateRecords, {
        updateOnDuplicate: [
          'total_transactions', 'total_amount', 'total_revenue',
          'total_commission', 'total_tax', 'metadata', 'updated_at'
        ]
      })
      logger.info(`Saved ${aggregateRecords.length} channel aggregates for date ${date}`)
    }
  }

  async calculateComparisons(date) {
    const previousDate = this.getPreviousDate(date)

    const [currentData, previousData] = await Promise.all([
      DailyKpi.findAll({ where: { date } }),
      DailyKpi.findAll({ where: { date: previousDate } })
    ])

    const comparisons = []

    // Group by business type
    const currentGrouped = this.groupByBusinessType(currentData)
    const previousGrouped = this.groupByBusinessType(previousData)

    Object.keys(currentGrouped).forEach(businessType => {
      const current = currentGrouped[businessType]
      const previous = previousGrouped[businessType]

      if (previous) {
        comparisons.push({
          date,
          metric_type: 'transactions',
          business_type: businessType,
          current_value: current.totalTransactions,
          last_day_value: previous.totalTransactions,
          gap: current.totalTransactions - previous.totalTransactions,
          gap_percentage: this.calculatePercentageChange(current.totalTransactions, previous.totalTransactions)
        })

        comparisons.push({
          date,
          metric_type: 'amount',
          business_type: businessType,
          current_value: current.totalAmount,
          last_day_value: previous.totalAmount,
          gap: current.totalAmount - previous.totalAmount,
          gap_percentage: this.calculatePercentageChange(current.totalAmount, previous.totalAmount)
        })

        comparisons.push({
          date,
          metric_type: 'revenue',
          business_type: businessType,
          current_value: current.totalRevenue,
          last_day_value: previous.totalRevenue,
          gap: current.totalRevenue - previous.totalRevenue,
          gap_percentage: this.calculatePercentageChange(current.totalRevenue, previous.totalRevenue)
        })
      }
    })

    if (comparisons.length > 0) {
      await KpiComparisons.bulkCreate(comparisons, {
        updateOnDuplicate: ['current_value', 'last_day_value', 'gap', 'gap_percentage']
      })
    }
  }

  groupByBusinessType(data) {
    const grouped = {}
    data.forEach(item => {
      if (!grouped[item.business_type]) {
        grouped[item.business_type] = {
          totalTransactions: 0,
          totalAmount: 0,
          totalRevenue: 0
        }
      }

      grouped[item.business_type].totalTransactions += item.success_trx
      grouped[item.business_type].totalAmount += parseFloat(item.amount || 0)
      grouped[item.business_type].totalRevenue += parseFloat(item.revenue || 0)
    })
    return grouped
  }

  calculatePercentageChange(current, previous) {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(2)
  }

  getPreviousDate(dateStr) {
    const date = new Date(
      dateStr.substring(0, 4),
      dateStr.substring(4, 6) - 1,
      dateStr.substring(6, 8)
    )
    date.setDate(date.getDate() - 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }
}

module.exports = new KpiCalculatorService()