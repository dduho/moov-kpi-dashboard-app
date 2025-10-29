module.exports = (sequelize, DataTypes) => {
  const ImtBalances = sequelize.define('ImtBalances', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    country: { type: DataTypes.STRING(50), allowNull: false },
    ethub_receive_balance: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In millions XOF
    ethub_send_balance: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In millions XOF
    mfs_receive_balance: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In millions XOF
    mfs_send_balance: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In millions XOF
    balance_status: {
      type: DataTypes.ENUM('Healthy', 'Warning', 'Critical'),
      defaultValue: 'Healthy'
    }
  }, {
    tableName: 'imt_balances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'country'], unique: true }]
  })

  // Static methods for data retrieval
  ImtBalances.findByDateRange = async function(startDate, endDate, country = null) {
    const { Op } = require('sequelize')
    const whereClause = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
    if (country) {
      whereClause.country = country
    }
    return await this.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['country', 'ASC']]
    })
  }

  return ImtBalances
}