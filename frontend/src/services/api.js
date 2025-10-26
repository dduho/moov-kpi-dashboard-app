import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Dashboard
  getDashboardData(params = {}) {
    const queryParams = {}

    if (params.date) {
      queryParams.date = params.date
    }
    if (params.startDate && params.endDate) {
      queryParams.startDate = params.startDate
      queryParams.endDate = params.endDate
    }

    return apiClient.get('/dashboard', { params: queryParams })
  },

  // Daily KPIs
  getDailyKpis(date) {
    return apiClient.get('/kpis/daily', {
      params: { date: formatDate(date) }
    })
  },

  getDailyKpisByDateRange(startDate, endDate) {
    return apiClient.get('/kpis/daily/range', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Hourly KPIs
  getHourlyKpis(date) {
    return apiClient.get('/kpis/hourly', {
      params: { date: formatDate(date) }
    })
  },

  // IMT Data
  getImtData(date) {
    return apiClient.get('/imt', {
      params: { date: formatDate(date) }
    })
  },

  getImtByCountry(country, startDate, endDate) {
    return apiClient.get(`/imt/country/${country}`, {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Revenue
  getRevenueByChannel(startDate, endDate) {
    return apiClient.get('/revenue/by-channel', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Active Users
  getActiveUsers(startDate, endDate) {
    return apiClient.get('/users/active', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Weekly KPIs
  getWeeklyKpis(date) {
    return apiClient.get('/kpis/weekly', {
      params: date ? { date: formatDate(date) } : {}
    })
  },

  // Hourly Performance
  getHourlyPerformance(date, businessType) {
    return apiClient.get('/kpis/hourly-performance', {
      params: {
        date: formatDate(date),
        ...(businessType && { business_type: businessType })
      }
    })
  },

  // Comparative Analytics
  getComparativeAnalytics(date, businessType) {
    return apiClient.get('/kpis/comparative-analytics', {
      params: {
        date: formatDate(date),
        ...(businessType && { business_type: businessType })
      }
    })
  },

  // Export
  exportToExcel(params) {
    return apiClient.get('/export/excel', {
      params,
      responseType: 'blob'
    })
  },

  exportToPdf(params) {
    return apiClient.get('/export/pdf', {
      params,
      responseType: 'blob'
    })
  },

  // Acquisition & KYC
  getAcquisitionData(date) {
    return apiClient.get('/acquisition', {
      params: { date: formatDate(date) }
    })
  },

  getAcquisitionByDateRange(startDate, endDate) {
    return apiClient.get('/acquisition', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Merchants
  getMerchantData(date) {
    return apiClient.get('/merchants', {
      params: { date: formatDate(date) }
    })
  },

  getMerchantsByDateRange(startDate, endDate) {
    return apiClient.get('/merchants', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Agents
  getAgentData(date) {
    return apiClient.get('/agents', {
      params: { date: formatDate(date) }
    })
  },

  getAgentsByDateRange(startDate, endDate) {
    return apiClient.get('/agents', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  },

  // Channels
  getChannelMetrics(date) {
    return apiClient.get('/channels/metrics', {
      params: { date: formatDate(date) }
    })
  },

  getChannelMetricsByDateRange(startDate, endDate) {
    return apiClient.get('/channels/metrics', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      }
    })
  }
}

function formatDate(date) {
  if (typeof date === 'string') return date
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}