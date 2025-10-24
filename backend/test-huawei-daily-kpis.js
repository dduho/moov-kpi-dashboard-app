// Test RAR files in Huawei/DailyKPIs/202510/
const ftp = require('basic-ftp')
require('dotenv').config()

async function testHuaweiDailyKPIs() {
  console.log('🔍 Testing RAR files in /Huawei/DailyKPIs/202510/...')

  const client = new ftp.Client()
  client.ftp.verbose = true // Enable verbose for debugging

  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    })

    console.log('✅ Connected to FTP')

    // Try to access /Huawei/DailyKPIs/
    console.log('📁 Checking /Huawei/DailyKPIs/ directory...')
    try {
      const dailyKPIsFiles = await client.list('/Huawei/DailyKPIs/')
      console.log(`✅ /Huawei/DailyKPIs/ exists with ${dailyKPIsFiles.length} items`)

      // Show all items
      dailyKPIsFiles.forEach(file => {
        const type = file.type === 1 ? '📁' : '📄'
        console.log(`  ${type} ${file.name}`)
      })

      // Look for monthly folders (format YYYYMM)
      const monthlyFolders = dailyKPIsFiles.filter(file => file.name.match(/^\d{6}$/) && file.type === 1)
      console.log(`📅 Monthly folders: ${monthlyFolders.map(f => f.name).sort().join(', ')}`)

      // Check if 202510 exists
      const octoberFolder = monthlyFolders.find(f => f.name === '202510')
      if (octoberFolder) {
        console.log('✅ 202510 folder found!')

        // List files in /Huawei/DailyKPIs/202510/
        const octoberPath = '/Huawei/DailyKPIs/202510/'
        console.log(`📁 Listing ${octoberPath}...`)
        const octoberFiles = await client.list(octoberPath)
        console.log(`Found ${octoberFiles.length} items in ${octoberPath}`)

        // Show all files
        octoberFiles.forEach(file => {
          const type = file.type === 1 ? '📁' : '📄'
          console.log(`  ${type} ${file.name} (${file.size} bytes)`)
        })

        // Look for RAR files
        const rarFiles = octoberFiles.filter(file => file.name.endsWith('.rar') && file.type === 0)
        console.log(`📦 RAR files found: ${rarFiles.length}`)

        rarFiles.forEach(file => {
          console.log(`  📄 ${file.name} (${file.size} bytes, ${file.modifiedAt})`)
        })

        // Check if yesterday's file exists
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
        const targetFile = `${yesterdayStr}.rar`

        console.log(`🎯 Looking for yesterday's file: ${targetFile}`)
        const targetFileInfo = rarFiles.find(f => f.name === targetFile)
        if (targetFileInfo) {
          console.log(`🎉 SUCCESS: Yesterday's file ${targetFile} exists!`)
          console.log(`   Size: ${targetFileInfo.size} bytes`)
          console.log(`   Modified: ${targetFileInfo.modifiedAt}`)
        } else {
          console.log(`❌ Yesterday's file ${targetFile} not found`)
          console.log(`   Available RAR files: ${rarFiles.map(f => f.name).join(', ')}`)
        }

      } else {
        console.log('❌ 202510 folder not found')
        console.log(`   Available folders: ${monthlyFolders.map(f => f.name).join(', ')}`)
      }

    } catch (error) {
      console.log(`❌ Cannot access /Huawei/DailyKPIs/: ${error.message}`)
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP connection failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testHuaweiDailyKPIs()