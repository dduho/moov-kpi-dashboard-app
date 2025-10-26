module.exports = (sequelize, DataTypes) => {
  const KpiAggregates = sequelize.define('KpiAggregates', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    aggregate_type: {
      type: DataTypes.ENUM('business_type', 'country', 'channel'),
      allowNull: false
    },
    aggregate_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'The business_type, country, or channel name'
    },
    total_transactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_success: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_failed: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_pending: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 },
    total_revenue: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 },
    total_commission: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 },
    total_tax: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 },
    success_rate: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
    metadata: {
      type: DataTypes.JSON,
      comment: 'Additional aggregate-specific data'
    }
  }, {
    tableName: 'kpi_aggregates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['date', 'aggregate_type', 'aggregate_key'], unique: true },
      { fields: ['date'] },
      { fields: ['aggregate_type'] }
    ]
  })

  // Static methods for data retrieval
  KpiAggregates.findByDateAndType = async function(date, aggregateType) {
    return await this.findAll({
      where: { date, aggregate_type: aggregateType },
      order: [['aggregate_key', 'ASC']]
    })
  }

  KpiAggregates.findByDateRange = async function(startDate, endDate, aggregateType = null) {
    const { Op } = require('sequelize')
    const where = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }

    if (aggregateType) {
      where.aggregate_type = aggregateType
    }

    return await this.findAll({
      where,
      order: [['date', 'ASC'], ['aggregate_type', 'ASC'], ['aggregate_key', 'ASC']]
    })
  }

  return KpiAggregates
}
