module.exports = (sequelize, DataTypes) => {
  const ComparativeAnalytics = sequelize.define('ComparativeAnalytics', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    business_type: { type: DataTypes.STRING(100), allowNull: false },

    // Current day metrics
    current_success_trx: { type: DataTypes.INTEGER, defaultValue: 0 },
    current_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    current_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Last day metrics
    last_success_trx: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    last_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Gap analysis
    success_trx_gap: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    amount_gap: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    revenue_gap: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Percentage changes
    success_trx_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    amount_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    revenue_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },

    // Trend indicators
    trend: {
      type: DataTypes.ENUM('up', 'down', 'stable'),
      defaultValue: 'stable'
    }
  }, {
    tableName: 'comparative_analytics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['date', 'business_type']
      },
      {
        fields: ['date']
      },
      {
        fields: ['business_type']
      }
    ]
  })

  // Static methods for data retrieval
  ComparativeAnalytics.findByDate = async function(date) {
    return await this.findAll({
      where: { date: date },
      order: [['business_type', 'ASC']]
    })
  }

  ComparativeAnalytics.findByDateRange = async function(startDate, endDate) {
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

  ComparativeAnalytics.findByBusinessType = async function(businessType, limit = 30) {
    return await this.findAll({
      where: { business_type: businessType },
      order: [['date', 'DESC']],
      limit: limit
    })
  }

  ComparativeAnalytics.getTrendSummary = async function(date) {
    const analytics = await this.findByDate(date)
    const trends = analytics.reduce((summary, analytic) => {
      if (analytic.trend === 'up') summary.up++
      else if (analytic.trend === 'down') summary.down++
      else summary.stable++
      return summary
    }, { up: 0, down: 0, stable: 0 })

    return {
      date,
      total_business_types: analytics.length,
      trends,
      overall_trend: trends.up > trends.down ? 'positive' :
                     trends.down > trends.up ? 'negative' : 'stable'
    }
  }

  return ComparativeAnalytics
}