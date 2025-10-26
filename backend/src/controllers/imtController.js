const { ImtTransaction } = require('../models')
const cacheService = require('../services/cacheService')

class ImtController {
  async getImtData(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `imt-data:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const imtData = await ImtTransaction.findAll({
        where: { date },
        order: [['country', 'ASC'], ['imt_business', 'ASC']]
      })

      await cacheService.set(cacheKey, imtData, 300)
      res.json(imtData)
    } catch (error) {
      next(error)
    }
  }

  async getImtByCountry(req, res, next) {
    try {
      const { country, start_date, end_date } = req.params
      const cacheKey = `imt-country:${country}:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const imtData = await ImtTransaction.findAll({
        where: {
          country,
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC'], ['imt_business', 'ASC']]
      })

      await cacheService.set(cacheKey, imtData, 300)
      res.json(imtData)
    } catch (error) {
      next(error)
    }
  }

  async getImtSummary(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `imt-summary:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const imtData = await ImtTransaction.findAll({ where: { date } })

      const summary = this.calculateImtSummary(imtData)

      await cacheService.set(cacheKey, summary, 300)
      res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  calculateImtSummary(imtData) {
    const summary = {
      byCountry: {},
      byBusiness: {},
      total: {
        transactions: 0,
        amount: 0,
        revenue: 0,
        successRate: 0
      }
    }

    imtData.forEach(item => {
      // By country
      if (!summary.byCountry[item.country]) {
        summary.byCountry[item.country] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          successRate: 0
        }
      }

      summary.byCountry[item.country].transactions += item.total_success
      summary.byCountry[item.country].amount += parseFloat(item.amount)
      summary.byCountry[item.country].revenue += parseFloat(item.revenue)

      // By business type
      if (!summary.byBusiness[item.imt_business]) {
        summary.byBusiness[item.imt_business] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          successRate: 0
        }
      }

      summary.byBusiness[item.imt_business].transactions += item.total_success
      summary.byBusiness[item.imt_business].amount += parseFloat(item.amount)
      summary.byBusiness[item.imt_business].revenue += parseFloat(item.revenue)

      // Total
      summary.total.transactions += item.total_success
      summary.total.amount += parseFloat(item.amount)
      summary.total.revenue += parseFloat(item.revenue)
    })

    // Calculate success rates
    Object.keys(summary.byCountry).forEach(country => {
      const countryData = imtData.filter(item => item.country === country)
      const totalTx = countryData.reduce((sum, item) => sum + item.total_success + item.total_failed, 0)
      summary.byCountry[country].successRate = totalTx > 0 ? (summary.byCountry[country].transactions / totalTx * 100).toFixed(2) : 0
    })

    Object.keys(summary.byBusiness).forEach(business => {
      const businessData = imtData.filter(item => item.imt_business === business)
      const totalTx = businessData.reduce((sum, item) => sum + item.total_success + item.total_failed, 0)
      summary.byBusiness[business].successRate = totalTx > 0 ? (summary.byBusiness[business].transactions / totalTx * 100).toFixed(2) : 0
    })

    const totalTx = imtData.reduce((sum, item) => sum + item.total_success + item.total_failed, 0)
    summary.total.successRate = totalTx > 0 ? (summary.total.transactions / totalTx * 100).toFixed(2) : 0

    return summary
  }
}

module.exports = new ImtController()