// Test FTP Kaly directory
const ftp = require('basic-ftp')
require('dotenv').config()

async function testKalyDirectory() {
  console.log('🔍 Testing Kaly directory structure...')

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

    // List Kaly directory
    console.log('📁 Listing /Kaly directory...')
    const kalyFiles = await client.list('/Kaly')
    console.log(`Found ${kalyFiles.length} items in /Kaly:`)

    kalyFiles.forEach(file => {
      const type = file.type === 1 ? '📁' : '📄'
      console.log(`  ${type} ${file.name}`)
    })

    // Look for KPI folder
    const kpiFolder = kalyFiles.find(file => file.name === 'KPI' && file.type === 1)
    if (kpiFolder) {
      console.log('✅ KPI folder found!')

      // List KPI directory
      console.log('📁 Listing /Kaly/KPI directory...')
      const kpiFiles = await client.list('/Kaly/KPI')
      console.log(`Found ${kpiFiles.length} items in /Kaly/KPI:`)

      kpiFiles.forEach(file => {
        const type = file.type === 1 ? '📁' : '📄'
        console.log(`  ${type} ${file.name}`)
      })

      // Look for monthly folders (format YYYYMM)
      const monthlyFolders = kpiFiles.filter(file => file.name.match(/^\d{6}$/) && file.type === 1)
      console.log(`📅 Monthly folders: ${monthlyFolders.map(f => f.name).sort().join(', ')}`)

      if (monthlyFolders.length > 0) {
        // Get yesterday's date
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
        const monthFolder = yesterdayStr.substring(0, 6) // YYYYMM

        console.log(`🎯 Looking for yesterday's data: ${yesterdayStr}`)
        console.log(`📂 Checking month folder: ${monthFolder}`)

        const targetMonthFolder = monthlyFolders.find(f => f.name === monthFolder)
        if (targetMonthFolder) {
          console.log(`✅ Month folder ${monthFolder} exists`)

          // List files in month folder
          const monthPath = `/Kaly/KPI/${monthFolder}`
          const monthFiles = await client.list(monthPath)
          console.log(`📂 Files in ${monthPath}: ${monthFiles.length}`)

          // Look for RAR files
          const rarFiles = monthFiles.filter(file => file.name.endsWith('.rar'))
          console.log(`📦 RAR files: ${rarFiles.map(f => f.name).join(', ')}`)

          // Check if yesterday's file exists
          const targetFile = `${yesterdayStr}.rar`
          const targetFileInfo = rarFiles.find(f => f.name === targetFile)
          if (targetFileInfo) {
            console.log(`🎉 SUCCESS: Yesterday's file ${targetFile} exists!`)
            console.log(`   Size: ${targetFileInfo.size} bytes`)
            console.log(`   Modified: ${targetFileInfo.modifiedAt}`)
          } else {
            console.log(`❌ Yesterday's file ${targetFile} not found`)
            console.log(`   Available files: ${rarFiles.map(f => f.name).join(', ')}`)
          }
        } else {
          console.log(`❌ Month folder ${monthFolder} not found`)
        }
      }

    } else {
      console.log('❌ KPI folder not found in /Kaly')
      console.log('Available folders:', kalyFiles.filter(f => f.type === 1).map(f => f.name).join(', '))
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testKalyDirectory()