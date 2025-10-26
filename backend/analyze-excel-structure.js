const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

async function analyzeExcelFiles() {
  const excelDir = path.join(__dirname, 'temp/excel_analysis/20250704');

  try {
    const files = await fs.readdir(excelDir);
    const excelFiles = files.filter(file => file.endsWith('.xlsx'));

    console.log('=== ANALYSE DES FICHIERS EXCEL ===\n');

    for (const file of excelFiles) {
      const filePath = path.join(excelDir, file);
      console.log(`📄 Fichier: ${file}`);
      console.log('─'.repeat(50));

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        workbook.eachSheet((worksheet, sheetId) => {
          console.log(`\n📋 Feuille: "${worksheet.name}" (ID: ${sheetId})`);

          // Get first few rows to understand structure
          const rows = [];
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 5) { // Only first 5 rows for analysis
              const cells = [];
              row.eachCell((cell, colNumber) => {
                if (colNumber <= 15) { // Only first 15 columns
                  let value = cell.value;
                  if (value && typeof value === 'object') {
                    if (value.result !== undefined) value = value.result;
                    else if (value.error !== undefined) value = `#ERROR#`;
                    else value = `[${typeof value}]`;
                  }
                  cells.push(`${colNumber}: ${value || ''}`);
                }
              });
              rows.push(`Ligne ${rowNumber}: ${cells.join(' | ')}`);
            }
          });

          console.log('Structure des données:');
          rows.forEach(row => console.log(`  ${row}`));

          // Try to identify KPI types based on sheet name and content
          if (worksheet.name.toLowerCase().includes('kpi') && worksheet.name.toLowerCase().includes('daily')) {
            console.log('  🎯 Type: KPIs Quotidiennes (par business type)');
          } else if (worksheet.name.toLowerCase().includes('kpi') && worksheet.name.toLowerCase().includes('hourly')) {
            console.log('  🎯 Type: KPIs Horaires (par heure)');
          } else if (worksheet.name.toLowerCase().includes('imt')) {
            console.log('  🎯 Type: Transactions IMT (par pays)');
          } else if (worksheet.name.toLowerCase().includes('revenue') || worksheet.name.toLowerCase().includes('compare')) {
            console.log('  🎯 Type: Revenus (par canal)');
          } else {
            console.log('  ❓ Type: Non identifié');
          }
        });

      } catch (error) {
        console.log(`  ❌ Erreur lors de la lecture: ${error.message}`);
      }

      console.log('\n' + '='.repeat(60) + '\n');
    }

  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
  }
}

analyzeExcelFiles();