const { ActiveUsers, sequelize } = require('./src/models')
const { Op } = require('sequelize')

async function testUserQuery() {
  try {
    console.log('Sequelize dialect:', sequelize.getDialect())
    console.log('Database:', sequelize.config.storage)

    console.log('\n1. Testing findAll with date range...')
    const userData = await ActiveUsers.findAll({
      where: {
        date: {
          [Op.between]: ['20250701', '20250710']
        }
      },
      order: [['date', 'ASC']],
      limit: 3
    })

    console.log(`Found ${userData.length} records`)
    if (userData.length > 0) {
      console.log('\nSample record:')
      console.log(JSON.stringify(userData[0].toJSON(), null, 2))
    }

    console.log('\n2. Testing calculateUserSummary logic...')
    let totalClients = 0
    userData.forEach(item => {
      console.log(`Date: ${item.date}, Clients: ${item.clients}`)
      totalClients += item.clients || 0
    })
    console.log(`Total clients: ${totalClients}`)

    await sequelize.close()
    console.log('\n✅ Test completed successfully')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
    await sequelize.close()
    process.exit(1)
  }
}

testUserQuery()
