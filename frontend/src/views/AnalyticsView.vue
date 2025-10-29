<template>
  <div class="analytics-view">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Analytics Avancés</h2>
        <p class="section-subtitle">Analyses prédictives et insights intelligents</p>
      </div>
      <div class="flex gap-3">
        <DateSelector @dateChange="handleDateChange" />
        <button class="export-btn" @click="exportAnalytics">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Exporter</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <p class="mt-4 text-gray-600">Chargement des analyses avancées...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="text-error-600 mb-4">
        <p class="font-semibold">Erreur lors du chargement des analyses</p>
        <p class="text-sm mt-2">{{ error }}</p>
      </div>
      <button @click="refreshData" class="glass-btn">
        <span class="text-sm font-medium">Réessayer</span>
      </button>
    </div>

    <!-- Analytics Content -->
    <div v-else class="space-y-6">
      <!-- Performance Dashboard -->
      <div class="analytics-section">
        <h3 class="section-title">Tableau de Bord Performance</h3>
        <div v-if="performanceData" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="metric-card">
            <h4 class="metric-title">Revenus Totaux</h4>
            <p class="metric-value">{{ formatCurrency(performanceData.summary?.totalRevenue || 0) }}</p>
            <p class="metric-subtitle">Transactions: {{ formatNumber(performanceData.summary?.totalTransactions || 0) }}</p>
          </div>
          <div class="metric-card">
            <h4 class="metric-title">Canaux Actifs</h4>
            <p class="metric-value">{{ performanceData.summary?.activeChannels || 0 }}</p>
            <p class="metric-subtitle">Revenus par canal: {{ formatCurrency(performanceData.summary?.channelRevenue || 0) }}</p>
          </div>
          <div class="metric-card">
            <h4 class="metric-title">Top Canal</h4>
            <p class="metric-value">{{ performanceData.summary?.topPerformingChannel?.channel || 'N/A' }}</p>
            <p class="metric-subtitle">Revenus: {{ formatCurrency(performanceData.summary?.topPerformingChannel?.revenue || 0) }}</p>
          </div>
        </div>

        <div v-if="performanceData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-card">
            <h4 class="chart-title">Revenus par Business Type</h4>
            <BarChart :data="getBusinessTypeRevenueData()" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Revenus par Canal</h4>
            <BarChart :data="getChannelRevenueData()" :height="300" />
          </div>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div class="analytics-section">
        <h3 class="section-title">Analyse des Tendances</h3>
        <div class="flex gap-4 mb-6">
          <select v-model="selectedMetric" @change="loadTrendAnalysis" class="metric-selector">
            <option value="revenue">Revenus</option>
            <option value="transactions">Transactions</option>
            <option value="amount">Montant</option>
          </select>
          <input
            v-model="startDate"
            type="date"
            @change="loadTrendAnalysis"
            class="date-input"
          />
          <input
            v-model="endDate"
            type="date"
            @change="loadTrendAnalysis"
            class="date-input"
          />
        </div>

        <div v-if="trendData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-card">
            <h4 class="chart-title">Évolution des {{ selectedMetric === 'revenue' ? 'Revenus' : selectedMetric === 'transactions' ? 'Transactions' : 'Montants' }}</h4>
            <LineChart :data="getTrendChartData()" :height="300" />
          </div>
          <div class="insights-card">
            <h4 class="chart-title">Insights Automatiques</h4>
            <div class="insights-list">
              <div v-for="insight in trendData.insights" :key="insight.type" class="insight-item">
                <div class="insight-type">{{ getInsightTypeLabel(insight.type) }}</div>
                <div class="insight-content">
                  <span v-if="insight.type === 'daily_trend'">
                    Tendance {{ insight.direction }} de {{ insight.changePercent }}%
                  </span>
                  <span v-else-if="insight.type === 'channel_performance'">
                    Top canal: {{ insight.topChannel }} ({{ formatCurrency(insight.avgRevenue) }}/jour)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Predictive Insights -->
      <div class="analytics-section">
        <h3 class="section-title">Prédictions & Insights</h3>
        <div class="flex gap-4 mb-6">
          <label class="flex items-center gap-2">
            <span>Jours à prédire:</span>
            <input
              v-model.number="predictionDays"
              type="number"
              min="1"
              max="30"
              @change="loadPredictions"
              class="days-input"
            />
          </label>
        </div>

        <div v-if="predictions" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-card">
            <h4 class="chart-title">Prédictions de Revenus ({{ predictionDays }} jours)</h4>
            <BarChart :data="getPredictionsChartData()" :height="300" />
          </div>
          <div class="predictions-table">
            <h4 class="chart-title">Détail des Prédictions</h4>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Business Type</th>
                    <th>Revenus Prédits</th>
                    <th>Confiance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pred in predictions.predictions" :key="pred.businessType">
                    <td>{{ pred.businessType }}</td>
                    <td>{{ formatCurrency(pred.predictedRevenue) }}</td>
                    <td>
                      <span :class="getConfidenceClass(pred.confidence)">
                        {{ (pred.confidence * 100).toFixed(1) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Channel Performance Analysis -->
      <div class="analytics-section">
        <h3 class="section-title">Analyse Performance Canaux</h3>
        <div class="flex gap-4 mb-6">
          <input
            v-model="channelStartDate"
            type="date"
            @change="loadChannelAnalysis"
            class="date-input"
          />
          <input
            v-model="channelEndDate"
            type="date"
            @change="loadChannelAnalysis"
            class="date-input"
          />
        </div>

        <div v-if="channelAnalysis" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="chart-card">
              <h4 class="chart-title">Top Canaux par Revenus</h4>
              <BarChart :data="getTopChannelsData()" :height="300" />
            </div>
            <div class="chart-card">
              <h4 class="chart-title">Croissance par Canal</h4>
              <BarChart :data="getChannelGrowthData()" :height="300" />
            </div>
          </div>

          <div class="chart-card">
            <h4 class="chart-title">Analyse Détaillée par Canal</h4>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Revenus Totaux</th>
                    <th>Transactions</th>
                    <th>Moyenne/Jour</th>
                    <th>Croissance Mensuelle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="channel in channelAnalysis.channelPerformance" :key="channel.channel">
                    <td class="font-semibold">{{ channel.channel }}</td>
                    <td>{{ formatCurrency(channel.totalRevenue) }}</td>
                    <td>{{ formatNumber(channel.totalTransactions) }}</td>
                    <td>{{ formatCurrency(channel.avgRevenue) }}</td>
                    <td :class="channel.growthPercent >= 0 ? 'text-success-600' : 'text-error-600'">
                      {{ (channel.growthPercent || 0).toFixed(1) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Year-over-Year Comparison -->
      <div class="analytics-section">
        <h3 class="section-title">Comparaison Année sur Année</h3>
        <div class="flex gap-4 mb-6">
          <label class="flex items-center gap-2">
            <span>Année:</span>
            <input
              v-model.number="yoyYear"
              type="number"
              min="2020"
              max="2030"
              @change="loadYearOverYear"
              class="year-input"
            />
          </label>
          <label class="flex items-center gap-2">
            <span>Comparer avec:</span>
            <input
              v-model.number="yoyCompareYear"
              type="number"
              min="2020"
              max="2030"
              @change="loadYearOverYear"
              class="year-input"
            />
          </label>
        </div>

        <div v-if="yoyData" class="chart-card">
          <h4 class="chart-title">Évolution Mensuelle {{ yoyYear }} vs {{ yoyCompareYear || 'Année précédente' }}</h4>
          <LineChart :data="getYOYChartData()" :height="300" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import DateSelector from '@/components/widgets/DateSelector.vue'
import { IconDownload } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

// State
const loading = ref(true)
const error = ref(null)

// Data
const performanceData = ref(null)
const trendData = ref(null)
const predictions = ref(null)
const channelAnalysis = ref(null)
const yoyData = ref(null)

// Form controls
const selectedMetric = ref('revenue')
const startDate = ref('')
const endDate = ref('')
const predictionDays = ref(7)
const channelStartDate = ref('')
const channelEndDate = ref('')
const yoyYear = ref(new Date().getFullYear())
const yoyCompareYear = ref(new Date().getFullYear() - 1)

// Initialize dates
const initDates = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
  channelStartDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  channelEndDate.value = today.toISOString().split('T')[0]
}

// API calls
const loadPerformanceDashboard = async (date) => {
  try {
    const response = await apiService.getPerformanceDashboard(date)
    performanceData.value = response.data
  } catch (err) {
    console.error('Error loading performance dashboard:', err)
  }
}

const loadTrendAnalysis = async () => {
  if (!startDate.value || !endDate.value) return

  try {
    const response = await apiService.getTrendAnalysis(startDate.value, endDate.value, selectedMetric.value)
    trendData.value = response.data
  } catch (err) {
    console.error('Error loading trend analysis:', err)
  }
}

const loadPredictions = async () => {
  try {
    const response = await apiService.getPredictiveInsights(predictionDays.value)
    predictions.value = response.data
  } catch (err) {
    console.error('Error loading predictions:', err)
  }
}

const loadChannelAnalysis = async () => {
  if (!channelStartDate.value || !channelEndDate.value) return

  try {
    const response = await apiService.getChannelPerformanceAnalysis(channelStartDate.value, channelEndDate.value)
    channelAnalysis.value = response.data
  } catch (err) {
    console.error('Error loading channel analysis:', err)
  }
}

const loadYearOverYear = async () => {
  try {
    const response = await apiService.getYearOverYearComparison(yoyYear.value, yoyCompareYear.value)
    yoyData.value = response.data
  } catch (err) {
    console.error('Error loading year-over-year:', err)
  }
}

const loadAllAnalytics = async () => {
  loading.value = true
  error.value = null

  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')

    await Promise.all([
      loadPerformanceDashboard(today),
      loadTrendAnalysis(),
      loadPredictions(),
      loadChannelAnalysis(),
      loadYearOverYear()
    ])

    loading.value = false
  } catch (err) {
    console.error('Error loading analytics:', err)
    error.value = err.message || 'Erreur lors du chargement des analyses'
    loading.value = false
  }
}

const handleDateChange = (dateParams) => {
  // Update form controls based on date selector
  if (dateParams.date) {
    const date = dateParams.date
    startDate.value = date
    endDate.value = date
    channelStartDate.value = date
    channelEndDate.value = date
  } else if (dateParams.startDate && dateParams.endDate) {
    startDate.value = dateParams.startDate
    endDate.value = dateParams.endDate
    channelStartDate.value = dateParams.startDate
    channelEndDate.value = dateParams.endDate
  }

  loadAllAnalytics()
}

const refreshData = () => {
  loadAllAnalytics()
}

const exportAnalytics = () => {
  // TODO: Implement export functionality
  console.log('Export analytics data')
}

// Chart data helpers
const getBusinessTypeRevenueData = () => {
  if (!performanceData.value?.dailyKpis) return { labels: [], datasets: [] }

  const businessTypes = {}
  performanceData.value.dailyKpis.forEach(kpi => {
    if (!businessTypes[kpi.business_type]) {
      businessTypes[kpi.business_type] = 0
    }
    businessTypes[kpi.business_type] += parseFloat(kpi.revenue || 0)
  })

  return {
    labels: Object.keys(businessTypes),
    datasets: [{
      label: 'Revenus (XOF)',
      data: Object.values(businessTypes),
      backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B', '#EC4899']
    }]
  }
}

const getChannelRevenueData = () => {
  if (!performanceData.value?.revenueByChannel) return { labels: [], datasets: [] }

  return {
    labels: performanceData.value.revenueByChannel.map(item => item.channel),
    datasets: [{
      label: 'Revenus (XOF)',
      data: performanceData.value.revenueByChannel.map(item => parseFloat(item.revenue || 0)),
      backgroundColor: '#10B981'
    }]
  }
}

const getTrendChartData = () => {
  if (!trendData.value?.dailyTrends) return { labels: [], datasets: [] }

  const businessTypes = [...new Set(trendData.value.dailyTrends.map(t => t.business_type))]
  const datasets = []

  businessTypes.forEach((type, index) => {
    const typeData = trendData.value.dailyTrends.filter(t => t.business_type === type)
    const colors = ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B', '#EC4899']

    datasets.push({
      label: type,
      data: typeData.map(t => {
        switch (selectedMetric.value) {
          case 'revenue': return parseFloat(t.total_revenue || 0)
          case 'transactions': return parseInt(t.total_transactions || 0)
          case 'amount': return parseFloat(t.total_amount || 0)
          default: return 0
        }
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      tension: 0.4
    })
  })

  return {
    labels: [...new Set(trendData.value.dailyTrends.map(t => t.date))].sort(),
    datasets
  }
}

const getPredictionsChartData = () => {
  if (!predictions.value?.predictions) return { labels: [], datasets: [] }

  return {
    labels: predictions.value.predictions.map(p => p.businessType),
    datasets: [{
      label: 'Revenus Prédits (XOF)',
      data: predictions.value.predictions.map(p => p.predictedRevenue),
      backgroundColor: '#A855F7'
    }]
  }
}

const getTopChannelsData = () => {
  if (!channelAnalysis.value?.topPerformers) return { labels: [], datasets: [] }

  return {
    labels: channelAnalysis.value.topPerformers.map(c => c.channel),
    datasets: [{
      label: 'Revenus (XOF)',
      data: channelAnalysis.value.topPerformers.map(c => c.revenue),
      backgroundColor: '#0EA5E9'
    }]
  }
}

const getChannelGrowthData = () => {
  if (!channelAnalysis.value?.growthAnalysis) return { labels: [], datasets: [] }

  const channels = Object.keys(channelAnalysis.value.growthAnalysis)
  return {
    labels: channels,
    datasets: [{
      label: 'Croissance Mensuelle (%)',
      data: channels.map(c => channelAnalysis.value.growthAnalysis[c].averageMonthlyGrowth),
      backgroundColor: channels.map(c =>
        channelAnalysis.value.growthAnalysis[c].averageMonthlyGrowth >= 0 ? '#10B981' : '#EF4444'
      )
    }]
  }
}

const getYOYChartData = () => {
  if (!yoyData.value?.monthlyComparisons) return { labels: [], datasets: [] }

  return {
    labels: yoyData.value.monthlyComparisons.map(m => `Mois ${m.month}`),
    datasets: [
      {
        label: `${yoyData.value.years?.current || yoyYear.value}`,
        data: yoyData.value.monthlyComparisons.map(m => m.currentTotal),
        borderColor: '#0EA5E9',
        backgroundColor: '#0EA5E920',
        tension: 0.4
      },
      {
        label: `${yoyData.value.years?.previous || yoyCompareYear.value}`,
        data: yoyData.value.monthlyComparisons.map(m => m.previousTotal),
        borderColor: '#94A3B8',
        backgroundColor: '#94A3B820',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  }
}

// Helper functions
const getInsightTypeLabel = (type) => {
  const labels = {
    'daily_trend': 'Tendance Quotidienne',
    'channel_performance': 'Performance Canal'
  }
  return labels[type] || type
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) return 'text-success-600 font-semibold'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-error-600'
}

const formatNumber = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'XOF 0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value)
}

// Initialize
onMounted(() => {
  initDates()
  loadAllAnalytics()
})
</script>

<style scoped>
.analytics-view {
  padding: 1.5rem;
}

.analytics-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
}

.metric-card {
  background: linear-gradient(to bottom right, #EFF6FF, #DBEAFE);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #BFDBFE;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1E40AF;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E3A8A;
  margin-bottom: 0.25rem;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #2563EB;
}

.chart-card {
  background: #F9FAFB;
  border-radius: 0.5rem;
  padding: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1F2937;
}

.insights-card {
  background: #ECFDF5;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #A7F3D0;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #A7F3D0;
}

.insight-type {
  font-weight: 500;
  color: #047857;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.insight-content {
  color: #065F46;
}

.predictions-table {
  background: #FAF5FF;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #C4B5FD;
}

.data-table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.5rem 1rem;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.data-table th {
  background: #F3F4F6;
  font-weight: 600;
  color: #374151;
}

.metric-selector,
.date-input,
.days-input,
.year-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  outline: none;
}

.metric-selector:focus,
.date-input:focus,
.days-input:focus,
.year-input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-color: #3B82F6;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 0.75rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2563EB;
  color: white;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.export-btn:hover {
  background: #1D4ED8;
}

.glass-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  cursor: pointer;
}

.glass-btn:hover {
  background: white;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #F97316, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  color: #6B7280;
}
</style>