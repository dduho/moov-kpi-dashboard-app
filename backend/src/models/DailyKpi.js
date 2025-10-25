module.exports = (sequelize, DataTypes) => {
  const DailyKpi = sequelize.define('DailyKpi', {
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
    tableName: 'daily_kpi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'business_type', 'period'], unique: true }]
  })

  // Static methods for data retrieval
  DailyKpi.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['business_type', 'ASC']]
    })
  }

  DailyKpi.getSummary = async function(date) {
    const result = await this.findAll({
      where: { date },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('success_trx')), 'totalTransactions'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('commission')), 'totalCommission'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax'],
        [sequelize.fn('SUM', sequelize.col('failed_trx')), 'totalFailed'],
        [sequelize.fn('SUM', sequelize.col('expired_trx')), 'totalExpired']
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

  return DailyKpi
}
