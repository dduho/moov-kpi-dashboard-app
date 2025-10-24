const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class KpiComparisons extends Model {}

KpiComparisons.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  metric_type: { type: DataTypes.STRING(50) },
  business_type: { type: DataTypes.STRING(50) },
  current_value: { type: DataTypes.DECIMAL(20,2) },
  last_day_value: { type: DataTypes.DECIMAL(20,2) },
  gap: { type: DataTypes.DECIMAL(10,4) },
  gap_percentage: { type: DataTypes.DECIMAL(10,4) }
}, {
  sequelize,
  modelName: 'KpiComparisons',
  tableName: 'kpi_comparisons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['date', 'metric_type', 'business_type'], unique: true }]
})

module.exports = KpiComparisons