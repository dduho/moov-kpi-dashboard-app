const path = require('path')
const fs = require('fs').promises
const DailyDataIngestionService = require('../src/services/dailyDataIngestionService')

async function reimportAllData() {
  console.log('🔄 Starting re-import of all RAR files...\n')

  const kpiDataPath = process.env.KPI_DATA_PATH || path.join(__dirname, '../../kpi_data')
  const processedPath = path.join(kpiDataPath, 'processed')

  try {
    // Get all month directories
    const monthDirs = await fs.readdir(processedPath)
    const validMonthDirs = monthDirs.filter(dir => /^\d{6}$/.test(dir)).sort()

    console.log(`Found ${validMonthDirs.length} month directories`)

    let totalProcessed = 0
    let totalErrors = 0

    for (const monthDir of validMonthDirs) {
      const monthPath = path.join(processedPath, monthDir)
      const rarFiles = (await fs.readdir(monthPath))
        .filter(file => file.endsWith('.rar'))
        .sort()

      console.log(`\n📁 Processing ${monthDir} - ${rarFiles.length} RAR files`)

      for (const rarFile of rarFiles) {
        const rarPath = path.join(monthPath, rarFile)
        const dateMatch = rarFile.match(/^(\d{8})\.rar$/)

        if (!dateMatch) {
          console.log(`  ⚠️  Skipping invalid filename: ${rarFile}`)
          continue
        }

        const dateStr = dateMatch[1]
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        const formattedDate = `${year}-${month}-${day}`

        try {
          console.log(`  📥 Processing ${rarFile} (${formattedDate})...`)

          // Extract RAR to temp directory
          const extractDir = path.join(kpiDataPath, monthDir, dateStr)
          await fs.mkdir(extractDir, { recursive: true })

          // Use 7z to extract RAR
          const { execSync } = require('child_process')
          try {
            execSync(`7z x "${rarPath}" -o"${extractDir}" -y`, {
              stdio: 'pipe',
              windowsHide: true
            })
          } catch (err) {
            console.log(`  ⚠️  7z extraction failed, trying node-unrar-js...`)
            // Fallback to node-unrar-js if 7z fails
            const unrar = require('node-unrar-js')
            const buf = await fs.readFile(rarPath)
            const extractor = unrar.createExtractorFromData({ data: buf })
            const list = extractor.getFileList()
            const extracted = extractor.extract({ files: list[1].fileHeaders.map(f => f.name) })

            for (const file of extracted[1].files) {
              const filePath = path.join(extractDir, file.fileHeader.name)
              await fs.mkdir(path.dirname(filePath), { recursive: true })
              await fs.writeFile(filePath, file.extract[1])
            }
          }

          // Process extracted Excel files
          const service = new DailyDataIngestionService()
          await service.processDateFolder(extractDir, formattedDate)

          totalProcessed++
          console.log(`  ✅ Successfully processed ${dateStr}`)

        } catch (error) {
          totalErrors++
          console.error(`  ❌ Error processing ${rarFile}:`, error.message)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RE-IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully processed: ${totalProcessed} dates`)
    console.log(`❌ Errors: ${totalErrors} dates`)
    console.log(`📁 Total RAR files found: ${totalProcessed + totalErrors}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Fatal error during re-import:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  reimportAllData()
}

module.exports = reimportAllData
