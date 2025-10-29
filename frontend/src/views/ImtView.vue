<template>
  <div class="imt-transactions">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Transactions IMT</h2>
        <p class="section-subtitle">Analyses des transferts d'argent internationaux</p>
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
      <p class="mt-4 text-gray-600">Chargement des données IMT...</p>
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
          title="Total Transactions"
          :value="formatNumber(imtKpis.totalTransactions)"
          :trend="imtKpis.transactionsTrend"
          variant="purple"
          iconType="sales"
        />
        <KpiCard
          title="Revenus Totaux"
          :value="formatCurrency(imtKpis.totalRevenue)"
          :trend="imtKpis.revenueTrend"
          variant="blue"
          iconType="orders"
        />
        <KpiCard
          title="Taux de Succès"
          :value="`${imtKpis.successRate}%`"
          :trend="imtKpis.successTrend"
          variant="green"
          iconType="products"
        />
        <KpiCard
          title="Partenaires"
          :value="String(imtKpis.businessCount)"
          variant="orange"
          iconType="customers"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="chart-card">
          <h3 class="chart-title">Répartition par Pays</h3>
          <BarChart :data="countryDistributionData" :height="300" />
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Répartition par Partenaire IMT</h3>
          <BarChart :data="businessDistributionData" :height="300" />
        </div>
      </div>

      <div class="chart-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="chart-title">Détails des Transactions IMT</h3>
          <div class="search-container-sm">
            <IconSearch :size="16" class="search-icon-sm" />
            <input type="text" placeholder="Rechercher..." class="search-input-sm" v-model="searchQuery" />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pays</th>
                <th>Partenaire</th>
                <th>Succès</th>
                <th>Échecs</th>
                <th>Montant (XOF)</th>
                <th>Revenus (XOF)</th>
                <th>Taux Succès</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="txn in filteredTransactions" :key="`${txn.date}-${txn.country}-${txn.imt_business}`">
                <td class="font-medium">{{ formatDisplayDate(txn.date) }}</td>
                <td>{{ txn.country }}</td>
                <td>{{ txn.imt_business }}</td>
                <td class="text-green-600">{{ formatNumber(txn.total_success) }}</td>
                <td class="text-red-600">{{ formatNumber(txn.total_failed) }}</td>
                <td>{{ formatCurrency(parseFloat(txn.amount)) }}</td>
                <td>{{ formatCurrency(parseFloat(txn.revenue)) }}</td>
                <td>
                  <span class="status-badge" :class="getSuccessRateClass(txn.success_rate)">
                    {{ (parseFloat(txn.success_rate) * 100).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { IconDownload, IconSearch } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const transactions = ref([])
const currentDateParams = ref({})
const imtKpis = ref({
  totalTransactions: 0,
  transactionsTrend: 0,
  totalRevenue: 0,
  revenueTrend: 0,
  successRate: 0,
  successTrend: 0,
  businessCount: 0
})

const countryDistributionData = ref({
  labels: [],
  datasets: [{
    label: 'Transactions',
    data: [],
    backgroundColor: ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9']
  }]
})

const businessDistributionData = ref({
  labels: [],
  datasets: [{
    label: 'Revenus',
    data: [],
    backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B']
  }]
})

const fetchImtData = async (dateParams) => {
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

    const response = await apiService.getImtData(startDate, endDate)
    const data = response.data

    if (data && data.length > 0) {
      transactions.value = data.slice(0, 20) // Show first 20 transactions

      // Calculate KPIs
      const totalSuccess = data.reduce((sum, t) => sum + parseInt(t.total_success || 0), 0)
      const totalFailed = data.reduce((sum, t) => sum + parseInt(t.total_failed || 0), 0)
      const totalRevenue = data.reduce((sum, t) => sum + parseFloat(t.revenue || 0), 0)
      const uniqueBusinesses = [...new Set(data.map(t => t.imt_business))].length

      const successRate = totalSuccess + totalFailed > 0
        ? (totalSuccess / (totalSuccess + totalFailed) * 100)
        : 0

      imtKpis.value = {
        totalTransactions: totalSuccess,
        transactionsTrend: 0, // TODO: Calculate from previous period
        totalRevenue: totalRevenue,
        revenueTrend: 0,
        successRate: successRate.toFixed(1),
        successTrend: 0,
        businessCount: uniqueBusinesses
      }

      // Aggregate by country
      const countryAgg = {}
      data.forEach(t => {
        if (!countryAgg[t.country]) {
          countryAgg[t.country] = 0
        }
        countryAgg[t.country] += parseInt(t.total_success || 0)
      })

      const topCountries = Object.entries(countryAgg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      countryDistributionData.value = {
        labels: topCountries.map(([country]) => country),
        datasets: [{
          label: 'Transactions',
          data: topCountries.map(([, count]) => count),
          backgroundColor: ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9']
        }]
      }

      // Aggregate by business
      const businessAgg = {}
      data.forEach(t => {
        if (!businessAgg[t.imt_business]) {
          businessAgg[t.imt_business] = 0
        }
        businessAgg[t.imt_business] += parseFloat(t.revenue || 0)
      })

      const businesses = Object.entries(businessAgg).sort((a, b) => b[1] - a[1])

      businessDistributionData.value = {
        labels: businesses.map(([business]) => business),
        datasets: [{
          label: 'Revenus',
          data: businesses.map(([, revenue]) => revenue),
          backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B']
        }]
      }
    }
  } catch (err) {
    console.error('Error fetching IMT data:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

const handleDateChange = (dateParams) => {
  fetchImtData(dateParams)
}

const retry = () => {
  fetchImtData(currentDateParams.value)
}

const exportData = async () => {
  try {
    const response = await apiService.exportToExcel(currentDateParams.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `imt-transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Export error:', err)
  }
}

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value
  const query = searchQuery.value.toLowerCase()
  return transactions.value.filter(txn =>
    txn.country?.toLowerCase().includes(query) ||
    txn.imt_business?.toLowerCase().includes(query) ||
    txn.date?.includes(query)
  )
})

onMounted(() => {
  // Load yesterday by default
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '')
  fetchImtData({ date: dateStr })
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

const formatDateForAPI = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  // Format YYYYMMDD or YYYY-MM-DD to DD/MM/YYYY
  const str = dateStr.replace(/-/g, '')
  const year = str.substring(0, 4)
  const month = str.substring(4, 6)
  const day = str.substring(6, 8)
  return `${day}/${month}/${year}`
}

const getSuccessRateClass = (rate) => {
  const rateNum = parseFloat(rate) * 100
  if (rateNum >= 95) return 'status-success'
  if (rateNum >= 90) return 'status-warning'
  return 'status-error'
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
