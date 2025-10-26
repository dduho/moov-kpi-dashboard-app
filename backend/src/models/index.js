const { Sequelize, DataTypes } = require('sequelize')
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

// Import models
const User = require('./User')(sequelize, DataTypes)
const Role = require('./Role')(sequelize, DataTypes)
const Permission = require('./Permission')(sequelize, DataTypes)
const DailyKpi = require('./DailyKpi')(sequelize, DataTypes)
const HourlyKpi = require('./HourlyKpi')(sequelize, DataTypes)
const ImtTransaction = require('./ImtTransaction')(sequelize, DataTypes)
const RevenueByChannel = require('./RevenueByChannel')(sequelize, DataTypes)
const ActiveUsers = require('./ActiveUsers')(sequelize, DataTypes)
const KpiAggregates = require('./KpiAggregates')(sequelize, DataTypes)
const KpiComparisons = require('./KpiComparisons')(sequelize, DataTypes)
const WeeklyKpis = require('./WeeklyKpis')(sequelize, DataTypes)
const HourlyPerformance = require('./HourlyPerformance')(sequelize, DataTypes)
const ComparativeAnalytics = require('./ComparativeAnalytics')(sequelize, DataTypes)

// Define relationships
// User <-> Role (Many-to-Many)
User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles'
})

Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users'
})

// Role <-> Permission (Many-to-Many)
Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
})

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
})

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  DailyKpi,
  HourlyKpi,
  ImtTransaction,
  RevenueByChannel,
  ActiveUsers,
  KpiComparisons,
  KpiAggregates,
  WeeklyKpis,
  HourlyPerformance,
  ComparativeAnalytics
}