// Network connectivity test
const net = require('net')
require('dotenv').config()

async function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity...')

  const targets = [
    { host: '10.80.16.62', port: 21, description: 'FTP Server' },
    { host: '10.80.3.159', port: 6379, description: 'Redis (local network)' },
    { host: '127.0.0.1', port: 6379, description: 'Redis (localhost)' },
    { host: '8.8.8.8', port: 53, description: 'Google DNS (internet test)' }
  ]

  for (const target of targets) {
    await testConnection(target.host, target.port, target.description)
  }
}

function testConnection(host, port, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing connection to ${host}:${port} (${description})...`)

    const socket = new net.Socket()
    const timeout = 5000 // 5 seconds timeout

    const timer = setTimeout(() => {
      socket.destroy()
      console.log(`❌ ${description}: Connection timeout after ${timeout}ms`)
      resolve()
    }, timeout)

    socket.connect(port, host, () => {
      clearTimeout(timer)
      console.log(`✅ ${description}: Connection successful`)
      socket.destroy()
      resolve()
    })

    socket.on('error', (err) => {
      clearTimeout(timer)
      console.log(`❌ ${description}: Connection failed - ${err.code}`)
      resolve()
    })
  })
}

// Run both tests
async function runAllTests() {
  await testNetworkConnectivity()
  console.log('\n' + '='.repeat(50))

  // Import FTP test function
  const ftpService = require('./src/services/ftpService')

  console.log('🔍 Testing FTP connection with credentials...')
  try {
    console.log('🔍 Testing FTP connection to 10.80.16.62...')

    // Test connection and list files in the KPI directory
    const files = await ftpService.listFiles('/Huawei/Kaly/KPI')
    console.log('✅ FTP connection successful!')
    console.log(`📁 Found ${files.length} items in /Huawei/Kaly/KPI:`)

    files.forEach(file => {
      const type = file.type === 1 ? '📁' : '📄'
      console.log(`  ${type} ${file.name}`)
    })

    // List monthly folders
    const monthlyFolders = files.filter(file => file.name.match(/^\d{6}$/) && file.type === 1)
    console.log(`\n📅 Monthly folders found: ${monthlyFolders.map(f => f.name).sort().join(', ')}`)

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

        // Try to list files in the month folder
        try {
          const monthPath = `/Huawei/Kaly/KPI/${monthFolder}`
          const monthFiles = await ftpService.listFiles(monthPath)
          console.log(`📂 Files in ${monthPath}: ${monthFiles.length}`)

          // Look for RAR files
          const rarFiles = monthFiles.filter(file => file.name.endsWith('.rar'))
          console.log(`📦 RAR files found: ${rarFiles.map(f => f.name).join(', ')}`)

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

        } catch (error) {
          console.log(`❌ Error listing files in month folder: ${error.message}`)
        }

      } else {
        console.log(`❌ Month folder ${monthFolder} not found`)
        console.log(`   Available folders: ${monthlyFolders.map(f => f.name).join(', ')}`)
      }
    }

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

// Run all tests
runAllTests()