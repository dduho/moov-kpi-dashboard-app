const ftp = require('basic-ftp');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

async function testFTPAccess() {
  console.log('🔍 Testing FTP access...');

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // FTP configuration from environment
    const ftpConfig = {
      host: process.env.FTP_HOST || '10.80.16.62',
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER || 'Huawei',
      password: process.env.FTP_PASSWORD || 'Hu@w3!...#',
      secure: false
    };

    console.log(`Connecting to FTP: ${ftpConfig.host}:${ftpConfig.port}`);
    await client.access(ftpConfig);

    console.log('✅ FTP connection successful!');

    // List files in root directory
    console.log('\n📁 Listing root directory:');
    const rootFiles = await client.list('/');
    console.log(`Found ${rootFiles.length} items in root:`);
    rootFiles.slice(0, 10).forEach(file => {
      console.log(`  ${file.type === 2 ? '📁' : '📄'} ${file.name} (${file.size} bytes)`);
    });

    // Check if DailyKPIs directory exists
    const dailyKpisPath = '/DailyKPIs';
    console.log(`\n📁 Checking directory: ${dailyKpisPath}`);
    try {
      const dailyFiles = await client.list(dailyKpisPath);
      console.log(`✅ Found ${dailyFiles.length} items in ${dailyKpisPath}:`);
      dailyFiles.slice(0, 10).forEach(file => {
        console.log(`  ${file.type === 2 ? '📁' : '📄'} ${file.name} (${file.size} bytes)`);
      });

      // Look for recent monthly folders (YYYYMM format)
      const monthlyFolders = dailyFiles.filter(file =>
        file.type === 2 && /^\d{6}$/.test(file.name)
      );
      console.log(`\n📅 Found ${monthlyFolders.length} monthly folders:`);
      monthlyFolders.slice(-5).forEach(folder => {
        console.log(`  📁 ${folder.name}`);
      });

      // Test downloading a small file if available
      if (dailyFiles.length > 0) {
        const testFile = dailyFiles.find(file => file.type === 1 && file.size < 1000000); // Less than 1MB
        if (testFile) {
          console.log(`\n⬇️ Testing download of small file: ${testFile.name}`);
          const tempDir = path.join(__dirname, '../temp');
          await fs.mkdir(tempDir, { recursive: true });
          const localPath = path.join(tempDir, `test_${testFile.name}`);
          await client.downloadTo(localPath, dailyKpisPath + '/' + testFile.name);
          console.log(`✅ Successfully downloaded ${testFile.name} to ${localPath}`);

          // Check if it's an Excel file and try to read it
          if (testFile.name.endsWith('.xlsx') || testFile.name.endsWith('.xls')) {
            await testExcelReading(localPath);
          }
        }
      }

    } catch (error) {
      console.log(`❌ Could not access ${dailyKpisPath}: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ FTP test failed:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

async function testExcelReading(filePath) {
  console.log(`\n📊 Testing Excel file reading: ${filePath}`);

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    console.log(`✅ Successfully opened Excel file`);
    console.log(`📋 Found ${workbook.worksheets.length} worksheets:`);

    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`  ${sheetId}. ${worksheet.name} (${worksheet.rowCount} rows x ${worksheet.columnCount} columns)`);

      // Show first few rows of data
      if (worksheet.rowCount > 0) {
        console.log(`    Sample data from ${worksheet.name}:`);
        worksheet.getRows(1, Math.min(3, worksheet.rowCount))?.forEach((row, index) => {
          const values = row.values.slice(1, 6); // First 5 columns
          console.log(`      Row ${index + 1}: ${values.join(' | ')}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Excel reading test failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting FTP and Excel verification...\n');

    await testFTPAccess();

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { testFTPAccess, testExcelReading };