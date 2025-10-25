module.exports = (sequelize, DataTypes) => {
  const HourlyKpi = sequelize.define('HourlyKpi', {
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
    tableName: 'hourly_kpi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'hour', 'txn_type_name'], unique: true }]
  })

  // Static methods for data retrieval
  HourlyKpi.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['hour', 'ASC'], ['txn_type_name', 'ASC']]
    })
  }

  return HourlyKpi
}
