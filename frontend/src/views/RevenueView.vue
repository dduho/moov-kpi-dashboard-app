<template>
  <div class="revenue">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Analyse des Revenus</h2>
        <p class="section-subtitle">Répartition des revenus par canal et source</p>
      </div>
      <div class="flex gap-3">
        <DateRangeFilter @dateChange="handleDateChange" />
        <button class="export-btn" @click="exportData">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Exporter</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <p class="mt-4 text-gray-600">Chargement des données de revenus...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="text-error-600 mb-4">
        <p class="font-semibold">Erreur lors du chargement des données</p>
        <p class="text-sm mt-2">{{ error }}</p>
      </div>
      <button @click="retry" class="glass-btn">
        <span class="text-sm font-medium">Réessayer</span>
      </button>
    </div>

    <!-- Data display -->
    <template v-else>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Revenus Totaux"
        :value="formatCurrency(revenueKpis.totalRevenue)"
        :trend="revenueKpis.revenueTrend"
        variant="green"
        iconType="sales"
      />
      <KpiCard
        title="Mobile Money"
        :value="formatCurrency(revenueKpis.mobileMoney)"
        :trend="revenueKpis.mobileMoneyTrend"
        variant="blue"
        iconType="orders"
      />
      <KpiCard
        title="Marchand"
        :value="formatCurrency(revenueKpis.merchant)"
        :trend="revenueKpis.merchantTrend"
        variant="purple"
        iconType="products"
      />
      <KpiCard
        title="Autres"
        :value="formatCurrency(revenueKpis.others)"
        :trend="revenueKpis.othersTrend"
        variant="orange"
        iconType="customers"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Revenus par Canal</h3>
        <BarChart :data="revenueByChannelData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Tendance des Revenus Mensuels</h3>
        <LineChart :data="monthlyRevenueData" :height="300" />
      </div>
    </div>

    <div class="chart-card">
      <h3 class="chart-title mb-4">Performance par Canal</h3>
      <div class="space-y-4">
        <div v-for="channel in channelPerformance" :key="channel.name" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: channel.color }"></div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ channel.name }}</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="h-2 rounded-full transition-all" :style="{ width: channel.percentage + '%', backgroundColor: channel.color }"></div>
              </div>
            </div>
          </div>
          <div class="text-right ml-4">
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(channel.revenue) }}</p>
            <p class="text-sm" :class="channel.growth >= 0 ? 'text-success-600' : 'text-error-600'">
              {{ channel.growth >= 0 ? '↗' : '↘' }} {{ Math.abs(channel.growth) }}%
            </p>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { IconDownload } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

const loading = ref(true)
const error = ref(null)
const currentDateParams = ref({})

const revenueKpis = ref({
  totalRevenue: 0,
  revenueTrend: 0,
  mobileMoney: 0,
  mobileMoneyTrend: 0,
  merchant: 0,
  merchantTrend: 0,
  others: 0,
  othersTrend: 0
})

const revenueByChannelData = ref({
  labels: [],
  datasets: [{
    label: 'Revenus (XOF)',
    data: [],
    backgroundColor: ['#10B981', '#A855F7', '#F59E0B', '#0EA5E9', '#EC4899']
  }]
})

const monthlyRevenueData = ref({
  labels: [],
  datasets: [{
    label: 'Revenus (XOF)',
    data: [],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.4,
    fill: true
  }]
})

const channelPerformance = ref([])

const fetchRevenueData = async (dateParams) => {
  try {
    loading.value = true
    error.value = null
    currentDateParams.value = dateParams || currentDateParams.value

    // Extract date parameters
    let startDate, endDate
    if (dateParams?.date) {
      startDate = dateParams.date
      endDate = dateParams.date
    } else if (dateParams?.start_date && dateParams?.end_date) {
      startDate = dateParams.start_date
      endDate = dateParams.end_date
    } else {
      // Default: yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      startDate = formatDateForAPI(yesterday)
      endDate = startDate
    }

    const response = await apiService.getRevenueByChannel(startDate, endDate)
    const data = response.data

    if (data && data.length > 0) {
      // Calculate total revenue
      const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0)

      // Group by channel categories
      const channelGroups = {
        mobileMoney: ['MFS_SEND', 'MFS_RECV'],
        merchant: ['ETHUB_SEND', 'ETHUB_RECV'],
        others: []
      }

      let mobileMoneyRevenue = 0
      let merchantRevenue = 0
      let othersRevenue = 0

      data.forEach(item => {
        const revenue = parseFloat(item.revenue || 0)
        if (channelGroups.mobileMoney.includes(item.channel)) {
          mobileMoneyRevenue += revenue
        } else if (channelGroups.merchant.includes(item.channel)) {
          merchantRevenue += revenue
        } else {
          othersRevenue += revenue
        }
      })

      revenueKpis.value = {
        totalRevenue,
        revenueTrend: 0, // TODO: Calculate from previous period
        mobileMoney: mobileMoneyRevenue,
        mobileMoneyTrend: 0,
        merchant: merchantRevenue,
        merchantTrend: 0,
        others: othersRevenue,
        othersTrend: 0
      }

      // Prepare chart data
      const sortedData = [...data].sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))

      revenueByChannelData.value = {
        labels: sortedData.map(item => item.channel),
        datasets: [{
          label: 'Revenus (XOF)',
          data: sortedData.map(item => parseFloat(item.revenue)),
          backgroundColor: ['#10B981', '#A855F7', '#F59E0B', '#0EA5E9', '#EC4899']
        }]
      }

      // Prepare channel performance data
      channelPerformance.value = sortedData.map((item, index) => {
        const revenue = parseFloat(item.revenue)
        const percentage = totalRevenue > 0 ? (revenue / totalRevenue * 100) : 0
        const colors = ['#10B981', '#A855F7', '#F59E0B', '#0EA5E9', '#EC4899']

        return {
          name: item.channel,
          revenue,
          percentage: percentage.toFixed(1),
          growth: 0, // TODO: Calculate from previous period
          color: colors[index % colors.length]
        }
      })
    }
  } catch (err) {
    console.error('Error fetching revenue data:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

const handleDateChange = (dateParams) => {
  fetchRevenueData(dateParams)
}

const retry = () => {
  fetchRevenueData(currentDateParams.value)
}

const exportData = async () => {
  try {
    const response = await apiService.exportToExcel(currentDateParams.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `revenus-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Export error:', err)
  }
}

const formatDateForAPI = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'XOF 0'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value)
}

onMounted(() => {
  // Load yesterday by default
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '')
  fetchRevenueData({ date: dateStr })
})
</script>

<style scoped>
.loading-container {
  @apply flex flex-col items-center justify-center py-24;
}

.error-container {
  @apply flex flex-col items-center justify-center py-24;
  background: rgba(254, 242, 242, 0.5);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 1rem;
  padding: 2rem;
}

@import './views-styles.css';
</style>
