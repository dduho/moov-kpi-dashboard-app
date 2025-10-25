const DailyKpi = require('../models/DailyKpi')
const HourlyKpi = require('../models/HourlyKpi')
const RevenueByChannel = require('../models/RevenueByChannel')
const cacheService = require('../services/cacheService')

class ChannelController {
  async getChannelMetrics(req, res, next) {
    try {
      const { date, start_date, end_date } = req.query
      const cacheKey = `channels:${date || start_date + '-' + end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      const [revenueData, dailyKpis] = await Promise.all([
        RevenueByChannel.findAll({
          where: date ? { date } : {
            date: {
              [require('sequelize').Op.between]: [start_date, end_date]
            }
          },
          order: [['date', 'ASC'], ['channel', 'ASC']]
        }),
        DailyKpi.findAll({
          where: date ? { date } : {
            date: {
              [require('sequelize').Op.between]: [start_date, end_date]
            }
          }
        })
      ])

      const channelMetrics = this.calculateChannelMetrics(revenueData, dailyKpis)

      await cacheService.set(cacheKey, channelMetrics, 300)
      res.json(channelMetrics)
    } catch (error) {
      next(error)
    }
  }

  calculateChannelMetrics(revenueData, dailyKpis) {
    // Aggregate by channel
    const channelMap = {}

    revenueData.forEach(item => {
      const channel = item.channel || 'UNKNOWN'
      if (!channelMap[channel]) {
        channelMap[channel] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          failedTransactions: 0 // Mock for now
        }
      }

      channelMap[channel].transactions += item.transaction_count || 0
      channelMap[channel].amount += parseFloat(item.amount || 0)
      channelMap[channel].revenue += parseFloat(item.revenue || 0)
    })

    // Calculate total for percentages
    const totalTransactions = Object.values(channelMap).reduce((sum, c) => sum + c.transactions, 0)

    // Map to common channel names and add success rates + latency (mock data for latency)
    const channelLatency = {
      'USSD': 1850,
      'APP': 450,
      'App': 450,
      'Mobile': 450,
      'API': 280,
      'STK': 2100,
      'STK_PUSH': 2100,
      'Web': 650
    }

    const channels = {}
    Object.keys(channelMap).forEach(channel => {
      const data = channelMap[channel]
      const normalizedChannel = this.normalizeChannelName(channel)

      if (!channels[normalizedChannel]) {
        channels[normalizedChannel] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          share: 0,
          successRate: 0,
          latency: channelLatency[channel] || 1000
        }
      }

      channels[normalizedChannel].transactions += data.transactions
      channels[normalizedChannel].amount += data.amount
      channels[normalizedChannel].revenue += data.revenue

      // Mock success rate (would come from actual success/failure data)
      const totalAttempts = data.transactions + data.failedTransactions
      channels[normalizedChannel].successRate = totalAttempts > 0
        ? ((data.transactions / totalAttempts) * 100).toFixed(2)
        : 95.0 // Default mock
    })

    // Calculate shares
    Object.keys(channels).forEach(channel => {
      channels[channel].share = totalTransactions > 0
        ? ((channels[channel].transactions / totalTransactions) * 100).toFixed(2)
        : 0
    })

    // Ensure we have the main 4 channels
    const mainChannels = ['USSD', 'App', 'API', 'STK']
    mainChannels.forEach(ch => {
      if (!channels[ch]) {
        channels[ch] = {
          transactions: 0,
          amount: 0,
          revenue: 0,
          share: 0,
          successRate: 0,
          latency: channelLatency[ch] || 1000
        }
      }
    })

    // Mock detailed metrics with status
    const detailedMetrics = [
      {
        name: 'USSD',
        successRate: channels['USSD']?.successRate || 95.2,
        latency: channels['USSD']?.latency || 1850,
        volume: channels['USSD']?.transactions || 0,
        status: 'success'
      },
      {
        name: 'App Mobile',
        successRate: channels['App']?.successRate || 97.8,
        latency: channels['App']?.latency || 450,
        volume: channels['App']?.transactions || 0,
        status: 'success'
      },
      {
        name: 'API',
        successRate: channels['API']?.successRate || 98.5,
        latency: channels['API']?.latency || 280,
        volume: channels['API']?.transactions || 0,
        status: 'success'
      },
      {
        name: 'STK Push',
        successRate: channels['STK']?.successRate || 94.1,
        latency: channels['STK']?.latency || 2100,
        volume: channels['STK']?.transactions || 0,
        status: channels['STK']?.successRate < 95 ? 'warning' : 'success'
      }
    ]

    return {
      overview: {
        totalTransactions,
        totalRevenue: Object.values(channels).reduce((sum, c) => sum + c.revenue, 0)
      },
      byChannel: channels,
      distribution: {
        USSD: parseFloat(channels['USSD']?.share || 0),
        App: parseFloat(channels['App']?.share || 0),
        API: parseFloat(channels['API']?.share || 0),
        STK: parseFloat(channels['STK']?.share || 0)
      },
      successRates: {
        USSD: parseFloat(channels['USSD']?.successRate || 95.2),
        App: parseFloat(channels['App']?.successRate || 97.8),
        API: parseFloat(channels['API']?.successRate || 98.5),
        STK: parseFloat(channels['STK']?.successRate || 94.1)
      },
      latency: {
        USSD: channels['USSD']?.latency || 1850,
        App: channels['App']?.latency || 450,
        API: channels['API']?.latency || 280,
        STK: channels['STK']?.latency || 2100
      },
      detailedMetrics
    }
  }

  normalizeChannelName(channel) {
    const normalized = channel.toUpperCase()
    if (normalized.includes('APP') || normalized.includes('MOBILE')) return 'App'
    if (normalized.includes('USSD')) return 'USSD'
    if (normalized.includes('API')) return 'API'
    if (normalized.includes('STK') || normalized.includes('PUSH')) return 'STK'
    return channel
  }
}

module.exports = new ChannelController()
