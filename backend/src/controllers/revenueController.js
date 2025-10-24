const RevenueByChannel = require('../models/RevenueByChannel')
const cacheService = require('../services/cacheService')

class RevenueController {
  async getRevenueByChannel(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `revenue-channel:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const revenueData = await RevenueByChannel.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC'], ['channel', 'ASC']]
      })

      const summary = this.calculateRevenueSummary(revenueData)

      await cacheService.set(cacheKey, summary, 300)
      res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  async getRevenueTrends(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `revenue-trends:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const revenueData = await RevenueByChannel.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const trends = this.calculateRevenueTrends(revenueData)

      await cacheService.set(cacheKey, trends, 300)
      res.json(trends)
    } catch (error) {
      next(error)
    }
  }

  calculateRevenueSummary(revenueData) {
    const summary = {
      byChannel: {},
      total: {
        revenue: 0,
        commission: 0,
        tax: 0,
        netRevenue: 0
      }
    }

    revenueData.forEach(item => {
      // By channel
      if (!summary.byChannel[item.channel]) {
        summary.byChannel[item.channel] = {
          revenue: 0,
          commission: 0,
          tax: 0,
          netRevenue: 0,
          transactionCount: 0
        }
      }

      summary.byChannel[item.channel].revenue += parseFloat(item.revenue)
      summary.byChannel[item.channel].commission += parseFloat(item.commission)
      summary.byChannel[item.channel].tax += parseFloat(item.tax)
      summary.byChannel[item.channel].netRevenue += parseFloat(item.revenue) - parseFloat(item.commission) - parseFloat(item.tax)
      summary.byChannel[item.channel].transactionCount += item.transaction_count

      // Total
      summary.total.revenue += parseFloat(item.revenue)
      summary.total.commission += parseFloat(item.commission)
      summary.total.tax += parseFloat(item.tax)
      summary.total.netRevenue += parseFloat(item.revenue) - parseFloat(item.commission) - parseFloat(item.tax)
    })

    return summary
  }

  calculateRevenueTrends(revenueData) {
    const trends = {}
    const dateMap = new Map()

    // Group by date
    revenueData.forEach(item => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          totalRevenue: 0,
          totalCommission: 0,
          totalTax: 0,
          byChannel: {}
        })
      }

      const dateData = dateMap.get(item.date)
      dateData.totalRevenue += parseFloat(item.revenue)
      dateData.totalCommission += parseFloat(item.commission)
      dateData.totalTax += parseFloat(item.tax)

      if (!dateData.byChannel[item.channel]) {
        dateData.byChannel[item.channel] = {
          revenue: 0,
          commission: 0,
          tax: 0
        }
      }

      dateData.byChannel[item.channel].revenue += parseFloat(item.revenue)
      dateData.byChannel[item.channel].commission += parseFloat(item.commission)
      dateData.byChannel[item.channel].tax += parseFloat(item.tax)
    })

    // Convert to array and sort by date
    const sortedTrends = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    return sortedTrends
  }
}

module.exports = new RevenueController()