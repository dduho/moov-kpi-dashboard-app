const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class RevenueByChannel extends Model {}

RevenueByChannel.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  channel: { type: DataTypes.STRING(50) },
  transaction_count: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(20,2) },
  revenue: { type: DataTypes.DECIMAL(20,2) },
  commission: { type: DataTypes.DECIMAL(20,2) },
  tax: { type: DataTypes.DECIMAL(20,2) }
}, {
  sequelize,
  modelName: 'RevenueByChannel',
  tableName: 'revenue_by_channel',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['date', 'channel'], unique: true }]
})

// Static methods for data retrieval
RevenueByChannel.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['channel', 'ASC']]
  })
}

module.exports = RevenueByChannel
