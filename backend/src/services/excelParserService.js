const ExcelJS = require('exceljs')
const path = require('path')
const { DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers, WeeklyKpis, HourlyPerformance, ComparativeAnalytics, ImtCountryStats, ImtBalances, YearlyComparison, ChannelDailyStats } = require('../models')
const logger = require('../utils/logger')

class ExcelParserService {
  async parseHourlyComparison(workbook, date) {
    const cntSheet = workbook.getWorksheet('CNT')
    const amtSheet = workbook.getWorksheet('AMT')
    const revSheet = workbook.getWorksheet('REV')
    if (!cntSheet || !amtSheet || !revSheet) {
      logger.warn('Feuilles CNT, AMT ou REV manquantes')
      return
    }

    const records = []
    // On suppose que chaque feuille a: Hour | CNT_N | CNT_O | %
    cntSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const hour = this.getNumericValue(row, 1)
        const record = {
          date,
          hour,
          count_n: this.getNumericValue(row, 2) * 1000, // CNT (K) -> convert to actual count
          count_o: this.getNumericValue(row, 3) * 1000, // CNT (K) -> convert to actual count
          count_gap_percent: this.getNumericValue(row, 4)
        }
        records.push(record)
      }
    })

    // AMT: Hour | AMT_N | AMT_O | %
    amtSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const hour = this.getNumericValue(row, 1)
        const found = records.find(r => r.hour === hour)
        if (found) {
          found.amount_n = this.getNumericValue(row, 2) * 1000000 // AMT (M XOF) -> convert to XOF
          found.amount_o = this.getNumericValue(row, 3) * 1000000 // AMT (M XOF) -> convert to XOF
          found.amount_gap_percent = this.getNumericValue(row, 4)
        }
      }
    })

    // REV: Hour | REV_N | REV_O | %
    revSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const hour = this.getNumericValue(row, 1)
        const found = records.find(r => r.hour === hour)
        if (found) {
          found.revenue_n = this.getNumericValue(row, 2) * 1000 // REV (K XOF) -> convert to XOF
          found.revenue_o = this.getNumericValue(row, 3) * 1000 // REV (K XOF) -> convert to XOF
          found.revenue_gap_percent = this.getNumericValue(row, 4)
        }
      }
    })

    if (records.length > 0) {
      await require('../models').HourlyComparison.bulkCreate(records, {
        updateOnDuplicate: [
          'count_n','count_o','count_gap_percent','amount_n','amount_o','amount_gap_percent','revenue_n','revenue_o','revenue_gap_percent'
        ]
      })
      logger.info(`Successfully parsed ${records.length} hourly comparison records`)
    } else {
      logger.warn('No valid hourly comparison records to save')
    }
  }
  async parseDailyComparison(workbook, date) {
    const vsSheet = workbook.getWorksheet('VS')
    const gapSheet = workbook.getWorksheet('GAP')
    if (!vsSheet) {
      logger.warn('Feuille VS non trouvée')
      return
    }

    const records = []

    // VS: Business Type | Success Trx (N) | Success Trx (O) | Amount (N) | Amount (O) | Revenue (N) | Revenue (O) | ...
    vsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const record = {
          date,
          business_type: this.getCellValue(row, 1),
          success_trx_n: this.getNumericValue(row, 2),
          success_trx_o: this.getNumericValue(row, 3),
          amount_n: this.getNumericValue(row, 4), // Already in XOF (no conversion)
          amount_o: this.getNumericValue(row, 5), // Already in XOF (no conversion)
          revenue_n: this.getNumericValue(row, 6), // Already in XOF (no conversion)
          revenue_o: this.getNumericValue(row, 7), // Already in XOF (no conversion)
          commission_n: this.getNumericValue(row, 8), // Already in XOF (no conversion)
          commission_o: this.getNumericValue(row, 9), // Already in XOF (no conversion)
          tax_n: this.getNumericValue(row, 10), // Already in XOF (no conversion)
          tax_o: this.getNumericValue(row, 11) // Already in XOF (no conversion)
        }
        records.push(record)
      }
    })

    // GAP: Business Type | Trx Gap | Amount Gap | Revenue Gap
    if (gapSheet) {
      gapSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const business_type = this.getCellValue(row, 1)
          const found = records.find(r => r.business_type === business_type)
          if (found) {
            found.trx_gap = this.getNumericValue(row, 2) * 1000 // TRX.CNT (K) -> convert to actual count
            found.amount_gap = this.getNumericValue(row, 3) * 1000000 // TRX.AMT (M XOF) -> convert to XOF
            found.revenue_gap = this.getNumericValue(row, 4) * 1000 // TRX.REVE (K XOF) -> convert to XOF
          }
        }
      })
    }

    // Calculs de taux si besoin
    records.forEach(r => {
      // Success rate: success_trx / (success_trx + failed_trx) * 100
      r.success_rate_n = this.calculateSuccessRate(r.success_trx_n, r.failed_trx_n || 0)
      r.success_rate_o = this.calculateSuccessRate(r.success_trx_o, r.failed_trx_o || 0)
      // Revenue rate: revenue / amount
      r.revenue_rate_n = this.calculateRevenueRate(r.revenue_n, r.amount_n)
      r.revenue_rate_o = this.calculateRevenueRate(r.revenue_o, r.amount_o)
    })

    if (records.length > 0) {
      await require('../models').DailyComparison.bulkCreate(records, {
        updateOnDuplicate: [
          'success_trx_n','success_trx_o','amount_n','amount_o','revenue_n','revenue_o','commission_n','commission_o','tax_n','tax_o',
          'trx_gap','amount_gap','revenue_gap','success_rate_n','success_rate_o','revenue_rate_n','revenue_rate_o'
        ]
      })
      logger.info(`Successfully parsed ${records.length} daily comparison records`)
    } else {
      logger.warn('No valid daily comparison records to save')
    }
  }
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
          logger.debug(`No matching file found for pattern: ${file.pattern}. Available excel files: ${excelFiles.join(', ')}`)
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
        // ComparativeAnalytics is now calculated automatically by KPI Calculator Service
        // No need to parse from Excel as it creates conflicts with calculated data
        break
      default:
        throw new Error(`Unknown file type: ${type}`)
    }
  }

  async parseDailyKpi(workbook, date) {
    // VS/GAP
    await this.parseDailyComparison(workbook, date)

    // KPI_N
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
          amount: this.getNumericValue(row, 5), // Already in XOF (no conversion needed)
          revenue: this.getNumericValue(row, 6), // Already in XOF (no conversion needed)
          commission: this.getNumericValue(row, 7), // Already in XOF (no conversion needed)
          tax: this.getNumericValue(row, 8), // Already in XOF (no conversion needed)
          failed_trx: this.getNumericValue(row, 9),
          expired_trx: this.getNumericValue(row, 10),
          // Calculate success_rate and revenue_rate instead of reading from Excel
          success_rate: this.calculateSuccessRate(this.getNumericValue(row, 4), this.getNumericValue(row, 9)),
          revenue_rate: this.calculateRevenueRate(this.getNumericValue(row, 6), this.getNumericValue(row, 5))
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
        await require('../models').DailyKpi.bulkCreate(validRecords, {
          updateOnDuplicate: ['success_trx', 'amount', 'revenue', 'commission', 'tax', 'failed_trx', 'expired_trx', 'success_rate', 'revenue_rate']
        })
        logger.info(`Successfully parsed ${validRecords.length} daily KPI records`)
      } else {
        logger.warn('No valid daily KPI records to save')
      }
    }
  }

  async parseHourlyKpi(workbook, date) {
    // Comparaison horaire CNT/AMT/REV
    await this.parseHourlyComparison(workbook, date)

    // NEW
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
          total_amount: this.getNumericValue(row, 8), // Already in XOF (no conversion for NEW/LAST)
          total_fee: this.getNumericValue(row, 9), // Already in XOF (no conversion for NEW/LAST)
          total_commission: this.getNumericValue(row, 10), // Already in XOF (no conversion for NEW/LAST)
          total_tax: this.getNumericValue(row, 11) // Already in XOF (no conversion for NEW/LAST)
        }
        records.push(record)
      }
    })

    if (records.length > 0) {
      await require('../models').HourlyKpi.bulkCreate(records, {
        updateOnDuplicate: ['total_trans', 'total_success', 'total_failed', 'total_pending', 'total_amount', 'total_fee', 'total_commission', 'total_tax']
      })
    }
  }

  async parseImt(workbook, date) {
    await this.parseImtView(workbook, date)          // Feuille "VIEW"
    await this.parseImtBusiness(workbook, date)      // Feuille "IMT_BUSINESS"
  }

  async parseImtView(workbook, date) {
    const sheet = workbook.getWorksheet('VIEW')
    if (!sheet) {
      logger.warn('Feuille VIEW non trouvée pour IMT')
      return
    }

    const countryStatsRecords = []
    const balanceRecords = []

    // Parser la feuille VIEW qui a une structure complexe
    // Section 1: Statistiques par pays (lignes 1-?)
    // Section 2: ETHUB_SEND (lignes ?-?)
    // Section 3: Tableau de soldes (lignes ?-fin)

    let currentSection = null
    let headerRow = null

    sheet.eachRow((row, rowNumber) => {
      const firstCell = this.getCellValue(row, 1)

      if (!firstCell) return // Skip empty rows

      // Detect section headers
      if (typeof firstCell === 'string') {
        if (firstCell.toLowerCase().includes('country') || rowNumber === 1) {
          currentSection = 'COUNTRY_STATS'
          headerRow = row
          return
        }
        if (firstCell.toLowerCase().includes('ethub_send')) {
          currentSection = 'ETHUB_SEND'
          headerRow = row
          return
        }
        if (firstCell.toLowerCase().includes('et hub receive') || firstCell.toLowerCase().includes('balance')) {
          currentSection = 'BALANCES'
          headerRow = row
          return
        }
      }

      // Parse data based on current section
      if (currentSection === 'COUNTRY_STATS' && rowNumber > (headerRow ? headerRow.number : 1)) {
        // Country | CNT | AMT (M) | REV (K) | COMM (K) | TAX (K)
        const country = this.getCellValue(row, 1)
        if (country && typeof country === 'string') {
          const record = {
            date,
            country: country.trim(),
            direction: 'RECEIVE', // Default for country stats section
            hub_type: 'ETHUB', // Default for country stats section
            count: this.getNumericValue(row, 2),
            amount: this.getNumericValue(row, 3) * 1000000, // AMT (M XOF) -> convert to XOF
            revenue: this.getNumericValue(row, 4) * 1000, // REV (K XOF) -> convert to XOF
            commission: this.getNumericValue(row, 5) * 1000, // COMM (K XOF) -> convert to XOF
            tax: this.getNumericValue(row, 6) * 1000 // TAX (K XOF) -> convert to XOF
          }
          countryStatsRecords.push(record)
        }
      }

      if (currentSection === 'ETHUB_SEND' && rowNumber > headerRow.number) {
        // Similar structure but for SEND direction
        const country = this.getCellValue(row, 1)
        if (country && typeof country === 'string') {
          const record = {
            date,
            country: country.trim(),
            direction: 'SEND',
            hub_type: 'ETHUB',
            count: this.getNumericValue(row, 2),
            amount: this.getNumericValue(row, 3) * 1000000, // AMT (M XOF) -> convert to XOF
            revenue: this.getNumericValue(row, 4) * 1000, // REV (K XOF) -> convert to XOF
            commission: this.getNumericValue(row, 5) * 1000, // COMM (K XOF) -> convert to XOF
            tax: this.getNumericValue(row, 6) * 1000 // TAX (K XOF) -> convert to XOF
          }
          countryStatsRecords.push(record)
        }
      }

      if (currentSection === 'BALANCES' && rowNumber > headerRow.number) {
        // Country | ET HUB Receive | ET HUB Send | MFS Receive | MFS Send | Balance Status
        const country = this.getCellValue(row, 1)
        if (country && typeof country === 'string') {
          const record = {
            date,
            country: country.trim(),
            ethub_receive_balance: this.getNumericValue(row, 2),
            ethub_send_balance: this.getNumericValue(row, 3),
            mfs_receive_balance: this.getNumericValue(row, 4),
            mfs_send_balance: this.getNumericValue(row, 5),
            balance_status: this.determineBalanceStatus([
              this.getNumericValue(row, 2),
              this.getNumericValue(row, 3),
              this.getNumericValue(row, 4),
              this.getNumericValue(row, 5)
            ])
          }
          balanceRecords.push(record)
        }
      }
    })

    // Save country stats
    if (countryStatsRecords.length > 0) {
      const { ImtCountryStats } = require('../models')
      await ImtCountryStats.bulkCreate(countryStatsRecords, {
        updateOnDuplicate: ['count', 'amount', 'revenue', 'commission', 'tax']
      })
      logger.info(`Successfully parsed ${countryStatsRecords.length} IMT country stats records`)
    }

    // Save balances
    if (balanceRecords.length > 0) {
      const { ImtBalances } = require('../models')
      await ImtBalances.bulkCreate(balanceRecords, {
        updateOnDuplicate: ['ethub_receive_balance', 'ethub_send_balance', 'mfs_receive_balance', 'mfs_send_balance', 'balance_status']
      })
      logger.info(`Successfully parsed ${balanceRecords.length} IMT balance records`)
    }
  }

  async parseImtBusiness(workbook, date) {
    const sheet = workbook.getWorksheet('IMT_BUSINESS')
    if (!sheet) {
      logger.warn('Feuille IMT_BUSINESS non trouvée')
      return
    }

    const records = []

    // Structure: Date | Country | Channel | Success | Failed | Amount (M) | REV (K) | COMM (K) | TAX (K) | Success Rate | Balance
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const channel = this.getCellValue(row, 3)
        if (channel && typeof channel === 'string') {
          const record = {
            date,
            country: this.getCellValue(row, 2),
            imt_business: 'MoneyGram', // Default, could be parsed from data
            channel: channel.trim().toUpperCase(), // ETHUB_SEND, ETHUB_RECV, MFS_SEND, MFS_RECV
            hour: null, // For daily data, hour is null
            total_success: this.getNumericValue(row, 4),
            total_failed: this.getNumericValue(row, 5),
            amount: this.getNumericValue(row, 6) * 1000000, // AMOUNT_IN_MILLION (M XOF) -> convert to XOF
            revenue: this.getNumericValue(row, 7) * 1000, // REVENUE_IN_THOUSAND (K XOF) -> convert to XOF
            commission: this.getNumericValue(row, 8) * 1000, // COMM_IN_THOUSAND (K XOF) -> convert to XOF
            tax: this.getNumericValue(row, 9) * 1000, // TAX_IN_THOUSAND (K XOF) -> convert to XOF
            success_rate: this.calculateSuccessRate(this.getNumericValue(row, 4), this.getNumericValue(row, 5)),
            balance: this.getNumericValue(row, 11) // Balance in XOF (no conversion needed)
          }
          records.push(record)
        }
      }
    })

    if (records.length > 0) {
      await ImtTransaction.bulkCreate(records, {
        updateOnDuplicate: ['total_success', 'total_failed', 'amount', 'revenue', 'commission', 'tax', 'success_rate', 'balance']
      })
      logger.info(`Successfully parsed ${records.length} IMT business records`)
    }
  }

  determineBalanceStatus(balances) {
    const total = balances.reduce((sum, balance) => sum + balance, 0)
    if (total < 10) return 'Critical'
    if (total < 50) return 'Warning'
    return 'Healthy'
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

          // Apply unit conversions based on sheet type
          let convertedAmount = amount
          let convertedRevenue = revenue
          let convertedCommission = commission
          let convertedTax = tax

          if (sheetName === 'KPI-Day') {
            // Revenue (K XOF) -> convert to XOF
            convertedRevenue = revenue * 1000
            convertedCommission = commission * 1000
            convertedTax = tax * 1000
          } else if (sheetName === 'Cash In' || sheetName === 'Cash Out' || sheetName === 'IMT' ||
                     sheetName === 'Banks' || sheetName === 'P2P' || sheetName === 'Bill' || sheetName === 'Telco') {
            // Revenue (K XOF) -> convert to XOF
            convertedRevenue = revenue * 1000
            convertedCommission = commission * 1000
            convertedTax = tax * 1000
          }
          // App and Active sheets: assume already in correct units

          // Only accumulate if we have valid data
          if (transactionCount > 0 || convertedAmount > 0 || convertedRevenue > 0) {
            totalTransactionCount += transactionCount
            totalAmount += convertedAmount
            totalRevenue += convertedRevenue
            totalCommission += convertedCommission
            totalTax += convertedTax
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

    // Also parse additional sheets from Revenue Compare files
    await this.parseActiveUsers(workbook, date)
    await this.parseWeeklyKpis(workbook, date)
    await this.parseYearlyComparison(workbook, date)
    // ChannelDailyStats is now calculated automatically by KPI Calculator Service
  }

  async parseActiveUsers(workbook, date) {
    const worksheet = workbook.getWorksheet('Active')
    if (!worksheet) return

    // On suppose que la feuille a la structure :
    // Ligne 1: Clients, Ligne 2: Agents, Ligne 3: Marchands, Ligne 4: Nouveaux inscrits, Ligne 5: Users App
    // Colonnes: 01, 02, ..., 31, 总数 (Total), AVG, M (Évolution)

    const rows = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 2 && rowNumber <= 6) {
        rows.push(row)
      }
    })

    if (rows.length < 5) {
      logger.warn('Feuille Active: nombre de lignes insuffisant pour extraire toutes les catégories')
      return
    }

    // Extraction des valeurs
    const getValue = (row, col) => {
      const cell = row.getCell(col)
      return typeof cell.value === 'number' ? cell.value : parseFloat(cell.value) || 0
    }

    // On cherche les index des colonnes Total, AVG et M
    const headerRow = worksheet.getRow(1)
    let totalCol = 0, avgCol = 0, momCol = 0
    headerRow.eachCell((cell, colNumber) => {
      if (typeof cell.value === 'string') {
        const val = cell.value.toUpperCase()
        if (val.includes('TOTAL')) totalCol = colNumber
        if (val.includes('AVG')) avgCol = colNumber
        if (val === 'M') momCol = colNumber
      }
    })

    // Utiliser AVG comme valeur représentative du mois (moyenne)
    // Création du record
    const record = {
      date,
      clients: getValue(rows[0], avgCol) * 1000, // User (K) -> convert to actual count
      agents: getValue(rows[1], avgCol), // Already in actual count
      merchants: getValue(rows[2], avgCol), // Already in actual count
      new_registrations: getValue(rows[3], avgCol), // Already in actual count
      app_users: getValue(rows[4], avgCol), // Already in actual count
      month_avg: getValue(rows[0], avgCol), // Moyenne (AVG) - pour clients
      mom_evolution: getValue(rows[0], momCol) // Évolution mensuelle (MOM%)
    }

    // Calcul du total actif (somme des catégories)
    record.total_active = record.clients + record.agents + record.merchants + record.new_registrations + record.app_users

    await ActiveUsers.upsert(record)
    logger.info('ActiveUsers record enregistré:', record)
  }

  async parseWeeklyKpis(workbook, date) {
    const worksheet = workbook.getWorksheet('KPI-Week')
    if (!worksheet) return

    const records = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const record = {
          week_start_date: this.getCellValue(row, 1),
          monday_revenue: this.getNumericValue(row, 2) * 1000, // Revenue (K XOF) -> convert to XOF
          tuesday_revenue: this.getNumericValue(row, 3) * 1000,
          wednesday_revenue: this.getNumericValue(row, 4) * 1000,
          thursday_revenue: this.getNumericValue(row, 5) * 1000,
          friday_revenue: this.getNumericValue(row, 6) * 1000,
          saturday_revenue: this.getNumericValue(row, 7) * 1000,
          sunday_revenue: this.getNumericValue(row, 8) * 1000,
          monday_transactions: this.getNumericValue(row, 9),
          tuesday_transactions: this.getNumericValue(row, 10),
          wednesday_transactions: this.getNumericValue(row, 11),
          thursday_transactions: this.getNumericValue(row, 12),
          friday_transactions: this.getNumericValue(row, 13),
          saturday_transactions: this.getNumericValue(row, 14),
          sunday_transactions: this.getNumericValue(row, 15),
          total_revenue: this.getNumericValue(row, 16) * 1000, // Revenue (K XOF) -> convert to XOF
          total_transactions: this.getNumericValue(row, 17),
          revenue_change_percent: this.getNumericValue(row, 18),
          avg_daily_revenue: this.getNumericValue(row, 19) * 1000 // Revenue (K XOF) -> convert to XOF
        }

        // Calculate week_end_date and other fields
        if (record.week_start_date) {
          const startDate = new Date(record.week_start_date)
          const endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6) // Add 6 days for end of week

          record.week_end_date = endDate.toISOString().split('T')[0]
          record.year = startDate.getFullYear()
          record.week_number = this.getWeekNumber(startDate)
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
          updateOnDuplicate: ['monday_revenue', 'tuesday_revenue', 'wednesday_revenue', 'thursday_revenue', 'friday_revenue', 'saturday_revenue', 'sunday_revenue', 'monday_transactions', 'tuesday_transactions', 'wednesday_transactions', 'thursday_transactions', 'friday_transactions', 'saturday_transactions', 'sunday_transactions', 'total_revenue', 'total_transactions', 'revenue_change_percent', 'avg_daily_revenue']
        })
        logger.info(`Successfully parsed ${validRecords.length} weekly KPI records`)
      } else {
        logger.warn('No valid weekly KPI records to save')
      }
    }
  }

  async parseYearlyComparison(workbook, date) {
    const worksheet = workbook.getWorksheet('KPI-Year')
    if (!worksheet) return

    const records = []
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        // Assuming columns: Month | Day | Value | Monthly Total | Monthly AVG | MOM% | YOY%
        const month = this.getNumericValue(row, 1)
        const day = this.getNumericValue(row, 2)

        if (month && day) {
          const record = {
            year,
            month,
            day,
            value: this.getNumericValue(row, 3) * 1000, // REV (K XOF) -> convert to XOF
            monthly_total: this.getNumericValue(row, 4) * 1000, // REV (K XOF) -> convert to XOF
            monthly_avg: this.getNumericValue(row, 5) * 1000, // REV (K XOF) -> convert to XOF
            mom_percent: this.getNumericValue(row, 6), // Already in percentage
            yoy_percent: this.getNumericValue(row, 7), // Already in percentage
            metric_type: 'revenue' // Default to revenue, could be parameterized
          }
          records.push(record)
        }
      }
    })

    if (records.length > 0) {
      await YearlyComparison.bulkCreate(records, {
        updateOnDuplicate: ['value', 'monthly_total', 'monthly_avg', 'mom_percent', 'yoy_percent']
      })
      logger.info(`Successfully parsed ${records.length} yearly comparison records`)
    } else {
      logger.warn('No valid yearly comparison records to save')
    }
  }

  async parseChannelDailyStats(workbook, date) {
    const channelSheets = ['Cash In', 'Cash Out', 'IMT', 'Banks', 'P2P', 'Bill', 'Telco']
    const records = []

    const dateObj = new Date(date)
    const dayOfMonth = dateObj.getDate()
    const month = dateObj.getMonth() + 1
    const year = dateObj.getFullYear()

    for (const sheetName of channelSheets) {
      const worksheet = workbook.getWorksheet(sheetName)
      if (!worksheet) {
        logger.warn(`Worksheet '${sheetName}' not found in revenue file for date ${date}`)
        continue
      }

      try {
        // Parse daily data - assuming structure similar to other sheets
        // Column 1: Day (01-31), Column 4: Transactions, Column 5: Amount, Column 6: Revenue, etc.
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // Skip header
            const day = this.getNumericValue(row, 1)
            if (day === dayOfMonth) { // Only process the row for our target date
              const record = {
                date,
                channel: sheetName,
                day_of_month: day,
                month,
                year,
                transactions_count: this.getNumericValue(row, 4),
                amount: this.getNumericValue(row, 5),
                revenue: this.getNumericValue(row, 6),
                users_count: this.getNumericValue(row, 3) || 0 // Assuming users count in column 3
              }

              // Set channel-specific flags
              if (sheetName === 'IMT') {
                record.includes_mfs = true
                record.includes_ethub = true
              } else if (sheetName === 'P2P') {
                record.service_active = true
              }

              records.push(record)
            }
          }
        })

        logger.info(`Parsed channel data for '${sheetName}': date ${date}`)
      } catch (error) {
        logger.error(`Error parsing worksheet '${sheetName}' for date ${date}:`, error)
      }
    }

    if (records.length > 0) {
      await ChannelDailyStats.bulkCreate(records, {
        updateOnDuplicate: ['transactions_count', 'amount', 'revenue', 'users_count']
      })
      logger.info(`Successfully saved ${records.length} channel daily stats records`)
    } else {
      logger.warn(`No channel daily stats records to save for date ${date}`)
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

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  calculateSuccessRate(successTrx, failedTrx) {
    const totalTransactions = successTrx + failedTrx
    if (totalTransactions === 0) return 0
    return parseFloat(((successTrx / totalTransactions) * 100).toFixed(2))
  }

  calculateRevenueRate(revenue, amount) {
    if (amount === 0) return 0
    return parseFloat((revenue / amount).toFixed(4))
  }
}

module.exports = new ExcelParserService()