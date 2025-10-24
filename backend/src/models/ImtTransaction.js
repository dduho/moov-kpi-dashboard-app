const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class ImtTransaction extends Model {}

ImtTransaction.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  country: { type: DataTypes.STRING(50) },
  imt_business: { type: DataTypes.STRING(50) },
  total_success: { type: DataTypes.INTEGER },
  total_failed: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(20,2) },
  revenue: { type: DataTypes.DECIMAL(20,2) },
  commission: { type: DataTypes.DECIMAL(20,2) },
  tax: { type: DataTypes.DECIMAL(20,2) },
  success_rate: { type: DataTypes.DECIMAL(5,4) },
  balance: { type: DataTypes.DECIMAL(20,2) }
}, {
  sequelize,
  modelName: 'ImtTransaction',
  tableName: 'imt_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['date', 'country', 'imt_business'], unique: true }]
})

// Static methods for data retrieval
ImtTransaction.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC'], ['country', 'ASC'], ['imt_business', 'ASC']]
  })
}

module.exports = ImtTransaction
