const { ActiveUsers } = require('../models')
const cacheService = require('../services/cacheService')

class AcquisitionController {
  async getAcquisitionData(req, res, next) {
    try {
      const { date, start_date, end_date } = req.query
      const cacheKey = `acquisition:${date || start_date + '-' + end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // For now, return calculated data from ActiveUsers
      // In production, this would query specific acquisition tables
      const userData = await ActiveUsers.findAll({
        where: date ? { date } : {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const acquisitionData = this.calculateAcquisitionMetrics(userData, date)

      await cacheService.set(cacheKey, acquisitionData, 300)
      res.json(acquisitionData)
    } catch (error) {
      next(error)
    }
  }

  calculateAcquisitionMetrics(userData, targetDate) {
    const latestData = userData[userData.length - 1] || {}

    // Calculate aggregates
    const totalNewUsers = userData.reduce((sum, u) => sum + (u.new_users || 0), 0)
    const totalActivations = userData.reduce((sum, u) => sum + (u.app_activations || 0), 0)

    // Mock data for channels (would come from actual channel table)
    const channelDistribution = {
      USSD: Math.floor(totalNewUsers * 0.42),
      App: Math.floor(totalNewUsers * 0.38),
      PDV: Math.floor(totalNewUsers * 0.15),
      Web: Math.floor(totalNewUsers * 0.05)
    }

    // Mock KYC levels (would come from actual KYC table)
    const kycLevels = {
      Basic: Math.floor(totalNewUsers * 0.52),
      Standard: Math.floor(totalNewUsers * 0.34),
      Full: Math.floor(totalNewUsers * 0.14)
    }

    // Mock conversion cohorts (would come from cohort analysis)
    const conversionCohorts = [
      { period: 'J+1', rate: 45 },
      { period: 'J+7', rate: 62 },
      { period: 'J+14', rate: 71 },
      { period: 'J+30', rate: 78 }
    ]

    return {
      overview: {
        newRegistrations: latestData.new_users || 0,
        activations: latestData.app_activations || 0,
        activationRate: latestData.new_users > 0
          ? ((latestData.app_activations / latestData.new_users) * 100).toFixed(2)
          : 0,
        reactivations: Math.floor((latestData.new_users || 0) * 0.12) // Mock: 12% are reactivations
      },
      trends: {
        dailyNewUsers: userData.map(u => ({
          date: u.date,
          count: u.new_users,
          activations: u.app_activations
        })),
        growth: this.calculateGrowthRate(userData.map(u => u.new_users))
      },
      channelDistribution,
      kycLevels,
      conversionCohorts,
      period: {
        totalNewUsers,
        totalActivations,
        averageActivationRate: totalNewUsers > 0
          ? ((totalActivations / totalNewUsers) * 100).toFixed(2)
          : 0
      }
    }
  }

  calculateGrowthRate(values) {
    if (values.length < 2) return 0
    const recent = values.slice(-7).reduce((a, b) => a + b, 0) / 7
    const previous = values.slice(-14, -7).reduce((a, b) => a + b, 0) / 7
    return previous > 0 ? (((recent - previous) / previous) * 100).toFixed(2) : 0
  }
}

module.exports = new AcquisitionController()
