const DailyKpi = require('../models/DailyKpi')
const cacheService = require('../services/cacheService')

class AgentController {
  async getAgentData(req, res, next) {
    try {
      const { date, start_date, end_date } = req.query
      const cacheKey = `agents:${date || start_date + '-' + end_date}`

      const cachedData = await cacheService.get(cacheKey)
      if (cachedData) {
        return res.json(cachedData)
      }

      // In production, this would query agent-specific tables
      // For now, we'll derive from DailyKpi for CASHIN/CASHOUT business types
      const kpiData = await DailyKpi.findAll({
        where: date ? { date } : {
          date: {
            [require('sequelize').Op.between]: [start_date, end_date]
          }
        },
        order: [['date', 'ASC']]
      })

      const agentData = this.calculateAgentMetrics(kpiData)

      await cacheService.set(cacheKey, agentData, 300)
      res.json(agentData)
    } catch (error) {
      next(error)
    }
  }

  calculateAgentMetrics(kpiData) {
    // Extract cash-in/cash-out data
    const cashInKpis = kpiData.filter(k =>
      k.business_type && k.business_type.toUpperCase().includes('CASHIN')
    )
    const cashOutKpis = kpiData.filter(k =>
      k.business_type && k.business_type.toUpperCase().includes('CASHOUT')
    )

    const totalCashIn = cashInKpis.reduce((sum, k) => sum + parseFloat(k.amount || 0), 0)
    const totalCashOut = cashOutKpis.reduce((sum, k) => sum + parseFloat(k.amount || 0), 0)
    const cashInOutRatio = totalCashOut > 0 ? (totalCashIn / totalCashOut).toFixed(2) : '0.00'

    // Mock agent data (would come from agent database)
    const activeAgents = 4580
    const avgFloat = 2850000 // XOF
    const reloadTime = 18 // hours

    const byZone = [
      { zone: 'Dakar', cashIn: 2200000000, cashOut: 1550000000, agents: 1850, avgFloat: 3200000 },
      { zone: 'Thiès', cashIn: 1500000000, cashOut: 1050000000, agents: 890, avgFloat: 2850000 },
      { zone: 'Saint-Louis', cashIn: 980000000, cashOut: 690000000, agents: 650, avgFloat: 2400000 },
      { zone: 'Kaolack', cashIn: 850000000, cashOut: 600000000, agents: 580, avgFloat: 2200000 },
      { zone: 'Autres', cashIn: 1200000000, cashOut: 850000000, agents: 610, avgFloat: 2600000 }
    ]

    const liquidityTensions = [
      { day: 'Lun', level: 15 },
      { day: 'Mar', level: 18 },
      { day: 'Mer', level: 22 },
      { day: 'Jeu', level: 28 },
      { day: 'Ven', level: 35 },
      { day: 'Sam', level: 42 },
      { day: 'Dim', level: 25 }
    ]

    const topAgents = [
      { id: 'AG-1234', zone: 'Dakar Centre', volume: 45000000, revenue: 850000, growth: 22.5, reliability: 98.5 },
      { id: 'AG-1189', zone: 'Plateau', volume: 42000000, revenue: 820000, growth: 18.3, reliability: 97.2 },
      { id: 'AG-1445', zone: 'Medina', volume: 38500000, revenue: 750000, growth: 25.1, reliability: 96.8 },
      { id: 'AG-1678', zone: 'Parcelles', volume: 35000000, revenue: 680000, growth: 15.7, reliability: 98.1 },
      { id: 'AG-1892', zone: 'Grand Yoff', volume: 32000000, revenue: 620000, growth: 28.4, reliability: 95.3 },
      { id: 'AG-2045', zone: 'Thiès', volume: 28500000, revenue: 550000, growth: 12.9, reliability: 97.5 },
      { id: 'AG-2234', zone: 'Rufisque', volume: 25000000, revenue: 485000, growth: 19.2, reliability: 96.1 },
      { id: 'AG-2456', zone: 'Guédiawaye', volume: 22000000, revenue: 425000, growth: 31.5, reliability: 94.8 },
      { id: 'AG-2678', zone: 'Pikine', volume: 20000000, revenue: 390000, growth: 16.3, reliability: 97.8 },
      { id: 'AG-2891', zone: 'Saint-Louis', volume: 18500000, revenue: 365000, growth: 22.1, reliability: 95.9 }
    ]

    return {
      overview: {
        activeAgents,
        cashInOutRatio,
        avgFloat,
        reloadTime,
        totalCashIn,
        totalCashOut
      },
      byZone,
      liquidityTensions,
      topAgents,
      performance: {
        agentGrowth: 12.1,
        transactionVolumeGrowth: 15.8,
        avgReliability: 96.7
      },
      alerts: {
        lowFloat: byZone.filter(z => z.avgFloat < 2500000).length,
        highTension: liquidityTensions.filter(t => t.level > 30).length
      }
    }
  }
}

module.exports = new AgentController()
