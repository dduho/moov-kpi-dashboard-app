const DailyDataIngestionJob = require('./backend/src/jobs/dailyDataIngestion')

async function testDataIngestion() {
  try {
    console.log('Testing data ingestion for yesterday...')

    // Test the ingestion logic
    await DailyDataIngestionJob.run()

    console.log('Data ingestion test completed successfully')
  } catch (error) {
    console.error('Data ingestion test failed:', error.message)
    console.error('Full error:', error)
  }
}

testDataIngestion()