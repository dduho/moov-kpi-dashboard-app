// Test FTP Kaly files
const ftp = require('basic-ftp')
require('dotenv').config()

async function testKalyFiles() {
  console.log('🔍 Testing Kaly files structure...')

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

    // List all files in Kaly
    console.log('📁 Listing all files in /Kaly...')
    const allFiles = await client.list('/Kaly')
    console.log(`Found ${allFiles.length} items in /Kaly`)

    // Filter RAR files
    const rarFiles = allFiles.filter(file => file.name.endsWith('.rar') && file.type === 0)
    console.log(`📦 RAR files found: ${rarFiles.length}`)

    rarFiles.forEach(file => {
      console.log(`  📄 ${file.name} (${file.size} bytes, ${file.modifiedAt})`)
    })

    // Check if yesterday's file exists
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const targetFile = `${yesterdayStr}.rar`

    console.log(`\n🎯 Looking for yesterday's file: ${targetFile}`)

    const targetFileInfo = rarFiles.find(f => f.name === targetFile)
    if (targetFileInfo) {
      console.log(`🎉 SUCCESS: Yesterday's file ${targetFile} exists!`)
      console.log(`   Size: ${targetFileInfo.size} bytes`)
      console.log(`   Modified: ${targetFileInfo.modifiedAt}`)
    } else {
      console.log(`❌ Yesterday's file ${targetFile} not found`)

      // Show available RAR files sorted by date
      const sortedRarFiles = rarFiles.sort((a, b) => b.modifiedAt - a.modifiedAt)
      console.log('\n📅 Recent RAR files (most recent first):')
      sortedRarFiles.slice(0, 10).forEach(file => {
        console.log(`  📄 ${file.name} (${file.modifiedAt})`)
      })
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testKalyFiles()