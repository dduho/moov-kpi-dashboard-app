require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const { errorHandler } = require('./middleware/errorHandler')
const dailyDataIngestionJob = require('./jobs/dailyDataIngestion')

const app = express()

// Middlewares
app.use(express.json())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/kpis', require('./routes/kpis'))
app.use('/api/imt', require('./routes/imt'))
app.use('/api/revenue', require('./routes/revenue'))
app.use('/api/users', require('./routes/users'))
app.use('/api/comparisons', require('./routes/comparisons'))
app.use('/api/export', require('./routes/export'))
app.use('/api/acquisition', require('./routes/acquisition'))
app.use('/api/merchants', require('./routes/merchants'))
app.use('/api/agents', require('./routes/agents'))
app.use('/api/channels', require('./routes/channels'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    redis: process.env.REDIS_AVAILABLE === 'true' ? 'connected' : 'disabled'
  })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.API_PORT || 3000
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
  console.log(`Redis status: ${process.env.REDIS_AVAILABLE === 'true' ? 'enabled' : 'disabled'}`)

  // Start the daily data ingestion job
  try {
    dailyDataIngestionJob.start()
    console.log('Daily data ingestion job started (runs daily at 9:00 AM)')
  } catch (error) {
    console.error('Failed to start daily data ingestion job:', error.message)
  }
})
