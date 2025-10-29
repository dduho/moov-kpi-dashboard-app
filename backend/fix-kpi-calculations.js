const { DailyKpi } = require('./src/models');
const logger = require('./src/utils/logger');

async function fixKpiCalculations() {
  try {
    logger.info('Starting KPI calculations fix...');

    // Get all DailyKpi records
    const allRecords = await DailyKpi.findAll({
      order: [['date', 'ASC'], ['business_type', 'ASC']]
    });

    logger.info(`Found ${allRecords.length} records to process`);

    let updatedCount = 0;

    for (const record of allRecords) {
      const totalTransactions = record.success_trx + (record.failed_trx || 0);

      // Calculate success rate: success_trx / total_transactions
      const successRate = totalTransactions > 0
        ? (record.success_trx / totalTransactions)
        : 0;

      // Calculate revenue rate: revenue / amount (if amount > 0)
      const revenueRate = record.amount && parseFloat(record.amount) > 0
        ? (parseFloat(record.revenue || 0) / parseFloat(record.amount))
        : 0;

      // Check if values need updating
      const currentSuccessRate = parseFloat(record.success_rate || 0);
      const currentRevenueRate = parseFloat(record.revenue_rate || 0);

      const successRateDiff = Math.abs(successRate - currentSuccessRate);
      const revenueRateDiff = Math.abs(revenueRate - currentRevenueRate);

      // Update if difference is significant (> 0.001)
      if (successRateDiff > 0.001 || revenueRateDiff > 0.001) {
        await record.update({
          success_rate: successRate,
          revenue_rate: revenueRate
        });
        updatedCount++;
      }
    }

    logger.info(`Successfully updated ${updatedCount} records`);
    logger.info('KPI calculations fix completed');

  } catch (error) {
    logger.error('Error fixing KPI calculations:', error);
    throw error;
  }
}

// Run the fix
fixKpiCalculations()
  .then(() => {
    logger.info('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });