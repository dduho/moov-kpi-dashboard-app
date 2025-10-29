const cron = require('node-cron')
const ftpService = require('../services/ftpService')
const excelParserService = require('../services/excelParserService')
const kpiCalculatorService = require('../services/kpiCalculatorService')
const cacheService = require('../services/cacheService')
const logger = require('../utils/logger')
const fs = require('fs').promises
const path = require('path')
const AdmZip = require('adm-zip')
const unrar = require('node-unrar-js')
const ingestionService = require('../services/dailyDataIngestionService')
const { DailyKpi } = require('../models')

class DailyDataIngestionJob {
  constructor() {
    // Use absolute path to kpi_data directory (mounted volume in Docker, relative path locally)
    this.tempDir = process.env.KPI_DATA_PATH || path.join(__dirname, '../../kpi_data')
    this.processedDates = new Set() // Track processed dates in memory
    this.ensureTempDir()
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true })
    } catch (error) {
      logger.error('Error creating temp directory:', error)
    }
  }

  start() {
    // Run initial scan on startup
    this.runInitialScan()

    // Run every day at 9:00 AM to check for new files
    cron.schedule('0 9 * * *', async () => {
      await this.runDailyCheck()
    })

    logger.info('Daily data ingestion job scheduled')
  }

  async runInitialScan() {
    logger.info('Starting initial scan of all available RAR files...')

    try {
      // Load already processed dates from database
      await this.loadProcessedDates()

      // Scan all monthly folders
      const monthlyFolders = await this.scanMonthlyFolders()

      for (const monthFolder of monthlyFolders) {
        await this.processMonthlyFolder(monthFolder)
      }

      logger.info('Initial scan completed')
    } catch (error) {
      logger.error('Error during initial scan:', error)
    }
  }

  async runDailyCheck() {
    logger.info('Starting daily check for new RAR files...')

    try {
      // Load current processed dates
      await this.loadProcessedDates()

      // Scan all monthly folders for new files
      const monthlyFolders = await this.scanMonthlyFolders()

      for (const monthFolder of monthlyFolders) {
        await this.processMonthlyFolder(monthFolder, true) // Only process new files
      }

      logger.info('Daily check completed')
    } catch (error) {
      logger.error('Error during daily check:', error)
    }
  }

  async loadProcessedDates() {
    try {
      // Get all distinct dates from DailyKpi table
      const processedRecords = await DailyKpi.findAll({
        attributes: ['date'],
        group: ['date'],
        raw: true
      })

      this.processedDates = new Set(processedRecords.map(record => record.date))
      logger.info(`Loaded ${this.processedDates.size} processed dates from database`)
    } catch (error) {
      logger.warn('Could not load processed dates from database, starting fresh:', error.message)
      this.processedDates = new Set()
    }
  }

  async scanMonthlyFolders() {
    try {
      const entries = await fs.readdir(this.tempDir, { withFileTypes: true })
      const monthlyFolders = entries
        .filter(entry => entry.isDirectory() && /^\d{6}$/.test(entry.name)) // YYYYMM format
        .map(entry => entry.name)
        .sort() // Process in chronological order

      logger.info(`Found ${monthlyFolders.length} monthly folders: ${monthlyFolders.join(', ')}`)
      return monthlyFolders
    } catch (error) {
      logger.error('Error scanning monthly folders:', error)
      return []
    }
  }

  async processMonthlyFolder(monthFolder, onlyNewFiles = false) {
    const monthPath = path.join(this.tempDir, monthFolder)

    try {
      const entries = await fs.readdir(monthPath, { withFileTypes: true })

      // First handle RAR files found directly in the month folder by extracting
      // them and moving any contained Excel files into a date folder.
      const rarFiles = entries
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.rar'))
        .map(entry => entry.name)

      for (const rarFile of rarFiles) {
        try {
          const rarFullPath = path.join(monthPath, rarFile)
          const dateMatch = rarFile.match(/(\d{8})\.rar$/)
          const targetDate = dateMatch ? dateMatch[1] : null

          logger.info(`Found RAR file ${rarFile} in ${monthFolder}`)

          // Extract RAR to a temporary extraction directory
          const extractPath = await ingestionService.extractRarFile(rarFullPath)

          // If the RAR filename contains a date, move extracted Excel files into the date folder
          if (targetDate) {
            const dateFolderPath = path.join(monthPath, targetDate)
            await fs.mkdir(dateFolderPath, { recursive: true })

            // Move any Excel files from extractPath into the date folder
            try {
              // Move Excel files recursively from extractPath into dateFolderPath
              await this.moveExcelsFromExtract(extractPath, dateFolderPath)
            } catch (moveErr) {
              logger.warn(`Could not move extracted files for ${rarFile}:`, moveErr.message)
            }

            // Cleanup extracted dir
            try { await fs.rm(extractPath, { recursive: true, force: true }) } catch (e) { }
          }
        } catch (err) {
          logger.error(`Failed to extract RAR ${rarFile}:`, err)
        }
      }

      // Look for date folders (YYYYMMDD format) or Excel files
      const dateFolders = entries
        .filter(entry => {
          if (entry.isDirectory() && /^\d{8}$/.test(entry.name)) {
            return true // Date folder like 20251001
          }
          if (entry.isFile() && (entry.name.toLowerCase().endsWith('.xlsx') || entry.name.toLowerCase().endsWith('.xls'))) {
            return true // Excel file
          }
          return false
        })
        .map(entry => {
          if (entry.isDirectory()) {
            return entry.name // Return date from folder name
          } else {
            // Extract date from Excel filename (handles .xls/.xlsx)
            const match = entry.name.match(/(\d{8})\.(xlsx|xls)$/i)
            return match ? match[1] : null
          }
        })
        .filter(date => date && /^\d{8}$/.test(date)) // Ensure valid date format
        .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
        .sort() // Process in chronological order

      logger.info(`Found ${dateFolders.length} date entries in ${monthFolder}: ${dateFolders.join(', ')}`)

      for (const date of dateFolders) {
        if (onlyNewFiles && this.processedDates.has(date)) {
          logger.debug(`Skipping already processed date: ${date}`)
          continue
        }

        try {
          await this.processDate(date)
          this.processedDates.add(date)
        } catch (error) {
          logger.error(`Failed to process date ${date}:`, error)
          // Continue with other dates
        }
      }
    } catch (error) {
      logger.error(`Error processing monthly folder ${monthFolder}:`, error)
    }
  }

  async processDate(date) {
    logger.info(`Processing data for date: ${date}`)

    try {
      // 1. Check for Excel files directly in the date folder
      const monthFolder = date.substring(0, 6) // YYYYMM
      const dateFolderPath = path.join(this.tempDir, monthFolder, date)

      logger.info(`Checking for Excel files in: ${dateFolderPath}`)
      try {
        await fs.access(dateFolderPath)
        logger.info(`Found date folder: ${dateFolderPath}`)
      } catch (error) {
        logger.info(`Date folder not found, checking for direct Excel files in month folder`)
        // If date folder doesn't exist, look for Excel files directly in month folder
        const monthFolderPath = path.join(this.tempDir, monthFolder)

        // First check if there's a RAR file for this date and extract it into a date folder
        const possibleRar = path.join(monthFolderPath, `${date}.rar`)
        try {
          await fs.access(possibleRar)
          logger.info(`Found RAR for date ${date}: ${possibleRar} — extracting now`)
          try {
            const extractPath = await ingestionService.extractRarFile(possibleRar)

            // Ensure date folder exists and move any extracted Excel files into it
            const tempDateFolder = path.join(monthFolderPath, date)
            await fs.mkdir(tempDateFolder, { recursive: true })

            // Move Excel files recursively from extractPath into tempDateFolder
            try {
              await this.moveExcelsFromExtract(extractPath, tempDateFolder)
            } catch (e) {
              logger.warn(`Failed moving extracted files for ${possibleRar}:`, e.message)
            }

            // Cleanup extracted directory
            try { await fs.rm(extractPath, { recursive: true, force: true }) } catch (e) { }
          } catch (err) {
            logger.error(`Failed to extract RAR ${possibleRar}:`, err)
          }
        } catch (rarNotFoundErr) {
          // No RAR for this date; proceed to look for direct Excel files
        }

        await this.processExcelFilesInFolder(monthFolderPath, date)
        return
      }

      // 2. Parse Excel files directly from the date folder
      logger.info('Parsing Excel files...')
      await excelParserService.parseAllFiles(dateFolderPath, date)
      logger.info('Parsed all Excel files')

      // 3. Calculate aggregated KPIs
      logger.info('Calculating aggregated KPIs...')
      await kpiCalculatorService.calculateDailyAggregates(date)
      logger.info('Calculated aggregated KPIs')

      // 4. Clear cache
      logger.info('Clearing cache...')
      await cacheService.clearAll()
      logger.info('Cleared cache')

      logger.info(`Successfully completed data ingestion for date: ${date}`)
    } catch (error) {
      logger.error(`Error during data ingestion for date ${date}:`, error)
      throw error
    }
  }

  async processExcelFilesInFolder(folderPath, date) {
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true })
      const excelFiles = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.xlsx') && entry.name.includes(date))
        .map(entry => entry.name)

      if (excelFiles.length === 0) {
        logger.warn(`No Excel files found for date ${date} in ${folderPath}`)
        return
      }

      logger.info(`Found ${excelFiles.length} Excel files for date ${date}`)

      // Create a temporary folder with the Excel files for parsing
      const tempDateFolder = path.join(folderPath, date)
      await fs.mkdir(tempDateFolder, { recursive: true })

      // Copy Excel files to the temp folder
      for (const excelFile of excelFiles) {
        const srcPath = path.join(folderPath, excelFile)
        const destPath = path.join(tempDateFolder, excelFile)
        await fs.copyFile(srcPath, destPath)
        logger.info(`Copied ${excelFile} to ${tempDateFolder}`)
      }

      // Parse the Excel files
      await excelParserService.parseAllFiles(tempDateFolder, date)

      // Calculate aggregated KPIs
      await kpiCalculatorService.calculateDailyAggregates(date)

      // Clear cache
      await cacheService.clearAll()

      // Cleanup temp folder
      await fs.rm(tempDateFolder, { recursive: true, force: true })
      logger.info(`Cleaned up temporary folder: ${tempDateFolder}`)

    } catch (error) {
      logger.error(`Error processing Excel files in folder ${folderPath}:`, error)
      throw error
    }
  }

  // Recursively find Excel files under an extraction path and move them into destFolder
  async moveExcelsFromExtract(extractPath, destFolder) {
    const walk = async (current) => {
      const entries = await fs.readdir(current, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(current, e.name)
        if (e.isDirectory()) {
          await walk(full)
        } else if (e.isFile()) {
          const lower = e.name.toLowerCase()
          if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
            const dest = path.join(destFolder, e.name)
            try {
              await fs.mkdir(path.dirname(dest), { recursive: true })
              await fs.rename(full, dest)
              logger.info(`Moved extracted Excel ${e.name} -> ${dest}`)
            } catch (err) {
              logger.warn(`Failed to move extracted file ${full} -> ${dest}:`, err.message)
            }
          }
        }
      }
    }

    await walk(extractPath)
  }

  async tryFindLocalFile(date) {
    const possiblePaths = [
      // Primary: Date folder
      path.join(this.tempDir, date.substring(0, 6), date),
      // Fallback: Excel files directly in month folder
      path.join(this.tempDir, date.substring(0, 6))
    ]

    for (const filePath of possiblePaths) {
      try {
        logger.info(`Checking for data at: ${filePath}`)
        const stats = await fs.stat(filePath)

        if (stats.isDirectory()) {
          // Check if directory contains Excel files
          const files = await fs.readdir(filePath)
          const hasExcelFiles = files.some(file => file.endsWith('.xlsx') && file.includes(date))
          if (hasExcelFiles) {
            logger.info(`Found Excel files for date ${date} in: ${filePath}`)
            return true
          }
        }
        // Continue checking other paths
      } catch (error) {
        logger.debug(`Path not found or not accessible: ${filePath}`)
        continue
      }
    }

    return false
  }

  // For manual trigger - process a specific date
  async runForDate(date) {
    logger.info(`Manually triggering data ingestion for date: ${date}`)
    await this.processDate(date)
  }
}

module.exports = new DailyDataIngestionJob()