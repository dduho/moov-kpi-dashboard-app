module.exports = (sequelize, DataTypes) => {
  const ChannelDailyStats = sequelize.define('ChannelDailyStats', {
    date: { type: DataTypes.DATEONLY, allowNull: false },

    // Channel identification
    channel: { type: DataTypes.STRING(50), allowNull: false }, // 'Cash In', 'Cash Out', 'IMT', 'Banks', 'P2P', 'Bill', 'Telco'

    // Daily metrics
    users_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    transactions_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 }, // In thousands XOF
    amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 }, // In millions XOF

    // Monthly aggregations (calculated)
    monthly_total_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    monthly_avg_revenue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    monthly_total_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    monthly_avg_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },

    // Growth metrics
    mom_revenue_percent: { type: DataTypes.DECIMAL(8, 4), defaultValue: 0 }, // Month-over-Month revenue %
    mom_transactions_percent: { type: DataTypes.DECIMAL(8, 4), defaultValue: 0 }, // Month-over-Month transactions %

    // Channel-specific flags
    includes_mfs: { type: DataTypes.BOOLEAN, defaultValue: false }, // For IMT: includes MFS?
    includes_ethub: { type: DataTypes.BOOLEAN, defaultValue: false }, // For IMT: includes ETHUB?
    service_active: { type: DataTypes.BOOLEAN, defaultValue: true }, // For P2P: service active?

    // Additional metadata
    day_of_month: { type: DataTypes.INTEGER, allowNull: false }, // 1-31
    month: { type: DataTypes.INTEGER, allowNull: false }, // 1-12
    year: { type: DataTypes.INTEGER, allowNull: false } // 2024, 2025, etc.
  }, {
    tableName: 'channel_daily_stats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['date', 'channel']
      },
      {
        fields: ['channel', 'year', 'month']
      },
      {
        fields: ['year', 'month', 'day_of_month']
      }
    ]
  })

  // Static methods for data retrieval
  ChannelDailyStats.findByChannel = async function(channel, startDate = null, endDate = null) {
    const { Op } = require('sequelize')
    const whereClause = { channel }

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      }
    }

    return await this.findAll({
      where: whereClause,
      order: [['date', 'ASC']]
    })
  }

  ChannelDailyStats.findByDateRange = async function(startDate, endDate, channels = null) {
    const { Op } = require('sequelize')
    const whereClause = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }

    if (channels && channels.length > 0) {
      whereClause.channel = {
        [Op.in]: channels
      }
    }

    return await this.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['channel', 'ASC']]
    })
  }

  ChannelDailyStats.getMonthlyStats = async function(year, month, channel = null) {
    const whereClause = { year, month }
    if (channel) {
      whereClause.channel = channel
    }

    return await this.findAll({
      where: whereClause,
      attributes: [
        'channel',
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('transactions_count')), 'total_transactions'],
        [sequelize.fn('AVG', sequelize.col('revenue')), 'avg_daily_revenue'],
        [sequelize.fn('AVG', sequelize.col('transactions_count')), 'avg_daily_transactions'],
        [sequelize.fn('COUNT', sequelize.col('date')), 'days_count']
      ],
      group: ['channel'],
      order: [['channel', 'ASC']]
    })
  }

  ChannelDailyStats.getChannelComparison = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'channel',
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('transactions_count')), 'total_transactions'],
        [sequelize.fn('AVG', sequelize.col('revenue')), 'avg_revenue'],
        [sequelize.fn('COUNT', sequelize.col('date')), 'days_count']
      ],
      group: ['channel'],
      order: [[sequelize.literal('total_revenue'), 'DESC']]
    })
  }

  return ChannelDailyStats
}