// Redis diagnostic script
const net = require('net')
const redis = require('redis')

async function diagnoseRedis() {
  console.log('🔍 Diagnosing Redis connection issues...')

  const redisHost = process.env.REDIS_HOST || '10.80.3.159'
  const redisPort = parseInt(process.env.REDIS_PORT) || 6379
  const redisPassword = process.env.REDIS_PASSWORD || ''

  console.log(`📍 Target Redis: ${redisHost}:${redisPort}`)

  // Test 1: Basic network connectivity
  console.log('\n1️⃣ Testing basic network connectivity...')
  try {
    await testTcpConnection(redisHost, redisPort)
    console.log('✅ TCP connection successful')
  } catch (error) {
    console.log('❌ TCP connection failed:', error.message)
    console.log('   Possible causes:')
    console.log('   - Redis server not running')
    console.log('   - Firewall blocking port 6379')
    console.log('   - Redis only listening on localhost')
    return
  }

  // Test 2: Redis protocol connection
  console.log('\n2️⃣ Testing Redis protocol connection...')
  try {
    const client = redis.createClient({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      connect_timeout: 5000,
      retry_delay_on_failover: 100,
      max_attempts: 1
    })

    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('✅ Redis client connected')
        resolve()
      })

      client.on('error', (err) => {
        console.log('❌ Redis client error:', err.message)
        reject(err)
      })

      client.on('ready', () => {
        console.log('✅ Redis client ready')
      })

      // Set timeout
      setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 5000)
    })

    // Test basic Redis commands
    console.log('\n3️⃣ Testing Redis commands...')
    const pingResult = await client.ping()
    console.log('✅ PING result:', pingResult)

    const infoResult = await client.info('server')
    console.log('✅ INFO result:', infoResult.split('\n')[0])

    client.quit()
    console.log('✅ Redis connection test completed successfully!')

  } catch (error) {
    console.log('❌ Redis protocol test failed:', error.message)

    // Test with different configurations
    console.log('\n4️⃣ Testing alternative configurations...')

    // Try without password
    if (redisPassword) {
      console.log('🔄 Trying without password...')
      try {
        const clientNoPass = redis.createClient({
          host: redisHost,
          port: redisPort,
          connect_timeout: 3000
        })

        await new Promise((resolve, reject) => {
          clientNoPass.on('connect', () => {
            console.log('✅ Connection successful without password')
            resolve()
          })
          clientNoPass.on('error', reject)
          setTimeout(() => reject(new Error('Timeout')), 3000)
        })

        clientNoPass.quit()
      } catch (err) {
        console.log('❌ Still fails without password')
      }
    }

    // Try localhost if we're on the same network
    console.log('🔄 Trying localhost (127.0.0.1)...')
    try {
      const clientLocal = redis.createClient({
        host: '127.0.0.1',
        port: redisPort,
        connect_timeout: 3000
      })

      await new Promise((resolve, reject) => {
        clientLocal.on('connect', () => {
          console.log('✅ Localhost connection successful - Redis might be running locally')
          console.log('💡 Suggestion: Update REDIS_HOST to 127.0.0.1 if Redis is local')
          resolve()
        })
        clientLocal.on('error', reject)
        setTimeout(() => reject(new Error('Timeout')), 3000)
      })

      clientLocal.quit()
    } catch (err) {
      console.log('❌ Localhost connection also fails')
    }

    console.log('\n🔧 Troubleshooting suggestions:')
    console.log('1. Check if Redis is running on the server:')
    console.log('   - SSH to 10.80.3.159 and run: sudo systemctl status redis')
    console.log('   - Or run: redis-cli ping')
    console.log('2. Check Redis configuration:')
    console.log('   - Look at /etc/redis/redis.conf')
    console.log('   - Check "bind" directive (should be 0.0.0.0 or your IP)')
    console.log('   - Check if password is required')
    console.log('3. Check firewall:')
    console.log('   - Run: sudo ufw status or sudo iptables -L')
    console.log('4. Start Redis if not running:')
    console.log('   - sudo systemctl start redis')
    console.log('   - Or: redis-server')
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

// Run diagnosis
require('dotenv').config()
diagnoseRedis().catch(console.error)