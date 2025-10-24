const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class DailyKpi extends Model {}

DailyKpi.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  business_type: { type: DataTypes.STRING(50) },
  period: { type: DataTypes.STRING(100) },
  success_trx: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(20,2) },
  revenue: { type: DataTypes.DECIMAL(20,2) },
  commission: { type: DataTypes.DECIMAL(20,2) },
  tax: { type: DataTypes.DECIMAL(20,2) },
  failed_trx: { type: DataTypes.INTEGER },
  expired_trx: { type: DataTypes.INTEGER },
  success_rate: { type: DataTypes.DECIMAL(5,4) },
  revenue_rate: { type: DataTypes.DECIMAL(10,4) }
}, {
  sequelize,
  modelName: 'DailyKpi',
  tableName: 'daily_kpi',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['date', 'business_type', 'period'], unique: true }]
})

// Static methods for data retrieval
DailyKpi.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['business_type', 'ASC']]
  })
}

DailyKpi.getSummary = async function(date) {
  const result = await this.findAll({
    where: { date },
    attributes: [
      [require('sequelize').fn('SUM', require('sequelize').col('success_trx')), 'totalTransactions'],
      [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
      [require('sequelize').fn('SUM', require('sequelize').col('revenue')), 'totalRevenue'],
      [require('sequelize').fn('SUM', require('sequelize').col('commission')), 'totalCommission'],
      [require('sequelize').fn('SUM', require('sequelize').col('tax')), 'totalTax'],
      [require('sequelize').fn('SUM', require('sequelize').col('failed_trx')), 'totalFailed'],
      [require('sequelize').fn('SUM', require('sequelize').col('expired_trx')), 'totalExpired']
    ],
    raw: true
  })

  return result[0] || {
    totalTransactions: 0,
    totalAmount: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalTax: 0,
    totalFailed: 0,
    totalExpired: 0
  }
}

module.exports = DailyKpi
