module.exports = (sequelize, DataTypes) => {
  const WeeklyKpis = sequelize.define('WeeklyKpis', {
    week_start_date: { type: DataTypes.DATEONLY, allowNull: false },
    week_end_date: { type: DataTypes.DATEONLY, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    week_number: { type: DataTypes.INTEGER, allowNull: false },

    // Revenue metrics by day of week
    monday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    tuesday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    wednesday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    thursday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    friday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    saturday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    sunday_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    // Transaction metrics by day of week
    monday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    tuesday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    wednesday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    thursday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    friday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    saturday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    sunday_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },

    // Weekly totals
    total_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    total_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_daily_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    avg_daily_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },

    // Growth metrics
    revenue_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    transaction_change_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }
  }, {
    tableName: 'weekly_kpis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['week_start_date']
      },
      {
        fields: ['year', 'week_number']
      }
    ]
  })

  // Static methods for data retrieval
  WeeklyKpis.findByWeekRange = async function(startWeek, endWeek, year) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        year: year,
        week_number: {
          [Op.between]: [startWeek, endWeek]
        }
      },
      order: [['week_start_date', 'ASC']]
    })
  }

  WeeklyKpis.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        week_start_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['week_start_date', 'ASC']]
    })
  }

  return WeeklyKpis
}