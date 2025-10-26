const dailyDataIngestionJob = require('./src/jobs/dailyDataIngestion')

async function processMissingDates() {
  console.log('Processing missing dates with corrected file patterns...')

  // Dates that are available in RAR files but not processed yet
  const missingDates = [
    '20250704',
    '20250705',
    '20250706',
    '20250707',
    '20250802',
    '20250804'
  ]

  for (const date of missingDates) {
    try {
      console.log(`Processing date: ${date}`)
      await dailyDataIngestionJob.runForDate(date)
      console.log(`Successfully processed date: ${date}`)
    } catch (error) {
      console.error(`Failed to process date ${date}:`, error.message)
      // Continue with other dates
    }
  }

  console.log('Finished processing missing dates')
}

// Run the script
processMissingDates().catch(console.error)