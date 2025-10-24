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

class DailyDataIngestionJob {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp')
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
    // Run every day at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      await this.run()
    })

    logger.info('Daily data ingestion job scheduled')
  }

  async run() {
    const date = this.getYesterdayDate()
    logger.info(`Starting daily data ingestion for date: ${date}`)

    try {
      // Try multiple file patterns and locations
      const fileFound = await this.tryFindAndDownloadFile(date)

      if (!fileFound) {
        logger.warn(`No file found for date: ${date}`)
        return
      }

      // 2. Extract RAR or ZIP
      const extractPath = path.join(this.tempDir, date)
      logger.info(`Extracting files to ${extractPath}...`)

      // Determine file type and extract accordingly
      const downloadedFile = path.join(this.tempDir, `${date}.rar`)
      const isRar = await this.isRarFile(downloadedFile)

      if (isRar) {
        await this.extractRar(downloadedFile, extractPath)
        logger.info(`Extracted RAR files to ${extractPath}`)
      } else {
        // Try ZIP extraction
        await this.extractZip(downloadedFile, extractPath)
        logger.info(`Extracted ZIP files to ${extractPath}`)
      }

      // 3. Parse Excel files
      const filesDirectory = path.join(extractPath, date)
      logger.info('Parsing Excel files...')
      await excelParserService.parseAllFiles(filesDirectory, date)
      logger.info('Parsed all Excel files')

      // 4. Calculate aggregated KPIs
      logger.info('Calculating aggregated KPIs...')
      await kpiCalculatorService.calculateDailyAggregates(date)
      logger.info('Calculated aggregated KPIs')

      // 5. Clear cache
      logger.info('Clearing cache...')
      await cacheService.clearAll()
      logger.info('Cleared cache')

      // 6. Cleanup temp files
      logger.info('Cleaning up temporary files...')
      await this.cleanup(extractPath, downloadedFile)
      logger.info('Cleaned up temporary files')

      logger.info(`Successfully completed data ingestion for date: ${date}`)
    } catch (error) {
      logger.error(`Error during data ingestion for date ${date}:`, error)
      // Send alert notification
      // await notificationService.sendAlert('Data Ingestion Failed', error.message)
    }
  }

  async tryFindAndDownloadFile(date) {
    const possiblePaths = [
      // Primary: RAR files in monthly folders
      { path: `${date.substring(0, 6)}/${date}.rar`, type: 'rar' },
      // Fallback: ZIP files in root with timestamp
      { path: `${date}*.zip`, type: 'zip_pattern' },
      // Alternative: Direct RAR in root
      { path: `${date}.rar`, type: 'rar' }
    ]

    for (const filePattern of possiblePaths) {
      try {
        logger.info(`Trying to find file: ${filePattern.path}`)

        if (filePattern.type === 'zip_pattern') {
          // Special handling for ZIP files with timestamps
          const files = await ftpService.listFiles('/')
          const matchingFile = files.find(file =>
            file.name.startsWith(date) &&
            file.name.endsWith('.zip') &&
            file.type === 0
          )

          if (matchingFile) {
            logger.info(`Found ZIP file: ${matchingFile.name}`)
            const localPath = path.join(this.tempDir, `${date}.zip`)
            await ftpService.downloadFile(matchingFile.name, localPath)
            // Rename to .rar for consistency
            await fs.rename(localPath, path.join(this.tempDir, `${date}.rar`))
            return true
          }
        } else {
          // Standard file download
          const localPath = path.join(this.tempDir, `${date}.rar`)
          await ftpService.downloadFile(filePattern.path, localPath)
          logger.info(`Downloaded file: ${filePattern.path}`)
          return true
        }
      } catch (error) {
        logger.debug(`File not found at ${filePattern.path}:`, error.message)
        continue
      }
    }

    return false
  }

  async extractRar(rarPath, extractPath) {
    try {
      // Create extract directory
      await fs.mkdir(extractPath, { recursive: true })

      // Extract RAR file
      const extractor = await unrar.createExtractorFromFile({
        filepath: rarPath,
        targetPath: extractPath
      })

      const { files } = extractor.extract()
      logger.info(`Extracted ${files.length} files from RAR`)
    } catch (error) {
      logger.error('Error extracting RAR file:', error)
      throw error
    }
  }

  async extractZip(zipPath, extractPath) {
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(extractPath, true)
  }

  async cleanup(extractPath, rarPath) {
    try {
      await fs.rm(extractPath, { recursive: true, force: true })
      await fs.unlink(rarPath)
    } catch (error) {
      logger.error('Error during cleanup:', error)
    }
  }

  getYesterdayDate() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const year = yesterday.getFullYear()
    const month = String(yesterday.getMonth() + 1).padStart(2, '0')
    const day = String(yesterday.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  // For manual trigger
  async runForDate(date) {
    logger.info(`Manually triggering data ingestion for date: ${date}`)
    // Similar logic as run() but with custom date
    try {
      // 1. Download file from FTP (RAR format with monthly folder structure)
      const rarFileName = `${date}.rar`
      const localRarPath = path.join(this.tempDir, rarFileName)

      // Build remote path: /Huawei/Kaly/KPI/YYYYMM/YYYYMMDD.rar
      const monthFolder = date.substring(0, 6) // YYYYMM
      const remoteFilePath = path.join(monthFolder, rarFileName)

      logger.info(`Downloading ${remoteFilePath} from FTP...`)
      await ftpService.downloadFile(remoteFilePath, localRarPath)
      logger.info(`Downloaded ${remoteFilePath} from FTP`)

      // 2. Extract RAR
      const extractPath = path.join(this.tempDir, date)
      logger.info(`Extracting RAR files to ${extractPath}...`)
      await this.extractRar(localRarPath, extractPath)
      logger.info(`Extracted RAR files to ${extractPath}`)

      // 3. Parse Excel files
      const filesDirectory = path.join(extractPath, date)
      logger.info('Parsing Excel files...')
      await excelParserService.parseAllFiles(filesDirectory, date)
      logger.info('Parsed all Excel files')

      // 4. Calculate aggregated KPIs
      logger.info('Calculating aggregated KPIs...')
      await kpiCalculatorService.calculateDailyAggregates(date)
      logger.info('Calculated aggregated KPIs')

      // 5. Clear cache
      logger.info('Clearing cache...')
      await cacheService.clearAll()
      logger.info('Cleared cache')

      // 6. Cleanup temp files
      logger.info('Cleaning up temporary files...')
      await this.cleanup(extractPath, localRarPath)
      logger.info('Cleaned up temporary files')

      logger.info(`Successfully completed data ingestion for date: ${date}`)
    } catch (error) {
      logger.error(`Error during manual data ingestion for date ${date}:`, error)
      throw error
    }
  }

  async isRarFile(filePath) {
    try {
      // Simple check: try to read RAR signature
      const fs = require('fs')
      const buffer = Buffer.alloc(4)
      const fd = fs.openSync(filePath, 'r')
      fs.readSync(fd, buffer, 0, 4, 0)
      fs.closeSync(fd)

      // RAR signature: 0x52617221
      return buffer.readUInt32LE(0) === 0x52617221
    } catch (error) {
      return false
    }
  }
}

module.exports = new DailyDataIngestionJob()