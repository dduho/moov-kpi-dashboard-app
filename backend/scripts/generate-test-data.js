const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs').promises

async function generateTestExcelFiles(date) {
  const dateStr = date // Format: 20250701
  const outputDir = path.join(__dirname, `../../kpi_data/${dateStr.substring(0, 6)}/${dateStr}`)

  // Créer le dossier de sortie
  await fs.mkdir(outputDir, { recursive: true })
  console.log(`📁 Dossier créé: ${outputDir}`)

  // 1. Générer Daily KPI
  console.log(`\n📊 Génération de 【MMTG-Tools】Daily KPI - ${dateStr}.xlsx...`)
  const dailyWorkbook = new ExcelJS.Workbook()
  const dailySheet = dailyWorkbook.addWorksheet('KPI_N')

  // En-têtes
  dailySheet.addRow([
    'Business Type', 'Period', 'Type', 'Success Trx', 'Amount', 'Revenue',
    'Commission', 'Tax', 'Failed Trx', 'Expired Trx', 'Success Rate',
    'Rate2', 'Rate3', 'Revenue Rate'
  ])

  // Données de test
  const businessTypes = ['Cash In', 'Cash Out', 'P2P', 'Bill Payment', 'IMT']
  const periods = ['00-06', '06-12', '12-18', '18-24', 'Total']

  businessTypes.forEach(business => {
    periods.forEach(period => {
      dailySheet.addRow([
        business,
        period,
        'Type1',
        Math.floor(Math.random() * 10000) + 1000,
        Math.floor(Math.random() * 1000000) + 100000,
        Math.floor(Math.random() * 50000) + 5000,
        Math.floor(Math.random() * 10000) + 1000,
        Math.floor(Math.random() * 5000) + 500,
        Math.floor(Math.random() * 500),
        Math.floor(Math.random() * 100),
        Math.random() * 0.2 + 0.8, // 80-100%
        0.05,
        0.03,
        Math.random() * 0.05 + 0.02
      ])
    })
  })

  await dailyWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Daily KPI - ${dateStr}.xlsx`))
  console.log(`✅ Daily KPI généré avec ${businessTypes.length * periods.length} lignes`)

  // 2. Générer Hourly KPI
  console.log(`\n📊 Génération de 【MMTG-Tools】Hourly KPI - ${dateStr}.xlsx...`)
  const hourlyWorkbook = new ExcelJS.Workbook()
  const hourlySheet = hourlyWorkbook.addWorksheet('NEW')

  // En-têtes
  hourlySheet.addRow([
    'Hour', 'Txn Type Name', 'Period', 'Total Trans', 'Total Success',
    'Total Failed', 'Total Pending', 'Total Amount', 'Total Fee',
    'Total Commission', 'Total Tax'
  ])

  // Données pour chaque heure
  const txnTypes = ['Cash In', 'Cash Out', 'P2P', 'Bill Payment']
  for (let hour = 0; hour < 24; hour++) {
    txnTypes.forEach(txnType => {
      hourlySheet.addRow([
        hour,
        txnType,
        'H' + hour,
        Math.floor(Math.random() * 1000) + 100,
        Math.floor(Math.random() * 900) + 80,
        Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 100000) + 10000,
        Math.floor(Math.random() * 1000) + 100,
        Math.floor(Math.random() * 500) + 50,
        Math.floor(Math.random() * 200) + 20
      ])
    })
  }

  await hourlyWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Hourly KPI - ${dateStr}.xlsx`))
  console.log(`✅ Hourly KPI généré avec ${24 * txnTypes.length} lignes`)

  // 3. Générer IMT Hourly
  console.log(`\n📊 Génération de 【MMTG-Tools】IMT Hourly - ${dateStr}.xlsx...`)
  const imtWorkbook = new ExcelJS.Workbook()
  const imtSheet = imtWorkbook.addWorksheet('IMT_BUSINESS')

  // En-têtes
  imtSheet.addRow([
    'Hour', 'Country', 'IMT Business', 'Total Success', 'Total Failed',
    'Amount', 'Revenue', 'Commission', 'Tax', 'Success Rate', 'Balance'
  ])

  // Données IMT - une seule ligne par combinaison (date, country, imt_business)
  // Le modèle ImtTransaction a une contrainte unique sur ces 3 champs
  const countries = ['Senegal', 'Mali', 'Burkina Faso', 'Benin', 'Togo']
  const imtBusinesses = ['MoneyGram', 'Western Union', 'RIA']  // Removed duplicate 'Ria'

  countries.forEach(country => {
    imtBusinesses.forEach(imtBiz => {
      // Données agrégées sur 24 heures
      imtSheet.addRow([
        '', // Hour vide car données agrégées
        country,
        imtBiz,
        Math.floor(Math.random() * 2000) + 500,  // Total success agrégé
        Math.floor(Math.random() * 200) + 10,    // Total failed agrégé
        Math.floor(Math.random() * 1000000) + 100000,  // Amount agrégé
        Math.floor(Math.random() * 40000) + 5000,      // Revenue agrégé
        Math.floor(Math.random() * 20000) + 2000,      // Commission agrégé
        Math.floor(Math.random() * 10000) + 1000,      // Tax agrégé
        '95%', // Success rate
        Math.floor(Math.random() * 2000000) + 200000   // Balance agrégé
      ])
    })
  })

  await imtWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】IMT Hourly - ${dateStr}.xlsx`))
  console.log(`✅ IMT Hourly généré avec ${countries.length * imtBusinesses.length} lignes`)

  // 4. Générer Revenue Compare
  console.log(`\n📊 Génération de 【MMTG-Tools】Revenue Compare - ${dateStr}.xlsx...`)
  const revenueWorkbook = new ExcelJS.Workbook()

  const channels = ['App', 'Active', 'KPI-Day', 'Cash In', 'Cash Out', 'IMT', 'Banks', 'P2P', 'Bill', 'Telco']
  channels.forEach(channel => {
    const sheet = revenueWorkbook.addWorksheet(channel)

    // En-têtes
    sheet.addRow(['Type', 'Sub-Type', 'Period', 'Transaction Count', 'Amount', 'Revenue', 'Commission', 'Tax'])

    // Données pour chaque canal
    for (let i = 0; i < 10; i++) {
      sheet.addRow([
        `Type ${i + 1}`,
        `Sub ${i + 1}`,
        'Daily',
        Math.floor(Math.random() * 5000) + 500,
        Math.floor(Math.random() * 500000) + 50000,
        Math.floor(Math.random() * 25000) + 2500,
        Math.floor(Math.random() * 5000) + 500,
        Math.floor(Math.random() * 2500) + 250
      ])
    }
  })

  await revenueWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Revenue Compare - ${dateStr}.xlsx`))
  console.log(`✅ Revenue Compare généré avec ${channels.length} feuilles`)

  console.log(`\n✅ Tous les fichiers Excel générés dans: ${outputDir}`)
  return outputDir
}

async function generateMultipleDates() {
  console.log('='.repeat(80))
  console.log('GÉNÉRATION DE DONNÉES DE TEST')
  console.log('='.repeat(80))

  // Générer des données pour plusieurs dates
  const dates = [
    '20250704',
    '20250705',
    '20250706',
    '20250801',
    '20250802'
  ]

  for (const date of dates) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Génération pour la date: ${date}`)
    console.log('='.repeat(80))
    await generateTestExcelFiles(date)
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log('✅ GÉNÉRATION TERMINÉE')
  console.log('='.repeat(80))
  console.log('\nVous pouvez maintenant exécuter:')
  console.log('  node scripts/test-ingestion-pipeline.js')
}

// Exporter les fonctions
module.exports = generateTestExcelFiles

// Exécuter la génération si appelé directement
if (require.main === module) {
  generateMultipleDates().catch(console.error)
}
