const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mmtg_dashboard',
  username: process.env.DB_USER || 'dashboard_user',
  password: process.env.DB_PASSWORD || 'your_password',
  logging: false
});

async function diagnoseDataIssues() {
  try {
    console.log('🔍 DIAGNOSTIC DES PROBLÈMES DE DONNÉES\n');

    // 1. Vérifier les valeurs dans DailyKpi
    console.log('1. Vérification des valeurs DailyKpi (dernière date):');
    const latestDailyKpi = await sequelize.query(`
      SELECT date, business_type, success_trx, amount, revenue, commission, tax
      FROM daily_kpis
      WHERE date = (SELECT MAX(date) FROM daily_kpis)
      ORDER BY business_type
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('DailyKpi valeurs (devraient être en unités réelles, pas millions):');
    latestDailyKpi.forEach(row => {
      console.log(`  ${row.business_type}: success=${row.success_trx}, amount=${row.amount}, revenue=${row.revenue}`);
    });

    // 2. Vérifier les valeurs dans ImtTransaction
    console.log('\n2. Vérification des valeurs ImtTransaction (dernière date):');
    const latestImt = await sequelize.query(`
      SELECT date, country, imt_business, total_success, amount, revenue, commission, tax
      FROM imt_transactions
      WHERE date = (SELECT MAX(date) FROM imt_transactions)
      ORDER BY country, imt_business
      LIMIT 5
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('ImtTransaction valeurs (amount devrait être en millions, revenue en milliers):');
    latestImt.forEach(row => {
      console.log(`  ${row.country} ${row.imt_business}: success=${row.total_success}, amount=${row.amount}M, revenue=${row.revenue}K`);
    });

    // 3. Vérifier les agrégations hebdomadaires
    console.log('\n3. Vérification des agrégations hebdomadaires:');
    const weeklyData = await sequelize.query(`
      SELECT week_start_date, total_revenue, total_transactions, avg_daily_revenue
      FROM weekly_kpis
      ORDER BY week_start_date DESC
      LIMIT 3
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('WeeklyKpis valeurs (devraient être > 0):');
    weeklyData.forEach(row => {
      console.log(`  Week ${row.week_start_date}: revenue=${row.total_revenue}, transactions=${row.total_transactions}, avg_daily=${row.avg_daily_revenue}`);
    });

    // 4. Vérifier les agrégations dans KpiAggregates
    console.log('\n4. Vérification des agrégations KpiAggregates:');
    const aggregates = await sequelize.query(`
      SELECT aggregate_type, aggregate_key, total_revenue, total_amount, total_transactions
      FROM kpi_aggregates
      WHERE date = (SELECT MAX(date) FROM kpi_aggregates)
      ORDER BY aggregate_type, aggregate_key
      LIMIT 10
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('KpiAggregates valeurs:');
    aggregates.forEach(row => {
      console.log(`  ${row.aggregate_type} ${row.aggregate_key}: revenue=${row.total_revenue}, amount=${row.total_amount}, transactions=${row.total_transactions}`);
    });

    // 5. Vérifier les données RevenueByChannel
    console.log('\n5. Vérification des données RevenueByChannel:');
    const revenueData = await sequelize.query(`
      SELECT channel, transaction_count, amount, revenue
      FROM revenue_by_channels
      WHERE date = (SELECT MAX(date) FROM revenue_by_channels)
      ORDER BY channel
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('RevenueByChannel valeurs:');
    revenueData.forEach(row => {
      console.log(`  ${row.channel}: transactions=${row.transaction_count}, amount=${row.amount}, revenue=${row.revenue}`);
    });

  } catch (error) {
    console.error('Erreur lors du diagnostic:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnoseDataIssues();