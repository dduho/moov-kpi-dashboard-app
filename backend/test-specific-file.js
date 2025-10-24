// Test specific file access
const ftp = require('basic-ftp')
require('dotenv').config()

async function testSpecificFileAccess() {
  console.log('🔍 Testing access to specific file: /Huawei/Kaly/KPI/202510/20251022.rar')

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

    // Check if Huawei directory exists
    console.log('📁 Checking /Huawei directory...')
    try {
      const huaweiFiles = await client.list('/Huawei')
      console.log(`✅ /Huawei exists with ${huaweiFiles.length} items`)
    } catch (error) {
      console.log('❌ /Huawei directory not found or not accessible')
      client.close()
      return
    }

    // Check if Kaly directory exists
    console.log('📁 Checking /Huawei/Kaly directory...')
    try {
      const kalyFiles = await client.list('/Huawei/Kaly')
      console.log(`✅ /Huawei/Kaly exists with ${kalyFiles.length} items`)
    } catch (error) {
      console.log('❌ /Huawei/Kaly directory not found or not accessible')
      client.close()
      return
    }

    // Check if KPI directory exists
    console.log('📁 Checking /Huawei/Kaly/KPI directory...')
    try {
      const kpiFiles = await client.list('/Huawei/Kaly/KPI')
      console.log(`✅ /Huawei/Kaly/KPI exists with ${kpiFiles.length} items`)

      // Show monthly folders
      const monthlyFolders = kpiFiles.filter(f => f.type === 1 && f.name.match(/^\d{6}$/))
      console.log(`📅 Monthly folders: ${monthlyFolders.map(f => f.name).sort().join(', ')}`)
    } catch (error) {
      console.log('❌ /Huawei/Kaly/KPI directory not found or not accessible')
      client.close()
      return
    }

    // Check if 202510 directory exists
    console.log('📁 Checking /Huawei/Kaly/KPI/202510 directory...')
    try {
      const monthFiles = await client.list('/Huawei/Kaly/KPI/202510')
      console.log(`✅ /Huawei/Kaly/KPI/202510 exists with ${monthFiles.length} items`)

      // Look for the specific file
      const targetFile = monthFiles.find(f => f.name === '20251022.rar')
      if (targetFile) {
        console.log('🎉 SUCCESS: File 20251022.rar found!')
        console.log(`   Size: ${targetFile.size} bytes`)
        console.log(`   Modified: ${targetFile.modifiedAt}`)
        console.log(`   Type: ${targetFile.type === 0 ? 'File' : 'Directory'}`)
      } else {
        console.log('❌ File 20251022.rar not found in /Huawei/Kaly/KPI/202510')
        console.log('📄 Available files:', monthFiles.filter(f => f.type === 0).map(f => f.name).join(', '))
      }

    } catch (error) {
      console.log('❌ /Huawei/Kaly/KPI/202510 directory not found or not accessible')
      console.log('Error:', error.message)
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP connection failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testSpecificFileAccess()