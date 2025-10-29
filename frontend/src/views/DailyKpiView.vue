<template>
  <div class="daily-kpis">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">KPI Journaliers</h2>
        <p class="section-subtitle">Métriques de performance quotidiennes et tendances</p>
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
      <p class="mt-4 text-gray-600">Chargement des KPIs journaliers...</p>
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

    <!-- Content -->
    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Transactions Totales"
          :value="formatNumber(dailyKpis.totalTransactions || 0)"
          :trend="dailyKpis.transactionsTrend || 0"
          variant="blue"
          iconType="sales"
        />
        <KpiCard
          title="Volume Total"
          :value="formatCurrency(dailyKpis.totalAmount || 0)"
          :trend="dailyKpis.volumeTrend || 0"
          variant="green"
          iconType="orders"
        />
        <KpiCard
          title="Revenus Totaux"
          :value="formatCurrency(dailyKpis.totalRevenue || 0)"
          :trend="dailyKpis.revenueTrend || 0"
          variant="purple"
          iconType="customers"
        />
        <KpiCard
          title="Taux de Succès"
          :value="`${dailyKpis.successRate || 0}%`"
          :trend="dailyKpis.successRateTrend || 0"
          variant="orange"
          iconType="products"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="chart-card">
          <h3 class="chart-title">Transactions par Business Type</h3>
          <BarChart :data="transactionsByTypeData" :height="300" />
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Revenus par Business Type</h3>
          <BarChart :data="revenueByTypeData" :height="300" />
        </div>
      </div>

      <!-- Data Table by Business Type -->
      <div class="chart-card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="chart-title">Détails par Business Type</h3>
          <div class="search-container-sm">
            <IconSearch :size="16" class="search-icon-sm" />
            <input type="text" placeholder="Rechercher..." class="search-input-sm" v-model="searchQuery" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Business Type</th>
                <th>Période</th>
                <th>Success Trx</th>
                <th>Failed Trx</th>
                <th>Taux Succès</th>
                <th>Montant</th>
                <th>Revenus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredDailyData" :key="`${row.business_type}-${row.period}`">
                <td class="font-medium">{{ row.business_type }}</td>
                <td>{{ row.period }}</td>
                <td>{{ formatNumber(row.success_trx) }}</td>
                <td>{{ formatNumber(row.failed_trx) }}</td>
                <td>
                  <span :class="row.success_rate >= 95 ? 'text-success-600' : 'text-warning-600'">
                    {{ row.success_rate.toFixed(2) }}%
                  </span>
                </td>
                <td>{{ formatCurrency(row.amount) }}</td>
                <td>{{ formatCurrency(row.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Daily Comparison Section -->
      <div v-if="comparisonData.length" class="chart-card">
        <h3 class="chart-title mb-4">Comparaison Jour vs Jour-1 (VS/GAP, CNT/AMT/REV)</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Business Type</th>
                <th>Transactions J</th>
                <th>Transactions J-1</th>
                <th>Écart (GAP)</th>
                <th>Montant J</th>
                <th>Montant J-1</th>
                <th>Écart Montant</th>
                <th>Revenus J</th>
                <th>Revenus J-1</th>
                <th>Écart Revenus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in comparisonData" :key="item.business_type">
                <td class="font-semibold">{{ item.business_type }}</td>
                <td>{{ formatNumber(item.current_day_transaction_count) }}</td>
                <td>{{ formatNumber(item.last_day_transaction_count) }}</td>
                <td :class="item.transaction_count_gap >= 0 ? 'text-success-600' : 'text-error-600'">
                  {{ item.transaction_count_gap >= 0 ? '+' : '' }}{{ formatNumber(item.transaction_count_gap) }}
                </td>
                <td>{{ formatCurrency(item.current_day_amount) }}</td>
                <td>{{ formatCurrency(item.last_day_amount) }}</td>
                <td :class="item.amount_gap >= 0 ? 'text-success-600' : 'text-error-600'">
                  {{ item.amount_gap >= 0 ? '+' : '' }}{{ formatCurrency(item.amount_gap) }}
                </td>
                <td>{{ formatCurrency(item.current_day_revenue) }}</td>
                <td>{{ formatCurrency(item.last_day_revenue) }}</td>
                <td :class="item.revenue_gap >= 0 ? 'text-success-600' : 'text-error-600'">
                  {{ item.revenue_gap >= 0 ? '+' : '' }}{{ formatCurrency(item.revenue_gap) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { IconDownload, IconSearch } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

const searchQuery = ref('')
const dailyKpis = ref({})
const dailyData = ref([])
const comparisonData = ref([])
const loading = ref(true)
const error = ref(null)
const currentDateParams = ref({})

const fetchDailyKpis = async (dateParams) => {
  loading.value = true
  error.value = null
  currentDateParams.value = dateParams

  try {
    let date = dateParams.date || dateParams.start_date

    const [kpiRes, compRes] = await Promise.all([
      apiService.getDailyKpis(date),
      apiService.getComparativeAnalytics(date)
    ])

    // Process Daily KPIs
    if (kpiRes.data && Array.isArray(kpiRes.data)) {
      dailyData.value = kpiRes.data

      // Calculate overview stats from detailed data
      const totalTransactions = dailyData.value.reduce((sum, item) => sum + (item.success_trx || 0), 0)
      const totalAmount = dailyData.value.reduce((sum, item) => sum + (item.amount || 0), 0)
      const totalRevenue = dailyData.value.reduce((sum, item) => sum + (item.revenue || 0), 0)
      const totalSuccessTrx = dailyData.value.reduce((sum, item) => sum + (item.success_trx || 0), 0)
      const totalFailedTrx = dailyData.value.reduce((sum, item) => sum + (item.failed_trx || 0), 0)
      const totalTrx = totalSuccessTrx + totalFailedTrx
      const successRate = totalTrx > 0 ? (totalSuccessTrx / totalTrx) * 100 : 0

      dailyKpis.value = {
        totalTransactions,
        totalAmount,
        totalRevenue,
        successRate: successRate.toFixed(2),
        transactionsTrend: 0, // TODO: Calculate from comparison
        volumeTrend: 0,
        revenueTrend: 0,
        successRateTrend: 0
      }
    }

    // Process Daily Comparison
    if (compRes.data && Array.isArray(compRes.data)) {
      comparisonData.value = compRes.data
    }
  } catch (err) {
    console.error('Error fetching daily KPIs:', err)
    error.value = err.message || 'Erreur lors du chargement des KPIs quotidiens.'
  }

  loading.value = false
}

const handleDateChange = (dateParams) => {
  fetchDailyKpis(dateParams)
}

const retry = () => {
  fetchDailyKpis(currentDateParams.value)
}

const exportData = async () => {
  try {
    const response = await apiService.exportToExcel(currentDateParams.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `daily-kpis-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Export error:', err)
  }
}

onMounted(() => {
  // Load yesterday by default
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '')
  fetchDailyKpis({ date: dateStr })
})

const filteredDailyData = computed(() => {
  if (!searchQuery.value) return dailyData.value
  const query = searchQuery.value.toLowerCase()
  return dailyData.value.filter(row =>
    row.business_type?.toLowerCase().includes(query) ||
    row.period?.toLowerCase().includes(query)
  )
})

// Chart data for transactions by business type
const transactionsByTypeData = computed(() => {
  if (!dailyData.value || dailyData.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Aggregate by business_type
  const grouped = {}
  dailyData.value.forEach(item => {
    if (!grouped[item.business_type]) {
      grouped[item.business_type] = 0
    }
    grouped[item.business_type] += item.success_trx || 0
  })

  return {
    labels: Object.keys(grouped),
    datasets: [{
      label: 'Transactions',
      data: Object.values(grouped),
      backgroundColor: '#0EA5E9'
    }]
  }
})

// Chart data for revenue by business type
const revenueByTypeData = computed(() => {
  if (!dailyData.value || dailyData.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Aggregate by business_type
  const grouped = {}
  dailyData.value.forEach(item => {
    if (!grouped[item.business_type]) {
      grouped[item.business_type] = 0
    }
    grouped[item.business_type] += item.revenue || 0
  })

  return {
    labels: Object.keys(grouped),
    datasets: [{
      label: 'Revenus (XOF)',
      data: Object.values(grouped),
      backgroundColor: '#10B981'
    }]
  }
})

const formatNumber = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('fr-FR').format(Math.round(value))
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'XOF 0'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value)
}
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
