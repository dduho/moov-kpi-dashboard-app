// Test RAR download and extraction
const dailyDataIngestionService = require('./src/services/dailyDataIngestionService')

async function testRarDownloadAndExtract() {
  console.log('🧪 Testing RAR download and extraction...')

  try {
    // Calculate yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

    console.log(`📅 Testing with date: ${yesterdayStr}`)

    // Test download
    console.log('⬇️ Testing download...')
    const localFilePath = await dailyDataIngestionService.downloadYesterdayFile(yesterdayStr)
    console.log(`✅ Download successful: ${localFilePath}`)

    // Check file exists
    const fs = require('fs')
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath)
      console.log(`📊 File size: ${stats.size} bytes`)
    }

    // Test extraction
    console.log('📦 Testing extraction...')
    const extractPath = await dailyDataIngestionService.extractRarFile(localFilePath)
    console.log(`✅ Extraction successful: ${extractPath}`)

    // List extracted files
    const files = fs.readdirSync(extractPath)
    console.log(`📁 Extracted ${files.length} files:`)
    files.forEach(file => {
      const filePath = require('path').join(extractPath, file)
      const stats = fs.statSync(filePath)
      console.log(`  📄 ${file} (${stats.size} bytes)`)
    })

    console.log('🎉 RAR download and extraction test completed successfully!')

  } catch (error) {
    console.error('❌ RAR test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testRarDownloadAndExtract()