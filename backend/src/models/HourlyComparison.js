module.exports = (sequelize, DataTypes) => {
  const HourlyComparison = sequelize.define('HourlyComparison', {
    date: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: 'Date du jour (YYYYMMDD)'
    },
    hour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Heure (0-23)'
    },
    count_n: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Volume de transactions jour N'
    },
    amount_n: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Montant jour N'
    },
    revenue_n: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Revenu jour N'
    },
    count_o: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Volume de transactions jour O (veille)'
    },
    amount_o: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Montant jour O (veille)'
    },
    revenue_o: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Revenu jour O (veille)'
    },
    count_gap_percent: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Écart volume (%)'
    },
    amount_gap_percent: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Écart montant (%)'
    },
    revenue_gap_percent: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Écart revenu (%)'
    }
  }, {
    tableName: 'hourly_comparisons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return HourlyComparison
}
