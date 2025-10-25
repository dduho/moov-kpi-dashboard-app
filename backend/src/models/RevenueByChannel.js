module.exports = (sequelize, DataTypes) => {
  const RevenueByChannel = sequelize.define('RevenueByChannel', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    channel: { type: DataTypes.STRING(50) },
    transaction_count: { type: DataTypes.INTEGER },
    amount: { type: DataTypes.DECIMAL(20,2) },
    revenue: { type: DataTypes.DECIMAL(20,2) },
    commission: { type: DataTypes.DECIMAL(20,2) },
    tax: { type: DataTypes.DECIMAL(20,2) }
  }, {
    tableName: 'revenue_by_channel',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'channel'], unique: true }]
  })

  // Static methods for data retrieval
  RevenueByChannel.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['channel', 'ASC']]
    })
  }

  return RevenueByChannel
}
