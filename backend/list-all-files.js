// Simple list all files
const ftp = require('basic-ftp')
require('dotenv').config()

async function listAllFiles() {
  console.log('📁 Listing ALL files in root...')

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
    console.log(`Total files: ${allFiles.length}`)

    // Show first 10 files
    console.log('\nFirst 10 files:')
    allFiles.slice(0, 10).forEach((file, index) => {
      const type = file.type === 1 ? '📁' : '📄'
      console.log(`${index + 1}. ${type} "${file.name}" (${file.size} bytes)`)
    })

    // Show last 10 files
    console.log('\nLast 10 files:')
    allFiles.slice(-10).forEach((file, index) => {
      const type = file.type === 1 ? '📁' : '📄'
      console.log(`${allFiles.length - 9 + index}. ${type} "${file.name}" (${file.size} bytes)`)
    })

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
  }
}

listAllFiles()