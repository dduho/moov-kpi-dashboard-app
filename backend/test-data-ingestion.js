// Test complete data ingestion
const dailyDataIngestionService = require('./src/services/dailyDataIngestionService')

async function testDataIngestion() {
  console.log('🧪 Testing complete data ingestion pipeline...')

  try {
    await dailyDataIngestionService.ingestYesterdayData()
    console.log('🎉 Data ingestion test completed successfully!')
  } catch (error) {
    console.error('❌ Data ingestion test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testDataIngestion()