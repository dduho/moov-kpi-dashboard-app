const ExcelJS = require('exceljs')
const path = require('path')
const { DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers, WeeklyKpis, HourlyPerformance, ComparativeAnalytics } = require('../models')
const logger = require('../utils/logger')

class ExcelParserService {
  async parseAllFiles(directoryPath, date) {
    try {
      logger.info(`Starting to parse files for date: ${date}`)

      const files = [
        { pattern: /【MMTG-Tools】Daily KPI - \d{8}\.xlsx$/i, model: 'daily' },
        { pattern: /【MMTG-Tools】Hourly KPI - \d{8}\.xlsx$/i, model: 'hourly' },
        { pattern: /【MMTG-Tools】IMT Hourly - \d{8}\.xlsx$/i, model: 'imt' },
        { pattern: /【MMTG-Tools】Revenue Compare - \d{8}\.xlsx$/i, model: 'revenue' },
        { pattern: /【MMTG-Tools】Active Users - \d{8}\.xlsx$/i, model: 'active' },
        { pattern: /【MMTG-Tools】Weekly KPI - \d{8}\.xlsx$/i, model: 'weekly' },
        { pattern: /【MMTG-Tools】Hourly Performance - \d{8}\.xlsx$/i, model: 'hourly_performance' },
        { pattern: /【MMTG-Tools】Comparative Analytics - \d{8}\.xlsx$/i, model: 'comparative' }
      ]

      // Get all .xlsx files in directory
      const fs = require('fs').promises
      const allFiles = await fs.readdir(directoryPath)
      const excelFiles = allFiles.filter(file => file.endsWith('.xlsx'))

      for (const file of files) {
        // Try strict regex match first
        let matchingFile = excelFiles.find(excelFile => file.pattern.test(excelFile))

        // Fallback: be more tolerant. Look for files that contain the date and a keyword
        if (!matchingFile) {
          const keywordMap = {
            daily: 'daily',
            hourly: 'hourly',
            imt: 'imt',
            revenue: 'revenue',
            active: 'active',
            weekly: 'weekly',
            hourly_performance: 'performance|hourly',
            comparative: 'comparative'
          }

          const kw = keywordMap[file.model] || file.model
          const re = new RegExp(kw, 'i')

          matchingFile = excelFiles.find(f => f.includes(date) && re.test(f))
        }

        if (matchingFile) {
          const filePath = path.join(directoryPath, matchingFile)
          try {
            await this.parseFile(filePath, date, file.model)
            logger.info(`Parsed ${file.model} data from ${matchingFile}`)
          } catch (error) {
            logger.error(`Error parsing ${file.model} file:`, error)
          }
        } else {
          logger.warn(`No matching file found for pattern: ${file.pattern}. Available excel files: ${excelFiles.join(', ')}`)
        }
      }

      logger.info(`Successfully parsed all files for date: ${date}`)
    } catch (error) {
      logger.error(`Error parsing files for date ${date}:`, error)
      throw error
    }
  }

  async parseFile(filePath, date, type) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)

    switch (type) {
      case 'daily':
        await this.parseDailyKpi(workbook, date)
        break
      case 'hourly':
        await this.parseHourlyKpi(workbook, date)
        break
      case 'imt':
        await this.parseImt(workbook, date)
        break
      case 'revenue':
        await this.parseRevenue(workbook, date)
        break
      case 'active':
        await this.parseActiveUsers(workbook, date)
        break
      case 'weekly':
        await this.parseWeeklyKpis(workbook, date)
        break
      case 'hourly_performance':
        await this.parseHourlyPerformance(workbook, date)
        break
      case 'comparative':
        await this.parseComparativeAnalytics(workbook, date)
        break
      default:
        throw new Error(`Unknown file type: ${type}`)
    }
  }

  async parseDailyKpi(workbook, date) {
    const worksheet = workbook.getWorksheet('KPI_N')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          date,
          business_type: this.getCellValue(row, 1),
          period: this.getCellValue(row, 2),
          success_trx: this.getNumericValue(row, 4),
          amount: this.getNumericValue(row, 5),
          revenue: this.getNumericValue(row, 6),
          commission: this.getNumericValue(row, 7),
          tax: this.getNumericValue(row, 8),
          failed_trx: this.getNumericValue(row, 9),
          expired_trx: this.getNumericValue(row, 10),
          success_rate: this.getNumericValue(row, 11),
          revenue_rate: this.getNumericValue(row, 14)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      // Filter out records with invalid object values
      const validRecords = records.filter(record => {
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'object') {
            logger.warn(`Filtering out record with invalid ${key}:`, JSON.stringify(value))
            return false
          }
        }
        return true
      })

      if (validRecords.length > 0) {
        await DailyKpi.bulkCreate(validRecords, {
          updateOnDuplicate: ['success_trx', 'amount', 'revenue', 'commission', 'tax', 'failed_trx', 'expired_trx', 'success_rate', 'revenue_rate']
        })
        logger.info(`Successfully parsed ${validRecords.length} daily KPI records`)
      } else {
        logger.warn('No valid daily KPI records to save')
      }
    }
  }

  async parseHourlyKpi(workbook, date) {
    const worksheet = workbook.getWorksheet('NEW')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const record = {
          date,
          hour: this.getNumericValue(row, 1),
          txn_type_name: this.getCellValue(row, 2),
          total_trans: this.getNumericValue(row, 4),
          total_success: this.getNumericValue(row, 5),
          total_failed: this.getNumericValue(row, 6),
          total_pending: this.getNumericValue(row, 7),
          total_amount: this.getNumericValue(row, 8),
          total_fee: this.getNumericValue(row, 9),
          total_commission: this.getNumericValue(row, 10),
          total_tax: this.getNumericValue(row, 11)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      await HourlyKpi.bulkCreate(records, {
        updateOnDuplicate: ['total_trans', 'total_success', 'total_failed', 'total_pending', 'total_amount', 'total_fee', 'total_commission', 'total_tax']
      })
    }
  }

  async parseImt(workbook, date) {
    const worksheet = workbook.getWorksheet('IMT_BUSINESS')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const record = {
          date,
          country: this.getCellValue(row, 2),
          imt_business: this.getCellValue(row, 3),
          total_success: this.getNumericValue(row, 4),
          total_failed: this.getNumericValue(row, 5),
          amount: this.getNumericValue(row, 6),
          revenue: this.getNumericValue(row, 7),
          commission: this.getNumericValue(row, 8),
          tax: this.getNumericValue(row, 9),
          success_rate: this.parsePercentage(this.getCellValue(row, 10)),
          balance: this.getNumericValue(row, 11)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      await ImtTransaction.bulkCreate(records, {
        updateOnDuplicate: ['total_success', 'total_failed', 'amount', 'revenue', 'commission', 'tax', 'success_rate', 'balance']
      })
    }
  }

  async parseRevenue(workbook, date) {
    // Parse different sheets for revenue data
    const sheets = ['App', 'Active', 'KPI-Day', 'Cash In', 'Cash Out', 'IMT', 'Banks', 'P2P', 'Bill', 'Telco']
    const records = []

    for (const sheetName of sheets) {
      const worksheet = workbook.getWorksheet(sheetName)
      if (!worksheet) {
        logger.warn(`Worksheet '${sheetName}' not found in revenue file for date ${date}`)
        continue
      }

      try {
        // Initialize aggregates for this channel
        let totalTransactionCount = 0
        let totalAmount = 0
        let totalRevenue = 0
        let totalCommission = 0
        let totalTax = 0

        // Parse data from worksheet
        // Assuming data starts at row 2 (row 1 is header)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return // Skip header row

          // Try to extract data - adapt column indices based on actual Excel structure
          // Common structure: Column 1-3: metadata, 4: count, 5: amount, 6: revenue, 7: commission, 8: tax
          const transactionCount = this.getNumericValue(row, 4)
          const amount = this.getNumericValue(row, 5)
          const revenue = this.getNumericValue(row, 6)
          const commission = this.getNumericValue(row, 7)
          const tax = this.getNumericValue(row, 8)

          // Only accumulate if we have valid data
          if (transactionCount > 0 || amount > 0 || revenue > 0) {
            totalTransactionCount += transactionCount
            totalAmount += amount
            totalRevenue += revenue
            totalCommission += commission
            totalTax += tax
          }
        })

        // Only create record if we have meaningful data
        if (totalTransactionCount > 0 || totalAmount > 0 || totalRevenue > 0) {
          const record = {
            date,
            channel: sheetName.toLowerCase().replace(/\s+/g, '_'),
            transaction_count: totalTransactionCount,
            amount: totalAmount,
            revenue: totalRevenue,
            commission: totalCommission,
            tax: totalTax
          }
          records.push(record)
          logger.info(`Parsed revenue data for channel '${sheetName}': ${totalTransactionCount} transactions, ${totalRevenue} revenue`)
        } else {
          logger.warn(`No valid data found in worksheet '${sheetName}' for date ${date}`)
        }
      } catch (error) {
        logger.error(`Error parsing worksheet '${sheetName}' for date ${date}:`, error)
      }
    }

    if (records.length > 0) {
      await RevenueByChannel.bulkCreate(records, {
        updateOnDuplicate: ['transaction_count', 'amount', 'revenue', 'commission', 'tax']
      })
      logger.info(`Successfully saved ${records.length} revenue records for date ${date}`)
    } else {
      logger.warn(`No revenue records to save for date ${date}`)
    }
  }

  async parseActiveUsers(workbook, date) {
    const worksheet = workbook.getWorksheet('Active')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          date,
          business_type: this.getCellValue(row, 1),
          active_users: this.getNumericValue(row, 2),
          new_registrations: this.getNumericValue(row, 3),
          returning_users: this.getNumericValue(row, 4),
          session_duration: this.getNumericValue(row, 5),
          transactions_per_user: this.getNumericValue(row, 6)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      const validRecords = records.filter(record => {
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'object') {
            logger.warn(`Filtering out record with invalid ${key}:`, JSON.stringify(value))
            return false
          }
        }
        return true
      })

      if (validRecords.length > 0) {
        await ActiveUsers.bulkCreate(validRecords, {
          updateOnDuplicate: ['active_users', 'new_registrations', 'returning_users', 'session_duration', 'transactions_per_user']
        })
        logger.info(`Successfully parsed ${validRecords.length} active users records`)
      } else {
        logger.warn('No valid active users records to save')
      }
    }
  }

  async parseWeeklyKpis(workbook, date) {
    const worksheet = workbook.getWorksheet('KPI-Week')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          date,
          week_start_date: this.getCellValue(row, 1),
          monday_revenue: this.getNumericValue(row, 2),
          tuesday_revenue: this.getNumericValue(row, 3),
          wednesday_revenue: this.getNumericValue(row, 4),
          thursday_revenue: this.getNumericValue(row, 5),
          friday_revenue: this.getNumericValue(row, 6),
          saturday_revenue: this.getNumericValue(row, 7),
          sunday_revenue: this.getNumericValue(row, 8),
          monday_transactions: this.getNumericValue(row, 9),
          tuesday_transactions: this.getNumericValue(row, 10),
          wednesday_transactions: this.getNumericValue(row, 11),
          thursday_transactions: this.getNumericValue(row, 12),
          friday_transactions: this.getNumericValue(row, 13),
          saturday_transactions: this.getNumericValue(row, 14),
          sunday_transactions: this.getNumericValue(row, 15),
          weekly_total_revenue: this.getNumericValue(row, 16),
          weekly_total_transactions: this.getNumericValue(row, 17),
          weekly_growth_rate: this.getNumericValue(row, 18),
          weekly_avg_daily_revenue: this.getNumericValue(row, 19)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      const validRecords = records.filter(record => {
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'object') {
            logger.warn(`Filtering out record with invalid ${key}:`, JSON.stringify(value))
            return false
          }
        }
        return true
      })

      if (validRecords.length > 0) {
        await WeeklyKpis.bulkCreate(validRecords, {
          updateOnDuplicate: ['monday_revenue', 'tuesday_revenue', 'wednesday_revenue', 'thursday_revenue', 'friday_revenue', 'saturday_revenue', 'sunday_revenue', 'monday_transactions', 'tuesday_transactions', 'wednesday_transactions', 'thursday_transactions', 'friday_transactions', 'saturday_transactions', 'sunday_transactions', 'weekly_total_revenue', 'weekly_total_transactions', 'weekly_growth_rate', 'weekly_avg_daily_revenue']
        })
        logger.info(`Successfully parsed ${validRecords.length} weekly KPI records`)
      } else {
        logger.warn('No valid weekly KPI records to save')
      }
    }
  }

  async parseHourlyPerformance(workbook, date) {
    const worksheet = workbook.getWorksheet('CNT/AMT/REV')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          date,
          hour: this.getNumericValue(row, 1),
          business_type: this.getCellValue(row, 2),
          transaction_count: this.getNumericValue(row, 3),
          transaction_amount: this.getNumericValue(row, 4),
          revenue: this.getNumericValue(row, 5),
          transaction_count_change: this.getNumericValue(row, 6),
          transaction_amount_change: this.getNumericValue(row, 7),
          revenue_change: this.getNumericValue(row, 8),
          peak_hour_indicator: this.getCellValue(row, 9) === 'Yes' ? true : false
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      const validRecords = records.filter(record => {
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'object') {
            logger.warn(`Filtering out record with invalid ${key}:`, JSON.stringify(value))
            return false
          }
        }
        return true
      })

      if (validRecords.length > 0) {
        await HourlyPerformance.bulkCreate(validRecords, {
          updateOnDuplicate: ['transaction_count', 'transaction_amount', 'revenue', 'transaction_count_change', 'transaction_amount_change', 'revenue_change', 'peak_hour_indicator']
        })
        logger.info(`Successfully parsed ${validRecords.length} hourly performance records`)
      } else {
        logger.warn('No valid hourly performance records to save')
      }
    }
  }

  async parseComparativeAnalytics(workbook, date) {
    const worksheet = workbook.getWorksheet('VS/GAP')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          date,
          business_type: this.getCellValue(row, 1),
          current_day_transaction_count: this.getNumericValue(row, 2),
          last_day_transaction_count: this.getNumericValue(row, 3),
          transaction_count_gap: this.getNumericValue(row, 4),
          current_day_amount: this.getNumericValue(row, 5),
          last_day_amount: this.getNumericValue(row, 6),
          amount_gap: this.getNumericValue(row, 7),
          current_day_revenue: this.getNumericValue(row, 8),
          last_day_revenue: this.getNumericValue(row, 9),
          revenue_gap: this.getNumericValue(row, 10),
          trend: this.getCellValue(row, 11),
          performance_indicator: this.getCellValue(row, 12)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      const validRecords = records.filter(record => {
        for (const [key, value] of Object.entries(record)) {
          if (value && typeof value === 'object') {
            logger.warn(`Filtering out record with invalid ${key}:`, JSON.stringify(value))
            return false
          }
        }
        return true
      })

      if (validRecords.length > 0) {
        await ComparativeAnalytics.bulkCreate(validRecords, {
          updateOnDuplicate: ['current_day_transaction_count', 'last_day_transaction_count', 'transaction_count_gap', 'current_day_amount', 'last_day_amount', 'amount_gap', 'current_day_revenue', 'last_day_revenue', 'revenue_gap', 'trend', 'performance_indicator']
        })
        logger.info(`Successfully parsed ${validRecords.length} comparative analytics records`)
      } else {
        logger.warn('No valid comparative analytics records to save')
      }
    }
  }

  getCellValue(row, columnIndex) {
    const cell = row.getCell(columnIndex)
    if (!cell || cell.value === null || cell.value === undefined) return null

    // Handle Excel formula results and errors
    if (typeof cell.value === 'object') {
      // Check for Excel error objects (like { error: '#N/A' })
      if (cell.value.error !== undefined) {
        return null // Return null for any Excel error
      }
      // Check for formula results
      if (cell.value.result !== undefined) {
        return cell.value.result
      }
      // Check for empty objects
      if (Object.keys(cell.value).length === 0) {
        return null // Return null for empty objects
      }
      // Any other object type we don't recognize
      return null
    }

    return cell.value
  }

  getNumericValue(row, columnIndex) {
    const value = this.getCellValue(row, columnIndex)
    if (value === null) return 0 // Return 0 for null values (including Excel errors)
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  parsePercentage(value) {
    if (typeof value === 'string') {
      return parseFloat(value.replace('%', '')) / 100
    }
    return value || 0
  }
}

module.exports = new ExcelParserService()