const ftp = require('basic-ftp')
const fs = require('fs').promises
const path = require('path')
const unrar = require('node-unrar-js')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

class DailyDataIngestionService {
  constructor() {
    this.ftpConfig = {
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    }
  }

  /**
   * Download and process yesterday's data file
   */
  async ingestYesterdayData() {
    console.log('🚀 Starting daily data ingestion...')

    try {
      // Calculate yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

      console.log(`📅 Processing data for: ${yesterdayStr}`)

      // Find and download the data file
      const localFilePath = await this.downloadYesterdayFile(yesterdayStr)

      // Extract the RAR file
      const extractPath = await this.extractRarFile(localFilePath)

      // Process the extracted data
      await this.processExtractedData(extractPath, yesterdayStr)

      console.log('✅ Daily data ingestion completed successfully!')

    } catch (error) {
      console.error('❌ Daily data ingestion failed:', error.message)
      throw error
    }
  }

  /**
   * Find and download yesterday's data file from FTP
   */
  async downloadYesterdayFile(yesterdayStr) {
    const client = new ftp.Client()
    client.ftp.verbose = false

    try {
      console.log('🔍 Connecting to FTP server...')
      await client.access(this.ftpConfig)

      // Get current month folder (YYYYMM)
      const currentMonth = yesterdayStr.substring(0, 6)
      const monthPath = `/${currentMonth}/`

      console.log(`📁 Looking in monthly folder: ${monthPath}`)

      // List files in the monthly folder
      const monthFiles = await client.list(monthPath)

      // Find yesterday's RAR file
      const targetFile = monthFiles.find(file =>
        file.name === `${yesterdayStr}.rar`
      )

      if (!targetFile) {
        throw new Error(`RAR file not found for ${yesterdayStr} in ${monthPath}`)
      }

      console.log(`📄 Found file: ${targetFile.name} (${targetFile.size} bytes)`)

      // Create temp directory
      const tempDir = path.join(__dirname, '../../temp')
      await fs.mkdir(tempDir, { recursive: true })

      // Download the file
      const localPath = path.join(tempDir, targetFile.name)
      console.log(`⬇️ Downloading to: ${localPath}`)

      await client.downloadTo(localPath, monthPath + targetFile.name)

      console.log('✅ File downloaded successfully!')
      return localPath

    } finally {
      client.close()
    }
  }

  /**
   * Extract RAR file to temp directory
   */
  async extractRarFile(rarPath) {
    console.log(`📦 Extracting RAR file: ${rarPath}`)

    // Create extraction directory
    const extractPath = rarPath.replace('.rar', '_extracted')
    await fs.mkdir(extractPath, { recursive: true })

    // Try using command-line 7z/unrar if available (more reliable)
    try {
      // Prefer 7z if present
      const cmd7z = `7z x -y -o"${extractPath}" "${rarPath}"`
      await execAsync(cmd7z)
      console.log(`✅ RAR extracted to: ${extractPath} using 7z`)
      return extractPath
    } catch (cmdErr) {
      console.warn('7z extraction failed or not available, falling back to node-unrar-js:', cmdErr.message)
      try {
        const extractor = await unrar.createExtractorFromFile({
          filepath: rarPath,
          targetPath: extractPath
        })
        const result = extractor.extract()
        const files = result && result.files ? result.files : []
        console.log(`✅ RAR extraction (node-unrar-js) completed to: ${extractPath}`)
        console.log(`📁 Extracted ${files.length} files`)
        return extractPath
      } catch (fallbackErr) {
        console.error('Failed to extract RAR with node-unrar-js:', fallbackErr.message)
        throw fallbackErr
      }
    }
  }

  /**
   * Process the extracted data files
   */
  async processExtractedData(extractPath, dateStr) {
    console.log(`🔄 Processing extracted data from: ${extractPath}`)

    // List extracted files
    const files = await fs.readdir(extractPath)
    console.log(`📁 Found ${files.length} extracted files:`, files)

    // Look for Excel files
    const excelFiles = files.filter(file =>
      file.endsWith('.xlsx') || file.endsWith('.xls')
    )

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in extracted data')
    }

    console.log(`📊 Found ${excelFiles.length} Excel files:`, excelFiles)

    // TODO: Process each Excel file and extract KPI data
    // This will be implemented in the next step

    console.log('✅ Data processing placeholder completed')
  }
}

module.exports = new DailyDataIngestionService()