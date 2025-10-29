#!/usr/bin/env node

/**
 * Migration script to add missing columns to imt_transactions table
 * for Phase 3 IMT restructuring
 */

const { sequelize } = require('../src/models')

async function migrateImtTransactions() {
  try {
    console.log('🔄 Starting IMT transactions migration...')

    // Add channel column
    await sequelize.getQueryInterface().addColumn('imt_transactions', 'channel', {
      type: sequelize.Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null
    })
    console.log('  ✅ Added channel column')

    // Add hour column
    await sequelize.getQueryInterface().addColumn('imt_transactions', 'hour', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    })
    console.log('  ✅ Added hour column')

    // Drop old unique index if it exists
    try {
      await sequelize.getQueryInterface().removeIndex('imt_transactions', 'imt_transactions_date_country_imt_business')
      console.log('  ✅ Dropped old unique index')
    } catch (error) {
      console.log('  ℹ️  Old index may not exist, continuing...')
    }

    // Create new unique index with channel and hour
    await sequelize.getQueryInterface().addIndex('imt_transactions', ['date', 'country', 'imt_business', 'channel', 'hour'], {
      unique: true,
      name: 'imt_transactions_date_country_imt_business_channel_hour'
    })
    console.log('  ✅ Created new unique index')

    console.log('✅ IMT transactions migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateImtTransactions()