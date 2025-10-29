<template>
  <div class="hourly-kpis">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">KPI Horaires</h2>
        <p class="section-subtitle">Répartition des performances horaires</p>
      </div>
      <div class="flex gap-3">
        <DateRangeFilter @dateChange="handleDateChange" :single-date-only="true" />
        <button class="export-btn" @click="exportData">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Exporter</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <p class="mt-4 text-gray-600">Chargement des données horaires...</p>
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
        title="Heure de Pointe"
        :value="peakHour"
        :trend="0"
        variant="pink"
        iconType="sales"
      />
      <KpiCard
        title="Moyenne/Heure"
        :value="formatNumber(hourlyKpis.avgPerHour)"
        :trend="hourlyKpis.avgTrend"
        variant="orange"
        iconType="orders"
      />
      <KpiCard
        title="Total Aujourd'hui"
        :value="formatNumber(hourlyKpis.totalToday)"
        :trend="hourlyKpis.totalTrend"
        variant="green"
        iconType="products"
      />
      <KpiCard
        title="Heure Actuelle"
        :value="formatNumber(hourlyKpis.currentHour)"
        :trend="hourlyKpis.currentTrend"
        variant="blue"
        iconType="customers"
      />
    </div>

    <div class="chart-card mb-6">
      <h3 class="chart-title">Distribution Horaire (Aujourd'hui)</h3>
      <LineChart :data="hourlyDistributionData" :height="350" />
    </div>

    <div class="chart-card">
      <h3 class="chart-title">Comparaison Horaire (Cette Semaine)</h3>
      <BarChart :data="hourlyComparisonData" :height="300" />
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
const peakHour = ref('--:--')

const hourlyKpis = ref({
  avgPerHour: 0,
  avgTrend: 0,
  totalToday: 0,
  totalTrend: 0,
  currentHour: 0,
  currentTrend: 0
})

const hourlyDistributionData = ref({
  labels: [],
  datasets: [{
    label: 'Transactions',
    data: [],
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    tension: 0.4,
    fill: true
  }]
})

const hourlyComparisonData = ref({
  labels: [],
  datasets: [{
    label: 'Revenus (XOF)',
    data: [],
    backgroundColor: '#22D3EE'
  }]
})

const fetchHourlyData = async (dateParams) => {
  try {
    loading.value = true
    error.value = null
    currentDateParams.value = dateParams || currentDateParams.value

    // Extract date parameter (hourly only supports single date)
    let date
    if (dateParams?.date) {
      date = dateParams.date
    } else if (dateParams?.start_date) {
      // Use start_date if provided
      date = dateParams.start_date
    } else {
      // Default: yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      date = formatDateForAPI(yesterday)
    }

    const response = await apiService.getHourlyKpis(date)
    const data = response.data

    if (data && data.length > 0) {
      // Group data by hour
      const hourlyData = {}
      data.forEach(item => {
        const hour = item.hour
        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            cnt: 0,
            amt: 0,
            rev: 0
          }
        }
        hourlyData[hour].cnt += parseInt(item.cnt || 0)
        hourlyData[hour].amt += parseFloat(item.amt || 0)
        hourlyData[hour].rev += parseFloat(item.rev || 0)
      })

      // Create arrays for all 24 hours
      const hours = []
      const transactions = []
      const revenues = []

      for (let h = 0; h < 24; h++) {
        const hourStr = String(h).padStart(2, '0')
        hours.push(hourStr)

        if (hourlyData[h]) {
          transactions.push(hourlyData[h].cnt)
          revenues.push(hourlyData[h].rev)
        } else {
          transactions.push(0)
          revenues.push(0)
        }
      }

      // Find peak hour
      let maxTransactions = 0
      let peakHourIndex = 0
      transactions.forEach((count, index) => {
        if (count > maxTransactions) {
          maxTransactions = count
          peakHourIndex = index
        }
      })
      peakHour.value = `${String(peakHourIndex).padStart(2, '0')}:00`

      // Calculate KPIs
      const totalTransactions = transactions.reduce((sum, val) => sum + val, 0)
      const avgPerHour = totalTransactions > 0 ? Math.round(totalTransactions / 24) : 0
      const currentHourIndex = new Date().getHours()
      const currentHourTransactions = transactions[currentHourIndex] || 0

      hourlyKpis.value = {
        avgPerHour,
        avgTrend: 0, // TODO: Calculate from previous period
        totalToday: totalTransactions,
        totalTrend: 0,
        currentHour: currentHourTransactions,
        currentTrend: 0
      }

      // Update chart data
      hourlyDistributionData.value = {
        labels: hours,
        datasets: [{
          label: 'Transactions',
          data: transactions,
          borderColor: '#A855F7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }

      // Group into 3-hour blocks for comparison
      const blockLabels = ['00-03', '03-06', '06-09', '09-12', '12-15', '15-18', '18-21', '21-24']
      const blockData = []

      for (let i = 0; i < 8; i++) {
        const startHour = i * 3
        const blockSum = revenues.slice(startHour, startHour + 3).reduce((sum, val) => sum + val, 0)
        blockData.push(Math.round(blockSum))
      }

      hourlyComparisonData.value = {
        labels: blockLabels,
        datasets: [{
          label: 'Revenus (XOF)',
          data: blockData,
          backgroundColor: '#22D3EE'
        }]
      }
    }
  } catch (err) {
    console.error('Error fetching hourly data:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

const handleDateChange = (dateParams) => {
  fetchHourlyData(dateParams)
}

const retry = () => {
  fetchHourlyData(currentDateParams.value)
}

const exportData = async () => {
  try {
    const response = await apiService.exportToExcel(currentDateParams.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `kpi-horaires-${new Date().toISOString().split('T')[0]}.xlsx`)
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

const formatNumber = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('fr-FR').format(Math.round(value))
}

onMounted(() => {
  // Load yesterday by default
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '')
  fetchHourlyData({ date: dateStr })
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
