const DailyKpi = require('../models/DailyKpi')
const cacheService = require('../services/cacheService')

class MerchantController {
  async getMerchantData(req, res, next) {
    try {
      const { date, start_date, end_date } = req.query
      const cacheKey = `merchants:${date || start_date + '-' + end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // In production, this would query merchant-specific tables
      // For now, we'll derive from DailyKpi data
      const kpiData = await DailyKpi.findAll({
        where: date ? { date } : {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const merchantData = this.calculateMerchantMetrics(kpiData)

      await cacheService.set(cacheKey, merchantData, 300)
      res.json(merchantData)
    } catch (error) {
      next(error)
    }
  }

  calculateMerchantMetrics(kpiData) {
    // Extract merchant/QR related data
    // In production, filter by business_type === 'MERCHANT' or 'QR'
    const merchantKpis = kpiData.filter(k =>
      k.business_type && (k.business_type.includes('MERCHANT') || k.business_type.includes('QR'))
    )

    const totalQrTransactions = merchantKpis.reduce((sum, k) => sum + k.success_trx, 0)
    const totalQrAmount = merchantKpis.reduce((sum, k) => sum + parseFloat(k.amount || 0), 0)

    // Mock data for merchants (would come from merchant database)
    const activeMerchants = 8540
    const avgTicket = totalQrTransactions > 0 ? totalQrAmount / totalQrTransactions : 0

    const topMerchants = [
      { id: 'M-001', name: 'Shop A', volume: 450000000, transactions: 12500, growth: 22.5 },
      { id: 'M-002', name: 'Shop B', volume: 380000000, transactions: 10800, growth: 18.3 },
      { id: 'M-003', name: 'Shop C', volume: 320000000, transactions: 9200, growth: 25.1 },
      { id: 'M-004', name: 'Shop D', volume: 285000000, transactions: 8100, growth: 15.7 },
      { id: 'M-005', name: 'Shop E', volume: 245000000, transactions: 7300, growth: 28.4 }
    ]

    const acceptanceRateTrend = [
      { week: 'Sem 1', rate: 78 },
      { week: 'Sem 2', rate: 82 },
      { week: 'Sem 3', rate: 85 },
      { week: 'Sem 4', rate: 88 }
    ]

    const densityByRegion = [
      { region: 'Dakar', merchants: 3580, density: 85, transactions: 156000 },
      { region: 'Thiès', merchants: 1240, density: 45, transactions: 48000 },
      { region: 'Saint-Louis', merchants: 890, density: 32, transactions: 32000 },
      { region: 'Kaolack', merchants: 745, density: 28, transactions: 25000 },
      { region: 'Ziguinchor', merchants: 520, density: 18, transactions: 18000 },
      { region: 'Autres', merchants: 1565, density: 25, transactions: 45000 }
    ]

    return {
      overview: {
        activeMerchants,
        qrTransactions: totalQrTransactions,
        qrAmount: totalQrAmount,
        avgTicket: Math.round(avgTicket)
      },
      topMerchants,
      acceptanceRate: {
        current: 88,
        trend: acceptanceRateTrend
      },
      geographic: {
        byRegion: densityByRegion,
        totalCoverage: densityByRegion.reduce((sum, r) => sum + r.merchants, 0)
      },
      performance: {
        transactionGrowth: 22.3,
        amountGrowth: 25.7,
        newMerchantsThisMonth: Math.floor(activeMerchants * 0.08) // 8% new
      }
    }
  }
}

module.exports = new MerchantController()
