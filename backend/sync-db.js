const { WeeklyKpis, HourlyPerformance, ComparativeAnalytics } = require('./src/models')

async function syncDatabase() {
  try {
    console.log('Creating new KPI tables...')

    // Create tables for new models only
    await WeeklyKpis.sync({ force: false })
    await HourlyPerformance.sync({ force: false })
    await ComparativeAnalytics.sync({ force: false })

    console.log('New KPI tables created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error creating new tables:', error)
    process.exit(1)
  }
}

syncDatabase()