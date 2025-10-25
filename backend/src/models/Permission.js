module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Resource name (e.g., users, kpis, reports)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Action name (e.g., create, read, update, delete)'
    }
  }, {
    tableName: 'permissions',
    timestamps: true
  })

  return Permission
}