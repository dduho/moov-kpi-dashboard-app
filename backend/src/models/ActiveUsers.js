const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('.')

class ActiveUsers extends Model {}

ActiveUsers.init({
  date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  dau: { type: DataTypes.INTEGER, defaultValue: 0 },
  mau: { type: DataTypes.INTEGER, defaultValue: 0 },
  new_users: { type: DataTypes.INTEGER, defaultValue: 0 },
  app_activations: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  sequelize,
  modelName: 'ActiveUsers',
  tableName: 'active_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

// Static methods for data retrieval
ActiveUsers.findByDateRange = async function(startDate, endDate) {
  return await this.findAll({
    where: {
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'ASC']]
  })
}

module.exports = ActiveUsers