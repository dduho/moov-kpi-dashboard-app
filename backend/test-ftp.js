// Test script for FTP connection
const ftpService = require('./src/services/ftpService')

async function testFTPConnection() {
  try {
    console.log('🔍 Testing FTP connection to 10.80.16.62...')

    // Test connection and list files in the KPI directory
    const files = await ftpService.listFiles('/Huawei/Kaly/KPI')
    console.log('✅ FTP connection successful!')
    console.log(`📁 Found ${files.length} items in /Huawei/Kaly/KPI`)

    // List monthly folders
    const monthlyFolders = files.filter(file => file.name.match(/^\d{6}$/) && file.type === 1)
    console.log('📅 Monthly folders found:', monthlyFolders.map(f => f.name).sort())

    if (monthlyFolders.length > 0) {
      // Get yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
      const monthFolder = yesterdayStr.substring(0, 6) // YYYYMM

      console.log(`\n🎯 Looking for yesterday's data: ${yesterdayStr}`)
      console.log(`📂 Checking month folder: ${monthFolder}`)

      // Check if month folder exists
      const targetMonthFolder = monthlyFolders.find(f => f.name === monthFolder)
      if (targetMonthFolder) {
        console.log(`✅ Month folder ${monthFolder} exists`)

        // List files in the month folder
        const monthPath = `/Kaly/KPI/${monthFolder}`
        const monthFiles = await ftpService.listFiles(monthPath)
        console.log(`📄 Found ${monthFiles.length} files in ${monthPath}`)

        // Look for yesterday's RAR file
        const yesterdayRarFile = monthFiles.find(file =>
          file.name === `${yesterdayStr}.rar` && file.type === 0
        )

        if (yesterdayRarFile) {
          console.log(`🎉 SUCCESS: Yesterday's data file found!`)
          console.log(`📁 File: ${yesterdayRarFile.name}`)
          console.log(`📏 Size: ${(yesterdayRarFile.size / 1024 / 1024).toFixed(2)} MB`)
          console.log(`📅 Modified: ${yesterdayRarFile.modifiedAt}`)

          // Test file download (just check if accessible)
          console.log(`\n🔄 Testing file download...`)
          const testPath = `./temp/test_${yesterdayStr}.rar`
          await ftpService.downloadFile(`${monthFolder}/${yesterdayStr}.rar`, testPath)
          console.log(`✅ File download successful: ${testPath}`)

          // Clean up test file
          const fs = require('fs').promises
          try {
            await fs.unlink(testPath)
            console.log(`🧹 Test file cleaned up`)
          } catch (e) {
            // Ignore cleanup errors
          }

        } else {
          console.log(`❌ Yesterday's RAR file not found: ${yesterdayStr}.rar`)
          console.log('📋 Available RAR files in this month:')
          const rarFiles = monthFiles.filter(file => file.name.endsWith('.rar'))
          rarFiles.forEach(file => {
            console.log(`   - ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
          })
        }

      } else {
        console.log(`❌ Month folder ${monthFolder} not found`)
        console.log('📋 Available month folders:', monthlyFolders.map(f => f.name))
      }
    }

  } catch (error) {
    console.error('❌ FTP connection failed:', error.message)
    console.error('🔍 Error details:', error)
  }
}

testFTPConnection()