<template>
  <div class="users">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Utilisateurs Actifs</h2>
        <p class="section-subtitle">Métriques d'engagement et d'activité des utilisateurs</p>
      </div>
      <button class="export-btn">
        <IconDownload :size="18" />
        <span class="text-sm font-medium">Exporter</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Utilisateurs Totaux"
        :value="formatNumber(userKpis.totalUsers)"
        :trend="userKpis.totalTrend"
        variant="purple"
        iconType="customers"
      />
      <KpiCard
        title="Actifs Aujourd'hui"
        :value="formatNumber(userKpis.activeToday)"
        :trend="userKpis.activeTrend"
        variant="blue"
        iconType="sales"
      />
      <KpiCard
        title="Nouveaux Utilisateurs"
        :value="formatNumber(userKpis.newUsers)"
        :trend="userKpis.newTrend"
        variant="green"
        iconType="orders"
      />
      <KpiCard
        title="Taux d'Engagement"
        value="${userKpis.engagementRate}%"
        :trend="userKpis.engagementTrend"
        variant="orange"
        iconType="products"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Tendance de Croissance des Utilisateurs</h3>
        <LineChart :data="userGrowthData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Activité des Utilisateurs par Jour</h3>
        <BarChart :data="dailyActivityData" :height="300" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-card">
        <h3 class="chart-title mb-4">Segments d'Utilisateurs</h3>
        <div class="space-y-4">
          <div v-for="segment in userSegments" :key="segment.name" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: segment.color + '20' }">
                <span class="text-lg font-bold" :style="{ color: segment.color }">{{ segment.icon }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ segment.name }}</p>
                <p class="text-sm text-gray-500">{{ formatNumber(segment.count) }} utilisateurs</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-gray-900">{{ segment.percentage }}%</p>
              <span class="status-badge" :class="'status-' + segment.status">{{ segment.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title mb-4">Utilisateurs les Plus Actifs</h3>
        <div class="space-y-3">
          <div v-for="(user, index) in topUsers" :key="user.id" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                {{ index + 1 }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-sm text-gray-500">{{ formatNumber(user.transactions) }} transactions</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(user.volume) }}</p>
              <p class="text-xs text-gray-500">Volume</p>
            </div>
          </div>
        </div>
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

const userKpis = ref({
  totalUsers: 45820,
  totalTrend: 22.5,
  activeToday: 12340,
  activeTrend: 15.8,
  newUsers: 1850,
  newTrend: 28.3,
  engagementRate: 68.5,
  engagementTrend: 5.2
})

const userGrowthData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Total Users',
    data: [35000, 37500, 40200, 42800, 44500, 45820],
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    tension: 0.4,
    fill: true
  }]
})

const dailyActivityData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Active Users',
    data: [10500, 11200, 10800, 11800, 12800, 11500, 9800],
    backgroundColor: '#0EA5E9'
  }]
})

const userSegments = ref([
  { name: 'Utilisateurs Premium', count: 8540, percentage: 18.6, status: 'success', icon: '⭐', color: '#10B981' },
  { name: 'Utilisateurs Réguliers', count: 28420, percentage: 62.0, status: 'info', icon: '👤', color: '#0EA5E9' },
  { name: 'Nouveaux Utilisateurs', count: 6280, percentage: 13.7, status: 'warning', icon: '🆕', color: '#F59E0B' },
  { name: 'Inactifs', count: 2580, percentage: 5.7, status: 'error', icon: '💤', color: '#EF4444' }
])

const topUsers = ref([
  { id: 1, name: 'John Doe', transactions: 2580, volume: 12500000 },
  { id: 2, name: 'Jane Smith', transactions: 2340, volume: 11800000 },
  { id: 3, name: 'Mike Johnson', transactions: 2120, volume: 10200000 },
  { id: 4, name: 'Sarah Williams', transactions: 1980, volume: 9500000 },
  { id: 5, name: 'Tom Brown', transactions: 1850, volume: 8900000 }
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
