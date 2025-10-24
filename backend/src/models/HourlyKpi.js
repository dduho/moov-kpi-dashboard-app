const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class HourlyKpi extends Model {}

HourlyKpi.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  hour: { type: DataTypes.INTEGER },
  txn_type_name: { type: DataTypes.STRING(50) },
  total_trans: { type: DataTypes.INTEGER },
  total_success: { type: DataTypes.INTEGER },
  total_failed: { type: DataTypes.INTEGER },
  total_pending: { type: DataTypes.INTEGER },
  total_amount: { type: DataTypes.DECIMAL(20,2) },
  total_fee: { type: DataTypes.DECIMAL(20,2) },
  total_commission: { type: DataTypes.DECIMAL(20,2) },
  total_tax: { type: DataTypes.DECIMAL(20,2) }
}, {
  sequelize,
  modelName: 'HourlyKpi',
  tableName: 'hourly_kpi',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['date', 'hour', 'txn_type_name'], unique: true }]
})

// Static methods for data retrieval
HourlyKpi.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['hour', 'ASC'], ['txn_type_name', 'ASC']]
  })
}

module.exports = HourlyKpi
