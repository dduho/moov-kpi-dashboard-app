#!/usr/bin/env node

/**
 * Script to populate ChannelDailyStats table from existing DailyKpi data
 * This is needed because the ChannelDailyStats table was empty due to disabled KPI calculations
 */

const { DailyKpi, ChannelDailyStats } = require('./src/models')
const logger = require('./src/utils/logger')

class ChannelStatsPopulator {
  constructor() {
    // Mapping of business types to channels
    this.businessTypeToChannel = {
      'Bill Payment': 'Bill',
      'Cash In': 'Cash In',
      'Cash Out': 'Cash Out',
      'IMT': 'IMT',
      'P2P': 'P2P'
    }
  }

  async populateChannelStatsForDate(date) {
    try {
      logger.info(`Populating ChannelDailyStats for date: ${date}`)

      // Get all daily KPIs for the date
      const dailyKpis = await DailyKpi.findAll({ where: { date } })

      if (dailyKpis.length === 0) {
        logger.warn(`No daily KPI data found for date ${date}`)
        return
      }

      const dateObj = new Date(date)
      const dayOfMonth = dateObj.getDate()
      const month = dateObj.getMonth() + 1
      const year = dateObj.getFullYear()

      // Group KPIs by business type
      const businessTypeData = {}
      dailyKpis.forEach(kpi => {
        if (!businessTypeData[kpi.business_type]) {
          businessTypeData[kpi.business_type] = {
            success_trx: 0,
            failed_trx: 0,
            amount: 0,
            revenue: 0,
            users_count: 0
          }
        }

        const data = businessTypeData[kpi.business_type]
        data.success_trx += kpi.success_trx || 0
        data.failed_trx += kpi.failed_trx || 0
        data.amount += parseFloat(kpi.amount || 0)
        data.revenue += parseFloat(kpi.revenue || 0)
        // Note: users_count is not available in DailyKpi, so we'll use a default
      })

      // Create channel stats records
      const records = []
      for (const [businessType, data] of Object.entries(businessTypeData)) {
        const channel = this.businessTypeToChannel[businessType]
        if (channel) {
          const record = {
            date,
            channel,
            day_of_month: dayOfMonth,
            month,
            year,
            transactions_count: data.success_trx,
            amount: data.amount,
            revenue: data.revenue,
            users_count: Math.floor(data.success_trx / 10) // Estimate users as 1/10 of transactions
          }

          // Set channel-specific flags
          if (channel === 'IMT') {
            record.includes_mfs = true
            record.includes_ethub = true
          } else if (channel === 'P2P') {
            record.service_active = true
          }

          records.push(record)
        }
      }

      if (records.length > 0) {
        await ChannelDailyStats.bulkCreate(records, {
          updateOnDuplicate: ['transactions_count', 'amount', 'revenue', 'users_count']
        })
        logger.info(`Successfully created ${records.length} channel stats records for date ${date}`)
      } else {
        logger.warn(`No channel stats records to create for date ${date}`)
      }

    } catch (error) {
      logger.error(`Error populating channel stats for date ${date}:`, error)
      throw error
    }
  }

  async populateAllDates() {
    try {
      logger.info('Starting population of ChannelDailyStats for all dates...')

      // Get all distinct dates from DailyKpi table
      const dateRecords = await DailyKpi.findAll({
        attributes: ['date'],
        group: ['date'],
        order: [['date', 'ASC']],
        raw: true
      })

      const dates = dateRecords.map(record => record.date)
      logger.info(`Found ${dates.length} dates to process: ${dates.join(', ')}`)

      for (const date of dates) {
        await this.populateChannelStatsForDate(date)
      }

      logger.info('Completed population of ChannelDailyStats for all dates')

    } catch (error) {
      logger.error('Error populating channel stats for all dates:', error)
      throw error
    }
  }
}

// Run if called directly
if (require.main === module) {
  const populator = new ChannelStatsPopulator()
  populator.populateAllDates()
    .then(() => {
      console.log('Channel stats population completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('Channel stats population failed:', error)
      process.exit(1)
    })
}

module.exports = ChannelStatsPopulator