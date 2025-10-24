// Test root directory and Huawei access
const ftp = require('basic-ftp')
require('dotenv').config()

async function testHuaweiAccess() {
  console.log('🔍 Testing Huawei directory access...')

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

    // Get current working directory
    const pwd = await client.pwd()
    console.log(`📂 Current directory: ${pwd}`)

    // List root directory again
    console.log('📁 Listing root directory...')
    const rootFiles = await client.list('/')
    console.log(`Found ${rootFiles.length} items in root`)

    // Look for Huawei directory
    const huaweiDir = rootFiles.find(f => f.name === 'Huawei' && f.type === 1)
    if (huaweiDir) {
      console.log('✅ Huawei directory found in root')
      console.log(`   Permissions: ${huaweiDir.permissions || 'N/A'}`)
      console.log(`   Size: ${huaweiDir.size}`)
      console.log(`   Modified: ${huaweiDir.modifiedAt}`)

      // Try to list Huawei directory
      try {
        const huaweiFiles = await client.list('/Huawei')
        console.log(`✅ Successfully listed /Huawei: ${huaweiFiles.length} items`)
        huaweiFiles.forEach(file => {
          const type = file.type === 1 ? '📁' : '📄'
          console.log(`  ${type} ${file.name}`)
        })
      } catch (error) {
        console.log(`❌ Cannot list /Huawei: ${error.message}`)
      }

    } else {
      console.log('❌ Huawei directory not found in root')
      console.log('Available directories:', rootFiles.filter(f => f.type === 1).map(f => f.name).join(', '))
    }

    // Try direct access to the full path
    console.log('\n🔍 Trying direct access to /Huawei/Kaly/KPI/202510/20251022.rar...')
    try {
      // Try to get file info
      const fileInfo = await client.list('/Huawei/Kaly/KPI/202510/20251022.rar')
      console.log('✅ File exists!')
      console.log(`   Details: ${JSON.stringify(fileInfo, null, 2)}`)
    } catch (error) {
      console.log(`❌ Cannot access file: ${error.message}`)
    }

    client.close()

  } catch (error) {
    console.log('❌ FTP connection failed:', error.message)
    console.log('🔍 Error details:', error)
  }
}

testHuaweiAccess()