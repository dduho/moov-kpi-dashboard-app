<template>
  <div class="imt-transactions">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Transactions IMT</h2>
        <p class="section-subtitle">Analyses des transferts d'argent internationaux</p>
      </div>
      <button class="export-btn">
        <IconDownload :size="18" />
        <span class="text-sm font-medium">Exporter</span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-500">Chargement des données IMT...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">Erreur: {{ error }}</p>
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
        <h3 class="chart-title mb-4">Détails des Transactions IMT</h3>
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
              <tr v-for="txn in transactions" :key="`${txn.date}-${txn.country}-${txn.imt_business}`">
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
import { ref, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import { IconDownload } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

const loading = ref(true)
const error = ref(null)
const transactions = ref([])
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

const fetchImtData = async () => {
  try {
    loading.value = true
    error.value = null

    // Get last 30 days of data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const response = await apiService.getImtData(formatDateForAPI(endDate))
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

onMounted(() => {
  fetchImtData()
})

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)
const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
}).format(value)

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
@import './views-styles.css';
</style>
