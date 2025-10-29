module.exports = (sequelize, DataTypes) => {
  const ImtTransaction = sequelize.define('ImtTransaction', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    country: { type: DataTypes.STRING(50) },
    imt_business: { type: DataTypes.STRING(50) },
    channel: { type: DataTypes.STRING(50), allowNull: false }, // ETHUB_SEND, ETHUB_RECV, MFS_SEND, MFS_RECV
    hour: { type: DataTypes.INTEGER, allowNull: true }, // 0-23 for hourly data, null for daily
    total_success: { type: DataTypes.INTEGER },
    total_failed: { type: DataTypes.INTEGER },
    amount: { type: DataTypes.DECIMAL(20,2) }, // In millions XOF
    revenue: { type: DataTypes.DECIMAL(20,2) }, // In thousands XOF
    commission: { type: DataTypes.DECIMAL(20,2) }, // In thousands XOF
    tax: { type: DataTypes.DECIMAL(20,2) }, // In thousands XOF
    success_rate: { type: DataTypes.DECIMAL(5,4) },
    balance: { type: DataTypes.DECIMAL(20,2) } // In millions XOF
  }, {
    tableName: 'imt_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'country', 'imt_business', 'channel', 'hour'], unique: true }]
  })

  // Static methods for data retrieval
  ImtTransaction.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['country', 'ASC'], ['imt_business', 'ASC']]
    })
  }

  return ImtTransaction
}
