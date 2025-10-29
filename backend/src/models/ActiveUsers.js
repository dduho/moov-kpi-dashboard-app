module.exports = (sequelize, DataTypes) => {
  const ActiveUsers = sequelize.define('ActiveUsers', {
    date: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      comment: 'Date in YYYYMMDD format'
    },
    clients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of active clients (Clients row from Active sheet)'
    },
    agents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of active agents (Agents row from Active sheet)'
    },
    merchants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of active merchants (Marchands row from Active sheet)'
    },
    new_registrations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of new registrations (Nouveaux inscrits row from Active sheet)'
    },
    app_users: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of app users (Users App row from Active sheet)'
    },
    total_active: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total active users (sum of all categories)'
    },
    month_avg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monthly average (from AVG column in Active sheet)'
    },
    mom_evolution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Month-over-month evolution percentage (from M column in Active sheet)'
    }
  }, {
    tableName: 'active_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
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

  ActiveUsers.getLatest = async function() {
    return await this.findOne({
      order: [['date', 'DESC']]
    })
  }

  ActiveUsers.getTotals = async function(startDate, endDate) {
    const { Op } = require('sequelize')
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('clients')), 'total_clients'],
        [sequelize.fn('SUM', sequelize.col('agents')), 'total_agents'],
        [sequelize.fn('SUM', sequelize.col('merchants')), 'total_merchants'],
        [sequelize.fn('SUM', sequelize.col('new_registrations')), 'total_new_registrations'],
        [sequelize.fn('SUM', sequelize.col('app_users')), 'total_app_users'],
        [sequelize.fn('AVG', sequelize.col('total_active')), 'avg_total_active']
      ],
      raw: true
    })
  }

  return ActiveUsers
}