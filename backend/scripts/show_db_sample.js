// Usage: node scripts/show_db_sample.js
// Prints first 10 rows of each KPI model
const { DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers, WeeklyKpis, HourlyPerformance, ComparativeAnalytics } = require('../src/models');
const models = [
  { name: 'DailyKpi', model: DailyKpi },
  { name: 'HourlyKpi', model: HourlyKpi },
  { name: 'ImtTransaction', model: ImtTransaction },
  { name: 'RevenueByChannel', model: RevenueByChannel },
  { name: 'ActiveUsers', model: ActiveUsers },
  { name: 'WeeklyKpis', model: WeeklyKpis },
  { name: 'HourlyPerformance', model: HourlyPerformance },
  { name: 'ComparativeAnalytics', model: ComparativeAnalytics },
];

(async () => {
  for (const { name, model } of models) {
    try {
      const rows = await model.findAll({ limit: 10 });
      console.log(`\n=== ${name} (first 10 rows) ===`);
      if (rows.length === 0) {
        console.log('No data');
      } else {
        rows.forEach((row, i) => {
          console.log(`${i + 1}:`, row.toJSON());
        });
      }
    } catch (err) {
      console.log(`Error fetching ${name}:`, err.message);
    }
  }
  process.exit(0);
})();
