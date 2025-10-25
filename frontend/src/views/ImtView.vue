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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Total IMT"
        :value="formatNumber(imtKpis.totalTransactions)"
        :trend="imtKpis.transactionsTrend"
        variant="purple"
        iconType="sales"
      />
      <KpiCard
        title="Volume Total"
        :value="formatCurrency(imtKpis.totalVolume)"
        :trend="imtKpis.volumeTrend"
        variant="blue"
        iconType="orders"
      />
      <KpiCard
        title="Montant Moyen"
        :value="formatCurrency(imtKpis.avgAmount)"
        :trend="imtKpis.avgTrend"
        variant="green"
        iconType="products"
      />
      <KpiCard
        title="Pays"
        :value="String(imtKpis.countriesCount)"
        :trend="imtKpis.countriesTrend"
        variant="orange"
        iconType="customers"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Pays de Destination Principaux</h3>
        <BarChart :data="topCountriesData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Tendance Mensuelle</h3>
        <LineChart :data="monthlyTrendData" :height="300" />
      </div>
    </div>

    <div class="chart-card">
      <h3 class="chart-title mb-4">Transactions IMT Récentes</h3>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID Transaction</th>
              <th>Date</th>
              <th>Pays</th>
              <th>Montant (XOF)</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="txn in recentTransactions" :key="txn.id">
              <td class="font-medium">{{ txn.id }}</td>
              <td>{{ txn.date }}</td>
              <td>{{ txn.country }}</td>
              <td>{{ formatCurrency(txn.amount) }}</td>
              <td>
                <span class="status-badge" :class="'status-' + txn.status">
                  {{ txn.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import { IconDownload } from '@/components/icons/Icons.vue'

const imtKpis = ref({
  totalTransactions: 8540,
  transactionsTrend: 14.2,
  totalVolume: 4200000000,
  volumeTrend: 18.5,
  avgAmount: 492000,
  avgTrend: 3.7,
  countriesCount: 28,
  countriesTrend: 7.1
})

const topCountriesData = ref({
  labels: ['France', 'Senegal', 'Mali', 'Ivory Coast', 'Burkina Faso'],
  datasets: [{
    label: 'Transactions',
    data: [2400, 1800, 1200, 950, 720],
    backgroundColor: ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9']
  }]
})

const monthlyTrendData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Volume (B XOF)',
    data: [3.2, 3.8, 4.1, 3.9, 4.5, 4.2],
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    tension: 0.4
  }]
})

const recentTransactions = ref([
  { id: 'IMT-2025-1234', date: '2025-10-25', country: 'France', amount: 525000, status: 'success' },
  { id: 'IMT-2025-1233', date: '2025-10-25', country: 'Senegal', amount: 450000, status: 'success' },
  { id: 'IMT-2025-1232', date: '2025-10-25', country: 'Mali', amount: 380000, status: 'success' },
  { id: 'IMT-2025-1231', date: '2025-10-24', country: 'France', amount: 620000, status: 'success' },
  { id: 'IMT-2025-1230', date: '2025-10-24', country: 'Ivory Coast', amount: 495000, status: 'warning' }
])

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)
const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
}).format(value)
</script>

<style scoped>
@import './views-styles.css';
</style>
