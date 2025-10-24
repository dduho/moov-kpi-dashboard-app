// Simple FTP authentication test
const ftp = require('basic-ftp')
require('dotenv').config()

async function testFtpAuth() {
  console.log('🔐 Testing FTP authentication...')

  const client = new ftp.Client()
  client.ftp.verbose = true // Enable verbose logging

  try {
    console.log(`Connecting to ${process.env.FTP_HOST}:${process.env.FTP_PORT} as ${process.env.FTP_USER}...`)
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    })

    console.log('✅ FTP authentication successful!')

    // Try to get current directory
    const pwd = await client.pwd()
    console.log(`📂 Current directory: ${pwd}`)

    // Try to list root directory
    console.log('📁 Listing root directory...')
    const rootFiles = await client.list('/')
    console.log(`Found ${rootFiles.length} items in root:`)
    rootFiles.slice(0, 10).forEach(file => {
      const type = file.type === 1 ? '📁' : '📄'
      console.log(`  ${type} ${file.name}`)
    })

    client.close()
    return true

  } catch (error) {
    console.log('❌ FTP authentication failed:', error.message)
    console.log('🔍 Error details:', error)
    return false
  }
}

testFtpAuth()