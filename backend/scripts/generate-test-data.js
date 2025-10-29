const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs').promises

/**
 * Générateur de données de test Excel respectant TOUTES les feuilles des 4 fichiers
 * Basé sur RESTRUCTURATION_COMPLETE.md avec unités correctes (K, M, pourcentages)
 */

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDecimal(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

async function generateTestExcelFiles(date) {
  const dateStr = date // Format: 20250701
  const outputDir = path.join(__dirname, `../kpi_data/${dateStr.substring(0, 6)}/${dateStr}`)

  // Créer le dossier de sortie
  await fs.mkdir(outputDir, { recursive: true })
  console.log(`📁 Dossier créé: ${outputDir}`)

  // ==========================================================================
  // 1. 【MMTG-Tools】Revenue Compare
  // ==========================================================================
  console.log(`\n📊 Génération de Revenue Compare...`)
  const revenueWorkbook = new ExcelJS.Workbook()

  // 1.1 Active Sheet (User (K), autres en comptes bruts, MoM en ratio)
  const activeSheet = revenueWorkbook.addWorksheet('Active')
  activeSheet.addRow([
    'Categorie', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',
    'Total', 'AVG', 'M'
  ])

  const categories = ['Clients', 'Agents', 'Marchands', 'Nouveaux inscrits', 'Users App']
  categories.forEach((cat, idx) => {
    const dailyValues = []
    const baseValue = cat === 'Clients' ? randomInt(800, 1200) : randomInt(50, 300) // Clients en K, autres en brut

    for (let day = 1; day <= 31; day++) {
      const value = cat === 'Clients'
        ? randomDecimal(baseValue * 0.9, baseValue * 1.1, 3) // En milliers (K)
        : randomInt(Math.floor(baseValue * 0.8), Math.ceil(baseValue * 1.2)) // Brut
      dailyValues.push(value)
    }

    const total = dailyValues.reduce((a, b) => a + b, 0)
    const avg = total / 31
    const mom = randomDecimal(0.01, 0.1, 6) // MoM comme ratio (ex: 0.061539 = +6.15%)

    activeSheet.addRow([cat, ...dailyValues, total, avg, mom])
  })

  // 1.2 KPI-Day Sheet (Revenue (K XOF), TRX User (K), MOM en ratio)
  const kpiDaySheet = revenueWorkbook.addWorksheet('KPI-Day')
  kpiDaySheet.addRow([
    'Indicateur', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',
    'Total', 'MOM'
  ])

  const kpiDayIndicators = [
    { name: 'Revenue (K XOF)', base: 25000 },
    { name: 'TRX User (K)', base: 850 },
    { name: 'Transactions (K)', base: 1200 }
  ]

  kpiDayIndicators.forEach(ind => {
    const values = Array.from({ length: 31 }, () => randomDecimal(ind.base * 0.85, ind.base * 1.15, 2))
    const total = values.reduce((a, b) => a + b, 0)
    const mom = randomDecimal(-0.05, 0.05, 6) // -5% à +5%
    kpiDaySheet.addRow([ind.name, ...values, total, mom])
  })

  // 1.3 KPI-Week Sheet (Revenue: K XOF, Transaction: K, Amount: M XOF, GAP absolu)
  const kpiWeekSheet = revenueWorkbook.addWorksheet('KPI-Week')
  kpiWeekSheet.addRow(['Semaine', 'Revenue: K XOF', 'Transaction: K', 'TRXUsers: K', 'Amount: M XOF', 'GAP'])

  const weeks = ['01st ~ 07th', '08th ~ 14th', '15th ~ 21st', '22nd ~ 28th', '29th ~ 31st']
  weeks.forEach((week, idx) => {
    const revenue = randomDecimal(150000, 200000, 2) // K XOF
    const transactions = randomDecimal(7000, 9000, 2) // K
    const users = randomDecimal(5500, 6500, 2) // K
    const amount = randomDecimal(1200, 1600, 2) // M XOF
    const gap = idx > 0 ? randomDecimal(-5000, 5000, 2) : 0 // GAP absolu
    kpiWeekSheet.addRow([week, revenue, transactions, users, amount, gap])
  })

  // 1.4 KPI-Hour Sheet (en K XOF ou K, MoM en ratio)
  const kpiHourSheet = revenueWorkbook.addWorksheet('KPI-Hour')
  kpiHourSheet.addRow(['Hour', 'Revenue (K XOF)', 'Transactions (K)', 'Users (K)', 'MoM'])

  for (let hour = 0; hour < 24; hour++) {
    const revenue = randomDecimal(3000, 12000, 2)
    const transactions = randomDecimal(300, 800, 2)
    const users = randomDecimal(200, 500, 2)
    const mom = randomDecimal(-0.1, 0.1, 6)
    kpiHourSheet.addRow([hour, revenue, transactions, users, mom])
  }

  // 1.5 KPI-Year Sheet (REV (K XOF), MOM et YOY en ratios)
  const kpiYearSheet = revenueWorkbook.addWorksheet('KPI-Year')
  kpiYearSheet.addRow(['Mois', 'Annee', 'REV (K XOF)', 'Transactions (K)', 'MOM', 'YOY'])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  months.forEach((month, idx) => {
    // 2024
    kpiYearSheet.addRow([
      month, 2024,
      randomDecimal(600000, 800000, 2),
      randomDecimal(25000, 35000, 2),
      randomDecimal(-0.05, 0.05, 6),
      0
    ])
    // 2025
    kpiYearSheet.addRow([
      month, 2025,
      randomDecimal(650000, 850000, 2),
      randomDecimal(27000, 37000, 2),
      randomDecimal(-0.05, 0.05, 6),
      randomDecimal(0.05, 0.15, 6) // YOY positif
    ])
  })

  // 1.6-1.11 Channel Sheets (Cash In, Cash Out, IMT, Banks, P2P, Bill, Telco)
  const channels = ['Cash In', 'Cash Out', 'IMT', 'Banks', 'P2P', 'Bill', 'Telco']
  channels.forEach(channel => {
    const channelSheet = revenueWorkbook.addWorksheet(channel)
    channelSheet.addRow([
      'Date', 'Revenue (K XOF)', 'Transactions (K)', 'TRX User (K)', 'Amount (M XOF)', 'MoM'
    ])

    for (let day = 1; day <= 31; day++) {
      channelSheet.addRow([
        day,
        randomDecimal(5000, 15000, 2), // K XOF
        randomDecimal(800, 1500, 2), // K
        randomDecimal(600, 1200, 2), // K
        randomDecimal(100, 300, 2), // M XOF
        randomDecimal(-0.05, 0.05, 6) // MoM ratio
      ])
    }
  })

  await revenueWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Revenue Compare - ${dateStr}.xlsx`))
  console.log(`✅ Revenue Compare généré avec 12 feuilles`)

  // ==========================================================================
  // 2. 【MMTG-Tools】Daily KPI
  // ==========================================================================
  console.log(`\n📊 Génération de Daily KPI...`)
  const dailyWorkbook = new ExcelJS.Workbook()

  // 2.1 VS Sheet (montants en XOF brut, SUCC.RATE et REV.RATE en ratios)
  const vsSheet = dailyWorkbook.addWorksheet('VS')
  vsSheet.addRow([
    'Business Type',
    'SUCCESS.TRX (N)', 'SUCCESS.TRX (O)',
    'AMOUNT (N)', 'AMOUNT (O)',
    'REVENUE (N)', 'REVENUE (O)',
    'COMM (N)', 'COMM (O)',
    'TAX (N)', 'TAX (O)',
    'SUCC.RATE (N)', 'SUCC.RATE (O)',
    'REV.RATE (N)', 'REV.RATE (O)'
  ])

  const businessTypes = ['B2B Cash Out', 'B2B Transfer', 'B2C', 'Cash In', 'Cash Out', 'P2P', 'Bill Payment', 'IMT']
  businessTypes.forEach(business => {
    const successN = randomInt(8000, 15000)
    const successO = randomInt(7500, 14500)
    const amountN = randomInt(5000000000, 8000000000) // Milliards en XOF brut
    const amountO = randomInt(4800000000, 7800000000)
    const revenueN = randomInt(25000000, 45000000) // Millions en XOF brut
    const revenueO = randomInt(24000000, 44000000)
    const commN = randomInt(10000000, 20000000)
    const commO = randomInt(9500000, 19500000)
    const taxN = randomInt(2000000, 5000000)
    const taxO = randomInt(1900000, 4900000)
    const failedN = randomInt(100, 500)
    const failedO = randomInt(100, 500)
    const succRateN = successN / (successN + failedN) // Ratio (ex: 0.986111)
    const succRateO = successO / (successO + failedO)
    const revRateN = revenueN / amountN // Ratio
    const revRateO = revenueO / amountO

    vsSheet.addRow([
      business,
      successN, successO,
      amountN, amountO,
      revenueN, revenueO,
      commN, commO,
      taxN, taxO,
      succRateN.toFixed(6), succRateO.toFixed(6),
      revRateN.toFixed(6), revRateO.toFixed(6)
    ])
  })

  // 2.2 GAP Sheet (TRX.CNT (K), TRX.AMT (M XOF), TRX.REVE (K XOF) - écarts absolus)
  const gapSheet = dailyWorkbook.addWorksheet('GAP')
  gapSheet.addRow(['Business Type', 'TRX.CNT (K)', 'TRX.AMT (M XOF)', 'TRX.REVE (K XOF)'])

  businessTypes.forEach(business => {
    gapSheet.addRow([
      business,
      randomDecimal(-2, 2, 3), // K (écart absolu)
      randomDecimal(-50, 50, 2), // M XOF (écart absolu)
      randomDecimal(-500, 500, 2) // K XOF (écart absolu)
    ])
  })

  // 2.3 KPI_N Sheet (montants en XOF brut, taux en ratios)
  const kpiNSheet = dailyWorkbook.addWorksheet('KPI_N')
  kpiNSheet.addRow([
    'Business Type', 'Period', 'Type',
    'SUCCESS_TRX', 'AMOUNT', 'REVENUE', 'COMMISSION', 'TAX',
    'FAILED_TRX', 'EXPIRED_TRX',
    'SUCCESS_RATE', 'PRE_RATE', 'REVENUE_RATE', 'CHANGE'
  ])

  const periods = ['00-06', '06-12', '12-18', '18-24', 'Total']
  businessTypes.forEach(business => {
    periods.forEach(period => {
      const successTrx = randomInt(1000, 5000)
      const failedTrx = randomInt(50, 200)
      const expiredTrx = randomInt(20, 100)
      const amount = randomInt(500000000, 2000000000) // XOF brut
      const revenue = randomInt(2000000, 8000000) // XOF brut
      const commission = randomInt(800000, 3000000) // XOF brut
      const tax = randomInt(200000, 800000) // XOF brut
      const successRate = successTrx / (successTrx + failedTrx + expiredTrx) // Ratio
      const preRate = randomDecimal(0.90, 0.99, 6) // Taux de réussite veille
      const revenueRate = revenue / amount // Ratio
      const change = randomDecimal(-0.05, 0.05, 6) // Variation

      kpiNSheet.addRow([
        business, period, 'Type1',
        successTrx, amount, revenue, commission, tax,
        failedTrx, expiredTrx,
        successRate.toFixed(6), preRate, revenueRate.toFixed(6), change
      ])
    })
  })

  // 2.4 KPI_O Sheet (jour précédent - structure similaire à KPI_N mais sans variation)
  const kpiOSheet = dailyWorkbook.addWorksheet('KPI_O')
  kpiOSheet.addRow([
    'Business Type', 'Period', 'Type',
    'SUCCESS_TRX', 'AMOUNT', 'REVENUE', 'COMMISSION', 'TAX',
    'FAILED_TRX', 'EXPIRED_TRX',
    'SUCCESS_RATE'
  ])

  businessTypes.forEach(business => {
    periods.forEach(period => {
      const successTrx = randomInt(900, 4800)
      const failedTrx = randomInt(45, 195)
      const expiredTrx = randomInt(18, 95)
      const amount = randomInt(480000000, 1950000000)
      const revenue = randomInt(1900000, 7800000)
      const commission = randomInt(750000, 2900000)
      const tax = randomInt(190000, 780000)
      const successRate = successTrx / (successTrx + failedTrx + expiredTrx)

      kpiOSheet.addRow([
        business, period, 'Type1',
        successTrx, amount, revenue, commission, tax,
        failedTrx, expiredTrx,
        successRate.toFixed(6)
      ])
    })
  })

  // 2.5 Mapping Sheet (table de correspondance textuelle - pas de données numériques)
  const mappingSheet = dailyWorkbook.addWorksheet('Mapping')
  mappingSheet.addRow(['Huawei Label', 'TLC Category'])
  const mappings = [
    ['HW_CASH_IN', 'Cash In'],
    ['HW_CASH_OUT', 'Cash Out'],
    ['HW_P2P', 'P2P'],
    ['HW_BILL', 'Bill Payment'],
    ['HW_TOPUP', 'Telco'],
    ['HW_IMT', 'IMT']
  ]
  mappings.forEach(([hw, tlc]) => mappingSheet.addRow([hw, tlc]))

  await dailyWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Daily KPI - ${dateStr}.xlsx`))
  console.log(`✅ Daily KPI généré avec 5 feuilles`)

  // ==========================================================================
  // 3. 【MMTG-Tools】Hourly KPI
  // ==========================================================================
  console.log(`\n📊 Génération de Hourly KPI...`)
  const hourlyWorkbook = new ExcelJS.Workbook()

  // 3.1 CNT Sheet (valeurs en K, variation en pourcentage/ratio)
  const cntSheet = hourlyWorkbook.addWorksheet('CNT')
  cntSheet.addRow(['Hour', 'CNT (K)', 'CNT Prev (K)', 'Variation (%)'])

  for (let hour = 0; hour < 24; hour++) {
    const cnt = randomDecimal(0.8, 2.5, 3) // En milliers (ex: 1.249 = 1249 transactions)
    const cntPrev = randomDecimal(0.7, 2.4, 3)
    const variation = (cnt - cntPrev) / cntPrev // Ratio (ex: -0.02725857 = -2.73%)
    cntSheet.addRow([hour, cnt, cntPrev, variation.toFixed(8)])
  }

  // 3.2 AMT Sheet (montants en M XOF, écart absolu en M)
  const amtSheet = hourlyWorkbook.addWorksheet('AMT')
  amtSheet.addRow(['Hour', 'AMT (M XOF)', 'AMT Prev (M XOF)', 'Gap (M XOF)'])

  for (let hour = 0; hour < 24; hour++) {
    const amt = randomDecimal(50, 250, 2) // Millions
    const amtPrev = randomDecimal(48, 245, 2)
    const gap = amt - amtPrev
    amtSheet.addRow([hour, amt, amtPrev, gap.toFixed(2)])
  }

  // 3.3 REV Sheet (revenu en K XOF, variation en pourcentage/ratio)
  const revSheet = hourlyWorkbook.addWorksheet('REV')
  revSheet.addRow(['Hour', 'REV (K XOF)', 'REV Prev (K XOF)', 'Variation (%)'])

  for (let hour = 0; hour < 24; hour++) {
    const rev = randomDecimal(800, 3500, 2) // K XOF
    const revPrev = randomDecimal(750, 3400, 2)
    const variation = (rev - revPrev) / revPrev
    revSheet.addRow([hour, rev, revPrev, variation.toFixed(8)])
  }

  // 3.4 NEW Sheet (montants en XOF brut - pas de pourcentages)
  const newSheet = hourlyWorkbook.addWorksheet('NEW')
  newSheet.addRow([
    'Hour', 'Txn Type Name', 'Period',
    'Total Trans', 'Total Success', 'Total Failed', 'Total Pending',
    'TOTAL_AMOUNT', 'TOTAL_FEE', 'TOTAL_COMMISSION', 'TOTAL_TAX'
  ])

  const txnTypes = ['Cash In', 'Cash Out', 'P2P', 'Bill Payment', 'IMT']
  for (let hour = 0; hour < 24; hour++) {
    txnTypes.forEach(txnType => {
      const totalTrans = randomInt(500, 2000)
      const totalSuccess = randomInt(Math.floor(totalTrans * 0.85), Math.floor(totalTrans * 0.98))
      const totalFailed = randomInt(10, totalTrans - totalSuccess - 10)
      const totalPending = totalTrans - totalSuccess - totalFailed

      newSheet.addRow([
        hour, txnType, `H${hour}`,
        totalTrans, totalSuccess, totalFailed, totalPending,
        randomInt(50000000, 200000000), // XOF brut
        randomInt(500000, 2000000), // XOF brut
        randomInt(200000, 800000), // XOF brut
        randomInt(50000, 200000) // XOF brut
      ])
    })
  }

  // 3.5 LAST Sheet (structure identique à NEW, données de la veille)
  const lastSheet = hourlyWorkbook.addWorksheet('LAST')
  lastSheet.addRow([
    'Hour', 'Txn Type Name', 'Period',
    'Total Trans', 'Total Success', 'Total Failed', 'Total Pending',
    'TOTAL_AMOUNT', 'TOTAL_FEE', 'TOTAL_COMMISSION', 'TOTAL_TAX'
  ])

  for (let hour = 0; hour < 24; hour++) {
    txnTypes.forEach(txnType => {
      const totalTrans = randomInt(480, 1950)
      const totalSuccess = randomInt(Math.floor(totalTrans * 0.85), Math.floor(totalTrans * 0.98))
      const totalFailed = randomInt(10, totalTrans - totalSuccess - 10)
      const totalPending = totalTrans - totalSuccess - totalFailed

      lastSheet.addRow([
        hour, txnType, `H${hour}`,
        totalTrans, totalSuccess, totalFailed, totalPending,
        randomInt(48000000, 195000000),
        randomInt(480000, 1950000),
        randomInt(190000, 780000),
        randomInt(48000, 195000)
      ])
    })
  }

  await hourlyWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】Hourly KPI - ${dateStr}.xlsx`))
  console.log(`✅ Hourly KPI généré avec 5 feuilles`)

  // ==========================================================================
  // 4. 【MMTG-Tools】IMT Hourly
  // ==========================================================================
  console.log(`\n📊 Génération de IMT Hourly...`)
  const imtWorkbook = new ExcelJS.Workbook()

  // 4.1 VIEW Sheet (3 sections: par pays, par ETHUB, soldes)
  const viewSheet = imtWorkbook.addWorksheet('VIEW')

  // Section 1: Par pays (CNT, AMT (M XOF), REV/COMM/TAX (K XOF))
  viewSheet.addRow(['=== TRANSACTIONS PAR PAYS ==='])
  viewSheet.addRow(['Country', 'CNT', 'AMT (M XOF)', 'REV (K XOF)', 'COMM (K XOF)', 'TAX (K XOF)'])

  const countries = ['Senegal', 'Mali', 'Burkina Faso', 'Benin', 'Togo', 'Cote d\'Ivoire']
  countries.forEach(country => {
    viewSheet.addRow([
      country,
      randomInt(500, 2000), // CNT
      randomDecimal(250, 800, 2), // M XOF
      randomDecimal(5000, 15000, 2), // K XOF
      randomDecimal(2000, 6000, 2), // K XOF
      randomDecimal(500, 1500, 2) // K XOF
    ])
  })

  // Section 2: ETHUB RECEIVE/SEND
  viewSheet.addRow([])
  viewSheet.addRow(['=== ETHUB TRANSACTIONS ==='])
  viewSheet.addRow(['Type', 'CNT', 'AMT (M XOF)', 'REV (K XOF)', 'COMM (K XOF)', 'TAX (K XOF)'])

  const ethubTypes = ['ETHUB_RECEIVE', 'ETHUB_SEND']
  ethubTypes.forEach(type => {
    viewSheet.addRow([
      type,
      randomInt(800, 3000),
      randomDecimal(400, 1200, 2),
      randomDecimal(8000, 25000, 2),
      randomDecimal(3000, 10000, 2),
      randomDecimal(800, 2500, 2)
    ])
  })

  // Section 3: Soldes par pays/hub (montants en XOF brut, statut Normal/Critical)
  viewSheet.addRow([])
  viewSheet.addRow(['=== SOLDES ==='])
  viewSheet.addRow(['Country/Hub', 'Receive Balance', 'Send Balance', 'Status'])

  countries.forEach(country => {
    const receiveBalance = randomInt(50000000, 500000000) // XOF brut
    const sendBalance = randomInt(30000000, 450000000)
    const status = Math.abs(receiveBalance - sendBalance) > 200000000 ? 'Critical' : 'Normal'
    viewSheet.addRow([country, receiveBalance, sendBalance, status])
  })

  // 4.2 SUM Sheet (totaux par type: AMOUNT (M), REVENUE/COMM/TAX (K))
  const sumSheet = imtWorkbook.addWorksheet('SUM')
  sumSheet.addRow(['Type', 'CNT', 'AMOUNT (M)', 'REVENUE (K)', 'COMM (K)', 'TAX (K)'])

  const sumTypes = ['Total', 'ETHUB_RECEIVE', 'ETHUB_SEND', 'MFS_SEND', 'MFS_RECV']
  sumTypes.forEach(type => {
    sumSheet.addRow([
      type,
      randomInt(2000, 8000),
      randomDecimal(1000, 3500, 2), // M
      randomDecimal(20000, 70000, 2), // K
      randomDecimal(8000, 28000, 2), // K
      randomDecimal(2000, 7000, 2) // K
    ])
  })

  // 4.3 IMT_BUSINESS Sheet (AMOUNT_IN_MILLION (M), REVENUE/COMM/TAX_IN_THOUSAND (K), SUCCESS_RATE en %, BALANCE en XOF brut)
  const imtBusinessSheet = imtWorkbook.addWorksheet('IMT_BUSINESS')
  imtBusinessSheet.addRow([
    'Date', 'Hour', 'Country', 'IMT Business', 'Channel',
    'TOTAL_SUCCESS', 'TOTAL_FAILED',
    'AMOUNT_IN_MILLION', 'REVENUE_IN_THOUSAND', 'COMM_IN_THOUSAND', 'TAX_IN_THOUND',
    'SUCCESS_RATE', 'BALANCE'
  ])

  const imtBusinesses = ['MoneyGram', 'Western Union', 'RIA']
  const imtChannels = ['ETHUB_SEND', 'ETHUB_RECV', 'MFS_SEND', 'MFS_RECV']

  countries.forEach(country => {
    imtBusinesses.forEach(business => {
      imtChannels.forEach(channel => {
        const totalSuccess = randomInt(200, 1000)
        const totalFailed = randomInt(10, 100)
        const successRate = (totalSuccess / (totalSuccess + totalFailed) * 100).toFixed(2) + '%'

        imtBusinessSheet.addRow([
          dateStr, '', country, business, channel,
          totalSuccess, totalFailed,
          randomDecimal(50, 300, 2), // M
          randomDecimal(1000, 6000, 2), // K
          randomDecimal(400, 2400, 2), // K
          randomDecimal(100, 600, 2), // K
          successRate,
          randomInt(10000000, 100000000) // XOF brut
        ])
      })
    })
  })

  await imtWorkbook.xlsx.writeFile(path.join(outputDir, `【MMTG-Tools】IMT Hourly - ${dateStr}.xlsx`))
  console.log(`✅ IMT Hourly généré avec 3 feuilles`)

  console.log(`\n✅ Tous les fichiers Excel générés dans: ${outputDir}`)
  console.log(`   - Revenue Compare: 12 feuilles (Active, KPI-Day, KPI-Week, KPI-Hour, KPI-Year, 7 channels)`)
  console.log(`   - Daily KPI: 5 feuilles (VS, GAP, KPI_N, KPI_O, Mapping)`)
  console.log(`   - Hourly KPI: 5 feuilles (CNT, AMT, REV, NEW, LAST)`)
  console.log(`   - IMT Hourly: 3 feuilles (VIEW, SUM, IMT_BUSINESS)`)
  console.log(`   Total: 25 feuilles Excel`)

  return outputDir
}

async function generateMultipleDates() {
  console.log('='.repeat(80))
  console.log('GÉNÉRATION DE DONNÉES DE TEST - STRUCTURE COMPLÈTE')
  console.log('25 feuilles Excel avec unités correctes (K, M, %, XOF brut)')
  console.log('='.repeat(80))

  // Générer 114 dates: du 2025-07-01 au 2025-10-22
  const dates = []
  const startDate = new Date('2025-07-01')
  const endDate = new Date('2025-10-22')

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    dates.push(`${year}${month}${day}`)
  }

  console.log(`\nGénération de ${dates.length} dates...`)

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    console.log(`\n${'='.repeat(80)}`)
    console.log(`[${i + 1}/${dates.length}] Génération pour la date: ${date}`)
    console.log('='.repeat(80))
    await generateTestExcelFiles(date)
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log('✅ GÉNÉRATION TERMINÉE')
  console.log('='.repeat(80))
  console.log(`\n${dates.length} dates générées avec 4 fichiers Excel et 25 feuilles chacune`)
  console.log('\nVous pouvez maintenant exécuter:')
  console.log('  node scripts/test-ingestion-pipeline.js')
}

// Exporter les fonctions
module.exports = generateTestExcelFiles

// Exécuter la génération si appelé directement
if (require.main === module) {
  generateMultipleDates().catch(console.error)
}
