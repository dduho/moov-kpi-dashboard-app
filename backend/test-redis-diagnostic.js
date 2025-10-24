// Test Redis connectivity and configuration
const net = require('net')
const redis = require('redis')

async function testRedisConnectivity() {
  console.log('🔍 Testing Redis connectivity to 10.80.3.159:6379...')

  const host = '10.80.3.159'
  const port = 6379

  // Test 1: Basic TCP connection
  console.log('🔌 Test 1: Basic TCP connection...')
  try {
    await testTcpConnection(host, port)
    console.log('✅ TCP connection successful')
  } catch (error) {
    console.log('❌ TCP connection failed:', error.message)
    console.log('   This could mean:')
    console.log('   - Redis is not running on this server')
    console.log('   - Firewall is blocking port 6379')
    console.log('   - Redis is configured to only listen on localhost')
    return
  }

  // Test 2: Redis protocol handshake
  console.log('🔄 Test 2: Redis protocol handshake...')
  try {
    const client = redis.createClient({
      host: host,
      port: port,
      connect_timeout: 5000,
      retry_delay_on_failover: 100
    })

    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('✅ Redis client connected successfully')
        resolve()
      })

      client.on('error', (err) => {
        console.log('❌ Redis client connection failed:', err.message)
        reject(err)
      })

      client.connect()
    })

    // Test 3: Basic Redis commands
    console.log('📝 Test 3: Basic Redis commands...')
    const pingResult = await client.ping()
    console.log('✅ PING result:', pingResult)

    const infoResult = await client.info('server')
    console.log('✅ INFO result (first few lines):')
    console.log(infoResult.split('\n').slice(0, 5).join('\n'))

    client.quit()
    console.log('✅ Redis tests completed successfully!')

  } catch (error) {
    console.log('❌ Redis protocol test failed:', error.message)
    console.log('   Possible causes:')
    console.log('   - Redis requires authentication (password)')
    console.log('   - Redis is configured with protected mode')
    console.log('   - Network timeout or connectivity issue')
  }
}

function testTcpConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    const timeout = 5000

    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error('Connection timeout'))
    }, timeout)

    socket.connect(port, host, () => {
      clearTimeout(timer)
      socket.destroy()
      resolve()
    })

    socket.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// Test localhost Redis as well
async function testLocalhostRedis() {
  console.log('\n🏠 Testing localhost Redis (127.0.0.1:6379)...')

  try {
    const client = redis.createClient({
      host: '127.0.0.1',
      port: 6379,
      connect_timeout: 2000
    })

    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('✅ Local Redis is running!')
        resolve()
      })

      client.on('error', () => {
        console.log('❌ Local Redis is not running')
        reject()
      })

      client.connect()
    })

    client.quit()

  } catch (error) {
    console.log('❌ Local Redis test failed')
  }
}

// Run all tests
async function runAllRedisTests() {
  await testRedisConnectivity()
  await testLocalhostRedis()
}

runAllRedisTests()