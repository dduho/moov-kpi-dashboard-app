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

    <!-- Date Range Filter -->
    <div class="mb-6">
      <DateRangeFilter @dateChange="handleDateChange" defaultRange="30days" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <KpiCard
        title="Clients"
        :value="formatNumberK(userKpis.clients)"
        :trend="userKpis.mom_evolution"
        variant="blue"
        iconType="customers"
      />
      <KpiCard
        title="Agents"
        :value="formatNumber(userKpis.agents)"
        :trend="userKpis.mom_evolution"
        variant="green"
        iconType="sales"
      />
      <KpiCard
        title="Marchands"
        :value="formatNumber(userKpis.merchants)"
        :trend="userKpis.mom_evolution"
        variant="orange"
        iconType="orders"
      />
      <KpiCard
        title="Nouveaux Inscrits"
        :value="formatNumber(userKpis.new_registrations)"
        :trend="userKpis.mom_evolution"
        variant="purple"
        iconType="products"
      />
      <KpiCard
        title="Users App"
        :value="formatNumber(userKpis.app_users)"
        :trend="userKpis.mom_evolution"
        variant="indigo"
        iconType="customers"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Tendance de Croissance des Utilisateurs</h3>
        <LineChart :data="userGrowthData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Évolution des Clients par Jour</h3>
        <BarChart :data="dailyActivityData" :height="300" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="chart-card">
        <h3 class="chart-title mb-4">Répartition des Utilisateurs</h3>
        <div class="space-y-4">
          <div v-for="segment in userSegments" :key="segment.name" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" :style="{ backgroundColor: segment.color + '20' }">
                <span class="text-lg font-bold" :style="{ color: segment.color }">{{ segment.icon }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ segment.name }}</p>
                <p class="text-sm text-gray-500">{{ segment.displayValue }}</p>
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
        <h3 class="chart-title mb-4">Statistiques Moyennes</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">Clients Moyens</p>
              <p class="text-2xl font-bold text-blue-600">{{ formatNumberK(averageKpis.clients) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatNumberK(totalKpis.clients) }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">Agents Moyens</p>
              <p class="text-2xl font-bold text-green-600">{{ formatNumber(averageKpis.agents) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatNumber(totalKpis.agents) }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">Marchands Moyens</p>
              <p class="text-2xl font-bold text-orange-600">{{ formatNumber(averageKpis.merchants) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatNumber(totalKpis.merchants) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { IconDownload } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api.js'

const userKpis = ref({
  clients: 0,
  agents: 0,
  merchants: 0,
  new_registrations: 0,
  app_users: 0,
  total_active: 0,
  mom_evolution: 0
})

const averageKpis = ref({
  clients: 0,
  agents: 0,
  merchants: 0,
  new_registrations: 0,
  app_users: 0
})

const totalKpis = ref({
  clients: 0,
  agents: 0,
  merchants: 0,
  new_registrations: 0,
  app_users: 0
})

const userGrowthData = ref({ labels: [], datasets: [] })
const dailyActivityData = ref({ labels: [], datasets: [] })
const userSegments = ref([])

const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('fr-FR').format(Math.round(value))
}

const formatNumberK = (value) => {
  if (!value) return '0 K'
  const thousands = value / 1000
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(thousands) + ' K'
}

const loadUserData = async (dateParams) => {
  try {
    let startDate, endDate

    if (dateParams.date) {
      // Single date
      startDate = dateParams.date
      endDate = dateParams.date
    } else {
      // Date range
      startDate = dateParams.start_date
      endDate = dateParams.end_date
    }

    console.log('Loading users data:', { startDate, endDate })

    const response = await apiService.getActiveUsers(startDate, endDate)
    console.log('API Response:', response.data)

    if (response?.data) {
      const data = response.data

      // L'API retourne maintenant: { total, average, latest }
      if (data.latest) {
        userKpis.value = {
          clients: data.latest.clients || 0,
          agents: data.latest.agents || 0,
          merchants: data.latest.merchants || 0,
          new_registrations: data.latest.new_registrations || 0,
          app_users: data.latest.app_users || 0,
          total_active: (data.latest.clients || 0) + (data.latest.agents || 0) + (data.latest.merchants || 0),
          mom_evolution: data.latest.mom_evolution || 0
        }
      }

      if (data.average) {
        averageKpis.value = {
          clients: data.average.clients || 0,
          agents: data.average.agents || 0,
          merchants: data.average.merchants || 0,
          new_registrations: data.average.new_registrations || 0,
          app_users: data.average.app_users || 0
        }
      }

      if (data.total) {
        totalKpis.value = {
          clients: data.total.clients || 0,
          agents: data.total.agents || 0,
          merchants: data.total.merchants || 0,
          new_registrations: data.total.new_registrations || 0,
          app_users: data.total.app_users || 0
        }
      }

      const latest = data.latest || {}

      userSegments.value = [
        {
          name: 'Clients',
          count: latest.clients || 0,
          displayValue: formatNumberK(latest.clients || 0),
          percentage: 0,
          status: 'info',
          icon: '👤',
          color: '#0EA5E9'
        },
        {
          name: 'Agents',
          count: latest.agents || 0,
          displayValue: formatNumber(latest.agents || 0),
          percentage: 0,
          status: 'success',
          icon: '👨‍💼',
          color: '#10B981'
        },
        {
          name: 'Marchands',
          count: latest.merchants || 0,
          displayValue: formatNumber(latest.merchants || 0),
          percentage: 0,
          status: 'warning',
          icon: '🏪',
          color: '#F59E0B'
        },
        {
          name: 'App Users',
          count: latest.app_users || 0,
          displayValue: formatNumber(latest.app_users || 0),
          percentage: 0,
          status: 'primary',
          icon: '📱',
          color: '#6366F1'
        }
      ]

      // Calculer les pourcentages
      const total = (latest.clients || 0) + (latest.agents || 0) + (latest.merchants || 0) + (latest.app_users || 0)
      if (total > 0) {
        userSegments.value.forEach(seg => {
          seg.percentage = Math.round((seg.count / total) * 100)
        })
      }
    }
  } catch (e) {
    console.error('Erreur chargement utilisateurs actifs:', e)
  }
}

const handleDateChange = (dateParams) => {
  console.log('Date changed:', dateParams)
  loadUserData(dateParams)
}

onMounted(() => {
  // Le DateRangeFilter va automatiquement émettre un événement au montage
  // avec la plage par défaut (30days)
})
</script>

<style scoped>
@import './views-styles.css';
</style>
