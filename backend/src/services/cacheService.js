const redis = require('redis')

class CacheService {
  constructor() {
    this.redisAvailable = process.env.REDIS_AVAILABLE === 'true'
    this.memoryCache = new Map() // Cache en mémoire comme fallback
    this.client = null // Initialize later
    this.initialized = false
  }

  async initializeRedis() {
    if (this.initialized) return

    this.initialized = true

    if (this.redisAvailable) {
      try {
        this.client = redis.createClient({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          family: 4  // Force IPv4
        })

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err)
          this.redisAvailable = false
          console.log('Switching to in-memory cache')
        })

        await this.client.connect()
        console.log('Redis client connected successfully')
      } catch (err) {
        console.warn('Failed to connect to Redis:', err.message)
        this.redisAvailable = false
        console.log('Using in-memory cache instead')
      }
    } else {
      console.log('Cache service initialized with in-memory cache (no Redis)')
    }
  }

  async get(key) {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        const value = await this.client.get(key)
        return value ? JSON.parse(value) : null
      } catch (error) {
        console.error('Redis get error:', error)
        // Fallback to memory cache
        return this.memoryCache.get(key) || null
      }
    } else {
      // Use memory cache
      const item = this.memoryCache.get(key)
      if (item && item.expiry > Date.now()) {
        return item.value
      } else if (item) {
        this.memoryCache.delete(key) // Remove expired item
      }
      return null
    }
  }

  async set(key, value, ttl = 300) {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        await this.client.setEx(key, ttl, JSON.stringify(value))
      } catch (error) {
        console.error('Redis set error:', error)
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value: value,
          expiry: Date.now() + (ttl * 1000)
        })
      }
    } else {
      // Use memory cache
      this.memoryCache.set(key, {
        value: value,
        expiry: Date.now() + (ttl * 1000)
      })
    }
  }

  async del(key) {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        await this.client.del(key)
      } catch (error) {
        console.error('Redis del error:', error)
      }
    }
    // Always clean memory cache
    this.memoryCache.delete(key)
  }

  async clearAll() {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        await this.client.flushAll()
      } catch (error) {
        console.error('Redis clear error:', error)
      }
    }
    // Always clean memory cache
    this.memoryCache.clear()
  }

  async getKeys(pattern = '*') {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        return await this.client.keys(pattern)
      } catch (error) {
        console.error('Redis keys error:', error)
      }
    }
    // Return memory cache keys (simple implementation)
    return Array.from(this.memoryCache.keys()).filter(key =>
      pattern === '*' || key.includes(pattern.replace('*', ''))
    )
  }

  async getStats() {
    await this.initializeRedis()

    if (this.redisAvailable && this.client) {
      try {
        const info = await this.client.info()
        const lines = info.split('\n')
        const stats = {}

        lines.forEach(line => {
          if (line.includes(':')) {
            const [key, value] = line.split(':')
            stats[key] = value
          }
        })

        return {
          connected_clients: stats.connected_clients,
          used_memory: stats.used_memory_human,
          total_connections_received: stats.total_connections_received,
          keyspace_hits: stats.keyspace_hits,
          keyspace_misses: stats.keyspace_misses,
          hit_rate: stats.keyspace_hits && stats.keyspace_misses ?
            (parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses)) * 100).toFixed(2) : 0
        }
      } catch (error) {
        console.error('Redis stats error:', error)
      }
    }

    // Return memory cache stats
    return {
      cache_type: 'in-memory',
      items_count: this.memoryCache.size,
      used_memory: 'N/A (in-memory)',
      hit_rate: 'N/A'
    }
  }
}

module.exports = new CacheService()