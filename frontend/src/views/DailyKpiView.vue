<template>
  <div class="daily-kpis">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Daily KPIs</h2>
        <p class="section-subtitle">Daily performance metrics and trends</p>
      </div>
      <div class="flex gap-3">
        <button class="glass-btn">
          <span class="text-sm font-medium">Last 7 Days</span>
          <IconChevronDown :size="16" class="text-gray-500" />
        </button>
        <button class="export-btn">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Export</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Total Transactions"
        :value="formatNumber(dailyKpis.totalTransactions)"
        :trend="dailyKpis.transactionsTrend"
        variant="blue"
        iconType="sales"
      />
      <KpiCard
        title="Total Volume"
        :value="formatCurrency(dailyKpis.totalVolume)"
        :trend="dailyKpis.volumeTrend"
        variant="green"
        iconType="orders"
      />
      <KpiCard
        title="Active Users"
        :value="formatNumber(dailyKpis.activeUsers)"
        :trend="dailyKpis.usersTrend"
        variant="purple"
        iconType="customers"
      />
      <KpiCard
        title="Success Rate"
        value="${dailyKpis.successRate}%"
        :trend="dailyKpis.successRateTrend"
        variant="orange"
        iconType="products"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Daily Transactions Trend</h3>
        <LineChart :data="transactionsTrendData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Volume by Day</h3>
        <BarChart :data="volumeByDayData" :height="300" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="chart-title">Daily Breakdown</h3>
        <div class="search-container-sm">
          <IconSearch :size="16" class="search-icon-sm" />
          <input type="text" placeholder="Search..." class="search-input-sm" v-model="searchQuery" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transactions</th>
              <th>Volume (XOF)</th>
              <th>Active Users</th>
              <th>Success Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredDailyData" :key="row.date">
              <td class="font-medium">{{ row.date }}</td>
              <td>{{ formatNumber(row.transactions) }}</td>
              <td>{{ formatCurrency(row.volume) }}</td>
              <td>{{ formatNumber(row.users) }}</td>
              <td>
                <span :class="row.successRate >= 95 ? 'text-success-600' : 'text-warning-600'">
                  {{ row.successRate }}%
                </span>
              </td>
              <td>
                <span class="status-badge" :class="row.successRate >= 95 ? 'status-success' : 'status-warning'">
                  {{ row.successRate >= 95 ? 'Good' : 'Average' }}
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
import { ref, computed } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import { IconDownload, IconChevronDown, IconSearch } from '@/components/icons/Icons.vue'

const searchQuery = ref('')

const dailyKpis = ref({
  totalTransactions: 45620,
  transactionsTrend: 12.5,
  totalVolume: 12500000,
  volumeTrend: 8.3,
  activeUsers: 8930,
  usersTrend: 15.2,
  successRate: 96.8,
  successRateTrend: 2.1
})

const transactionsTrendData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Transactions',
    data: [5200, 6100, 5800, 6500, 7200, 6800, 7900],
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    tension: 0.4
  }]
})

const volumeByDayData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Volume (M XOF)',
    data: [1.5, 1.8, 1.7, 2.0, 2.2, 2.1, 2.4],
    backgroundColor: '#10B981'
  }]
})

const dailyData = ref([
  { date: '2025-10-25', transactions: 7900, volume: 2400000, users: 1450, successRate: 97.2 },
  { date: '2025-10-24', transactions: 6800, volume: 2100000, users: 1320, successRate: 96.8 },
  { date: '2025-10-23', transactions: 7200, volume: 2200000, users: 1380, successRate: 97.5 },
  { date: '2025-10-22', transactions: 6500, volume: 2000000, users: 1290, successRate: 96.2 },
  { date: '2025-10-21', transactions: 5800, volume: 1700000, users: 1150, successRate: 95.8 },
  { date: '2025-10-20', transactions: 6100, volume: 1800000, users: 1220, successRate: 96.5 },
  { date: '2025-10-19', transactions: 5200, volume: 1500000, users: 1080, successRate: 94.8 }
])

const filteredDailyData = computed(() => {
  if (!searchQuery.value) return dailyData.value
  return dailyData.value.filter(row =>
    row.date.includes(searchQuery.value) ||
    row.transactions.toString().includes(searchQuery.value)
  )
})

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
