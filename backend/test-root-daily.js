// Test FTP root daily files
const ftp = require('basic-ftp')
require('dotenv').config()

async function testRootDailyFiles() {
  console.log('🔍 Testing root directory for daily files...')

  const client = new ftp.Client()
  client.ftp.verbose = false

  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    })

    console.log('✅ Connected to FTP')

    // List all files in root
    console.log('📁 Listing all files in root...')
    const allFiles = await client.list('/')
    console.log(`Found ${allFiles.length} total items in root`)

    // Filter ZIP files with date pattern YYYYMMDD
    const dateZipFiles = allFiles.filter(file =>
      file.name.match(/^(\d{8})\d{6}_CS_EXTRACTION\.zip$/) && file.type === 0
    )
    console.log(`📦 Daily ZIP files found: ${dateZipFiles.length}`)

    dateZipFiles.forEach(file => {
      const dateMatch = file.name.match(/^(\d{8})\d{6}_CS_EXTRACTION\.zip$/)
      const date = dateMatch[1]
      console.log(`  📄 ${file.name} (${file.size} bytes, ${file.modifiedAt}) - Date: ${date}`)
    })

    // Check if yesterday's file exists
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

    console.log(`\n🎯 Looking for yesterday's file pattern: ${yesterdayStr}*CS_EXTRACTION.zip`)

    const targetFiles = dateZipFiles.filter(f => f.name.startsWith(yesterdayStr))
    if (targetFiles.length > 0) {
      console.log(`🎉 SUCCESS: Found ${targetFiles.length} file(s) for yesterday:`)
      targetFiles.forEach(file => {
        console.log(`   📄 ${file.name} (${file.size} bytes, ${file.modifiedAt})`)
      })

      // Take the most recent one
      const mostRecent = targetFiles.sort((a, b) => b.modifiedAt - a.modifiedAt)[0]
      console.log(`\n📥 Most recent file for yesterday: ${mostRecent.name}`)

    } else {
      console.log(`❌ No files found for yesterday (${yesterdayStr})`)

      // Show recent files
      const sortedFiles = dateZipFiles.sort((a, b) => b.modifiedAt - a.modifiedAt)
      console.log('\n📅 Most recent daily files:')
      sortedFiles.slice(0, 5).forEach(file => {
        const dateMatch = file.name.match(/^(\d{8})\d{6}_CS_EXTRACTION\.zip$/)
        const date = dateMatch[1]
        console.log(`  📄 ${file.name} - Date: ${date} (${file.modifiedAt})`)
      })
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testRootDailyFiles()