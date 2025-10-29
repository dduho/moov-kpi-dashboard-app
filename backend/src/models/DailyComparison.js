module.exports = (sequelize, DataTypes) => {
  const DailyComparison = sequelize.define('DailyComparison', {
    date: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: 'Date du jour (YYYYMMDD)'
    },
    business_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type de business (B2B Cash Out, B2B Transfer, etc.)'
    },
    success_trx_n: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Transactions réussies jour N'
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
    commission_n: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Commission jour N'
    },
    tax_n: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Taxe jour N'
    },
    success_trx_o: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Transactions réussies jour O (veille)'
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
    commission_o: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Commission jour O (veille)'
    },
    tax_o: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Taxe jour O (veille)'
    },
    success_rate_n: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Taux de succès jour N'
    },
    success_rate_o: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Taux de succès jour O'
    },
    revenue_rate_n: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Taux de revenu jour N'
    },
    revenue_rate_o: {
      type: DataTypes.DECIMAL(6,2),
      defaultValue: 0,
      comment: 'Taux de revenu jour O'
    },
    trx_gap: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Écart de transactions N vs O'
    },
    amount_gap: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Écart de montant N vs O'
    },
    revenue_gap: {
      type: DataTypes.DECIMAL(18,2),
      defaultValue: 0,
      comment: 'Écart de revenu N vs O'
    }
  }, {
    tableName: 'daily_comparisons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return DailyComparison
}
