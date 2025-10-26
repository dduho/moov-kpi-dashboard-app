const path = require('path')
const fs = require('fs').promises
const { execSync } = require('child_process')

async function extractAllRars() {
  console.log('🔄 Extracting all RAR files...\n')

  const kpiDataPath = process.env.KPI_DATA_PATH || path.join(__dirname, '../../kpi_data')
  const processedPath = path.join(kpiDataPath, 'processed')

  try {
    // Get all month directories in processed folder
    const monthDirs = await fs.readdir(processedPath)
    const validMonthDirs = monthDirs.filter(dir => /^\d{6}$/.test(dir)).sort()

    console.log(`Found ${validMonthDirs.length} month directories in processed folder\n`)

    let total = 0
    let success = 0
    let errors = 0
    let skipped = 0

    for (const monthDir of validMonthDirs) {
      const monthProcessedPath = path.join(processedPath, monthDir)
      const rarFiles = (await fs.readdir(monthProcessedPath))
        .filter(file => file.endsWith('.rar'))
        .sort()

      console.log(`📁 Processing ${monthDir} - ${rarFiles.length} RAR files`)

      for (const rarFile of rarFiles) {
        total++
        const rarPath = path.join(monthProcessedPath, rarFile)
        const dateStr = rarFile.replace('.rar', '')

        // Create extract directory in main kpi_data folder
        const extractDir = path.join(kpiDataPath, monthDir, dateStr)

        try {
          // Check if already extracted
          const exists = await fs.access(extractDir).then(() => true).catch(() => false)
          if (exists) {
            const files = await fs.readdir(extractDir)
            const excelFiles = files.filter(f => f.endsWith('.xlsx'))
            if (excelFiles.length > 0) {
              console.log(`  ⏭️  ${dateStr} - already extracted (${excelFiles.length} Excel files)`)
              skipped++
              continue
            }
          }

          // Create directory
          await fs.mkdir(extractDir, { recursive: true })

          // Extract using 7z
          console.log(`  📥 Extracting ${dateStr}...`)
          execSync(`7z x "${rarPath}" -o"${extractDir}" -y`, {
            stdio: 'pipe',
            windowsHide: true
          })

          // Verify extraction
          const files = await fs.readdir(extractDir)
          const excelFiles = files.filter(f => f.endsWith('.xlsx'))

          if (excelFiles.length > 0) {
            success++
            console.log(`  ✅ ${dateStr} - extracted ${excelFiles.length} Excel files`)
          } else {
            errors++
            console.log(`  ❌ ${dateStr} - no Excel files found after extraction`)
          }

        } catch (error) {
          errors++
          console.error(`  ❌ ${dateStr} - extraction failed:`, error.message)
        }
      }

      console.log('') // Empty line between months
    }

    console.log('='.repeat(60))
    console.log('📊 EXTRACTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`📁 Total RAR files: ${total}`)
    console.log(`✅ Successfully extracted: ${success}`)
    console.log(`⏭️  Already extracted: ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Fatal error during extraction:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  extractAllRars()
}

module.exports = extractAllRars
