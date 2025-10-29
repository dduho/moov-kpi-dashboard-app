const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:./database/kpi_database.db');

async function listTables() {
  try {
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", { type: Sequelize.QueryTypes.SELECT });
    console.log('Tables in database:');
    tables.forEach(table => console.log('- ' + table.name));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

listTables();