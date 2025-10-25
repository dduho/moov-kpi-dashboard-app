<template>
  <div class="dashboard-kpi">
    <!-- Header avec tabs -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">KPI Dashboard</h2>
        <p class="section-subtitle">Comprehensive business metrics & analytics</p>
      </div>
      <div class="flex gap-3">
        <button class="glass-btn">
          <span class="text-sm font-medium">Today</span>
          <IconChevronDown :size="16" class="text-gray-500" />
        </button>
        <button class="export-btn">
          <IconDownload :size="18" />
          <span class="text-sm font-medium">Export</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-container mb-6">
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
    <div class="space-y-6">
      <!-- 1. ACQUISITION, KYC & ACTIVATION -->
      <div v-show="activeTab === 'acquisition'">
        <h3 class="category-title">Acquisition, KYC & Activation</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Nouveaux Inscrits" :value="formatNumber(acquisition.newRegistrations)" :trend="12.5" variant="blue" iconType="customers" />
          <KpiCard title="Activations" :value="formatNumber(acquisition.activations)" :trend="15.2" variant="green" iconType="sales" />
          <KpiCard title="Taux d'Activation" :value="`${acquisition.activationRate}%`" :trend="2.1" variant="purple" iconType="products" />
          <KpiCard title="Réactivations" :value="formatNumber(acquisition.reactivations)" :trend="8.3" variant="orange" iconType="orders" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Inscriptions par Canal</h4>
            <BarChart :data="acquisitionChannelData" :height="250" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">KYC par Palier</h4>
            <BarChart :data="kycLevelsData" :height="250" />
          </div>
        </div>

        <div class="chart-card">
          <h4 class="chart-title">Conversion J+N (Cohortes)</h4>
          <LineChart :data="cohortConversionData" :height="300" />
        </div>
      </div>

      <!-- 2. UTILISATION & RÉTENTION -->
      <div v-show="activeTab === 'retention'">
        <h3 class="category-title">Utilisation & Rétention</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="DAU" :value="formatNumber(retention.dau)" :trend="5.8" variant="purple" iconType="customers" />
          <KpiCard title="WAU" :value="formatNumber(retention.wau)" :trend="7.2" variant="blue" iconType="sales" />
          <KpiCard title="MAU" :value="formatNumber(retention.mau)" :trend="9.1" variant="green" iconType="products" />
          <KpiCard title="Taux d'Activité" :value="`${retention.activityRate}%`" :trend="3.5" variant="orange" iconType="orders" />
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
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Transactions Total" :value="formatNumber(transactions.total)" :trend="11.3" variant="blue" iconType="sales" />
          <KpiCard title="Taux de Succès" :value="`${transactions.successRate}%`" :trend="1.2" variant="green" iconType="products" />
          <KpiCard title="Taux d'Échec" :value="`${transactions.failureRate}%`" :trend="-0.8" variant="orange" iconType="orders" />
          <KpiCard title="Volume Total" :value="formatCurrency(transactions.totalVolume)" :trend="14.7" variant="purple" iconType="customers" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Transactions par Produit</h4>
            <BarChart :data="transactionsByProductData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Taux de Succès par Produit</h4>
            <BarChart :data="successRateByProductData" :height="300" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Pacing Horaire (vs Objectif)</h4>
            <LineChart :data="pacingData" :height="250" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Distribution Heures de Pointe</h4>
            <div class="heatmap-container">
              <div class="text-sm text-gray-600 mb-2">Heatmap : Heure × Jour</div>
              <div class="grid grid-cols-8 gap-1 text-xs">
                <div></div>
                <div class="text-center font-medium">Lun</div>
                <div class="text-center font-medium">Mar</div>
                <div class="text-center font-medium">Mer</div>
                <div class="text-center font-medium">Jeu</div>
                <div class="text-center font-medium">Ven</div>
                <div class="text-center font-medium">Sam</div>
                <div class="text-center font-medium">Dim</div>
                <template v-for="hour in peakHours" :key="hour.hour">
                  <div class="text-right pr-2 font-medium">{{ hour.hour }}h</div>
                  <div v-for="(val, idx) in hour.days" :key="idx" 
                       :style="{ backgroundColor: getHeatmapColor(val) }"
                       class="h-8 rounded flex items-center justify-center">
                    {{ val }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h4 class="chart-title mb-4">Motifs d'Échec</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="reason in failureReasons" :key="reason.type" class="failure-card">
              <div class="flex justify-between items-start mb-2">
                <span class="text-sm font-medium text-gray-700">{{ reason.type }}</span>
                <span class="text-lg font-bold text-error-600">{{ reason.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-error-500 h-2 rounded-full" :style="{ width: reason.percentage + '%' }"></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ formatNumber(reason.count) }} échecs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. REVENUS & RENTABILITÉ -->
      <div v-show="activeTab === 'revenue'">
        <h3 class="category-title">Revenus & Rentabilité</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Revenus Totaux" :value="formatCurrency(revenue.total)" :trend="15.8" variant="green" iconType="sales" />
          <KpiCard title="Take-Rate Global" :value="`${revenue.takeRate}%`" :trend="0.5" variant="blue" iconType="products" />
          <KpiCard title="ARPU" :value="formatCurrency(revenue.arpu)" :trend="7.2" variant="purple" iconType="customers" />
          <KpiCard title="ARPAT" :value="formatCurrency(revenue.arpat)" :trend="9.1" variant="orange" iconType="orders" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Revenus par Produit</h4>
            <BarChart :data="revenueByProductData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Revenus par Canal</h4>
            <BarChart :data="revenueByChannelData" :height="300" />
          </div>
        </div>

        <div class="chart-card mb-6">
          <h4 class="chart-title">Comparatifs Revenus (D-1, MoM, YoY)</h4>
          <BarChart :data="revenueComparisonsData" :height="250" />
        </div>

        <div class="chart-card">
          <h4 class="chart-title mb-4">Contribution par Produit</h4>
          <div class="space-y-3">
            <div v-for="product in revenueContribution" :key="product.name" class="contribution-bar">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ product.name }}</span>
                <span class="text-sm font-bold">{{ product.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full" :style="{ width: product.percentage + '%', backgroundColor: product.color }"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>{{ formatCurrency(product.revenue) }}</span>
                <span class="text-success-600">+{{ product.growth }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. MERCHANTS & QR -->
      <div v-show="activeTab === 'merchants'">
        <h3 class="category-title">Merchants & QR</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Marchands Actifs" :value="formatNumber(merchants.active)" :trend="18.5" variant="purple" iconType="sales" />
          <KpiCard title="Transactions QR" :value="formatNumber(merchants.qrTransactions)" :trend="22.3" variant="blue" iconType="products" />
          <KpiCard title="Montant QR" :value="formatCurrency(merchants.qrAmount)" :trend="25.7" variant="green" iconType="orders" />
          <KpiCard title="Ticket Moyen QR" :value="formatCurrency(merchants.avgTicket)" :trend="3.2" variant="orange" iconType="customers" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Top Marchands par Volume</h4>
            <BarChart :data="topMerchantsData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Taux d'Acceptation QR</h4>
            <LineChart :data="qrAcceptanceData" :height="300" />
          </div>
        </div>

        <div class="chart-card">
          <h4 class="chart-title mb-4">Densité Géographique Marchands</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="region in merchantDensity" :key="region.name" class="region-card">
              <div class="text-lg font-bold text-gray-900">{{ region.name }}</div>
              <div class="text-3xl font-bold text-primary-600 my-2">{{ formatNumber(region.merchants) }}</div>
              <div class="text-sm text-gray-600">marchands actifs</div>
              <div class="flex items-center gap-2 mt-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary-500 h-2 rounded-full" :style="{ width: region.density + '%' }"></div>
                </div>
                <span class="text-xs text-gray-500">{{ region.density }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. RÉSEAU AGENTS (PDV) -->
      <div v-show="activeTab === 'agents'">
        <h3 class="category-title">Réseau d'Agents & Liquidité</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Agents Actifs" :value="formatNumber(agents.active)" :trend="12.1" variant="blue" iconType="customers" />
          <KpiCard title="Cash-In/Out Ratio" :value="`${agents.cashRatio}`" :trend="0" variant="green" iconType="products" />
          <KpiCard title="Stock Float Moyen" :value="formatCurrency(agents.avgFloat)" :trend="5.3" variant="purple" iconType="sales" />
          <KpiCard title="Délai Réappro (h)" :value="`${agents.reloadTime}h`" :trend="-8.2" variant="orange" iconType="orders" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Cash-In vs Cash-Out par Zone</h4>
            <BarChart :data="cashInOutByZoneData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Tensions de Liquidité</h4>
            <LineChart :data="liquidityTensionData" :height="300" />
          </div>
        </div>

        <div class="chart-card">
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
                <tr v-for="(agent, idx) in topAgents" :key="agent.id">
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
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="USSD" :value="`${channels.ussdShare}%`" :trend="2.1" variant="blue" iconType="sales" />
          <KpiCard title="App Mobile" :value="`${channels.appShare}%`" :trend="15.8" variant="green" iconType="products" />
          <KpiCard title="API" :value="`${channels.apiShare}%`" :trend="8.3" variant="purple" iconType="orders" />
          <KpiCard title="STK Push" :value="`${channels.stkShare}%`" :trend="-3.2" variant="orange" iconType="customers" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Part Transactions par Canal</h4>
            <BarChart :data="channelDistributionData" :height="300" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title">Taux de Succès par Canal</h4>
            <BarChart :data="channelSuccessRateData" :height="300" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h4 class="chart-title">Temps Moyen d'Exécution (ms)</h4>
            <BarChart :data="channelLatencyData" :height="250" />
          </div>
          <div class="chart-card">
            <h4 class="chart-title mb-4">Métriques par Canal</h4>
            <div class="space-y-4">
              <div v-for="channel in channelMetrics" :key="channel.name" class="channel-metric-card">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import { IconDownload, IconChevronDown } from '@/components/icons/Icons.vue'

// Active tab
const activeTab = ref('acquisition')

const tabs = [
  { id: 'acquisition', label: 'Acquisition & KYC' },
  { id: 'retention', label: 'Rétention' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'revenue', label: 'Revenus' },
  { id: 'merchants', label: 'Merchants' },
  { id: 'agents', label: 'Agents' },
  { id: 'channels', label: 'Canaux' }
]

// 1. ACQUISITION DATA
const acquisition = ref({
  newRegistrations: 12450,
  activations: 8920,
  activationRate: 71.6,
  reactivations: 1540
})

const acquisitionChannelData = ref({
  labels: ['USSD', 'App', 'PDV', 'Web'],
  datasets: [{
    label: 'Inscriptions',
    data: [5200, 4800, 2100, 350],
    backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
  }]
})

const kycLevelsData = ref({
  labels: ['Basic', 'Standard', 'Full'],
  datasets: [{
    label: 'Comptes',
    data: [6500, 4200, 1750],
    backgroundColor: ['#FBBF24', '#22D3EE', '#10B981']
  }]
})

const cohortConversionData = ref({
  labels: ['J+1', 'J+7', 'J+14', 'J+30'],
  datasets: [{
    label: 'Taux de Conversion',
    data: [45, 62, 71, 78],
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    tension: 0.4
  }]
})

// 2. RETENTION DATA
const retention = ref({
  dau: 28450,
  wau: 85200,
  mau: 245800,
  activityRate: 68.5
})

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

const retentionCohorts = ref([
  { week: 'S-4', w0: 100, w1: 68, w2: 52, w3: 45, w4: 42 },
  { week: 'S-3', w0: 100, w1: 71, w2: 55, w3: 48, w4: 44 },
  { week: 'S-2', w0: 100, w1: 74, w2: 58, w3: 51, w4: 47 },
  { week: 'S-1', w0: 100, w1: 76, w2: 61, w3: 53, w4: null },
  { week: 'S0', w0: 100, w1: 78, w2: null, w3: null, w4: null }
])

// 3. TRANSACTIONS DATA
const transactions = ref({
  total: 458920,
  successRate: 96.8,
  failureRate: 3.2,
  totalVolume: 12500000000
})

const transactionsByProductData = ref({
  labels: ['P2P', 'Cash-in', 'Cash-out', 'Airtime', 'Data', 'Bills', 'Merchant'],
  datasets: [{
    label: 'Transactions',
    data: [125000, 98000, 87000, 76000, 42000, 18000, 12920],
    backgroundColor: ['#0EA5E9', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6', '#6366F1']
  }]
})

const successRateByProductData = ref({
  labels: ['P2P', 'Cash-in', 'Cash-out', 'Airtime', 'Data', 'Bills', 'Merchant'],
  datasets: [{
    label: 'Taux de Succès (%)',
    data: [98.2, 97.5, 96.1, 95.8, 94.2, 97.8, 96.5],
    backgroundColor: '#10B981'
  }]
})

const pacingData = ref({
  labels: ['00h', '04h', '08h', '12h', '16h', '20h', '24h'],
  datasets: [
    {
      label: 'Réalisé',
      data: [5, 12, 28, 52, 75, 92, 100],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    },
    {
      label: 'Objectif',
      data: [4, 10, 25, 50, 75, 90, 100],
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      borderDash: [5, 5]
    }
  ]
})

const peakHours = ref([
  { hour: '08', days: [45, 52, 48, 51, 55, 42, 38] },
  { hour: '12', days: [78, 82, 79, 85, 88, 65, 58] },
  { hour: '14', days: [92, 95, 91, 96, 98, 72, 65] },
  { hour: '18', days: [85, 88, 86, 89, 91, 78, 72] },
  { hour: '20', days: [68, 72, 70, 74, 76, 82, 85] }
])

const failureReasons = ref([
  { type: 'Solde Insuffisant', percentage: 42, count: 6580 },
  { type: 'Timeout', percentage: 28, count: 4390 },
  { type: 'Limite KYC', percentage: 15, count: 2350 },
  { type: 'Erreur Réseau', percentage: 10, count: 1570 },
  { type: 'Erreur SMS', percentage: 3, count: 470 },
  { type: 'Autres', percentage: 2, count: 310 }
])

// 4. REVENUE DATA
const revenue = ref({
  total: 450000000,
  takeRate: 1.85,
  arpu: 1850,
  arpat: 2420
})

const revenueByProductData = ref({
  labels: ['P2P', 'Cash-in', 'Cash-out', 'Airtime', 'Bills', 'Merchant'],
  datasets: [{
    label: 'Revenus (M XOF)',
    data: [125, 98, 87, 76, 42, 22],
    backgroundColor: '#10B981'
  }]
})

const revenueByChannelData = ref({
  labels: ['USSD', 'App', 'API', 'STK'],
  datasets: [{
    label: 'Revenus (M XOF)',
    data: [220, 145, 65, 20],
    backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
  }]
})

const revenueComparisonsData = ref({
  labels: ['D-1', 'Aujourd\'hui', 'MoM', 'YoY'],
  datasets: [{
    label: 'Variation (%)',
    data: [12.5, 0, 18.3, 45.7],
    backgroundColor: ['#14B8A6', '#0EA5E9', '#A855F7', '#10B981']
  }]
})

const revenueContribution = ref([
  { name: 'P2P', revenue: 125000000, percentage: 28, growth: 15.2, color: '#0EA5E9' },
  { name: 'Cash-in', revenue: 98000000, percentage: 22, growth: 12.8, color: '#10B981' },
  { name: 'Cash-out', revenue: 87000000, percentage: 19, growth: 18.5, color: '#F59E0B' },
  { name: 'Airtime', revenue: 76000000, percentage: 17, growth: 8.3, color: '#A855F7' },
  { name: 'Bills', revenue: 42000000, percentage: 9, growth: 22.1, color: '#EC4899' },
  { name: 'Merchant', revenue: 22000000, percentage: 5, growth: 35.7, color: '#6366F1' }
])

// 5. MERCHANTS DATA
const merchants = ref({
  active: 8540,
  qrTransactions: 42580,
  qrAmount: 2850000000,
  avgTicket: 66950
})

const topMerchantsData = ref({
  labels: ['Shop A', 'Shop B', 'Shop C', 'Shop D', 'Shop E'],
  datasets: [{
    label: 'Volume (M XOF)',
    data: [450, 380, 320, 285, 245],
    backgroundColor: '#A855F7'
  }]
})

const qrAcceptanceData = ref({
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  datasets: [{
    label: 'Taux d\'Acceptation (%)',
    data: [78, 82, 85, 88],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.4
  }]
})

const merchantDensity = ref([
  { name: 'Dakar', merchants: 3580, density: 85 },
  { name: 'Thiès', merchants: 1240, density: 45 },
  { name: 'Saint-Louis', merchants: 890, density: 32 },
  { name: 'Kaolack', merchants: 745, density: 28 },
  { name: 'Ziguinchor', merchants: 520, density: 18 },
  { name: 'Autres', merchants: 1565, density: 25 }
])

// 6. AGENTS DATA
const agents = ref({
  active: 4580,
  cashRatio: '1.42',
  avgFloat: 2850000,
  reloadTime: 18
})

const cashInOutByZoneData = ref({
  labels: ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack'],
  datasets: [
    { label: 'Cash-In', data: [2200, 1500, 980, 850], backgroundColor: '#10B981' },
    { label: 'Cash-Out', data: [1550, 1050, 690, 600], backgroundColor: '#F59E0B' }
  ]
})

const liquidityTensionData = ref({
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Niveau de Tension (%)',
    data: [15, 18, 22, 28, 35, 42, 25],
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    tension: 0.4
  }]
})

const topAgents = ref([
  { id: 'AG-1234', zone: 'Dakar Centre', volume: 45000000, revenue: 850000, growth: 22.5, reliability: 98.5 },
  { id: 'AG-1189', zone: 'Plateau', volume: 42000000, revenue: 820000, growth: 18.3, reliability: 97.2 },
  { id: 'AG-1445', zone: 'Medina', volume: 38500000, revenue: 750000, growth: 25.1, reliability: 96.8 },
  { id: 'AG-1678', zone: 'Parcelles', volume: 35000000, revenue: 680000, growth: 15.7, reliability: 98.1 },
  { id: 'AG-1892', zone: 'Grand Yoff', volume: 32000000, revenue: 620000, growth: 28.4, reliability: 95.3 },
  { id: 'AG-2045', zone: 'Thiès', volume: 28500000, revenue: 550000, growth: 12.9, reliability: 97.5 },
  { id: 'AG-2234', zone: 'Rufisque', volume: 25000000, revenue: 485000, growth: 19.2, reliability: 96.1 },
  { id: 'AG-2456', zone: 'Guédiawaye', volume: 22000000, revenue: 425000, growth: 31.5, reliability: 94.8 },
  { id: 'AG-2678', zone: 'Pikine', volume: 20000000, revenue: 390000, growth: 16.3, reliability: 97.8 },
  { id: 'AG-2891', zone: 'Saint-Louis', volume: 18500000, revenue: 365000, growth: 22.1, reliability: 95.9 }
])

// 7. CHANNELS DATA
const channels = ref({
  ussdShare: 48.5,
  appShare: 32.8,
  apiShare: 12.4,
  stkShare: 6.3
})

const channelDistributionData = ref({
  labels: ['USSD', 'App', 'API', 'STK'],
  datasets: [{
    label: 'Part de Marché (%)',
    data: [48.5, 32.8, 12.4, 6.3],
    backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
  }]
})

const channelSuccessRateData = ref({
  labels: ['USSD', 'App', 'API', 'STK'],
  datasets: [{
    label: 'Taux de Succès (%)',
    data: [95.2, 97.8, 98.5, 94.1],
    backgroundColor: '#10B981'
  }]
})

const channelLatencyData = ref({
  labels: ['USSD', 'App', 'API', 'STK'],
  datasets: [{
    label: 'Latence Moyenne (ms)',
    data: [1850, 450, 280, 2100],
    backgroundColor: ['#0EA5E9', '#10B981', '#A855F7', '#F59E0B']
  }]
})

const channelMetrics = ref([
  { name: 'USSD', successRate: 95.2, latency: 1850, volume: 222500, status: 'success' },
  { name: 'App Mobile', successRate: 97.8, latency: 450, volume: 150500, status: 'success' },
  { name: 'API', successRate: 98.5, latency: 280, volume: 56900, status: 'success' },
  { name: 'STK Push', successRate: 94.1, latency: 2100, volume: 28900, status: 'warning' }
])

// Helper functions
const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)
const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
}).format(value)

const getHeatmapColor = (value) => {
  if (!value) return '#F3F4F6'
  if (value >= 80) return '#10B981'
  if (value >= 60) return '#22D3EE'
  if (value >= 40) return '#FBBF24'
  if (value >= 20) return '#F59E0B'
  return '#EF4444'
}
</script>

<style scoped>
@import './views-styles.css';

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
  border-color: rgba(91, 95, 237, 0.3);
}

.tab-active {
  background: linear-gradient(135deg, rgba(91, 95, 237, 0.9), rgba(74, 78, 217, 0.9)) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(91, 95, 237, 0.3);
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

.failure-card {
  @apply p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all;
}

.contribution-bar {
  @apply p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all;
}

.region-card {
  @apply p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all text-center;
}

.channel-metric-card {
  @apply p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all;
}

.heatmap-container {
  @apply p-4;
}
</style>
