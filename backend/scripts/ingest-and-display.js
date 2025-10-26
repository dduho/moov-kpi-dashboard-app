const dailyDataIngestionJob = require('../src/jobs/dailyDataIngestion')
const { sequelize, DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, KpiAggregates } = require('../src/models')
const { Op } = require('sequelize')

async function ingestAndDisplay() {
  console.log('='.repeat(80))
  console.log('INGESTION ET AFFICHAGE DES DONNÉES KPI')
  console.log('='.repeat(80))

  try {
    // 1. Connexion à la base de données
    console.log('\n[1/4] Connexion à la base de données...')
    await sequelize.authenticate()
    await sequelize.sync()
    console.log('✅ Connecté à la base de données')

    // 2. Ingestion des données pour plusieurs dates
    console.log('\n[2/4] Ingestion des données...')
    const datesToIngest = ['20250704', '20250705', '20250706', '20250801', '20250802']

    for (const date of datesToIngest) {
      console.log(`\n  📅 Traitement de la date: ${date}`)
      try {
        await dailyDataIngestionJob.runForDate(date)
        console.log(`  ✅ Date ${date} traitée avec succès`)
      } catch (error) {
        console.log(`  ⚠️  Erreur pour ${date}: ${error.message}`)
      }
    }

    // 3. Vérification des données en base
    console.log('\n[3/4] Vérification des données en base...')
    const totalCounts = {
      dailyKpi: await DailyKpi.count(),
      hourlyKpi: await HourlyKpi.count(),
      imt: await ImtTransaction.count(),
      revenue: await RevenueByChannel.count(),
      aggregates: await KpiAggregates.count()
    }
    console.log(`  📊 Total DailyKpi: ${totalCounts.dailyKpi}`)
    console.log(`  📊 Total HourlyKpi: ${totalCounts.hourlyKpi}`)
    console.log(`  📊 Total ImtTransaction: ${totalCounts.imt}`)
    console.log(`  📊 Total RevenueByChannel: ${totalCounts.revenue}`)
    console.log(`  📊 Total KpiAggregates: ${totalCounts.aggregates}`)

    // 4. Affichage des statistiques multi-jours
    console.log('\n[4/4] Statistiques détaillées par jour...')
    console.log('='.repeat(80))

    // Récupérer les dates disponibles
    const availableDates = await DailyKpi.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('date')), 'date']],
      order: [[sequelize.col('date'), 'ASC']],
      raw: true
    })

    console.log(`\n📅 ${availableDates.length} dates disponibles: ${availableDates.map(d => d.date).join(', ')}`)

    // Pour chaque date, afficher un résumé
    for (const { date } of availableDates) {
      console.log('\n' + '─'.repeat(80))
      console.log(`📆 DATE: ${date}`)
      console.log('─'.repeat(80))

      // Daily KPI Summary
      const dailySummary = await DailyKpi.findAll({
        where: { date },
        attributes: [
          'business_type',
          [sequelize.fn('SUM', sequelize.col('success_trx')), 'total_transactions'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
          [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
          [sequelize.fn('SUM', sequelize.col('commission')), 'total_commission']
        ],
        group: ['business_type'],
        raw: true
      })

      console.log('\n💰 REVENUS PAR TYPE D\'ACTIVITÉ:')
      console.log('┌─────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐')
      console.log('│ Type            │ Transactions │ Montant      │ Revenu       │ Commission   │')
      console.log('├─────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤')

      let totalTrx = 0, totalAmount = 0, totalRevenue = 0, totalCommission = 0

      dailySummary.forEach(row => {
        const trx = parseInt(row.total_transactions) || 0
        const amt = parseFloat(row.total_amount) || 0
        const rev = parseFloat(row.total_revenue) || 0
        const com = parseFloat(row.total_commission) || 0

        totalTrx += trx
        totalAmount += amt
        totalRevenue += rev
        totalCommission += com

        console.log(`│ ${row.business_type.padEnd(15)} │ ${trx.toLocaleString().padStart(12)} │ ${amt.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │ ${rev.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │ ${com.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │`)
      })

      console.log('├─────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤')
      console.log(`│ ${'TOTAL'.padEnd(15)} │ ${totalTrx.toLocaleString().padStart(12)} │ ${totalAmount.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │ ${totalRevenue.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │ ${totalCommission.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │`)
      console.log('└─────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘')

      // Revenue by Channel
      const revenueByChannel = await RevenueByChannel.findAll({
        where: { date },
        order: [['revenue', 'DESC']],
        limit: 5,
        raw: true
      })

      if (revenueByChannel.length > 0) {
        console.log('\n📊 TOP 5 CANAUX PAR REVENU:')
        console.log('┌─────────────────┬──────────────┬──────────────┐')
        console.log('│ Canal           │ Transactions │ Revenu       │')
        console.log('├─────────────────┼──────────────┼──────────────┤')

        revenueByChannel.forEach(row => {
          const trx = parseInt(row.transaction_count) || 0
          const rev = parseFloat(row.revenue) || 0
          console.log(`│ ${row.channel.padEnd(15)} │ ${trx.toLocaleString().padStart(12)} │ ${rev.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │`)
        })

        console.log('└─────────────────┴──────────────┴──────────────┘')
      }

      // Hourly peak analysis
      const hourlyPeaks = await HourlyKpi.findAll({
        where: { date },
        attributes: [
          'hour',
          [sequelize.fn('SUM', sequelize.col('total_trans')), 'total_transactions'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        group: ['hour'],
        order: [[sequelize.literal('total_transactions'), 'DESC']],
        limit: 3,
        raw: true
      })

      if (hourlyPeaks.length > 0) {
        console.log('\n⏰ TOP 3 HEURES D\'ACTIVITÉ:')
        console.log('┌──────┬──────────────┬──────────────┐')
        console.log('│ Heure│ Transactions │ Montant      │')
        console.log('├──────┼──────────────┼──────────────┤')

        hourlyPeaks.forEach(row => {
          const hour = `${String(row.hour).padStart(2, '0')}:00`
          const trx = parseInt(row.total_transactions) || 0
          const amt = parseFloat(row.total_amount) || 0
          console.log(`│ ${hour.padEnd(4)} │ ${trx.toLocaleString().padStart(12)} │ ${amt.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0}).padStart(12)} │`)
        })

        console.log('└──────┴──────────────┴──────────────┘')
      }

      // IMT Summary
      const imtCount = await ImtTransaction.count({ where: { date } })
      if (imtCount > 0) {
        const imtSummary = await ImtTransaction.findAll({
          where: { date },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('total_success')), 'total_success'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
            [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue']
          ],
          raw: true
        })

        const imt = imtSummary[0]
        console.log('\n🌍 TRANSACTIONS IMT:')
        console.log(`  Transactions réussies: ${parseInt(imt.total_success || 0).toLocaleString()}`)
        console.log(`  Montant total: ${parseFloat(imt.total_amount || 0).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`)
        console.log(`  Revenu: ${parseFloat(imt.total_revenue || 0).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`)
      }
    }

    // Statistiques globales sur la période
    console.log('\n' + '='.repeat(80))
    console.log('📈 STATISTIQUES GLOBALES SUR LA PÉRIODE')
    console.log('='.repeat(80))

    const globalStats = await DailyKpi.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('date'))), 'total_days'],
        [sequelize.fn('SUM', sequelize.col('success_trx')), 'total_transactions'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('commission')), 'total_commission'],
        [sequelize.fn('AVG', sequelize.col('success_rate')), 'avg_success_rate']
      ],
      raw: true
    })

    const stats = globalStats[0]
    console.log(`\n📅 Nombre de jours: ${stats.total_days}`)
    console.log(`💳 Total transactions: ${parseInt(stats.total_transactions || 0).toLocaleString()}`)
    console.log(`💰 Montant total: ${parseFloat(stats.total_amount || 0).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})} FCFA`)
    console.log(`📊 Revenu total: ${parseFloat(stats.total_revenue || 0).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})} FCFA`)
    console.log(`🔧 Commission totale: ${parseFloat(stats.total_commission || 0).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})} FCFA`)
    console.log(`✅ Taux de succès moyen: ${(parseFloat(stats.avg_success_rate || 0) * 100).toFixed(2)}%`)

    // Moyenne par jour
    const avgPerDay = {
      transactions: parseInt(stats.total_transactions || 0) / parseInt(stats.total_days || 1),
      amount: parseFloat(stats.total_amount || 0) / parseInt(stats.total_days || 1),
      revenue: parseFloat(stats.total_revenue || 0) / parseInt(stats.total_days || 1)
    }

    console.log(`\n📊 Moyennes par jour:`)
    console.log(`  Transactions/jour: ${Math.round(avgPerDay.transactions).toLocaleString()}`)
    console.log(`  Montant/jour: ${Math.round(avgPerDay.amount).toLocaleString('fr-FR')} FCFA`)
    console.log(`  Revenu/jour: ${Math.round(avgPerDay.revenue).toLocaleString('fr-FR')} FCFA`)

    console.log('\n' + '='.repeat(80))
    console.log('✅ TRAITEMENT TERMINÉ AVEC SUCCÈS')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message)
    console.error(error.stack)
  } finally {
    await sequelize.close()
  }
}

// Exécuter
ingestAndDisplay().catch(console.error)
