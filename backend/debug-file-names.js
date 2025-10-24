// Debug file names
const ftp = require('basic-ftp')
require('dotenv').config()

async function debugFileNames() {
  console.log('🔍 Debugging file names...')

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

    // Show files containing '20251022'
    const targetFiles = allFiles.filter(file =>
      file.name.includes('20251022') && file.type === 0
    )

    console.log(`📄 Files containing '20251022': ${targetFiles.length}`)
    targetFiles.forEach(file => {
      console.log(`  📄 "${file.name}" (${file.size} bytes)`)
    })

    // Show all files ending with .zip
    const zipFiles = allFiles.filter(file =>
      file.name.endsWith('.zip') && file.type === 0
    )

    console.log(`\n📦 All ZIP files: ${zipFiles.length}`)
    zipFiles.slice(-5).forEach(file => {  // Show last 5
      console.log(`  📄 "${file.name}" (${file.size} bytes)`)
    })

    client.close()

  } catch (error) {
    console.log('❌ FTP test failed:', error.message)
  }
}

debugFileNames()