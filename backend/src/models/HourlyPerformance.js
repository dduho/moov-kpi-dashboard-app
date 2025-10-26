module.exports = (sequelize, DataTypes) => {
  const HourlyPerformance = sequelize.define('HourlyPerformance', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    hour: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 23 } },

    // Transaction counts
    transaction_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    transaction_count_last_day: { type: DataTypes.INTEGER, defaultValue: 0 },
    transaction_count_gap: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    transaction_count_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },

    // Amount metrics
    amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    amount_last_day: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    amount_gap: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    amount_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },

    // Revenue metrics
    revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    commission: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    revenue_last_day: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    commission_last_day: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    revenue_gap: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    revenue_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }
  }, {
    tableName: 'hourly_performance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['date', 'hour']
      },
      {
        fields: ['date']
      }
    ]
  })

  // Static methods for data retrieval
  HourlyPerformance.findByDate = async function(date) {
    return await this.findAll({
      where: { date: date },
      order: [['hour', 'ASC']]
    })
  }

  HourlyPerformance.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['hour', 'ASC']]
    })
  }

  HourlyPerformance.getDailySummary = async function(date) {
    const performances = await this.findByDate(date)
    return performances.reduce((summary, perf) => {
      summary.total_transactions += perf.transaction_count
      summary.total_amount += parseFloat(perf.amount || 0)
      summary.total_revenue += parseFloat(perf.revenue || 0)
      summary.total_commission += parseFloat(perf.commission || 0)
      return summary
    }, {
      total_transactions: 0,
      total_amount: 0,
      total_revenue: 0,
      total_commission: 0
    })
  }

  return HourlyPerformance
}