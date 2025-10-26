const fs = require('fs').promises
const path = require('path')
const fsSync = require('fs')
const unrar = require('rar-stream')
const ExcelJS = require('exceljs')
const logger = require('./src/utils/logger')

async function testDataExtraction() {
  const tempDir = path.join(__dirname, 'temp')
  const date = '20251001' // Try an older file
  const rarPath = path.join(tempDir, '202510', `${date}.rar`)
  const extractPath = path.join(tempDir, 'test_extraction')

  console.log('🚀 Starting data extraction test...')
  console.log('📁 RAR file:', rarPath)
  console.log('📂 Extract path:', extractPath)

  try {
    // Check if RAR file exists
    const stats = await fs.stat(rarPath)
    console.log('📊 File size:', stats.size, 'bytes')

    // 1. Extract RAR file using PowerShell script
    console.log('📦 Extracting RAR file using PowerShell script...')
    await fs.mkdir(extractPath, { recursive: true })

    const { spawn } = require('child_process')
    let extractionSuccessful = false

    try {
      const psScriptPath = path.join(__dirname, 'extract-rar.ps1')

      const result = await new Promise((resolve, reject) => {
        const powershell = spawn('powershell', [
          '-ExecutionPolicy', 'Bypass',
          '-File', psScriptPath,
          '-rarPath', rarPath,
          '-extractPath', extractPath
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        powershell.stdout.on('data', (data) => {
          stdout += data.toString()
          console.log('PS Output:', data.toString().trim())
        })

        powershell.stderr.on('data', (data) => {
          stderr += data.toString()
          console.error('PS Error:', data.toString().trim())
        })

        powershell.on('close', (code) => {
          if (code === 0) {
            resolve(stdout)
          } else {
            reject(new Error(`PowerShell script failed with code ${code}: ${stderr}`))
          }
        })

        powershell.on('error', (error) => {
          reject(error)
        })
      })

      console.log('✅ RAR extraction completed via PowerShell script')
      extractionSuccessful = true

    } catch (error) {
      console.error('❌ PowerShell extraction failed:', error.message)
      throw new Error('Unable to extract RAR file')
    }

    // 2. Find and parse Excel files
    const allFiles = await fs.readdir(extractPath)
    const excelFiles = allFiles.filter(file => file.endsWith('.xlsx'))
    console.log('📊 Excel files found:', excelFiles)

    if (excelFiles.length === 0) {
      console.log('⚠️  No Excel files found. Checking for subdirectories...')

      // Check for subdirectories
      for (const file of allFiles) {
        const filePath = path.join(extractPath, file)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) {
          console.log(`📁 Found subdirectory: ${file}`)
          const subFiles = await fs.readdir(filePath)
          const subExcelFiles = subFiles.filter(f => f.endsWith('.xlsx'))
          if (subExcelFiles.length > 0) {
            console.log(`📊 Excel files in ${file}:`, subExcelFiles)
            // Add to excelFiles with full path
            subExcelFiles.forEach(excel => {
              excelFiles.push(path.join(file, excel))
            })
          }
        }
      }
    }

    for (const excelFile of excelFiles) {
      const filePath = path.join(extractPath, excelFile)
      console.log(`\n🔍 Parsing: ${excelFile}`)

      try {
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(filePath)

        const worksheets = workbook.worksheets.map(ws => ws.name)
        console.log(`📋 Worksheets: ${worksheets.join(', ')}`)

        // Show sample data from first worksheet
        const firstSheet = workbook.getWorksheet(1)
        if (firstSheet) {
          console.log(`📊 Sample data from "${firstSheet.name}":`)

          // Get first 5 rows
          const rows = []
          firstSheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 6) { // Header + 5 data rows
              const rowData = []
              row.eachCell((cell, colNumber) => {
                if (colNumber <= 10) { // First 10 columns
                  rowData.push(cell.value)
                }
              })
              rows.push(rowData)
            }
          })

          rows.forEach((row, index) => {
            console.log(`${index === 0 ? 'Header' : `Row ${index}`}:`, row)
          })
        }

      } catch (error) {
        console.error(`❌ Error parsing ${excelFile}:`, error.message)
      }
    }

    if (excelFiles.length === 0) {
      console.log('⚠️  No Excel files were found to parse')
    }

    console.log('\n✅ Data extraction test completed!')

  } catch (error) {
    console.error('❌ Error during extraction:', error)
    console.error('Stack:', error.stack)
  } finally {
    // Cleanup
    try {
      await fs.rm(extractPath, { recursive: true, force: true })
      console.log('🧹 Cleaned up temporary files')
    } catch (error) {
      console.error('⚠️  Error during cleanup:', error.message)
    }
  }
}

// Run the test
testDataExtraction().catch(console.error)