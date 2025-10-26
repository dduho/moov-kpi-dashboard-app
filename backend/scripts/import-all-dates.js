const dailyDataIngestionJob = require('../src/jobs/dailyDataIngestion')
const { sequelize } = require('../src/models')

async function importAllDates() {
  console.log('🔄 Importing all generated data into database...\n')

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
  await sequelize.sync()
  console.log('✅ Connected to database\n')

  let success = 0
  let errors = 0

  for (const date of dates) {
    try {
      console.log(`📥 Importing ${date}...`)
      await dailyDataIngestionJob.runForDate(date)
      success++
      console.log(`✅ ${date} imported successfully`)
    } catch (error) {
      errors++
      console.error(`❌ ${date} failed:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully imported: ${success} dates`)
  console.log(`❌ Errors: ${errors} dates`)
  console.log('='.repeat(60))

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  importAllDates().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}

module.exports = importAllDates
