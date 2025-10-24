// Test downloading yesterday's ZIP file
const ftp = require('basic-ftp')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function testDownloadYesterdayFile() {
  console.log('📥 Testing download of yesterday\'s data file...')

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

    // List files to find yesterday's file
    const allFiles = await client.list('/')

    // Find yesterday's file (20251022 pattern)
    const yesterdayFiles = allFiles.filter(file =>
      file.name.includes('20251022') && file.name.endsWith('.zip') && file.type === 0
    )

    if (yesterdayFiles.length === 0) {
      console.log('❌ No file found for yesterday (20251022)')
      return
    }

    const targetFile = yesterdayFiles[0] // Take the first one
    console.log(`📄 Found file: ${targetFile.name} (${targetFile.size} bytes)`)

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }

    // Download the file
    const localPath = path.join(tempDir, targetFile.name)
    console.log(`⬇️ Downloading to: ${localPath}`)

    await client.downloadTo(localPath, targetFile.name)

    console.log('✅ File downloaded successfully!')

    // Check if file exists locally
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath)
      console.log(`📊 Local file size: ${stats.size} bytes`)
      console.log('🎉 Download test successful!')
    }

    client.close()

  } catch (error) {
    console.log('❌ Download test failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testDownloadYesterdayFile()