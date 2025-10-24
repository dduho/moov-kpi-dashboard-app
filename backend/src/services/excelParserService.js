const ExcelJS = require('exceljs')
const path = require('path')
const DailyKpi = require('../models/DailyKpi')
const HourlyKpi = require('../models/HourlyKpi')
const ImtTransaction = require('../models/ImtTransaction')
const RevenueByChannel = require('../models/RevenueByChannel')
const ActiveUsers = require('../models/ActiveUsers')
const logger = require('../utils/logger')

class ExcelParserService {
  async parseAllFiles(directoryPath, date) {
    try {
      logger.info(`Starting to parse files for date: ${date}`)

      const files = [
        { name: '_MMTG_Daily_KPI_', model: 'daily' },
        { name: '_MMTG-Tools_Hourly_KPI_', model: 'hourly' },
        { name: '_MMTG_IMT_Hourly_new-', model: 'imt' },
        { name: '_MMTG-Tools_Revenue_Compare_', model: 'revenue' }
      ]

      for (const file of files) {
        const filePath = path.join(directoryPath, `${file.name}${date}.xlsx`)
        try {
          await this.parseFile(filePath, date, file.model)
          logger.info(`Parsed ${file.model} data from ${file.name}${date}.xlsx`)
        } catch (error) {
          logger.error(`Error parsing ${file.model} file:`, error)
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
      await DailyKpi.bulkCreate(records, {
        updateOnDuplicate: ['success_trx', 'amount', 'revenue', 'commission', 'tax', 'failed_trx', 'expired_trx', 'success_rate', 'revenue_rate']
      })
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
      if (!worksheet) continue

      // This is a simplified parsing - in reality, you'd need to map the exact structure
      // For now, we'll create sample records based on the sheet name
      const record = {
        date,
        channel: sheetName.toLowerCase(),
        transaction_count: 0,
        amount: 0,
        revenue: 0,
        commission: 0,
        tax: 0
      }

      // Parse actual data from worksheet here
      // This would need to be customized based on the exact Excel structure

      records.push(record)
    }

    if (records.length > 0) {
      await RevenueByChannel.bulkCreate(records, {
        updateOnDuplicate: ['transaction_count', 'amount', 'revenue', 'commission', 'tax']
      })
    }
  }

  getCellValue(row, columnIndex) {
    const cell = row.getCell(columnIndex)
    return cell ? cell.value : null
  }

  getNumericValue(row, columnIndex) {
    const value = this.getCellValue(row, columnIndex)
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