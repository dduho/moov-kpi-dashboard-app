const { DailyKpi, WeeklyKpis, YearlyComparison, ChannelDailyStats, RevenueByChannel } = require('../models')
const cacheService = require('../services/cacheService')

class AdvancedAnalyticsController {
  async getPerformanceDashboard(req, res, next) {
    try {
      const { date } = req.query
      const cacheKey = `performance-dashboard:${date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Get daily KPIs for the specified date
      const dailyKpis = await DailyKpi.findAll({
        where: { date },
        order: [['business_type', 'ASC']]
      })

      // Get weekly KPIs containing this date
      const weekStart = this.getWeekStartDate(date)
      const weeklyKpis = await WeeklyKpis.findAll({
        where: { week_start_date: weekStart }
      })

      // Get channel stats for the date
      const channelStats = await ChannelDailyStats.findAll({
        where: { date },
        order: [['channel', 'ASC']]
      })

      // Get revenue by channel for the date
      const revenueByChannel = await RevenueByChannel.findAll({
        where: { date },
        order: [['channel', 'ASC']]
      })

      const dashboard = {
        date,
        dailyKpis,
        weeklyKpis,
        channelStats,
        revenueByChannel,
        summary: this.calculateDashboardSummary(dailyKpis, weeklyKpis, channelStats)
      }

      await cacheService.set(cacheKey, dashboard, 300)
      res.json(dashboard)
    } catch (error) {
      next(error)
    }
  }

  async getTrendAnalysis(req, res, next) {
    try {
      const { start_date, end_date, metric = 'revenue' } = req.query
      const cacheKey = `trend-analysis:${start_date}-${end_date}:${metric}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Get daily trends
      const dailyTrends = await DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
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
      })

      // Get weekly trends
      const weeklyTrends = await WeeklyKpis.findByDateRange(start_date, end_date)

      // Get channel trends
      const channelTrends = await ChannelDailyStats.findByDateRange(start_date, end_date)

      const analysis = {
        period: { start_date, end_date },
        dailyTrends,
        weeklyTrends,
        channelTrends,
        insights: this.generateTrendInsights(dailyTrends, weeklyTrends, channelTrends, metric)
      }

      await cacheService.set(cacheKey, analysis, 300)
      res.json(analysis)
    } catch (error) {
      next(error)
    }
  }

  async getPredictiveInsights(req, res, next) {
    try {
      const { days_ahead = 7 } = req.query
      const cacheKey = `predictive-insights:${days_ahead}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Get recent data for prediction (last 30 days)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const recentData = await DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [
              startDate.toISOString().split('T')[0].replace(/-/g, ''),
              endDate.toISOString().split('T')[0].replace(/-/g, '')
            ]
          }
        },
        order: [['date', 'ASC']]
      })

      const predictions = this.generatePredictions(recentData, parseInt(days_ahead))

      await cacheService.set(cacheKey, predictions, 1800) // Cache for 30 minutes
      res.json(predictions)
    } catch (error) {
      next(error)
    }
  }

  async getChannelPerformanceAnalysis(req, res, next) {
    try {
      const { start_date, end_date } = req.query
      const cacheKey = `channel-performance:${start_date}-${end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Get channel daily stats
      const channelData = await ChannelDailyStats.findByDateRange(start_date, end_date)

      // Get revenue by channel
      const revenueData = await RevenueByChannel.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC'], ['channel', 'ASC']]
      })

      const analysis = {
        period: { start_date, end_date },
        channelPerformance: this.analyzeChannelPerformance(channelData, revenueData),
        topPerformers: this.getTopPerformingChannels(channelData),
        growthAnalysis: this.analyzeChannelGrowth(channelData)
      }

      await cacheService.set(cacheKey, analysis, 300)
      res.json(analysis)
    } catch (error) {
      next(error)
    }
  }

  async getYearOverYearComparison(req, res, next) {
    try {
      const { year, compare_with_year } = req.query
      const cacheKey = `yoy-comparison:${year}-vs-${compare_with_year}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Get data for both years
      const currentYearData = await YearlyComparison.findByYear(year)
      const previousYearData = compare_with_year ? await YearlyComparison.findByYear(compare_with_year) : null

      const comparison = {
        years: { current: year, previous: compare_with_year },
        currentYear: currentYearData,
        previousYear: previousYearData,
        analysis: this.calculateYearOverYearAnalysis(currentYearData, previousYearData)
      }

      await cacheService.set(cacheKey, comparison, 300)
      res.json(comparison)
    } catch (error) {
      next(error)
    }
  }

  // Helper methods
  calculateDashboardSummary(dailyKpis, weeklyKpis, channelStats) {
    const totalRevenue = dailyKpis.reduce((sum, kpi) => sum + parseFloat(kpi.revenue || 0), 0)
    const totalTransactions = dailyKpis.reduce((sum, kpi) => sum + parseInt(kpi.success_trx || 0), 0)

    const channelRevenue = channelStats.reduce((sum, stat) => sum + parseFloat(stat.revenue || 0), 0)
    const activeChannels = [...new Set(channelStats.map(stat => stat.channel))].length

    return {
      totalRevenue,
      totalTransactions,
      channelRevenue,
      activeChannels,
      topPerformingChannel: this.getTopChannel(channelStats)
    }
  }

  generateTrendInsights(dailyTrends, weeklyTrends, channelTrends, metric) {
    // Simple trend analysis
    const insights = []

    if (dailyTrends.length > 1) {
      const recent = dailyTrends.slice(-7) // Last 7 days
      const trend = this.calculateTrend(recent, metric)
      insights.push({
        type: 'daily_trend',
        metric,
        direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        changePercent: Math.abs(trend)
      })
    }

    if (channelTrends.length > 0) {
      const channelPerformance = this.analyzeChannelPerformance(channelTrends, [])
      insights.push({
        type: 'channel_performance',
        topChannel: channelPerformance[0]?.channel || 'N/A',
        avgRevenue: channelPerformance[0]?.avgRevenue || 0
      })
    }

    return insights
  }

  generatePredictions(recentData, daysAhead) {
    // Simple linear regression for prediction
    if (recentData.length < 7) {
      return { error: 'Insufficient data for prediction' }
    }

    const predictions = []
    const businessTypes = [...new Set(recentData.map(d => d.business_type))]

    for (const businessType of businessTypes) {
      const typeData = recentData.filter(d => d.business_type === businessType)
      if (typeData.length < 7) continue

      const revenues = typeData.map(d => parseFloat(d.revenue || 0))
      const prediction = this.linearRegression(revenues)

      predictions.push({
        businessType,
        predictedRevenue: prediction,
        confidence: this.calculateConfidence(revenues),
        daysAhead
      })
    }

    return { predictions, basedOnDays: recentData.length }
  }

  analyzeChannelPerformance(channelData, revenueData) {
    const channelSummary = {}

    channelData.forEach(stat => {
      if (!channelSummary[stat.channel]) {
        channelSummary[stat.channel] = {
          channel: stat.channel,
          totalRevenue: 0,
          totalTransactions: 0,
          days: 0,
          avgRevenue: 0,
          avgTransactions: 0
        }
      }

      channelSummary[stat.channel].totalRevenue += parseFloat(stat.revenue || 0)
      channelSummary[stat.channel].totalTransactions += parseInt(stat.transactions_count || 0)
      channelSummary[stat.channel].days += 1
    })

    // Calculate averages
    Object.values(channelSummary).forEach(summary => {
      summary.avgRevenue = summary.totalRevenue / summary.days
      summary.avgTransactions = summary.totalTransactions / summary.days
    })

    return Object.values(channelSummary).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  getTopPerformingChannels(channelData) {
    const channelTotals = {}

    channelData.forEach(stat => {
      if (!channelTotals[stat.channel]) {
        channelTotals[stat.channel] = { revenue: 0, transactions: 0 }
      }
      channelTotals[stat.channel].revenue += parseFloat(stat.revenue || 0)
      channelTotals[stat.channel].transactions += parseInt(stat.transactions_count || 0)
    })

    return Object.entries(channelTotals)
      .map(([channel, totals]) => ({ channel, ...totals }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  analyzeChannelGrowth(channelData) {
    // Group by channel and calculate growth
    const growthAnalysis = {}

    channelData.forEach(stat => {
      if (!growthAnalysis[stat.channel]) {
        growthAnalysis[stat.channel] = []
      }
      growthAnalysis[stat.channel].push({
        date: stat.date,
        revenue: parseFloat(stat.revenue || 0),
        mom_revenue_percent: parseFloat(stat.mom_revenue_percent || 0)
      })
    })

    const result = {}
    Object.entries(growthAnalysis).forEach(([channel, data]) => {
      data.sort((a, b) => a.date.localeCompare(b.date))
      const avgGrowth = data.reduce((sum, d) => sum + d.mom_revenue_percent, 0) / data.length
      result[channel] = {
        averageMonthlyGrowth: avgGrowth,
        dataPoints: data.length,
        latestGrowth: data[data.length - 1]?.mom_revenue_percent || 0
      }
    })

    return result
  }

  calculateYearOverYearAnalysis(currentYear, previousYear) {
    if (!previousYear || previousYear.length === 0) {
      return { note: 'No previous year data available for comparison' }
    }

    const analysis = {
      monthlyComparisons: [],
      overallGrowth: 0
    }

    // Group by month
    const currentByMonth = this.groupByMonth(currentYear)
    const previousByMonth = this.groupByMonth(previousYear)

    for (let month = 1; month <= 12; month++) {
      const current = currentByMonth[month] || []
      const previous = previousByMonth[month] || []

      const currentTotal = current.reduce((sum, d) => sum + parseFloat(d.value || 0), 0)
      const previousTotal = previous.reduce((sum, d) => sum + parseFloat(d.value || 0), 0)

      const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

      analysis.monthlyComparisons.push({
        month,
        currentTotal,
        previousTotal,
        growthPercent: growth
      })
    }

    analysis.overallGrowth = analysis.monthlyComparisons.reduce((sum, m) => sum + m.growthPercent, 0) / 12

    return analysis
  }

  // Utility methods
  getWeekStartDate(dateStr) {
    const date = new Date(
      dateStr.substring(0, 4),
      dateStr.substring(4, 6) - 1,
      dateStr.substring(6, 8)
    )
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date.setDate(diff))

    const year = weekStart.getFullYear()
    const month = String(weekStart.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(weekStart.getDate()).padStart(2, '0')
    return `${year}${month}${dayOfMonth}`
  }

  calculateTrend(data, metric) {
    if (data.length < 2) return 0

    const values = data.map(d => {
      switch (metric) {
        case 'revenue': return parseFloat(d.total_revenue || d.revenue || 0)
        case 'transactions': return parseInt(d.total_transactions || d.success_trx || 0)
        case 'amount': return parseFloat(d.total_amount || d.amount || 0)
        default: return 0
      }
    })

    const first = values[0]
    const last = values[values.length - 1]

    return first > 0 ? ((last - first) / first) * 100 : 0
  }

  linearRegression(values) {
    const n = values.length
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

  getTopChannel(channelStats) {
    if (channelStats.length === 0) return null

    return channelStats.reduce((top, stat) => {
      return parseFloat(stat.revenue || 0) > parseFloat(top.revenue || 0) ? stat : top
    })
  }

  groupByMonth(data) {
    return data.reduce((groups, item) => {
      const month = item.month
      if (!groups[month]) {
        groups[month] = []
      }
      groups[month].push(item)
      return groups
    }, {})
  }
}

module.exports = new AdvancedAnalyticsController()