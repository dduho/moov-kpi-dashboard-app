// Check available recent files
const ftp = require('basic-ftp')
require('dotenv').config()

async function checkRecentFiles() {
  console.log('📅 Checking available data files...')

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

    // List all files
    const allFiles = await client.list('/')

    // Filter ZIP files with date pattern (accept both files and directories)
    const zipFiles = allFiles.filter(file =>
      file.name.match(/^(\d{8})(\d{6})_CS_EXTRACTION\.zip$/)
    )

    console.log(`📦 Found ${zipFiles.length} CS_EXTRACTION files`)

    // Sort by date (most recent first)
    const sortedFiles = zipFiles.sort((a, b) => {
      const dateA = a.name.match(/^(\d{8})(\d{6})_CS_EXTRACTION\.zip$/)[1]
      const dateB = b.name.match(/^(\d{8})(\d{6})_CS_EXTRACTION\.zip$/)[1]
      return dateB.localeCompare(dateA)
    })

    console.log('\n📅 Most recent files:')
    sortedFiles.slice(0, 10).forEach(file => {
      const dateMatch = file.name.match(/^(\d{8})(\d{6})_CS_EXTRACTION\.zip$/)
      const date = dateMatch[1]
      const time = dateMatch[2]
      console.log(`  📄 ${file.name}`)
      console.log(`     Date: ${date} Time: ${time} Size: ${file.size} bytes Modified: ${file.modifiedAt}`)
    })

    // Check specifically for yesterday (20251022)
    const yesterday = '20251022'
    const yesterdayFiles = zipFiles.filter(file => file.name.startsWith(yesterday))

    console.log(`\n🎯 Looking for files from ${yesterday}:`)
    if (yesterdayFiles.length > 0) {
      yesterdayFiles.forEach(file => {
        console.log(`  ✅ Found: ${file.name} (${file.size} bytes)`)
      })
    } else {
      console.log(`  ❌ No files found for ${yesterday}`)

      // Check what dates are available in the last 5 days
      const recentDates = ['20251021', '20251020', '20251019', '20251018', '20251017']
      console.log('\n🔍 Checking last 5 days:')
      recentDates.forEach(date => {
        const dateFiles = zipFiles.filter(file => file.name.startsWith(date))
        console.log(`  ${date}: ${dateFiles.length} file(s)`)
      })
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
  }
}

checkRecentFiles()