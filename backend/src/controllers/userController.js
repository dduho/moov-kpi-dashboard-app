const ActiveUsers = require('../models/ActiveUsers')
const cacheService = require('../services/cacheService')

class UserController {
  async getActiveUsers(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `active-users:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const userData = await ActiveUsers.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const summary = this.calculateUserSummary(userData)

      await cacheService.set(cacheKey, summary, 300)
      res.json(summary)
    } catch (error) {
      next(error)
    }
  }

  async getUserTrends(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `user-trends:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const userData = await ActiveUsers.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const trends = this.calculateUserTrends(userData)

      await cacheService.set(cacheKey, trends, 300)
      res.json(trends)
    } catch (error) {
      next(error)
    }
  }

  calculateUserSummary(userData) {
    if (userData.length === 0) {
      return {
        total: {
          dau: 0,
          mau: 0,
          newUsers: 0,
          appActivations: 0
        },
        average: {
          dau: 0,
          mau: 0,
          newUsers: 0,
          appActivations: 0
        }
      }
    }

    const summary = {
      total: {
        dau: 0,
        mau: 0,
        newUsers: 0,
        appActivations: 0
      },
      average: {
        dau: 0,
        mau: 0,
        newUsers: 0,
        appActivations: 0
      }
    }

    userData.forEach(item => {
      summary.total.dau += item.dau
      summary.total.mau += item.mau
      summary.total.newUsers += item.new_users
      summary.total.appActivations += item.app_activations
    })

    const count = userData.length
    summary.average.dau = Math.round(summary.total.dau / count)
    summary.average.mau = Math.round(summary.total.mau / count)
    summary.average.newUsers = Math.round(summary.total.newUsers / count)
    summary.average.appActivations = Math.round(summary.total.appActivations / count)

    return summary
  }

  calculateUserTrends(userData) {
    return userData.map(item => ({
      date: item.date,
      dau: item.dau,
      mau: item.mau,
      newUsers: item.new_users,
      appActivations: item.app_activations,
      retentionRate: item.mau > 0 ? (item.dau / item.mau * 100).toFixed(2) : 0
    }))
  }
}

module.exports = new UserController()