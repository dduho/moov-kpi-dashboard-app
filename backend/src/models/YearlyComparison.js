module.exports = (sequelize, DataTypes) => {
  const YearlyComparison = sequelize.define('YearlyComparison', {
    year: { type: DataTypes.INTEGER, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false },
    day: { type: DataTypes.INTEGER, allowNull: false },

    // Daily value (could be revenue, transactions, etc.)
    value: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Monthly aggregations
    monthly_total: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    monthly_avg: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Year-over-year and month-over-month comparisons
    mom_percent: { type: DataTypes.DECIMAL(8, 4), defaultValue: 0 }, // Month-over-Month %
    yoy_percent: { type: DataTypes.DECIMAL(8, 4), defaultValue: 0 }, // Year-over-Year %

    // Metadata
    metric_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'revenue' }, // 'revenue', 'transactions', etc.
    category: { type: DataTypes.STRING(100), allowNull: true } // Optional category filter
  }, {
    tableName: 'yearly_comparisons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['year', 'month', 'day', 'metric_type', 'category']
      },
      {
        fields: ['year', 'month']
      },
      {
        fields: ['metric_type']
      }
    ]
  })

  // Static methods for data retrieval
  YearlyComparison.findByYear = async function(year, metricType = null) {
    const whereClause = { year }
    if (metricType) {
      whereClause.metric_type = metricType
    }
    return await this.findAll({
      where: whereClause,
      order: [['month', 'ASC'], ['day', 'ASC']]
    })
  }

  YearlyComparison.findByMonth = async function(year, month, metricType = null) {
    const whereClause = { year, month }
    if (metricType) {
      whereClause.metric_type = metricType
    }
    return await this.findAll({
      where: whereClause,
      order: [['day', 'ASC']]
    })
  }

  YearlyComparison.getYearlyTrends = async function(year, metricType = 'revenue') {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        year,
        metric_type: metricType
      },
      attributes: [
        'month',
        [sequelize.fn('SUM', sequelize.col('value')), 'monthly_total'],
        [sequelize.fn('AVG', sequelize.col('value')), 'monthly_avg'],
        [sequelize.fn('COUNT', sequelize.col('day')), 'days_count']
      ],
      group: ['month'],
      order: [['month', 'ASC']]
    })
  }

  return YearlyComparison
}