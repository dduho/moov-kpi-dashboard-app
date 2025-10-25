module.exports = (sequelize, DataTypes) => {
  const ActiveUsers = sequelize.define('ActiveUsers', {
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    dau: { type: DataTypes.INTEGER, defaultValue: 0 },
    mau: { type: DataTypes.INTEGER, defaultValue: 0 },
    new_users: { type: DataTypes.INTEGER, defaultValue: 0 },
    app_activations: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'active_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })

  // Static methods for data retrieval
  ActiveUsers.findByDateRange = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    })
  }

  return ActiveUsers
}