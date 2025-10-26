const path = require('path')
const fs = require('fs').promises
const dailyDataIngestionService = require('../src/services/dailyDataIngestionService')

async function importExistingExcelFiles() {
  console.log('🔄 Starting import of existing Excel files...\n')

  const kpiDataPath = process.env.KPI_DATA_PATH || path.join(__dirname, '../../kpi_data')

  try {
    // Get all month directories
    const monthDirs = await fs.readdir(kpiDataPath)
    const validMonthDirs = monthDirs.filter(dir => /^\d{6}$/.test(dir) && dir !== 'processed').sort()

    console.log(`Found ${validMonthDirs.length} month directories to scan`)

    let totalProcessed = 0
    let totalErrors = 0
    const processedDates = []

    for (const monthDir of validMonthDirs) {
      const monthPath = path.join(kpiDataPath, monthDir)

      try {
        const dateDirs = (await fs.readdir(monthPath))
          .filter(dir => /^\d{8}$/.test(dir))
          .sort()

        console.log(`\n📁 Scanning ${monthDir} - ${dateDirs.length} date folders`)

        for (const dateDir of dateDirs) {
          const datePath = path.join(monthPath, dateDir)

          const year = dateDir.substring(0, 4)
          const month = dateDir.substring(4, 6)
          const day = dateDir.substring(6, 8)
          const formattedDate = `${year}-${month}-${day}`

          try {
            // Check if folder has Excel files
            const files = await fs.readdir(datePath)
            const excelFiles = files.filter(f => f.endsWith('.xlsx'))

            if (excelFiles.length === 0) {
              console.log(`  ⏭️  Skipping ${dateDir} - no Excel files`)
              continue
            }

            console.log(`  📥 Processing ${dateDir} (${formattedDate}) - ${excelFiles.length} Excel files`)

            // Process with the daily data ingestion service
            await dailyDataIngestionService.processDateFolder(datePath, formattedDate)

            totalProcessed++
            processedDates.push(formattedDate)
            console.log(`  ✅ Successfully imported ${formattedDate}`)

          } catch (error) {
            totalErrors++
            console.error(`  ❌ Error processing ${dateDir}:`, error.message)
          }
        }
      } catch (error) {
        console.error(`  ⚠️  Error reading month ${monthDir}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully imported: ${totalProcessed} dates`)
    console.log(`❌ Errors: ${totalErrors} dates`)
    console.log('='.repeat(60))

    if (processedDates.length > 0) {
      console.log(`\n📅 Date range: ${processedDates[0]} to ${processedDates[processedDates.length - 1]}`)
    }

  } catch (error) {
    console.error('❌ Fatal error during import:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  importExistingExcelFiles()
}

module.exports = importExistingExcelFiles
