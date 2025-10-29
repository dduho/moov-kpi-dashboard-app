module.exports = (sequelize, DataTypes) => {
  const ImtCountryStats = sequelize.define('ImtCountryStats', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    country: { type: DataTypes.STRING(50), allowNull: false },
    direction: { type: DataTypes.ENUM('RECEIVE', 'SEND'), allowNull: false },
    hub_type: { type: DataTypes.ENUM('ETHUB', 'MFS'), allowNull: false },
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    amount: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In millions XOF
    revenue: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In thousands XOF
    commission: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }, // In thousands XOF
    tax: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 } // In thousands XOF
  }, {
    tableName: 'imt_country_stats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['date', 'country', 'direction', 'hub_type'], unique: true }]
  })

  // Static methods for data retrieval
  ImtCountryStats.findByDateRange = async function(startDate, endDate, country = null) {
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
      order: [['date', 'ASC'], ['country', 'ASC'], ['direction', 'ASC'], ['hub_type', 'ASC']]
    })
  }

  return ImtCountryStats
}