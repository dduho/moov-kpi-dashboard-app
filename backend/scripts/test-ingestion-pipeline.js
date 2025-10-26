const path = require('path')
const fs = require('fs').promises
const dailyDataIngestionJob = require('../src/jobs/dailyDataIngestion')
const { sequelize, DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel } = require('../src/models')
const logger = require('../src/utils/logger')

async function testIngestionPipeline() {
  console.log('='.repeat(80))
  console.log('TEST DU PIPELINE D\'INGESTION DES DONNÉES')
  console.log('='.repeat(80))

  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n[1/6] Vérification de la connexion à la base de données...')
    await sequelize.authenticate()
    console.log('✅ Connexion à la base de données réussie')
    console.log(`   Base de données: ${sequelize.config.database || 'SQLite'}`)

    // 2. Synchroniser les modèles (créer les tables si elles n'existent pas)
    console.log('\n[2/6] Synchronisation des modèles...')
    await sequelize.sync({ alter: true })
    console.log('✅ Modèles synchronisés')

    // 3. Vérifier la structure du dossier kpi_data
    console.log('\n[3/6] Vérification de la structure de kpi_data...')
    const kpiDataPath = path.join(__dirname, '../../kpi_data')

    try {
      await fs.access(kpiDataPath)
      console.log(`✅ Dossier kpi_data trouvé: ${kpiDataPath}`)

      // Lister les dossiers mensuels
      const monthFolders = await fs.readdir(kpiDataPath, { withFileTypes: true })
      const months = monthFolders
        .filter(entry => entry.isDirectory() && /^\d{6}$/.test(entry.name))
        .map(entry => entry.name)

      console.log(`   Dossiers mensuels trouvés: ${months.join(', ')}`)

      // Pour chaque mois, chercher les fichiers RAR
      for (const month of months.slice(0, 2)) { // Limiter à 2 mois pour le test
        const monthPath = path.join(kpiDataPath, month)
        const monthEntries = await fs.readdir(monthPath, { withFileTypes: true })

        const rarFiles = monthEntries
          .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.rar'))
          .map(entry => entry.name)

        const dateFolders = monthEntries
          .filter(entry => entry.isDirectory() && /^\d{8}$/.test(entry.name))
          .map(entry => entry.name)

        console.log(`   ${month}:`)
        console.log(`     - Fichiers RAR: ${rarFiles.length}`)
        console.log(`     - Dossiers de dates: ${dateFolders.length}`)

        // Vérifier le contenu d'un dossier de date
        if (dateFolders.length > 0) {
          const dateFolder = dateFolders[0]
          const datePath = path.join(monthPath, dateFolder)
          const excelFiles = await fs.readdir(datePath)
          console.log(`     - Exemple (${dateFolder}): ${excelFiles.length} fichiers`)
          if (excelFiles.length > 0) {
            console.log(`       Fichiers: ${excelFiles.slice(0, 3).join(', ')}${excelFiles.length > 3 ? '...' : ''}`)
          }
        }
      }
    } catch (error) {
      console.log(`❌ Erreur lors de la vérification de kpi_data: ${error.message}`)
    }

    // 4. Tester l'extraction et le parsing pour une date spécifique
    console.log('\n[4/6] Test d\'ingestion pour une date...')

    // Chercher une date disponible
    const kpiDataPath2 = path.join(__dirname, '../../kpi_data')
    const monthFolders2 = await fs.readdir(kpiDataPath2, { withFileTypes: true })
    const firstMonth = monthFolders2.find(entry => entry.isDirectory() && /^\d{6}$/.test(entry.name))

    if (firstMonth) {
      const monthPath = path.join(kpiDataPath2, firstMonth.name)
      const monthEntries = await fs.readdir(monthPath, { withFileTypes: true })

      // Chercher un dossier de date avec des fichiers Excel
      const dateFolders = monthEntries.filter(entry => entry.isDirectory() && /^\d{8}$/.test(entry.name))

      let testDate = null
      for (const dateFolder of dateFolders) {
        const datePath = path.join(monthPath, dateFolder.name)
        const files = await fs.readdir(datePath)
        const hasExcel = files.some(f => f.toLowerCase().endsWith('.xlsx'))
        if (hasExcel) {
          testDate = dateFolder.name
          break
        }
      }

      if (testDate) {
        console.log(`   Test avec la date: ${testDate}`)

        // Compter les enregistrements avant
        const beforeCounts = {
          dailyKpi: await DailyKpi.count({ where: { date: testDate } }),
          hourlyKpi: await HourlyKpi.count({ where: { date: testDate } }),
          imt: await ImtTransaction.count({ where: { date: testDate } }),
          revenue: await RevenueByChannel.count({ where: { date: testDate } })
        }
        console.log('   Enregistrements avant:')
        console.log(`     - DailyKpi: ${beforeCounts.dailyKpi}`)
        console.log(`     - HourlyKpi: ${beforeCounts.hourlyKpi}`)
        console.log(`     - ImtTransaction: ${beforeCounts.imt}`)
        console.log(`     - RevenueByChannel: ${beforeCounts.revenue}`)

        // Lancer l'ingestion
        console.log('   Lancement de l\'ingestion...')
        await dailyDataIngestionJob.runForDate(testDate)

        // Compter les enregistrements après
        const afterCounts = {
          dailyKpi: await DailyKpi.count({ where: { date: testDate } }),
          hourlyKpi: await HourlyKpi.count({ where: { date: testDate } }),
          imt: await ImtTransaction.count({ where: { date: testDate } }),
          revenue: await RevenueByChannel.count({ where: { date: testDate } })
        }
        console.log('   Enregistrements après:')
        console.log(`     - DailyKpi: ${afterCounts.dailyKpi} (${afterCounts.dailyKpi > beforeCounts.dailyKpi ? '+' : ''}${afterCounts.dailyKpi - beforeCounts.dailyKpi})`)
        console.log(`     - HourlyKpi: ${afterCounts.hourlyKpi} (${afterCounts.hourlyKpi > beforeCounts.hourlyKpi ? '+' : ''}${afterCounts.hourlyKpi - beforeCounts.hourlyKpi})`)
        console.log(`     - ImtTransaction: ${afterCounts.imt} (${afterCounts.imt > beforeCounts.imt ? '+' : ''}${afterCounts.imt - beforeCounts.imt})`)
        console.log(`     - RevenueByChannel: ${afterCounts.revenue} (${afterCounts.revenue > beforeCounts.revenue ? '+' : ''}${afterCounts.revenue - beforeCounts.revenue})`)

        if (afterCounts.dailyKpi > 0 || afterCounts.hourlyKpi > 0) {
          console.log('✅ Données ingérées avec succès')
        } else {
          console.log('⚠️  Aucune donnée ingérée - vérifier les fichiers Excel')
        }
      } else {
        console.log('⚠️  Aucune date avec fichiers Excel trouvée')
      }
    }

    // 5. Vérifier les données totales en base
    console.log('\n[5/6] Statistiques globales de la base de données...')
    const totalCounts = {
      dailyKpi: await DailyKpi.count(),
      hourlyKpi: await HourlyKpi.count(),
      imt: await ImtTransaction.count(),
      revenue: await RevenueByChannel.count()
    }
    console.log(`   Total DailyKpi: ${totalCounts.dailyKpi}`)
    console.log(`   Total HourlyKpi: ${totalCounts.hourlyKpi}`)
    console.log(`   Total ImtTransaction: ${totalCounts.imt}`)
    console.log(`   Total RevenueByChannel: ${totalCounts.revenue}`)

    // 6. Vérifier les dates uniques
    console.log('\n[6/6] Dates disponibles en base...')
    const uniqueDates = await DailyKpi.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('date')), 'date']],
      order: [['date', 'DESC']],
      limit: 10,
      raw: true
    })
    console.log(`   Dernières dates (max 10): ${uniqueDates.map(d => d.date).join(', ')}`)

    console.log('\n' + '='.repeat(80))
    console.log('✅ TEST TERMINÉ AVEC SUCCÈS')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error)
    console.error(error.stack)
  } finally {
    await sequelize.close()
  }
}

// Exécuter le test
testIngestionPipeline().catch(console.error)
