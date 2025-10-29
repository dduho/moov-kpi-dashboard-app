const { ActiveUsers } = require('../models')
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
          clients: 0,
          agents: 0,
          merchants: 0,
          new_registrations: 0,
          app_users: 0
        },
        average: {
          clients: 0,
          agents: 0,
          merchants: 0,
          new_registrations: 0,
          app_users: 0
        },
        latest: {
          clients: 0,
          agents: 0,
          merchants: 0,
          new_registrations: 0,
          app_users: 0,
          mom_evolution: 0
        }
      }
    }

    const summary = {
      total: {
        clients: 0,
        agents: 0,
        merchants: 0,
        new_registrations: 0,
        app_users: 0
      },
      average: {
        clients: 0,
        agents: 0,
        merchants: 0,
        new_registrations: 0,
        app_users: 0
      },
      latest: null
    }

    userData.forEach(item => {
      summary.total.clients += item.clients || 0
      summary.total.agents += item.agents || 0
      summary.total.merchants += item.merchants || 0
      summary.total.new_registrations += item.new_registrations || 0
      summary.total.app_users += item.app_users || 0
    })

    const count = userData.length
    summary.average.clients = Math.round(summary.total.clients / count)
    summary.average.agents = Math.round(summary.total.agents / count)
    summary.average.merchants = Math.round(summary.total.merchants / count)
    summary.average.new_registrations = Math.round(summary.total.new_registrations / count)
    summary.average.app_users = Math.round(summary.total.app_users / count)

    // Get latest record
    const latestRecord = userData[userData.length - 1]
    summary.latest = {
      date: latestRecord.date,
      clients: latestRecord.clients || 0,
      agents: latestRecord.agents || 0,
      merchants: latestRecord.merchants || 0,
      new_registrations: latestRecord.new_registrations || 0,
      app_users: latestRecord.app_users || 0,
      mom_evolution: latestRecord.mom_evolution || 0
    }

    return summary
  }

  calculateUserTrends(userData) {
    return userData.map(item => ({
      date: item.date,
      clients: item.clients || 0,
      agents: item.agents || 0,
      merchants: item.merchants || 0,
      new_registrations: item.new_registrations || 0,
      app_users: item.app_users || 0,
      total_active: item.total_active || 0,
      mom_evolution: item.mom_evolution || 0
    }))
  }
}

module.exports = new UserController()