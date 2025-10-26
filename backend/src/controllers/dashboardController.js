const { DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers } = require('../models')
const cacheService = require('../services/cacheService')

class DashboardController {
  async getDashboardData(req, res, next) {
    try {
      const { date, startDate, endDate } = req.query
      const cacheKey = `dashboard:${date || startDate + '-' + endDate}`

      // Check cache first
      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // Determine date range
      const dateRange = this.parseDateRange(date, startDate, endDate)

      // Fetch all required data in parallel
      const [
        dailyKpis,
        hourlyKpis,
        imtTransactions,
        revenueByChannel,
        activeUsers,
        comparisons
      ] = await Promise.all([
        DailyKpi.findByDateRange(dateRange.start, dateRange.end),
        HourlyKpi.findByDateRange(dateRange.start, dateRange.end),
        ImtTransaction.findByDateRange(dateRange.start, dateRange.end),
        RevenueByChannel.findByDateRange(dateRange.start, dateRange.end),
        ActiveUsers.findByDateRange(dateRange.start, dateRange.end),
        this.getComparisons(dateRange.end)
      ])

      const dashboardData = {
        date: dateRange.end,
        dateRange,
        // 1. Global KPIs
        globalKpis: this.calculateGlobalKpis(dailyKpis, comparisons),
        // 2. Business Type KPIs
        businessTypeKpis: this.calculateBusinessTypeKpis(dailyKpis),
        // 3. Hourly KPIs
        hourlyKpis: this.calculateHourlyKpis(hourlyKpis),
        // 4. International KPIs (IMT)
        imtKpis: this.calculateImtKpis(imtTransactions),
        // 5. User KPIs
        userKpis: this.calculateUserKpis(activeUsers),
        // 6. Financial KPIs
        financialKpis: this.calculateFinancialKpis(revenueByChannel),
        // 7. Trend KPIs
        trendKpis: this.calculateTrendKpis(dailyKpis),
        // 8. Quality KPIs
        qualityKpis: this.calculateQualityKpis(dailyKpis, hourlyKpis),
        // Charts data
        charts: {
          hourlyTrends: this.formatHourlyTrends(hourlyKpis),
          businessBreakdown: this.getBusinessBreakdown(dailyKpis),
          revenueByChannel: this.formatRevenueByChannel(revenueByChannel),
          imtByCountry: this.formatImtByCountry(imtTransactions),
          userTrends: this.formatUserTrends(activeUsers)
        },
        lastUpdated: new Date()
      }

      // Cache for 5 minutes
      await cacheService.set(cacheKey, dashboardData, 300)

      res.json(dashboardData)
    } catch (error) {
      next(error)
    }
  }

  parseDateRange(date, startDate, endDate) {
    if (date) {
      return { start: date, end: date }
    }
    return {
      start: startDate || this.getDefaultStartDate(),
      end: endDate || this.getDefaultEndDate()
    }
  }

  getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30) // Last 30 days
    return this.formatDate(date)
  }

  getDefaultEndDate() {
    const date = new Date()
    date.setDate(date.getDate() - 1) // Use yesterday's date since today's data is not yet available
    return this.formatDate(date)
  }

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  calculateGlobalKpis(dailyKpis, comparisons) {
    const summary = this.calculateSummary(dailyKpis)

    return {
      // 1.1 Vue d'ensemble quotidienne
      overview: {
        totalTransactions: {
          current: summary.totalTransactions,
          previous: comparisons?.previous?.totalTransactions || 0,
          change: this.calculateChange(summary.totalTransactions, comparisons?.previous?.totalTransactions || 0),
          trend7d: [], // Will be calculated from historical data
          trend30d: []
        },
        totalVolume: {
          current: summary.totalAmount,
          previous: comparisons?.previous?.totalAmount || 0,
          change: this.calculateChange(summary.totalAmount, comparisons?.previous?.totalAmount || 0),
          trend7d: [],
          trend30d: []
        },
        totalRevenue: {
          current: summary.totalRevenue,
          previous: comparisons?.previous?.totalRevenue || 0,
          change: this.calculateChange(summary.totalRevenue, comparisons?.previous?.totalRevenue || 0),
          breakdown: {
            commission: summary.totalCommission,
            tax: summary.totalTax
          },
          trend7d: [],
          trend30d: []
        },
        successRate: {
          rate: summary.successRate,
          failed: summary.totalFailed,
          expired: summary.totalExpired,
          pending: summary.totalPending
        }
      },
      // 1.2 Indicateurs de performance
      performance: {
        averageTransactionValue: this.calculateAverageTransactionValue(dailyKpis),
        revenueRate: this.calculateRevenueRate(summary),
        commissionRate: this.calculateCommissionRate(summary),
        taxCollection: summary.totalTax
      }
    }
  }

  calculateBusinessTypeKpis(dailyKpis) {
    const businessTypes = {}

    dailyKpis.forEach(kpi => {
      const type = kpi.business_type || 'OTHER'
      if (!businessTypes[type]) {
        businessTypes[type] = {
          totalTrans: 0,
          totalSuccess: 0,
          totalFailed: 0,
          totalPending: 0,
          totalAmount: 0,
          totalFee: 0,
          totalCommission: 0,
          totalTax: 0,
          successRate: 0
        }
      }

      const business = businessTypes[type]
      business.totalTrans += kpi.success_trx + (kpi.failed_trx || 0)
      business.totalSuccess += kpi.success_trx
      business.totalFailed += kpi.failed_trx || 0
      business.totalPending += kpi.expired_trx || 0
      business.totalAmount += parseFloat(kpi.amount || 0)
      business.totalFee += parseFloat(kpi.revenue || 0) - parseFloat(kpi.commission || 0) - parseFloat(kpi.tax || 0)
      business.totalCommission += parseFloat(kpi.commission || 0)
      business.totalTax += parseFloat(kpi.tax || 0)
      business.successRate = business.totalTrans > 0 ? (business.totalSuccess / business.totalTrans) * 100 : 0
    })

    return businessTypes
  }

  calculateHourlyKpis(hourlyKpis) {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: { current: 0, previous: 0, change: 0, percentageOfDay: 0 },
      amount: { current: 0, previous: 0, change: 0, percentageOfDay: 0 },
      revenue: { current: 0, previous: 0, change: 0, percentageOfDay: 0 },
      breakdown: {}
    }))

    // Group by hour and transaction type
    const hourlyMap = new Map()

    hourlyKpis.forEach(kpi => {
      const key = `${kpi.date}-${kpi.hour}`
      if (!hourlyMap.has(key)) {
        hourlyMap.set(key, {
          date: kpi.date,
          hour: kpi.hour,
          transactions: 0,
          amount: 0,
          revenue: 0,
          breakdown: {}
        })
      }

      const hourData = hourlyMap.get(key)
      hourData.transactions += kpi.total_success
      hourData.amount += parseFloat(kpi.total_amount || 0)
      hourData.revenue += parseFloat(kpi.total_commission || 0) + parseFloat(kpi.total_tax || 0)

      // Breakdown by transaction type
      const txnType = kpi.txn_type_name || 'OTHER'
      if (!hourData.breakdown[txnType]) {
        hourData.breakdown[txnType] = {
          transactions: 0,
          amount: 0,
          revenue: 0
        }
      }
      hourData.breakdown[txnType].transactions += kpi.total_success
      hourData.breakdown[txnType].amount += parseFloat(kpi.total_amount || 0)
      hourData.breakdown[txnType].revenue += parseFloat(kpi.total_commission || 0) + parseFloat(kpi.total_tax || 0)
    })

    // Calculate daily totals and percentages
    const dailyTotals = this.calculateDailyTotals(hourlyMap)

    Array.from(hourlyMap.values()).forEach(hourData => {
      const hourIndex = hourData.hour
      const dayTotal = dailyTotals[hourData.date]

      hourlyData[hourIndex].count.current = hourData.transactions
      hourlyData[hourIndex].amount.current = hourData.amount
      hourlyData[hourIndex].revenue.current = hourData.revenue
      hourlyData[hourIndex].breakdown = hourData.breakdown

      if (dayTotal) {
        hourlyData[hourIndex].count.percentageOfDay = dayTotal.transactions > 0 ? (hourData.transactions / dayTotal.transactions) * 100 : 0
        hourlyData[hourIndex].amount.percentageOfDay = dayTotal.amount > 0 ? (hourData.amount / dayTotal.amount) * 100 : 0
        hourlyData[hourIndex].revenue.percentageOfDay = dayTotal.revenue > 0 ? (hourData.revenue / dayTotal.revenue) * 100 : 0
      }
    })

    return {
      distribution: hourlyData,
      analysis: {
        peakHours: this.findPeakHours(hourlyData),
        lowActivityPeriods: this.findLowActivityPeriods(hourlyData),
        trends: this.calculateHourlyTrends(hourlyData)
      }
    }
  }

  calculateImtKpis(imtTransactions) {
    const countries = {}
    const flows = {}

    imtTransactions.forEach(imt => {
      // Group by country
      const country = imt.country || 'UNKNOWN'
      if (!countries[country]) {
        countries[country] = {
          totalTransactions: 0,
          totalAmount: 0,
          revenue: 0,
          successRate: 0,
          flows: {}
        }
      }

      const countryData = countries[country]
      countryData.totalTransactions += imt.total_success + imt.total_failed
      countryData.totalAmount += parseFloat(imt.amount || 0)
      countryData.revenue += parseFloat(imt.revenue || 0)
      countryData.successRate = countryData.totalTransactions > 0 ?
        (imt.total_success / countryData.totalTransactions) * 100 : 0

      // Group by flow type
      const flow = imt.imt_business || 'UNKNOWN'
      if (!flows[flow]) {
        flows[flow] = {
          count: 0,
          amount: 0,
          revenue: 0,
          commission: 0,
          tax: 0,
          successRate: 0,
          balance: 0
        }
      }

      const flowData = flows[flow]
      flowData.count += imt.total_success
      flowData.amount += parseFloat(imt.amount || 0)
      flowData.revenue += parseFloat(imt.revenue || 0)
      flowData.commission += parseFloat(imt.commission || 0)
      flowData.tax += parseFloat(imt.tax || 0)
      flowData.balance += parseFloat(imt.balance || 0)
      flowData.successRate = (imt.total_success / (imt.total_success + imt.total_failed)) * 100

      // Link flow to country
      if (!countryData.flows[flow]) {
        countryData.flows[flow] = {
          count: 0,
          amount: 0,
          revenue: 0
        }
      }
      countryData.flows[flow].count += imt.total_success
      countryData.flows[flow].amount += parseFloat(imt.amount || 0)
      countryData.flows[flow].revenue += parseFloat(imt.revenue || 0)
    })

    return {
      byCountry: countries,
      byFlow: flows,
      ratios: this.calculateImtRatios(flows)
    }
  }

  calculateUserKpis(activeUsers) {
    const sortedUsers = activeUsers.sort((a, b) => new Date(a.date) - new Date(b.date))

    return {
      activity: {
        dau: {
          current: sortedUsers[sortedUsers.length - 1]?.dau || 0,
          average30d: this.calculateAverage(sortedUsers.map(u => u.dau)),
          trend: this.calculateTrend(sortedUsers.map(u => u.dau))
        },
        mau: {
          current: sortedUsers[sortedUsers.length - 1]?.mau || 0,
          trend: this.calculateTrend(sortedUsers.map(u => u.mau))
        }
      },
      acquisition: {
        newUsers: {
          daily: sortedUsers[sortedUsers.length - 1]?.new_users || 0,
          monthly: this.sumArray(sortedUsers.map(u => u.new_users)),
          trend: this.calculateTrend(sortedUsers.map(u => u.new_users))
        },
        retention: {
          // Calculate retention metrics
          recurringUsers: this.calculateRecurringUsers(sortedUsers),
          retentionRate: this.calculateRetentionRate(sortedUsers)
        }
      },
      appActivation: {
        activations: sortedUsers[sortedUsers.length - 1]?.app_activations || 0,
        trend: this.calculateTrend(sortedUsers.map(u => u.app_activations))
      }
    }
  }

  calculateFinancialKpis(revenueByChannel) {
    const channels = {}

    revenueByChannel.forEach(channel => {
      const channelName = channel.channel || 'UNKNOWN'
      if (!channels[channelName]) {
        channels[channelName] = {
          transactionCount: 0,
          amount: 0,
          revenue: 0,
          commission: 0,
          tax: 0,
          netRevenue: 0
        }
      }

      const ch = channels[channelName]
      ch.transactionCount += channel.transaction_count || 0
      ch.amount += parseFloat(channel.amount || 0)
      ch.revenue += parseFloat(channel.revenue || 0)
      ch.commission += parseFloat(channel.commission || 0)
      ch.tax += parseFloat(channel.tax || 0)
      ch.netRevenue = ch.revenue - ch.commission - ch.tax
    })

    return {
      byChannel: channels,
      comparisons: this.calculateFinancialComparisons(channels),
      rates: this.calculateFinancialRates(channels)
    }
  }

  calculateTrendKpis(dailyKpis) {
    // Group by date for trend analysis
    const dateGroups = {}
    dailyKpis.forEach(kpi => {
      if (!dateGroups[kpi.date]) {
        dateGroups[kpi.date] = {
          transactions: 0,
          amount: 0,
          revenue: 0
        }
      }
      dateGroups[kpi.date].transactions += kpi.success_trx
      dateGroups[kpi.date].amount += parseFloat(kpi.amount)
      dateGroups[kpi.date].revenue += parseFloat(kpi.revenue)
    })

    const dates = Object.keys(dateGroups).sort()
    const values = dates.map(date => dateGroups[date])

    return {
      dailyEvolution: {
        transactions7d: this.calculateMovingAverage(values.map(v => v.transactions), 7),
        transactions30d: this.calculateMovingAverage(values.map(v => v.transactions), 30),
        amount7d: this.calculateMovingAverage(values.map(v => v.amount), 7),
        amount30d: this.calculateMovingAverage(values.map(v => v.amount), 30),
        revenue7d: this.calculateMovingAverage(values.map(v => v.revenue), 7),
        revenue30d: this.calculateMovingAverage(values.map(v => v.revenue), 30)
      },
      patterns: {
        seasonality: this.detectSeasonality(values),
        growth: this.calculateGrowthMetrics(values)
      },
      forecasting: {
        projectedRevenue: this.calculateProjection(values.map(v => v.revenue)),
        expectedVolume: this.calculateProjection(values.map(v => v.transactions))
      }
    }
  }

  calculateQualityKpis(dailyKpis, hourlyKpis) {
    const totalTransactions = dailyKpis.reduce((sum, kpi) => sum + kpi.success_trx + (kpi.failed_trx || 0), 0)
    const totalSuccess = dailyKpis.reduce((sum, kpi) => sum + kpi.success_trx, 0)
    const totalFailed = dailyKpis.reduce((sum, kpi) => sum + (kpi.failed_trx || 0), 0)
    const totalExpired = dailyKpis.reduce((sum, kpi) => sum + (kpi.expired_trx || 0), 0)

    // Group by business type for detailed analysis
    const byBusinessType = {}
    dailyKpis.forEach(kpi => {
      const type = kpi.business_type || 'OTHER'
      if (!byBusinessType[type]) {
        byBusinessType[type] = {
          total: 0,
          success: 0,
          failed: 0,
          expired: 0,
          successRate: 0
        }
      }
      const bt = byBusinessType[type]
      bt.total += kpi.success_trx + (kpi.failed_trx || 0) + (kpi.expired_trx || 0)
      bt.success += kpi.success_trx
      bt.failed += kpi.failed_trx || 0
      bt.expired += kpi.expired_trx || 0
      bt.successRate = bt.total > 0 ? (bt.success / bt.total) * 100 : 0
    })

    // Group by hour for time-based analysis
    const byHour = Array.from({ length: 24 }, () => ({
      total: 0,
      success: 0,
      failed: 0,
      successRate: 0
    }))

    hourlyKpis.forEach(kpi => {
      const hour = kpi.hour
      byHour[hour].total += kpi.total_success + kpi.total_failed
      byHour[hour].success += kpi.total_success
      byHour[hour].failed += kpi.total_failed
      byHour[hour].successRate = byHour[hour].total > 0 ?
        (byHour[hour].success / byHour[hour].total) * 100 : 0
    })

    return {
      transactionQuality: {
        global: {
          totalTransactions,
          successRate: totalTransactions > 0 ? (totalSuccess / totalTransactions) * 100 : 0,
          failureRate: totalTransactions > 0 ? (totalFailed / totalTransactions) * 100 : 0,
          expiredRate: totalTransactions > 0 ? (totalExpired / totalTransactions) * 100 : 0
        },
        byBusinessType,
        byHour,
        byChannel: {} // Would need channel data
      },
      failureAnalysis: {
        totalFailed,
        failureRate: totalTransactions > 0 ? (totalFailed / totalTransactions) * 100 : 0,
        reasons: {} // Would need failure reason data
      },
      operationalMetrics: {
        processingTime: {
          average: 0, // Would need processing time data
          byType: {}
        },
        systemHealth: {
          successRateTrend: this.calculateSuccessRateTrend(dailyKpis),
          failureSpikes: this.detectFailureSpikes(dailyKpis)
        }
      }
    }
  }

  // Helper methods
  calculateSummary(dailyKpis) {
    return dailyKpis.reduce((acc, kpi) => {
      acc.totalTransactions += kpi.success_trx
      acc.totalAmount += parseFloat(kpi.amount || 0)
      acc.totalRevenue += parseFloat(kpi.revenue || 0)
      acc.totalCommission += parseFloat(kpi.commission || 0)
      acc.totalTax += parseFloat(kpi.tax || 0)
      acc.totalFailed += kpi.failed_trx || 0
      acc.totalExpired += kpi.expired_trx || 0
      acc.totalPending += kpi.pending_trx || 0
      return acc
    }, {
      totalTransactions: 0,
      totalAmount: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalTax: 0,
      totalFailed: 0,
      totalExpired: 0,
      totalPending: 0,
      successRate: 0
    })
  }

  calculateChange(current, previous) {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(2)
  }

  calculateAverageTransactionValue(dailyKpis) {
    const byBusinessType = {}
    dailyKpis.forEach(kpi => {
      const type = kpi.business_type || 'OTHER'
      if (!byBusinessType[type]) {
        byBusinessType[type] = { amount: 0, transactions: 0 }
      }
      byBusinessType[type].amount += parseFloat(kpi.amount || 0)
      byBusinessType[type].transactions += kpi.success_trx
    })

    Object.keys(byBusinessType).forEach(type => {
      const data = byBusinessType[type]
      byBusinessType[type].averageValue = data.transactions > 0 ? data.amount / data.transactions : 0
    })

    return byBusinessType
  }

  calculateRevenueRate(summary) {
    return summary.totalAmount > 0 ? (summary.totalRevenue / summary.totalAmount) * 100 : 0
  }

  calculateCommissionRate(summary) {
    return summary.totalAmount > 0 ? (summary.totalCommission / summary.totalAmount) * 100 : 0
  }

  formatHourlyTrends(hourlyKpis) {
    const hourlyMap = new Map()

    hourlyKpis.forEach(kpi => {
      if (!hourlyMap.has(kpi.hour)) {
        hourlyMap.set(kpi.hour, {
          hour: kpi.hour,
          transactions: 0,
          amount: 0,
          revenue: 0
        })
      }

      const hourData = hourlyMap.get(kpi.hour)
      hourData.transactions += kpi.total_success
      hourData.amount += parseFloat(kpi.total_amount || 0)
      hourData.revenue += parseFloat(kpi.total_commission || 0) + parseFloat(kpi.total_tax || 0)
    })

    return Array.from(hourlyMap.values()).sort((a, b) => a.hour - b.hour)
  }

  getBusinessBreakdown(dailyKpis) {
    const breakdown = {}

    dailyKpis.forEach(kpi => {
      if (!breakdown[kpi.business_type]) {
        breakdown[kpi.business_type] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          successRate: 0
        }
      }

      const business = breakdown[kpi.business_type]
      business.transactions += kpi.success_trx
      business.amount += parseFloat(kpi.amount || 0)
      business.revenue += parseFloat(kpi.revenue || 0)
      business.successRate = parseFloat(kpi.success_rate || 0)
    })

    return breakdown
  }

  formatRevenueByChannel(revenueByChannel) {
    return revenueByChannel.map(channel => ({
      channel: channel.channel,
      revenue: parseFloat(channel.revenue || 0),
      commission: parseFloat(channel.commission || 0),
      tax: parseFloat(channel.tax || 0),
      netRevenue: parseFloat(channel.revenue || 0) - parseFloat(channel.commission || 0) - parseFloat(channel.tax || 0)
    }))
  }

  formatImtByCountry(imtTransactions) {
    const countries = {}
    imtTransactions.forEach(imt => {
      const country = imt.country || 'UNKNOWN'
      if (!countries[country]) {
        countries[country] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          successRate: 0
        }
      }
      countries[country].transactions += imt.total_success
      countries[country].amount += parseFloat(imt.amount || 0)
      countries[country].revenue += parseFloat(imt.revenue || 0)
      countries[country].successRate = (imt.total_success / (imt.total_success + imt.total_failed)) * 100
    })
    return countries
  }

  formatUserTrends(activeUsers) {
    return activeUsers.map(user => ({
      date: user.date,
      dau: user.dau,
      mau: user.mau,
      newUsers: user.new_users,
      activations: user.app_activations
    }))
  }

  // Additional helper methods
  calculateDailyTotals(hourlyMap) {
    const dailyTotals = {}
    Array.from(hourlyMap.values()).forEach(hourData => {
      if (!dailyTotals[hourData.date]) {
        dailyTotals[hourData.date] = {
          transactions: 0,
          amount: 0,
          revenue: 0
        }
      }
      dailyTotals[hourData.date].transactions += hourData.transactions
      dailyTotals[hourData.date].amount += hourData.amount
      dailyTotals[hourData.date].revenue += hourData.revenue
    })
    return dailyTotals
  }

  findPeakHours(hourlyData) {
    const sorted = [...hourlyData].sort((a, b) =>
      b.count.current - a.count.current
    )
    return sorted.slice(0, 3).map(h => ({
      hour: h.hour,
      transactions: h.count.current,
      percentageOfDay: h.count.percentageOfDay
    }))
  }

  findLowActivityPeriods(hourlyData) {
    const sorted = [...hourlyData].sort((a, b) =>
      a.count.current - b.count.current
    )
    return sorted.slice(0, 3).map(h => ({
      hour: h.hour,
      transactions: h.count.current,
      percentageOfDay: h.count.percentageOfDay
    }))
  }

  calculateHourlyTrends(hourlyData) {
    const totalTransactions = hourlyData.reduce((sum, h) => sum + h.count.current, 0)
    const avgPerHour = totalTransactions / 24
    return {
      averagePerHour: Math.round(avgPerHour),
      peakHour: hourlyData.reduce((max, h) =>
        h.count.current > max.count.current ? h : max
      ).hour,
      lowHour: hourlyData.reduce((min, h) =>
        h.count.current < min.count.current ? h : min
      ).hour
    }
  }

  calculateImtRatios(flows) {
    const totalAmount = Object.values(flows).reduce((sum, f) => sum + f.amount, 0)
    const totalCount = Object.values(flows).reduce((sum, f) => sum + f.count, 0)

    const ratios = {}
    Object.entries(flows).forEach(([flow, data]) => {
      ratios[flow] = {
        amountPercentage: totalAmount > 0 ? ((data.amount / totalAmount) * 100).toFixed(2) : 0,
        countPercentage: totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(2) : 0,
        avgTicket: data.count > 0 ? (data.amount / data.count).toFixed(2) : 0
      }
    })
    return ratios
  }

  calculateAverage(arr) {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  }

  calculateTrend(arr) {
    if (arr.length < 2) return []
    const trends = []
    for (let i = 1; i < arr.length; i++) {
      const change = arr[i] - arr[i - 1]
      const changePercent = arr[i - 1] !== 0 ? ((change / arr[i - 1]) * 100).toFixed(2) : 0
      trends.push({ value: arr[i], change, changePercent })
    }
    return trends
  }

  sumArray(arr) {
    return arr.reduce((a, b) => a + b, 0)
  }

  calculateRecurringUsers(users) {
    if (users.length < 2) return 0
    const latest = users[users.length - 1]
    const previous = users[users.length - 2]
    return Math.max(0, latest.dau - latest.new_users)
  }

  calculateRetentionRate(users) {
    if (users.length < 30) return 0
    const thirtyDaysAgo = users[users.length - 30]
    const latest = users[users.length - 1]
    const retained = latest.dau - latest.new_users
    return thirtyDaysAgo.new_users > 0
      ? ((retained / thirtyDaysAgo.new_users) * 100).toFixed(2)
      : 0
  }

  calculateFinancialComparisons(channels) {
    const comparisons = {}
    const channelArray = Object.entries(channels)

    channelArray.forEach(([name, data], index) => {
      if (index > 0) {
        const prev = channelArray[index - 1][1]
        comparisons[name] = {
          revenueChange: ((data.revenue - prev.revenue) / prev.revenue * 100).toFixed(2),
          transactionChange: ((data.transactionCount - prev.transactionCount) / prev.transactionCount * 100).toFixed(2)
        }
      }
    })
    return comparisons
  }

  calculateFinancialRates(channels) {
    const rates = {}
    Object.entries(channels).forEach(([name, data]) => {
      rates[name] = {
        commissionRate: data.amount > 0 ? ((data.commission / data.amount) * 100).toFixed(2) : 0,
        taxRate: data.amount > 0 ? ((data.tax / data.amount) * 100).toFixed(2) : 0,
        revenueRate: data.amount > 0 ? ((data.revenue / data.amount) * 100).toFixed(2) : 0,
        netMargin: data.revenue > 0 ? ((data.netRevenue / data.revenue) * 100).toFixed(2) : 0
      }
    })
    return rates
  }

  calculateMovingAverage(values, period) {
    if (values.length < period) return []
    const result = []
    for (let i = period - 1; i < values.length; i++) {
      const slice = values.slice(i - period + 1, i + 1)
      const avg = slice.reduce((a, b) => a + b, 0) / period
      result.push(avg)
    }
    return result
  }

  detectSeasonality(values) {
    if (values.length < 7) return { detected: false }

    const weeklyPattern = []
    for (let i = 0; i < 7 && i < values.length; i++) {
      weeklyPattern.push(values.filter((_, idx) => idx % 7 === i))
    }

    return {
      detected: true,
      weeklyAverages: weeklyPattern.map(day =>
        day.reduce((a, b) => a.transactions + b.transactions, 0) / day.length
      )
    }
  }

  calculateGrowthMetrics(values) {
    if (values.length < 2) return { growth: 0, acceleration: 0 }

    const recent = values.slice(-7)
    const previous = values.slice(-14, -7)

    const recentAvg = recent.reduce((a, b) => a + b.transactions, 0) / recent.length
    const previousAvg = previous.length > 0
      ? previous.reduce((a, b) => a + b.transactions, 0) / previous.length
      : recentAvg

    const growth = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(2) : 0

    return {
      growth: parseFloat(growth),
      recentAvg: Math.round(recentAvg),
      previousAvg: Math.round(previousAvg)
    }
  }

  calculateProjection(values) {
    if (values.length < 7) return []

    const recent = values.slice(-7)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    const trend = (recent[recent.length - 1] - recent[0]) / recent.length

    const projection = []
    for (let i = 1; i <= 7; i++) {
      projection.push(Math.max(0, Math.round(avg + (trend * i))))
    }
    return projection
  }

  calculateSuccessRateTrend(dailyKpis) {
    const grouped = {}
    dailyKpis.forEach(kpi => {
      if (!grouped[kpi.date]) {
        grouped[kpi.date] = { success: 0, total: 0 }
      }
      grouped[kpi.date].success += kpi.success_trx
      grouped[kpi.date].total += kpi.success_trx + (kpi.failed_trx || 0)
    })

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      successRate: data.total > 0 ? ((data.success / data.total) * 100).toFixed(2) : 0
    }))
  }

  detectFailureSpikes(dailyKpis) {
    const failures = {}
    dailyKpis.forEach(kpi => {
      if (!failures[kpi.date]) {
        failures[kpi.date] = 0
      }
      failures[kpi.date] += kpi.failed_trx || 0
    })

    const dates = Object.keys(failures).sort()
    const values = dates.map(d => failures[d])
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const threshold = avg * 1.5 // 50% above average is considered a spike

    return dates.filter((date, idx) => values[idx] > threshold).map(date => ({
      date,
      failures: failures[date],
      deviation: ((failures[date] - avg) / avg * 100).toFixed(2)
    }))
  }

  async getComparisons(currentDate) {
    const previousDate = this.getPreviousDate(currentDate)

    const [current, previous] = await Promise.all([
      DailyKpi.getSummary(currentDate),
      DailyKpi.getSummary(previousDate)
    ])

    return {
      current,
      previous,
      changes: {
        transactions: this.calculateChange(current.totalTransactions, previous.totalTransactions),
        amount: this.calculateChange(current.totalAmount, previous.totalAmount),
        revenue: this.calculateChange(current.totalRevenue, previous.totalRevenue)
      }
    }
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

module.exports = new DashboardController()