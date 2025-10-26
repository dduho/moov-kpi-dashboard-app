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
const { DailyKpi } = require('../models')

class DailyDataIngestionJob {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp')
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
      const rarFiles = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.rar'))
        .map(entry => entry.name.replace('.rar', '')) // Remove .rar extension to get date
        .filter(date => /^\d{8}$/.test(date)) // Ensure it's a valid date format
        .sort() // Process in chronological order

      logger.info(`Found ${rarFiles.length} RAR files in ${monthFolder}`)

      for (const date of rarFiles) {
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
      // 1. Check for RAR file
      const monthFolder = date.substring(0, 6) // YYYYMM
      const rarPath = path.join(this.tempDir, monthFolder, `${date}.rar`)

      logger.info(`Checking for RAR file: ${rarPath}`)
      try {
        await fs.access(rarPath)
        logger.info(`Found RAR file: ${rarPath}`)
      } catch (error) {
        throw new Error(`RAR file not found: ${rarPath}`)
      }

      // 2. Extract RAR
      const extractPath = path.join(this.tempDir, date)
      logger.info(`Extracting RAR files to ${extractPath}...`)
      await this.extractRar(rarPath, extractPath)
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

      // 6. Cleanup temp files (but keep the original RAR file)
      logger.info('Cleaning up temporary files...')
      await this.cleanup(extractPath)
      logger.info('Cleaned up temporary files')

      logger.info(`Successfully completed data ingestion for date: ${date}`)
    } catch (error) {
      logger.error(`Error during data ingestion for date ${date}:`, error)
      throw error
    }
  }

  async tryFindLocalFile(date) {
    const possiblePaths = [
      // Primary: RAR files in monthly folders
      path.join(this.tempDir, date.substring(0, 6), `${date}.rar`),
      // Fallback: RAR file in root temp directory
      path.join(this.tempDir, `${date}.rar`)
    ]

    for (const filePath of possiblePaths) {
      try {
        logger.info(`Checking for local file: ${filePath}`)
        await fs.access(filePath)
        logger.info(`Found local file: ${filePath}`)
        return true
      } catch (error) {
        logger.debug(`File not found at ${filePath}:`, error.message)
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

  async extractRar(rarPath, extractPath) {
    const { spawn } = require('child_process')
    const os = require('os')
    
    return new Promise((resolve, reject) => {
      const isWindows = os.platform() === 'win32'
      
      if (isWindows) {
        // Windows: Use PowerShell to extract RAR files
        const psCommand = `
          $rarPath = "${rarPath.replace(/\\/g, '\\\\')}"
          $extractPath = "${extractPath.replace(/\\/g, '\\\\')}"
          
          # Create extraction directory if it doesn't exist
          if (!(Test-Path $extractPath)) {
            New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
          }
          
          # Extract RAR file using Windows built-in expand command or 7zip if available
          try {
            # Try with 7zip first (more reliable)
            $sevenZip = "C:\\Program Files\\7-Zip\\7z.exe"
            if (Test-Path $sevenZip) {
              & $sevenZip x "$rarPath" "-o$extractPath" "-y"
            } else {
              # Fallback to PowerShell Expand-Archive (for ZIP files) or COM object
              $shell = New-Object -ComObject Shell.Application
              $rar = $shell.NameSpace("$rarPath")
              $destination = $shell.NameSpace("$extractPath")
              $destination.CopyHere($rar.Items(), 16)
            }
          } catch {
            throw "Failed to extract RAR file: $($_.Exception.Message)"
          }
        `
        
        const powershell = spawn('powershell.exe', ['-Command', psCommand], {
          stdio: ['pipe', 'pipe', 'pipe']
        })
        
        let stdout = ''
        let stderr = ''
        
        powershell.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        powershell.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        powershell.on('close', (code) => {
          if (code === 0) {
            logger.info(`Successfully extracted RAR file to ${extractPath}`)
            resolve()
          } else {
            logger.error(`PowerShell extraction failed with code ${code}`)
            logger.error(`stdout: ${stdout}`)
            logger.error(`stderr: ${stderr}`)
            reject(new Error(`Failed to extract RAR file: ${stderr || stdout}`))
          }
        })
        
        powershell.on('error', (error) => {
          logger.error('Error spawning PowerShell for RAR extraction:', error)
          reject(error)
        })
      } else {
        // Linux: Use unrar or 7z command
        const linuxCommand = `
          mkdir -p "${extractPath}" &&
          if command -v unrar >/dev/null 2>&1; then
            unrar x -o+ "${rarPath}" "${extractPath}/"
          elif command -v 7z >/dev/null 2>&1; then
            7z x "${rarPath}" -o"${extractPath}"
          else
            echo "Neither unrar nor 7z found. Please install unrar or p7zip-full"
            exit 1
          fi
        `
        
        const bash = spawn('bash', ['-c', linuxCommand], {
          stdio: ['pipe', 'pipe', 'pipe']
        })
        
        let stdout = ''
        let stderr = ''
        
        bash.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        bash.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        bash.on('close', (code) => {
          if (code === 0) {
            logger.info(`Successfully extracted RAR file to ${extractPath}`)
            resolve()
          } else {
            logger.error(`Linux extraction failed with code ${code}`)
            logger.error(`stdout: ${stdout}`)
            logger.error(`stderr: ${stderr}`)
            reject(new Error(`Failed to extract RAR file: ${stderr || stdout}`))
          }
        })
        
        bash.on('error', (error) => {
          logger.error('Error spawning bash for RAR extraction:', error)
          reject(error)
        })
      }
    })
  }

  async cleanup(extractPath) {
    try {
      // Remove the extracted directory but keep the original RAR file
      await fs.rm(extractPath, { recursive: true, force: true })
      logger.info(`Cleaned up temporary extraction directory: ${extractPath}`)
    } catch (error) {
      logger.warn(`Failed to cleanup ${extractPath}:`, error.message)
    }
  }
}

module.exports = new DailyDataIngestionJob()