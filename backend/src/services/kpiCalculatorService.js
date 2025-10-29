const { DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers, KpiComparisons, KpiAggregates, WeeklyKpis, HourlyPerformance, ComparativeAnalytics, ChannelDailyStats } = require('../models')
const logger = require('../utils/logger')

class KpiCalculatorService {
  async calculateDailyAggregates(date) {
    try {
      logger.info(`Calculating daily aggregates for date: ${date}`)

      // Execute all aggregation functions, catching errors individually so one failure doesn't stop others
      const aggregationPromises = [
        this.calculateDailyKpiAggregates(date).catch(err => logger.error(`Error calculating daily KPI aggregates for ${date}:`, err.message)),
        this.calculateImtAggregates(date).catch(err => logger.error(`Error calculating IMT aggregates for ${date}:`, err.message)),
        this.calculateRevenueAggregates(date).catch(err => logger.error(`Error calculating revenue aggregates for ${date}:`, err.message)),
        this.calculateComparisons(date).catch(err => logger.error(`Error calculating comparisons for ${date}:`, err.message)),
        this.calculateWeeklyAggregates(date).catch(err => logger.error(`Error calculating weekly aggregates for ${date}:`, err.message)),
        this.calculateHourlyPerformanceAggregates(date).catch(err => logger.error(`Error calculating hourly performance aggregates for ${date}:`, err.message)),
        this.calculateComparativeAnalyticsAggregates(date).catch(err => logger.error(`Error calculating comparative analytics aggregates for ${date}:`, err.message)),
        this.calculateChannelDailyStats(date).catch(err => logger.error(`Error calculating channel daily stats for ${date}:`, err.message))
      ]

      await Promise.all(aggregationPromises)

      logger.info(`Successfully calculated daily aggregates for date: ${date}`)
    } catch (error) {
      logger.error(`Error calculating daily aggregates for date ${date}:`, error)
      // Don't throw - allow import to continue even if aggregates fail
      logger.warn(`Continuing import despite aggregate calculation errors for date ${date}`)
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

  async calculateWeeklyAggregates(date) {
    try {
      // Calculate weekly aggregates from daily data
      const weekStart = this.getWeekStartDate(date);
      const weekEnd = this.getWeekEndDate(date);

      const weeklyData = await DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [weekStart, weekEnd]
          }
        }
      });

      if (weeklyData.length === 0) {
        logger.warn(`No daily data found for week starting ${weekStart}`)
        return
      }

      // Group by day of week
      const dayOfWeekData = {}
      weeklyData.forEach(item => {
        const itemDate = new Date(item.date);
        const dayOfWeek = itemDate.getDay();

        if (!dayOfWeekData[dayOfWeek]) {
          dayOfWeekData[dayOfWeek] = {
            revenue: 0,
            transactions: 0
          }
        }

        dayOfWeekData[dayOfWeek].revenue += parseFloat(item.revenue || 0)
        dayOfWeekData[dayOfWeek].transactions += item.success_trx
      })

      // Calculate weekly totals
      const weeklyTotalRevenue = Object.values(dayOfWeekData).reduce((sum, day) => sum + day.revenue, 0)
      const weeklyTotalTransactions = Object.values(dayOfWeekData).reduce((sum, day) => sum + day.transactions, 0)
      const weeklyAvgDailyRevenue = weeklyTotalRevenue / 7

      // Get previous week data for growth calculation
      const prevWeekStart = this.getPreviousWeekStartDate(weekStart);
      const prevWeekData = await DailyKpi.findAll({
        where: {
          date: {
            [require('sequelize').Op.between]: [prevWeekStart, this.getWeekEndDate(prevWeekStart)]
          }
        }
      });

      const prevWeeklyTotalRevenue = prevWeekData.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0)
      const weeklyGrowthRate = prevWeeklyTotalRevenue > 0
        ? ((weeklyTotalRevenue - prevWeeklyTotalRevenue) / prevWeeklyTotalRevenue * 100).toFixed(2)
        : 0

      const weekEndDate = this.getWeekEndDate(weekStart);
      const weekStartDate = new Date(weekStart);
      const year = weekStartDate.getFullYear();
      const weekNumber = Math.ceil((weekStartDate - new Date(year, 0, 1)) / 86400000 / 7);

      const weeklyRecord = {
        week_start_date: weekStart,
        week_end_date: weekEndDate,
        year: year,
        week_number: weekNumber,
        monday_revenue: dayOfWeekData[1]?.revenue || 0,
        tuesday_revenue: dayOfWeekData[2]?.revenue || 0,
        wednesday_revenue: dayOfWeekData[3]?.revenue || 0,
        thursday_revenue: dayOfWeekData[4]?.revenue || 0,
        friday_revenue: dayOfWeekData[5]?.revenue || 0,
        saturday_revenue: dayOfWeekData[6]?.revenue || 0,
        sunday_revenue: dayOfWeekData[0]?.revenue || 0,
        monday_transactions: dayOfWeekData[1]?.transactions || 0,
        tuesday_transactions: dayOfWeekData[2]?.transactions || 0,
        wednesday_transactions: dayOfWeekData[3]?.transactions || 0,
        thursday_transactions: dayOfWeekData[4]?.transactions || 0,
        friday_transactions: dayOfWeekData[5]?.transactions || 0,
        saturday_transactions: dayOfWeekData[6]?.transactions || 0,
        sunday_transactions: dayOfWeekData[0]?.transactions || 0,
        total_revenue: weeklyTotalRevenue,
        total_transactions: weeklyTotalTransactions,
        revenue_change_percent: weeklyGrowthRate,
        avg_daily_revenue: weeklyAvgDailyRevenue
      }

      await WeeklyKpis.upsert(weeklyRecord)
      logger.info(`Calculated weekly aggregates for week starting ${weekStart}`)
    } catch (error) {
      logger.error(`Error calculating weekly aggregates for date ${date}:`, error)
    }
  }

  async calculateHourlyPerformanceAggregates(date) {
    try {
      const hourlyData = await HourlyKpi.findAll({ where: { date } })

      if (hourlyData.length === 0) {
        logger.warn(`No hourly data found for date ${date}`)
        return
      }

      // Get previous day data for comparison
      const previousDate = this.getPreviousDate(date)
      const previousHourlyData = await HourlyKpi.findAll({ where: { date: previousDate } })

      // Group by hour and business type
      const currentHourlyGrouped = this.groupByHourAndBusinessType(hourlyData)
      const previousHourlyGrouped = this.groupByHourAndBusinessType(previousHourlyData)

      const performanceRecords = []

      Object.keys(currentHourlyGrouped).forEach(hour => {
        Object.keys(currentHourlyGrouped[hour]).forEach(businessType => {
          const current = currentHourlyGrouped[hour][businessType]
          const previous = previousHourlyGrouped[hour]?.[businessType]

          const record = {
            date,
            hour: parseInt(hour),
            business_type: businessType,
            transaction_count: current.totalTrans,
            transaction_amount: current.totalAmount,
            revenue: current.totalFee + current.totalCommission,
            transaction_count_change: previous ? ((current.totalTrans - previous.totalTrans) / (previous.totalTrans || 1) * 100).toFixed(2) : 0,
            transaction_amount_change: previous ? ((current.totalAmount - previous.totalAmount) / (previous.totalAmount || 1) * 100).toFixed(2) : 0,
            revenue_change: previous ? (((current.totalFee + current.totalCommission) - (previous.totalFee + previous.totalCommission)) / ((previous.totalFee + previous.totalCommission) || 1) * 100).toFixed(2) : 0,
            peak_hour_indicator: this.isPeakHour(hour)
          }

          performanceRecords.push(record)
        })
      })

      if (performanceRecords.length > 0) {
        await HourlyPerformance.bulkCreate(performanceRecords, {
          updateOnDuplicate: ['transaction_count', 'transaction_amount', 'revenue', 'transaction_count_change', 'transaction_amount_change', 'revenue_change', 'peak_hour_indicator']
        })
        logger.info(`Calculated ${performanceRecords.length} hourly performance records for date ${date}`)
      }
    } catch (error) {
      logger.error(`Error calculating hourly performance aggregates for date ${date}:`, error)
    }
  }

  async calculateComparativeAnalyticsAggregates(date) {
    try {
      const previousDate = this.getPreviousDate(date)

      const [currentData, previousData] = await Promise.all([
        DailyKpi.findAll({ where: { date } }),
        DailyKpi.findAll({ where: { date: previousDate } })
      ])

      if (currentData.length === 0) {
        logger.warn(`No current data found for comparative analytics on date ${date}`)
        return
      }

      const currentGrouped = this.groupByBusinessType(currentData)
      const previousGrouped = this.groupByBusinessType(previousData)

      const analyticsRecords = []

      Object.keys(currentGrouped).forEach(businessType => {
        const current = currentGrouped[businessType]
        const previous = previousGrouped[businessType] || {
          totalTransactions: 0,
          totalAmount: 0,
          totalRevenue: 0
        }

        const transactionGap = current.totalTransactions - previous.totalTransactions
        const amountGap = current.totalAmount - previous.totalAmount
        const revenueGap = current.totalRevenue - previous.totalRevenue

        let trend = 'stable'
        if (transactionGap > 0 && amountGap > 0 && revenueGap > 0) trend = 'increasing'
        else if (transactionGap < 0 && amountGap < 0 && revenueGap < 0) trend = 'decreasing'

        const performanceIndicator = this.getPerformanceIndicator(trend, Math.abs(transactionGap), Math.abs(amountGap), Math.abs(revenueGap))

        analyticsRecords.push({
          date,
          business_type: businessType,
          current_day_transaction_count: current.totalTransactions,
          last_day_transaction_count: previous.totalTransactions,
          transaction_count_gap: transactionGap,
          current_day_amount: current.totalAmount,
          last_day_amount: previous.totalAmount,
          amount_gap: amountGap,
          current_day_revenue: current.totalRevenue,
          last_day_revenue: previous.totalRevenue,
          revenue_gap: revenueGap,
          trend,
          performance_indicator: performanceIndicator
        })
      })

      if (analyticsRecords.length > 0) {
        await ComparativeAnalytics.bulkCreate(analyticsRecords, {
          updateOnDuplicate: ['current_day_transaction_count', 'last_day_transaction_count', 'transaction_count_gap', 'current_day_amount', 'last_day_amount', 'amount_gap', 'current_day_revenue', 'last_day_revenue', 'revenue_gap', 'trend', 'performance_indicator']
        })
        logger.info(`Calculated ${analyticsRecords.length} comparative analytics records for date ${date}`)
      }
    } catch (error) {
      logger.error(`Error calculating comparative analytics aggregates for date ${date}:`, error)
    }
  }

  async calculateChannelDailyStats(date) {
    try {
      logger.info(`Calculating channel daily stats for date: ${date}`)

      const revenueData = await RevenueByChannel.findAll({ where: { date } })

      if (revenueData.length === 0) {
        logger.warn(`No revenue data found for date ${date}, skipping channel stats calculation`)
        return
      }

      // Map channel names from RevenueByChannel to ChannelDailyStats format
      const channelMapping = {
        'cash_in': 'Cash In',
        'cash_out': 'Cash Out',
        'imt': 'IMT',
        'banks': 'Banks',
        'p2p': 'P2P',
        'bill': 'Bill',
        'telco': 'Telco'
      }

      const records = []
      // Convert date string from YYYY-MM-DD to Date object
      const dateObj = new Date(date)
      const dayOfMonth = dateObj.getDate()
      const month = dateObj.getMonth() + 1
      const year = dateObj.getFullYear()

      for (const revenue of revenueData) {
        const channelName = channelMapping[revenue.channel]
        if (!channelName) {
          // Skip channels that don't map to ChannelDailyStats (like 'app', 'active', 'kpi-day')
          continue
        }

        const record = {
          date,
          channel: channelName,
          day_of_month: dayOfMonth,
          month,
          year,
          transactions_count: revenue.transaction_count || 0,
          amount: revenue.amount || 0,
          revenue: revenue.revenue || 0,
          users_count: 0, // Not available in RevenueByChannel, set to 0
          // Set channel-specific flags
          includes_mfs: channelName === 'IMT',
          includes_ethub: channelName === 'IMT',
          service_active: channelName === 'P2P'
        }

        records.push(record)
      }

      if (records.length > 0) {
        await ChannelDailyStats.bulkCreate(records, {
          updateOnDuplicate: ['transactions_count', 'amount', 'revenue', 'users_count']
        })
        logger.info(`Successfully saved ${records.length} channel daily stats records for date ${date}`)
      } else {
        logger.warn(`No channel daily stats records to save for date ${date}`)
      }
    } catch (error) {
      logger.error(`Error calculating channel daily stats for date ${date}:`, error)
      // Don't throw - allow import to continue even if channel stats fail
    }
  }

  groupByHourAndBusinessType(data) {
    const grouped = {}
    data.forEach(item => {
      const hour = item.hour
      const businessType = item.txn_type_name

      if (!grouped[hour]) {
        grouped[hour] = {}
      }

      if (!grouped[hour][businessType]) {
        grouped[hour][businessType] = {
          totalTrans: 0,
          totalAmount: 0,
          totalFee: 0,
          totalCommission: 0
        }
      }

      const agg = grouped[hour][businessType]
      agg.totalTrans += item.total_success
      agg.totalAmount += parseFloat(item.total_amount || 0)
      agg.totalFee += parseFloat(item.total_fee || 0)
      agg.totalCommission += parseFloat(item.total_commission || 0)
    })
    return grouped
  }

  isPeakHour(hour) {
    // Define peak hours as 8 AM to 8 PM
    return hour >= 8 && hour <= 20
  }

  getPerformanceIndicator(trend, transactionGap, amountGap, revenueGap) {
    const avgGap = (transactionGap + amountGap + revenueGap) / 3

    if (trend === 'increasing' && avgGap > 10) return 'excellent'
    if (trend === 'increasing' && avgGap > 5) return 'good'
    if (trend === 'stable') return 'stable'
    if (trend === 'decreasing' && avgGap > 10) return 'concerning'
    if (trend === 'decreasing' && avgGap > 5) return 'poor'
    return 'stable'
  }

  getWeekStartDate(dateStr) {
    // Handle both YYYY-MM-DD and YYYYMMDD formats
    let date;
    if (dateStr.includes('-')) {
      // YYYY-MM-DD format
      date = new Date(dateStr);
    } else {
      // YYYYMMDD format
      date = new Date(
        dateStr.substring(0, 4),
        dateStr.substring(4, 6) - 1,
        dateStr.substring(6, 8)
      );
    }
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(date.setDate(diff));

    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  }

  getWeekEndDate(weekStartStr) {
    // Handle both YYYY-MM-DD and YYYYMMDD formats
    let date;
    if (weekStartStr.includes('-')) {
      // YYYY-MM-DD format
      date = new Date(weekStartStr);
    } else {
      // YYYYMMDD format
      date = new Date(
        weekStartStr.substring(0, 4),
        weekStartStr.substring(4, 6) - 1,
        weekStartStr.substring(6, 8)
      );
    }
    date.setDate(date.getDate() + 6);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPreviousWeekStartDate(weekStartStr) {
    // Handle both YYYY-MM-DD and YYYYMMDD formats
    let date;
    if (weekStartStr.includes('-')) {
      // YYYY-MM-DD format
      date = new Date(weekStartStr);
    } else {
      // YYYYMMDD format
      date = new Date(
        weekStartStr.substring(0, 4),
        weekStartStr.substring(4, 6) - 1,
        weekStartStr.substring(6, 8)
      );
    }
    date.setDate(date.getDate() - 7);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    // Handle both YYYY-MM-DD and YYYYMMDD formats
    let date;
    if (dateStr.includes('-')) {
      // YYYY-MM-DD format
      date = new Date(dateStr);
    } else {
      // YYYYMMDD format
      date = new Date(
        dateStr.substring(0, 4),
        dateStr.substring(4, 6) - 1,
        dateStr.substring(6, 8)
      );
    }
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

module.exports = new KpiCalculatorService()