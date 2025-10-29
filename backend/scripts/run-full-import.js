const job = require('../src/jobs/dailyDataIngestion')

console.log('================================================================================')
console.log('IMPORTATION COMPLÈTE DES DONNÉES KPI')
console.log('================================================================================')

// Run initial scan which will import all dates
job.runInitialScan()
  .then(() => {
    console.log('\n✅ Import terminé avec succès!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Erreur lors de l\'import:', error)
    process.exit(1)
  })
