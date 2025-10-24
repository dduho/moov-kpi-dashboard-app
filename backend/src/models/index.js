const { Sequelize } = require('sequelize')
const path = require('path')

// Use SQLite for development when PostgreSQL is not available
const sequelize = process.env.NODE_ENV === 'production' 
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database/dev.sqlite'),
      logging: false
    })

module.exports = { sequelize }