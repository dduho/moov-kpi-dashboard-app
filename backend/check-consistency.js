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

async function checkBusinessTypes() {
  try {
    console.log('Checking business type consistency across tables...\n');

    // Check DailyKpi business types
    try {
      const dailyKpiTypes = await sequelize.query('SELECT DISTINCT business_type FROM "DailyKpis" ORDER BY business_type', { type: Sequelize.QueryTypes.SELECT });
      console.log('DailyKpi business types:', dailyKpiTypes.map(r => r.business_type));
    } catch (error) {
      console.log('DailyKpi table error:', error.message);
    }

    // Check DailyComparison business types
    try {
      const comparisonTypes = await sequelize.query('SELECT DISTINCT business_type FROM "DailyComparisons" ORDER BY business_type', { type: Sequelize.QueryTypes.SELECT });
      console.log('DailyComparison business types:', comparisonTypes.map(r => r.business_type));
    } catch (error) {
      console.log('DailyComparison table error:', error.message);
    }

    // Check RevenueByChannel channels
    try {
      const channels = await sequelize.query('SELECT DISTINCT channel FROM "RevenueByChannels" ORDER BY channel', { type: Sequelize.QueryTypes.SELECT });
      console.log('RevenueByChannel channels:', channels.map(r => r.channel));
    } catch (error) {
      console.log('RevenueByChannel table error:', error.message);
    }

    // Check ChannelDailyStats channels
    try {
      const channelStats = await sequelize.query('SELECT DISTINCT channel FROM "ChannelDailyStats" ORDER BY channel', { type: Sequelize.QueryTypes.SELECT });
      console.log('ChannelDailyStats channels:', channelStats.map(r => r.channel));
    } catch (error) {
      console.log('ChannelDailyStats table error:', error.message);
    }

    // Check ImtTransaction channels
    try {
      const imtChannels = await sequelize.query('SELECT DISTINCT channel FROM "ImtTransactions" ORDER BY channel', { type: Sequelize.QueryTypes.SELECT });
      console.log('ImtTransaction channels:', imtChannels.map(r => r.channel));
    } catch (error) {
      console.log('ImtTransaction table error:', error.message);
    }

  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkBusinessTypes();