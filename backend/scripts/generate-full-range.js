const generateTestExcelFiles = require('./generate-test-data')

async function generateFullRange() {
  const startDate = new Date('2025-07-01')
  const endDate = new Date('2025-10-22')

  console.log('🔄 Generating test data from 2025-07-01 to 2025-10-22...\n')

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

  console.log(`📅 Total dates to generate: ${dates.length}\n`)

  let success = 0
  let errors = 0

  for (const dateStr of dates) {
    try {
      console.log(`📥 Generating ${dateStr}...`)
      await generateTestExcelFiles(dateStr)
      success++
      console.log(`✅ ${dateStr} generated successfully\n`)
    } catch (error) {
      errors++
      console.error(`❌ ${dateStr} failed:`, error.message, '\n')
    }
  }

  console.log('='.repeat(60))
  console.log('📊 GENERATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully generated: ${success} dates`)
  console.log(`❌ Errors: ${errors} dates`)
  console.log('='.repeat(60))

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  generateFullRange()
}

module.exports = generateFullRange
