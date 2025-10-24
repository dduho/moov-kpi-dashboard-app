// Debug FTP file names
const ftp = require('basic-ftp')
require('dotenv').config()

async function debugFileNames() {
  console.log('🔍 Debugging FTP file names...')

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

    // List all files in root
    const allFiles = await client.list('/')
    console.log(`📁 Total files in root: ${allFiles.length}`)

    // Show all files containing '2025' in name
    const recentFiles = allFiles.filter(file =>
      file.name.includes('2025') && file.type === 0
    )

    console.log(`📦 Files containing '2025': ${recentFiles.length}`)
    recentFiles.slice(-10).forEach(file => {  // Show last 10
      console.log(`  📄 "${file.name}" (${file.size} bytes)`)
    })

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
  }
}

debugFileNames()