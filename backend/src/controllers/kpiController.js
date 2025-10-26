const { DailyKpi, HourlyKpi, WeeklyKpis, ActiveUsers, HourlyPerformance, ComparativeAnalytics } = require('../models')
const cacheService = require('../services/cacheService')

class KpiController {
  async getDailyKpis(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `daily-kpis:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const kpis = await DailyKpi.findAll({
        where: { date },
        order: [['business_type', 'ASC']]
      })

      await cacheService.set(cacheKey, kpis, 300)
      res.json(kpis)
    } catch (error) {
      next(error)
    }
  }

  async getDailyKpisByDateRange(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `daily-kpis-range:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const kpis = await DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC'], ['business_type', 'ASC']]
      })

      await cacheService.set(cacheKey, kpis, 300)
      res.json(kpis)
    } catch (error) {
      next(error)
    }
  }

  async getHourlyKpis(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `hourly-kpis:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const kpis = await HourlyKpi.findAll({
        where: { date },
        order: [['hour', 'ASC'], ['txn_type_name', 'ASC']]
      })

      await cacheService.set(cacheKey, kpis, 300)
      res.json(kpis)
    } catch (error) {
      next(error)
    }
  }

  async getComparisons(req, res, next) {
    try {
      const { date, compare_with } = req.query
      const cacheKey = `comparisons:${date}:${compare_with}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      let comparisonDate
      if (compare_with === 'previous_day') {
        comparisonDate = this.getPreviousDate(date)
      } else if (compare_with === 'previous_week') {
        comparisonDate = this.getPreviousWeek(date)
      } else if (compare_with === 'previous_month') {
        comparisonDate = this.getPreviousMonth(date)
      }

      const [current, previous] = await Promise.all([
        DailyKpi.findAll({ where: { date } }),
        DailyKpi.findAll({ where: { date: comparisonDate } })
      ])

      const comparisons = this.calculateComparisons(current, previous, compare_with)

      await cacheService.set(cacheKey, comparisons, 300)
      res.json(comparisons)
    } catch (error) {
      next(error)
    }
  }

  calculateComparisons(current, previous, type) {
    const comparisons = {}

    current.forEach(curr => {
      const prev = previous.find(p => p.business_type === curr.business_type)
      if (prev) {
        comparisons[curr.business_type] = {
          current: {
            transactions: curr.success_trx,
            amount: parseFloat(curr.amount),
            revenue: parseFloat(curr.revenue)
          },
          previous: {
            transactions: prev.success_trx,
            amount: parseFloat(prev.amount),
            revenue: parseFloat(prev.revenue)
          },
          changes: {
            transactions: this.calculateChange(curr.success_trx, prev.success_trx),
            amount: this.calculateChange(parseFloat(curr.amount), parseFloat(prev.amount)),
            revenue: this.calculateChange(parseFloat(curr.revenue), parseFloat(prev.revenue))
          }
        }
      }
    })

    return comparisons
  }

  calculateChange(current, previous) {
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

  getPreviousWeek(dateStr) {
    const date = new Date(
      dateStr.substring(0, 4),
      dateStr.substring(4, 6) - 1,
      dateStr.substring(6, 8)
    )
    date.setDate(date.getDate() - 7)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  getPreviousMonth(dateStr) {
    const date = new Date(
      dateStr.substring(0, 4),
      dateStr.substring(4, 6) - 1,
      dateStr.substring(6, 8)
    )
    date.setMonth(date.getMonth() - 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  getWeekStartDate(dateStr) {
    const date = new Date(
      dateStr.substring(0, 4),
      dateStr.substring(4, 6) - 1,
      dateStr.substring(6, 8)
    )
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    const weekStart = new Date(date.setDate(diff))

    const year = weekStart.getFullYear()
    const month = String(weekStart.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(weekStart.getDate()).padStart(2, '0')
    return `${year}${month}${dayOfMonth}`
  }

  async getWeeklyKpis(req, res, next) {
    try {
      const { date, week_start } = req.query
      let cacheKey, kpis

      if (week_start) {
        cacheKey = `weekly-kpis:${week_start}`
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        kpis = await WeeklyKpis.findAll({
          where: { week_start_date: week_start },
          order: [['week_start_date', 'ASC']]
        })
      } else if (date) {
        // Find the week containing the specified date
        const weekStart = this.getWeekStartDate(date)
        cacheKey = `weekly-kpis:${weekStart}`
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        kpis = await WeeklyKpis.findAll({
          where: { week_start_date: weekStart },
          order: [['week_start_date', 'ASC']]
        })
      } else {
        // Get latest weekly KPIs
        cacheKey = 'weekly-kpis:latest'
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        kpis = await WeeklyKpis.findAll({
          order: [['week_start_date', 'DESC']],
          limit: 4 // Last 4 weeks
        })
      }

      await cacheService.set(cacheKey, kpis, 300)
      res.json(kpis)
    } catch (error) {
      next(error)
    }
  }

  async getActiveUsers(req, res, next) {
    try {
      const { date, start_date, end_date } = req.query
      let cacheKey, users

      if (date) {
        cacheKey = `active-users:${date}`
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        users = await ActiveUsers.findAll({
          where: { date },
          order: [['business_type', 'ASC']]
        })
      } else if (start_date && end_date) {
        cacheKey = `active-users-range:${start_date}-${end_date}`
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        users = await ActiveUsers.findAll({
          where: {
            date: {
              [require('sequelize').Op.between]: [start_date, end_date]
            }
          },
          order: [['date', 'ASC'], ['business_type', 'ASC']]
        })
      } else {
        // Get latest active users data
        cacheKey = 'active-users:latest'
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        users = await ActiveUsers.findAll({
          order: [['date', 'DESC']],
          limit: 30 // Last 30 days
        })
      }

      await cacheService.set(cacheKey, users, 300)
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  async getHourlyPerformance(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `hourly-performance:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const performance = await HourlyPerformance.findAll({
        where: { date },
        order: [['hour', 'ASC']]
      })

      await cacheService.set(cacheKey, performance, 300)
      res.json(performance)
    } catch (error) {
      next(error)
    }
  }

  async getComparativeAnalytics(req, res, next) {
    try {
      const { date, business_type } = req.query
      const cacheKey = `comparative-analytics:${date}:${business_type || 'all'}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const whereClause = { date }
      if (business_type) {
        whereClause.business_type = business_type
      }

      const analytics = await ComparativeAnalytics.findAll({
        where: whereClause,
        order: [['business_type', 'ASC']]
      })

      await cacheService.set(cacheKey, analytics, 300)
      res.json(analytics)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new KpiController()