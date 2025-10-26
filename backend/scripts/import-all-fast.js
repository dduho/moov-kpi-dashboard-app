const dailyDataIngestionJob = require('../src/jobs/dailyDataIngestion')
const { sequelize } = require('../src/models')

async function importAllDates() {
  console.log('🔄 Starting fast import of all dates...\n')

  const startDate = new Date('2025-07-01')
  const endDate = new Date('2025-10-22')

  const dates = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}${month}${day}`

    dates.push(dateStr)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log(`📅 Total dates to import: ${dates.length}\n`)

  // Connect to database
  await sequelize.authenticate()
  console.log('✅ Database connected\n')

  let success = 0
  let errors = 0
  const startTime = Date.now()

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const progress = ((i + 1) / dates.length * 100).toFixed(1)

    try {
      process.stdout.write(`\r📥 [${progress}%] Importing ${date}... `)
      await dailyDataIngestionJob.runForDate(date)
      success++
      process.stdout.write(`✅`)
    } catch (error) {
      errors++
      console.log(`\n❌ ${date} failed: ${error.message}`)
    }

    // Show summary every 10 dates
    if ((i + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const avgTime = (elapsed / (i + 1)).toFixed(1)
      const remaining = ((dates.length - i - 1) * avgTime / 60).toFixed(1)
      console.log(`\n   📊 Progress: ${i + 1}/${dates.length} | ⏱️  Avg: ${avgTime}s/date | ⏳ ETA: ${remaining}min`)
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

  console.log('\n\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully imported: ${success} dates`)
  console.log(`❌ Errors: ${errors} dates`)
  console.log(`⏱️  Total time: ${totalTime} minutes`)
  console.log(`⚡ Average: ${(success > 0 ? ((Date.now() - startTime) / 1000 / success).toFixed(1) : 0)}s per date`)
  console.log('='.repeat(60))

  process.exit(errors > 0 ? 1 : 0)
}

// Run if called directly
if (require.main === module) {
  importAllDates().catch(err => {
    console.error('\n❌ Fatal error:', err.message)
    process.exit(1)
  })
}

module.exports = importAllDates
