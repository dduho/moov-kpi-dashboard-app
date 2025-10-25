<template>
  <div class="dashboard-kpi">
    <!-- Header avec tabs -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Tableau de Bord KPI</h2>
        <p class="section-subtitle">Métriques d'affaires complètes et analyses</p>
      </div>
      <div class="flex gap-3">
        <DateSelector @dateChange="handleDateChange" />
        <button class="export-btn" @click="exportData">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Exporter</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      <p class="mt-4 text-gray-600">Chargement des données du tableau de bord...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="text-error-600 mb-4">
        <p class="font-semibold">Erreur lors du chargement des données du tableau de bord</p>
        <p class="text-sm mt-2">{{ error }}</p>
      </div>
      <button @click="refreshData" class="glass-btn">
        <span class="text-sm font-medium">Réessayer</span>
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div v-else class="tabs-container mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { 'tab-active': activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="!loading && !error" class="space-y-6">
      <!-- 1. ACQUISITION, KYC & ACTIVATION -->
      <div v-show="activeTab === 'acquisition'">
        <h3 class="category-title">Acquisition, KYC & Activation</h3>

        <div v-if="acquisitionData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Nouveaux Inscrits"
            :value="formatNumber(acquisitionData.overview?.newRegistrations || 0)"
            :trend="12.5"
            variant="blue"
            iconType="customers"
          />
          <KpiCard
            title="Activations"
            :value="formatNumber(acquisitionData.overview?.activations || 0)"
            :trend="15.2"
            variant="green"
            iconType="sales"
          />
          <KpiCard
            title="Taux d'Activation"
            :value="`${acquisitionData.overview?.activationRate || 0}%`"
            :trend="2.1"
            variant="purple"
            iconType="products"
          />
          <KpiCard
            title="Réactivations"
            :value="formatNumber(acquisitionData.overview?.reactivations || 0)"
            :trend="8.3"
            variant="orange"
            iconType="orders"
          />
        </div>

        <div v-if="acquisitionData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Inscriptions par Canal</h4>
            <BarChart :data="getAcquisitionChannelData()" :height="250" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">KYC par Palier</h4>
            <BarChart :data="getKycLevelsData()" :height="250" />
          </div>
        </div>

        <div v-if="acquisitionData" class="chart-card">
          <h4 class="chart-title">Conversion J+N (Cohortes)</h4>
          <LineChart :data="getConversionCohortData()" :height="300" />
        </div>
      </div>

      <!-- 2. UTILISATION & RÉTENTION -->
      <div v-show="activeTab === 'retention'">
        <h3 class="category-title">Utilisation & Rétention</h3>

        <div v-if="usersData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="DAU"
            :value="formatNumber(usersData.total?.dau || 0)"
            :trend="5.8"
            variant="purple"
            iconType="customers"
          />
          <KpiCard
            title="WAU"
            :value="formatNumber(usersData.total?.dau ? usersData.total.dau * 3 : 0)"
            :trend="7.2"
            variant="blue"
            iconType="sales"
          />
          <KpiCard
            title="MAU"
            :value="formatNumber(usersData.total?.mau || 0)"
            :trend="9.1"
            variant="green"
            iconType="products"
          />
          <KpiCard
            title="Taux d'Activité"
            :value="`${calculateActivityRate()}%`"
            :trend="3.5"
            variant="orange"
            iconType="orders"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Fréquence Moyenne Transactions</h4>
            <LineChart :data="transactionFrequencyData" :height="250" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">ATV (Average Transaction Value)</h4>
            <BarChart :data="atvData" :height="250" />
          </div>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Cohortes de Rétention (par Semaine)</h4>
          <div class="overflow-x-auto">
            <table class="retention-table">
              <thead>
                <tr>
                  <th>Cohorte</th>
                  <th>Semaine 0</th>
                  <th>Semaine 1</th>
                  <th>Semaine 2</th>
                  <th>Semaine 3</th>
                  <th>Semaine 4</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cohort in retentionCohorts" :key="cohort.week">
                  <td>{{ cohort.week }}</td>
                  <td :style="{ backgroundColor: getHeatmapColor(cohort.w0) }">{{ cohort.w0 }}%</td>
                  <td :style="{ backgroundColor: getHeatmapColor(cohort.w1) }">{{ cohort.w1 }}%</td>
                  <td :style="{ backgroundColor: getHeatmapColor(cohort.w2) }">{{ cohort.w2 }}%</td>
                  <td :style="{ backgroundColor: getHeatmapColor(cohort.w3) }">{{ cohort.w3 }}%</td>
                  <td :style="{ backgroundColor: getHeatmapColor(cohort.w4) }">{{ cohort.w4 }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 3. TRANSACTIONS -->
      <div v-show="activeTab === 'transactions'">
        <h3 class="category-title">Transactions - Volumes & Qualité</h3>

        <div v-if="dashboardData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Transactions Total"
            :value="formatNumber(dashboardData.globalKpis?.overview?.totalTransactions?.current || 0)"
            :trend="11.3"
            variant="blue"
            iconType="sales"
          />
          <KpiCard
            title="Taux de Succès"
            :value="`${dashboardData.globalKpis?.overview?.successRate?.rate || 0}%`"
            :trend="1.2"
            variant="green"
            iconType="products"
          />
          <KpiCard
            title="Volume Total"
            :value="formatCurrency(dashboardData.globalKpis?.overview?.totalVolume?.current || 0)"
            :trend="14.7"
            variant="purple"
            iconType="customers"
          />
          <KpiCard
            title="Revenus"
            :value="formatCurrency(dashboardData.globalKpis?.overview?.totalRevenue?.current || 0)"
            :trend="15.8"
            variant="orange"
            iconType="orders"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Transactions par Produit</h4>
            <BarChart :data="transactionsByProductData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Heures de Pointe (Distribution 24h)</h4>
            <BarChart :data="getHourlyDistributionData()" :height="300" />
          </div>
        </div>
      </div>

      <!-- 4. REVENUS & RENTABILITÉ -->
      <div v-show="activeTab === 'revenue'">
        <h3 class="category-title">Revenus & Rentabilité</h3>

        <div v-if="revenueData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Revenus Totaux"
            :value="formatCurrency(revenueData.total?.revenue || 0)"
            :trend="15.8"
            variant="green"
            iconType="sales"
          />
          <KpiCard
            title="Commission"
            :value="formatCurrency(revenueData.total?.commission || 0)"
            :trend="12.3"
            variant="blue"
            iconType="products"
          />
          <KpiCard
            title="Taxe"
            :value="formatCurrency(revenueData.total?.tax || 0)"
            :trend="10.1"
            variant="purple"
            iconType="customers"
          />
          <KpiCard
            title="Net Revenue"
            :value="formatCurrency(revenueData.total?.netRevenue || 0)"
            :trend="16.5"
            variant="orange"
            iconType="orders"
          />
        </div>

        <div v-if="revenueData" class="chart-card">
          <h4 class="chart-title mb-4">Revenus par Canal</h4>
          <BarChart :data="getRevenueByChannelData()" :height="300" />
        </div>
      </div>

      <!-- 5. MERCHANTS & QR -->
      <div v-show="activeTab === 'merchants'">
        <h3 class="category-title">Merchants & QR</h3>

        <div v-if="merchantData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Marchands Actifs"
            :value="formatNumber(merchantData.overview?.activeMerchants || 0)"
            :trend="18.5"
            variant="purple"
            iconType="sales"
          />
          <KpiCard
            title="Transactions QR"
            :value="formatNumber(merchantData.overview?.qrTransactions || 0)"
            :trend="22.3"
            variant="blue"
            iconType="products"
          />
          <KpiCard
            title="Montant QR"
            :value="formatCurrency(merchantData.overview?.qrAmount || 0)"
            :trend="25.7"
            variant="green"
            iconType="orders"
          />
          <KpiCard
            title="Ticket Moyen QR"
            :value="formatCurrency(merchantData.overview?.avgTicket || 0)"
            :trend="3.2"
            variant="orange"
            iconType="customers"
          />
        </div>

        <div v-if="merchantData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Top Marchands par Volume</h4>
            <BarChart :data="getTopMerchantsData()" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Densité Géographique</h4>
            <BarChart :data="getMerchantDensityData()" :height="300" />
          </div>
        </div>
      </div>

      <!-- 6. RÉSEAU AGENTS (PDV) -->
      <div v-show="activeTab === 'agents'">
        <h3 class="category-title">Réseau d'Agents & Liquidité</h3>

        <div v-if="agentData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Agents Actifs"
            :value="formatNumber(agentData.overview?.activeAgents || 0)"
            :trend="12.1"
            variant="blue"
            iconType="customers"
          />
          <KpiCard
            title="Cash-In/Out Ratio"
            :value="agentData.overview?.cashInOutRatio || '0.00'"
            :trend="0"
            variant="green"
            iconType="products"
          />
          <KpiCard
            title="Stock Float Moyen"
            :value="formatCurrency(agentData.overview?.avgFloat || 0)"
            :trend="5.3"
            variant="purple"
            iconType="sales"
          />
          <KpiCard
            title="Délai Réappro (h)"
            :value="`${agentData.overview?.reloadTime || 0}h`"
            :trend="-8.2"
            variant="orange"
            iconType="orders"
          />
        </div>

        <div v-if="agentData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Cash-In vs Cash-Out par Zone</h4>
            <BarChart :data="getCashInOutByZoneData()" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Tensions de Liquidité</h4>
            <LineChart :data="getLiquidityTensionData()" :height="300" />
          </div>
        </div>

        <div v-if="agentData && agentData.topAgents" class="chart-card">
          <h4 class="chart-title mb-4">Top 10 Agents</h4>
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Agent ID</th>
                  <th>Zone</th>
                  <th>Volume</th>
                  <th>Revenus</th>
                  <th>Croissance</th>
                  <th>Fiabilité</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(agent, idx) in agentData.topAgents" :key="agent.id">
                  <td class="font-bold">{{ idx + 1 }}</td>
                  <td>{{ agent.id }}</td>
                  <td>{{ agent.zone }}</td>
                  <td>{{ formatCurrency(agent.volume) }}</td>
                  <td>{{ formatCurrency(agent.revenue) }}</td>
                  <td>
                    <span :class="agent.growth >= 0 ? 'text-success-600' : 'text-error-600'">
                      {{ agent.growth >= 0 ? '↗' : '↘' }} {{ Math.abs(agent.growth) }}%
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="agent.reliability >= 95 ? 'status-success' : 'status-warning'">
                      {{ agent.reliability }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 7. CANAUX & EXPÉRIENCE -->
      <div v-show="activeTab === 'channels'">
        <h3 class="category-title">Canaux & Expérience Utilisateur</h3>

        <div v-if="channelData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="USSD"
            :value="`${channelData.distribution?.USSD || 0}%`"
            :trend="2.1"
            variant="blue"
            iconType="sales"
          />
          <KpiCard
            title="App Mobile"
            :value="`${channelData.distribution?.App || 0}%`"
            :trend="15.8"
            variant="green"
            iconType="products"
          />
          <KpiCard
            title="API"
            :value="`${channelData.distribution?.API || 0}%`"
            :trend="8.3"
            variant="purple"
            iconType="orders"
          />
          <KpiCard
            title="STK Push"
            :value="`${channelData.distribution?.STK || 0}%`"
            :trend="-3.2"
            variant="orange"
            iconType="customers"
          />
        </div>

        <div v-if="channelData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Taux de Succès par Canal</h4>
            <BarChart :data="getChannelSuccessRateData()" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Temps Moyen d'Exécution (ms)</h4>
            <BarChart :data="getChannelLatencyData()" :height="250" />
          </div>
        </div>

        <div v-if="channelData && channelData.detailedMetrics" class="chart-card">
          <h4 class="chart-title mb-4">Métriques par Canal</h4>
          <div class="space-y-4">
            <div v-for="channel in channelData.detailedMetrics" :key="channel.name" class="channel-metric-card">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-900">{{ channel.name }}</span>
                <span class="status-badge" :class="'status-' + channel.status">{{ channel.status }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div class="text-gray-500">Succès</div>
                  <div class="font-bold text-success-600">{{ channel.successRate }}%</div>
                </div>
                <div>
                  <div class="text-gray-500">Latence</div>
                  <div class="font-bold text-gray-900">{{ channel.latency }}ms</div>
                </div>
                <div>
                  <div class="text-gray-500">Volume</div>
                  <div class="font-bold text-primary-600">{{ formatNumber(channel.volume) }}</div>
                </div>
              </div>
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
import DateSelector from '@/components/widgets/DateSelector.vue'
import { IconDownload } from '@/components/icons/Icons.vue'
import { apiService } from '@/services/api'

// Active tab
const activeTab = ref('acquisition')

const tabs = [
  { id: 'acquisition', label: 'Acquisition & KYC' },
  { id: 'retention', label: 'Rétention' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'revenue', label: 'Revenus' },
  { id: 'merchants', label: 'Marchands' },
  { id: 'agents', label: 'Agents' },
  { id: 'channels', label: 'Canaux' }
]

// State
const loading = ref(true)
const error = ref(null)
const currentDateParams = ref({})
const apiTestResult = ref(null)

// Data from API
const dashboardData = ref(null)
const acquisitionData = ref(null)
const merchantData = ref(null)
const agentData = ref(null)
const channelData = ref(null)
const usersData = ref(null)
const revenueData = ref(null)

// Mock retention cohorts (would come from API in production)
const retentionCohorts = ref([
  { week: 'S-4', w0: 100, w1: 68, w2: 52, w3: 45, w4: 42 },
  { week: 'S-3', w0: 100, w1: 71, w2: 55, w3: 48, w4: 44 },
  { week: 'S-2', w0: 100, w1: 74, w2: 58, w3: 51, w4: 47 },
  { week: 'S-1', w0: 100, w1: 76, w2: 61, w3: 53, w4: null },
  { week: 'S0', w0: 100, w1: 78, w2: null, w3: null, w4: null }
])

// Mock data for charts that don't have specific endpoints yet
const transactionFrequencyData = ref({
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Transactions/User',
    data: [2.3, 2.5, 2.4, 2.7, 2.9, 2.1, 1.8],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.4
  }]
})

const atvData = ref({
  labels: ['P2P', 'Cash-in', 'Cash-out', 'Airtime', 'Bills'],
  datasets: [{
    label: 'ATV (XOF)',
    data: [8500, 12000, 15000, 3500, 4200],
    backgroundColor: '#0EA5E9'
  }]
})

const transactionsByProductData = ref({
  labels: ['P2P', 'Cash-in', 'Cash-out', 'Airtime', 'Data', 'Bills', 'Merchant'],
  datasets: [{
    label: 'Transactions',
    data: [125000, 98000, 87000, 76000, 42000, 18000, 12920],
    backgroundColor: ['#0EA5E9', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6', '#6366F1']
  }]
})

// API Data Fetch Functions
const fetchAllData = async (dateParams) => {
  loading.value = true
  error.value = null

  try {
    const promises = []

    if (dateParams.date) {
      // Single date
      promises.push(
        apiService.getDashboardData({ date: dateParams.date }).catch(e => {
          console.error('Dashboard API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getAcquisitionData(dateParams.date).catch(e => {
          console.error('Acquisition API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getMerchantData(dateParams.date).catch(e => {
          console.error('Merchant API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getAgentData(dateParams.date).catch(e => {
          console.error('Agent API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getChannelMetrics(dateParams.date).catch(e => {
          console.error('Channel API error:', e)
          return { data: null, error: e.message }
        })
      )
    } else {
      // Date range
      const { start_date, end_date } = dateParams
      promises.push(
        apiService.getDashboardData({ startDate: start_date, endDate: end_date }).catch(e => {
          console.error('Dashboard API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getAcquisitionByDateRange(start_date, end_date).catch(e => {
          console.error('Acquisition API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getMerchantsByDateRange(start_date, end_date).catch(e => {
          console.error('Merchant API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getAgentsByDateRange(start_date, end_date).catch(e => {
          console.error('Agent API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getChannelMetricsByDateRange(start_date, end_date).catch(e => {
          console.error('Channel API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getActiveUsers(start_date, end_date).catch(e => {
          console.error('Users API error:', e)
          return { data: null, error: e.message }
        }),
        apiService.getRevenueByChannel(start_date, end_date).catch(e => {
          console.error('Revenue API error:', e)
          return { data: null, error: e.message }
        })
      )
    }

    const results = await Promise.all(promises)

    dashboardData.value = results[0]?.data || results[0]
    acquisitionData.value = results[1]?.data || results[1]
    merchantData.value = results[2]?.data || results[2]
    agentData.value = results[3]?.data || results[3]
    channelData.value = results[4]?.data || results[4]

    if (results.length > 5) {
      usersData.value = results[5]?.data || results[5]
      revenueData.value = results[6]?.data || results[6]
    }

    // Check if we have any data at all
    const hasAnyData = dashboardData.value || acquisitionData.value || merchantData.value ||
                      agentData.value || channelData.value || usersData.value || revenueData.value

    if (!hasAnyData) {
      error.value = 'Aucune donnée disponible pour la période sélectionnée. La base de données pourrait être vide ou la plage de dates ne contient aucune donnée.'
    } else {
      error.value = null // Clear any previous error if we have data
    }

    loading.value = false
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = err.message || 'Échec du chargement des données du tableau de bord'
    loading.value = false
  }
}

const handleDateChange = (dateParams) => {
  currentDateParams.value = dateParams
  fetchAllData(dateParams)
}

const refreshData = () => {
  fetchAllData(currentDateParams.value)
}

const exportData = async () => {
  try {
    const response = await apiService.exportToExcel(currentDateParams.value)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `kpi-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Export error:', err)
  }
}

// Data transformation functions
const getAcquisitionChannelData = () => {
  if (!acquisitionData.value?.channelDistribution) return { labels: [], datasets: [] }

  const channels = acquisitionData.value.channelDistribution
  return {
    labels: Object.keys(channels),
    datasets: [{
      label: 'Inscriptions',
      data: Object.values(channels),
      backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
    }]
  }
}

const getKycLevelsData = () => {
  if (!acquisitionData.value?.kycLevels) return { labels: [], datasets: [] }

  const levels = acquisitionData.value.kycLevels
  return {
    labels: Object.keys(levels),
    datasets: [{
      label: 'Comptes',
      data: Object.values(levels),
      backgroundColor: ['#FBBF24', '#22D3EE', '#10B981']
    }]
  }
}

const getConversionCohortData = () => {
  if (!acquisitionData.value?.conversionCohorts) return { labels: [], datasets: [] }

  const cohorts = acquisitionData.value.conversionCohorts
  return {
    labels: cohorts.map(c => c.period),
    datasets: [{
      label: 'Taux de Conversion (%)',
      data: cohorts.map(c => c.rate),
      borderColor: '#A855F7',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      tension: 0.4
    }]
  }
}

const getRevenueByChannelData = () => {
  if (!revenueData.value?.byChannel) return { labels: [], datasets: [] }

  const channels = Object.entries(revenueData.value.byChannel)
  return {
    labels: channels.map(([name]) => name),
    datasets: [{
      label: 'Revenus (XOF)',
      data: channels.map(([, data]) => data.revenue),
      backgroundColor: '#10B981'
    }]
  }
}

const getTopMerchantsData = () => {
  if (!merchantData.value?.topMerchants) return { labels: [], datasets: [] }

  const merchants = merchantData.value.topMerchants
  return {
    labels: merchants.map(m => m.name),
    datasets: [{
      label: 'Volume (XOF)',
      data: merchants.map(m => m.volume),
      backgroundColor: '#A855F7'
    }]
  }
}

const getMerchantDensityData = () => {
  if (!merchantData.value?.geographic?.byRegion) return { labels: [], datasets: [] }

  const regions = merchantData.value.geographic.byRegion
  return {
    labels: regions.map(r => r.region),
    datasets: [{
      label: 'Marchands',
      data: regions.map(r => r.merchants),
      backgroundColor: '#0EA5E9'
    }]
  }
}

const getCashInOutByZoneData = () => {
  if (!agentData.value?.byZone) return { labels: [], datasets: [] }

  const zones = agentData.value.byZone
  return {
    labels: zones.map(z => z.zone),
    datasets: [
      {
        label: 'Cash-In',
        data: zones.map(z => z.cashIn),
        backgroundColor: '#10B981'
      },
      {
        label: 'Cash-Out',
        data: zones.map(z => z.cashOut),
        backgroundColor: '#F59E0B'
      }
    ]
  }
}

const getLiquidityTensionData = () => {
  if (!agentData.value?.liquidityTensions) return { labels: [], datasets: [] }

  const tensions = agentData.value.liquidityTensions
  return {
    labels: tensions.map(t => t.day),
    datasets: [{
      label: 'Niveau de Tension (%)',
      data: tensions.map(t => t.level),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4
    }]
  }
}

const getChannelSuccessRateData = () => {
  if (!channelData.value?.successRates) return { labels: [], datasets: [] }

  const rates = channelData.value.successRates
  return {
    labels: Object.keys(rates),
    datasets: [{
      label: 'Taux de Succès (%)',
      data: Object.values(rates),
      backgroundColor: '#10B981'
    }]
  }
}

const getChannelLatencyData = () => {
  if (!channelData.value?.latency) return { labels: [], datasets: [] }

  const latency = channelData.value.latency
  return {
    labels: Object.keys(latency),
    datasets: [{
      label: 'Latence Moyenne (ms)',
      data: Object.values(latency),
      backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
    }]
  }
}

const getHourlyDistributionData = () => {
  if (!dashboardData.value?.charts?.hourlyTrends) return { labels: [], datasets: [] }

  const hourly = dashboardData.value.charts.hourlyTrends
  return {
    labels: hourly.map(h => `${h.hour}h`),
    datasets: [{
      label: 'Transactions',
      data: hourly.map(h => h.transactions),
      backgroundColor: '#0EA5E9'
    }]
  }
}

const calculateActivityRate = () => {
  if (!usersData.value?.total) return 0
  const { dau, mau } = usersData.value.total
  return mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0
}

// Helper functions
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

const getHeatmapColor = (value) => {
  if (!value) return '#F3F4F6'
  if (value >= 80) return '#10B981'
  if (value >= 60) return '#22D3EE'
  if (value >= 40) return '#FBBF24'
  if (value >= 20) return '#F59E0B'
  return '#EF4444'
}

const testApi = async () => {
  console.log('Testing API call from dashboard...')
  try {
    const response = await apiService.getDashboardData({ date: '20241024' })
    apiTestResult.value = JSON.stringify(response.data, null, 2)
    console.log('API test successful:', response.data)
  } catch (err) {
    apiTestResult.value = `Error: ${err.message}`
    console.error('API test failed:', err)
  }
}

// Lifecycle
onMounted(() => {
  console.log('DashboardView mounted - component loaded successfully')
  // Load default data (yesterday) on mount
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '')
  console.log('DashboardView: Loading data for date:', dateStr)
  fetchAllData({ date: dateStr })
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

.tabs-container {
  @apply flex gap-2 overflow-x-auto pb-2;
}

.tab-btn {
  @apply px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(229, 231, 235, 0.5);
  color: #6B7280;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(249, 115, 22, 0.3);
}

.date-btn-active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(234, 88, 12, 0.9)) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.category-title {
  @apply text-2xl font-bold mb-6;
  background: linear-gradient(135deg, #F97316, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.retention-table {
  @apply w-full text-sm;
}

.retention-table th,
.retention-table td {
  @apply px-4 py-2 text-center;
}

.retention-table th {
  @apply bg-gray-100 font-semibold text-gray-700;
}

.retention-table td {
  @apply font-medium;
  color: #1F2937;
}

.channel-metric-card {
  @apply p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all;
}
</style>

<style scoped>
@import './views-styles.css';
</style>
