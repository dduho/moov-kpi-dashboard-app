import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import { formatDateForAPI } from '@/utils/formatters'

export const useKpiStore = defineStore('kpi', {
  state: () => ({
    dashboardData: null,
    loading: false,
    error: null,
    selectedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // Default to yesterday since today's data is not yet available
      return date
    })(),
    dateRange: {
      start: null,
      end: null
    }
  }),

  getters: {
    // Computed properties for backward compatibility and easy access
    totalTransactions: (state) => {
      return state.dashboardData?.globalKpis?.overview?.totalTransactions?.current || 0
    },

    totalRevenue: (state) => {
      return state.dashboardData?.globalKpis?.overview?.totalRevenue?.current || 0
    },

    averageSuccessRate: (state) => {
      return state.dashboardData?.globalKpis?.overview?.successRate?.rate || 0
    },

    hourlyTrends: (state) => {
      return state.dashboardData?.charts?.hourlyTrends || []
    },

    businessBreakdown: (state) => {
      if (!state.dashboardData?.businessTypeKpis) return {}

      const breakdown = {}
      Object.entries(state.dashboardData.businessTypeKpis).forEach(([type, data]) => {
        breakdown[type] = {
          businessType: type,
          transactions: data.totalTrans,
          amount: data.totalAmount,
          revenue: data.totalRevenue,
          successRate: data.successRate
        }
      })
      return breakdown
    },

    // New getters for comprehensive KPIs
    globalKpis: (state) => state.dashboardData?.globalKpis || {},
    businessTypeKpis: (state) => state.dashboardData?.businessTypeKpis || {},
    hourlyKpis: (state) => state.dashboardData?.hourlyKpis || {},
    imtKpis: (state) => state.dashboardData?.imtKpis || {},
    userKpis: (state) => state.dashboardData?.userKpis || {},
    financialKpis: (state) => state.dashboardData?.financialKpis || {},
    trendKpis: (state) => state.dashboardData?.trendKpis || {},
    qualityKpis: (state) => state.dashboardData?.qualityKpis || {},
    charts: (state) => state.dashboardData?.charts || {}
  },

  actions: {
    setSelectedDate(date) {
      this.selectedDate = date
    },

    async fetchDashboardData(date = this.selectedDate, startDate = null, endDate = null) {
      this.loading = true
      this.error = null
      try {
        const params = {}
        if (startDate && endDate) {
          params.startDate = formatDateForAPI(startDate)
          params.endDate = formatDateForAPI(endDate)
        } else if (date) {
          params.date = formatDateForAPI(date)
        }

        const response = await apiService.getDashboardData(params)
        this.dashboardData = response.data
      } catch (error) {
        this.error = error.message || 'Failed to fetch dashboard data'
        console.error('Error fetching dashboard data:', error)
      } finally {
        this.loading = false
      }
    },

    // Backward compatibility methods
    async fetchDailyKpis(date = this.selectedDate) {
      // Data is now included in dashboard data
      await this.fetchDashboardData(date)
    },

    async fetchHourlyKpis(date = this.selectedDate) {
      // Data is now included in dashboard data
      await this.fetchDashboardData(date)
    },

    async fetchImtData(date = this.selectedDate) {
      // Data is now included in dashboard data
      await this.fetchDashboardData(date)
    },

    async fetchRevenueByChannel(startDate, endDate) {
      // Data is now included in dashboard data
      await this.fetchDashboardData(null, startDate, endDate)
    },

    async fetchActiveUsers(startDate, endDate) {
      // Data is now included in dashboard data
      await this.fetchDashboardData(null, startDate, endDate)
    },

    async refreshAllData() {
      await this.fetchDashboardData()
    },

    setDateRange(start, end) {
      this.dateRange.start = start
      this.dateRange.end = end
      // Fetch data for the new date range
      this.fetchDashboardData(null, start, end)
    },

    clearData() {
      this.dashboardData = null
      this.error = null
    }
  }
})