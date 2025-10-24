<template>
  <div class="dashboard">
    <Header
      title="KPI Dashboard"
      subtitle="Comprehensive business analytics and performance monitoring"
      @date-change="handleDateChange"
      @refresh="refreshData"
    />

    <!-- Loading State -->
    <v-row v-if="loading" class="mb-6">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="mt-4 text-h6">Loading dashboard data...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error" class="mb-6">
      <v-col cols="12">
        <v-alert type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn @click="refreshData" color="primary">
          <v-icon left>mdi-refresh</v-icon>
          Retry
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData">
      <!-- 1. Global KPIs Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="primary">mdi-view-dashboard</v-icon>
              <span class="text-h5">Global KPIs</span>
              <v-spacer />
              <v-chip color="info" variant="outlined">
                {{ formatDate(dashboardData.date) }}
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-4">
              <!-- Overview KPIs -->
              <v-row class="mb-6">
                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" color="primary" dark>
                    <v-icon size="48" class="mb-2">mdi-swap-horizontal</v-icon>
                    <div class="text-h4 font-weight-bold">{{ formatNumber(dashboardData.globalKpis?.overview?.totalTransactions?.current || 0) }}</div>
                    <div class="text-body-2">Total Transactions</div>
                    <v-chip
                      :color="dashboardData.globalKpis?.overview?.totalTransactions?.change >= 0 ? 'success' : 'error'"
                      size="small"
                      class="mt-2"
                      dark
                    >
                      {{ dashboardData.globalKpis?.overview?.totalTransactions?.change || 0 }}%
                    </v-chip>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" color="success" dark>
                    <v-icon size="48" class="mb-2">mdi-cash-multiple</v-icon>
                    <div class="text-h4 font-weight-bold">{{ formatCurrency(dashboardData.globalKpis?.overview?.totalVolume?.current || 0) }}</div>
                    <div class="text-body-2">Total Volume</div>
                    <v-chip
                      :color="dashboardData.globalKpis?.overview?.totalVolume?.change >= 0 ? 'success' : 'error'"
                      size="small"
                      class="mt-2"
                      dark
                    >
                      {{ dashboardData.globalKpis?.overview?.totalVolume?.change || 0 }}%
                    </v-chip>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" color="warning" dark>
                    <v-icon size="48" class="mb-2">mdi-trending-up</v-icon>
                    <div class="text-h4 font-weight-bold">{{ formatCurrency(dashboardData.globalKpis?.overview?.totalRevenue?.current || 0) }}</div>
                    <div class="text-body-2">Total Revenue</div>
                    <v-chip
                      :color="dashboardData.globalKpis?.overview?.totalRevenue?.change >= 0 ? 'success' : 'error'"
                      size="small"
                      class="mt-2"
                      dark
                    >
                      {{ dashboardData.globalKpis?.overview?.totalRevenue?.change || 0 }}%
                    </v-chip>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" :color="getSuccessRateColor(dashboardData.globalKpis?.overview?.successRate?.rate || 0)" dark>
                    <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-h4 font-weight-bold">{{ formatPercentage(dashboardData.globalKpis?.overview?.successRate?.rate || 0) }}</div>
                    <div class="text-body-2">Success Rate</div>
                    <div class="text-caption">
                      Failed: {{ formatNumber(dashboardData.globalKpis?.overview?.successRate?.failed || 0) }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Performance Indicators -->
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4" outlined>
                    <v-card-text class="text-center">
                      <v-icon color="info" size="32" class="mb-2">mdi-calculator</v-icon>
                      <div class="text-h6">{{ formatCurrency(dashboardData.globalKpis?.performance?.averageTransactionValue || 0) }}</div>
                      <div class="text-caption">Avg Transaction Value</div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4" outlined>
                    <v-card-text class="text-center">
                      <v-icon color="success" size="32" class="mb-2">mdi-percent</v-icon>
                      <div class="text-h6">{{ formatPercentage(dashboardData.globalKpis?.performance?.revenueRate || 0) }}</div>
                      <div class="text-caption">Revenue Rate</div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4" outlined>
                    <v-card-text class="text-center">
                      <v-icon color="warning" size="32" class="mb-2">mdi-hand-coin</v-icon>
                      <div class="text-h6">{{ formatPercentage(dashboardData.globalKpis?.performance?.commissionRate || 0) }}</div>
                      <div class="text-caption">Commission Rate</div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4" outlined>
                    <v-card-text class="text-center">
                      <v-icon color="error" size="32" class="mb-2">mdi-receipt</v-icon>
                      <div class="text-h6">{{ formatCurrency(dashboardData.globalKpis?.performance?.taxCollection || 0) }}</div>
                      <div class="text-caption">Tax Collection</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 2. Business Type KPIs -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="secondary">mdi-office-building</v-icon>
              <span class="text-h5">Business Type KPIs</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="businessTypeHeaders"
                :items="businessTypeItems"
                :items-per-page="5"
                class="elevation-1"
              >
                <template v-slot:item.successRate="{ item }">
                  <v-chip
                    :color="getSuccessRateColor(item.successRate)"
                    size="small"
                  >
                    {{ formatPercentage(item.successRate) }}
                  </v-chip>
                </template>
                <template v-slot:item.totalAmount="{ item }">
                  {{ formatCurrency(item.totalAmount) }}
                </template>
                <template v-slot:item.totalRevenue="{ item }">
                  {{ formatCurrency(item.totalRevenue) }}
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 3. Hourly KPIs -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="info">mdi-clock-outline</v-icon>
              <span class="text-h5">Hourly Distribution</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <LineChart
                v-if="hourlyTrendsData.labels && hourlyTrendsData.labels.length > 0"
                :data="hourlyTrendsData"
                :options="hourlyChartOptions"
              />
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-chart-line</v-icon>
                <p class="text-medium-emphasis mt-2">No hourly data available</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 4. International KPIs (IMT) -->
      <v-row class="mb-8">
        <v-col cols="12" lg="6">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="success">mdi-earth</v-icon>
              <span class="text-h5">International Transactions</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <BarChart
                v-if="imtByCountryData.labels && imtByCountryData.labels.length > 0"
                :data="imtByCountryData"
                :options="barChartOptions"
              />
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-chart-bar</v-icon>
                <p class="text-medium-emphasis mt-2">No IMT data available</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="warning">mdi-swap-horizontal-variant</v-icon>
              <span class="text-h5">IMT Flows</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="imtFlowHeaders"
                :items="imtFlowItems"
                :items-per-page="5"
                class="elevation-1"
              >
                <template v-slot:item.amount="{ item }">
                  {{ formatCurrency(item.amount) }}
                </template>
                <template v-slot:item.revenue="{ item }">
                  {{ formatCurrency(item.revenue) }}
                </template>
                <template v-slot:item.successRate="{ item }">
                  <v-chip
                    :color="getSuccessRateColor(item.successRate)"
                    size="small"
                  >
                    {{ formatPercentage(item.successRate) }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 5. User KPIs -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="primary">mdi-account-group</v-icon>
              <span class="text-h5">User Activity</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="blue" size="32" class="mb-2">mdi-account-check</v-icon>
                    <div class="text-h5">{{ formatNumber(dashboardData.userKpis?.activity?.dau?.current || 0) }}</div>
                    <div class="text-caption">Daily Active Users</div>
                    <v-chip
                      :color="dashboardData.userKpis?.activity?.dau?.trend?.direction === 'up' ? 'success' : 'error'"
                      size="small"
                      class="mt-2"
                    >
                      {{ dashboardData.userKpis?.activity?.dau?.trend?.change || 0 }}%
                    </v-chip>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="green" size="32" class="mb-2">mdi-account-multiple</v-icon>
                    <div class="text-h5">{{ formatNumber(dashboardData.userKpis?.activity?.mau?.current || 0) }}</div>
                    <div class="text-caption">Monthly Active Users</div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="orange" size="32" class="mb-2">mdi-account-plus</v-icon>
                    <div class="text-h5">{{ formatNumber(dashboardData.userKpis?.activity?.acquisition?.newUsers?.daily || 0) }}</div>
                    <div class="text-caption">New Users (Daily)</div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="purple" size="32" class="mb-2">mdi-cellphone-cog</v-icon>
                    <div class="text-h5">{{ formatNumber(dashboardData.userKpis?.activity?.appActivation?.activations || 0) }}</div>
                    <div class="text-caption">App Activations</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 6. Financial KPIs -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="success">mdi-finance</v-icon>
              <span class="text-h5">Revenue by Channel</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <BarChart
                v-if="revenueByChannelData.labels && revenueByChannelData.labels.length > 0"
                :data="revenueByChannelData"
                :options="barChartOptions"
              />
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-chart-bar</v-icon>
                <p class="text-medium-emphasis mt-2">No revenue data available</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 7. Quality KPIs -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="me-2" color="warning">mdi-quality-high</v-icon>
              <span class="text-h5">Transaction Quality</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon :color="getSuccessRateColor(dashboardData.qualityKpis?.transactionQuality?.global?.successRate || 0)" size="32" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-h5">{{ formatPercentage(dashboardData.qualityKpis?.transactionQuality?.global?.successRate || 0) }}</div>
                    <div class="text-caption">Global Success Rate</div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="error" size="32" class="mb-2">mdi-close-circle</v-icon>
                    <div class="text-h5">{{ formatPercentage(dashboardData.qualityKpis?.transactionQuality?.global?.failureRate || 0) }}</div>
                    <div class="text-caption">Failure Rate</div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="orange" size="32" class="mb-2">mdi-clock-alert</v-icon>
                    <div class="text-h5">{{ formatPercentage(dashboardData.qualityKpis?.transactionQuality?.global?.expiredRate || 0) }}</div>
                    <div class="text-caption">Expired Rate</div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-card class="pa-4 text-center" outlined>
                    <v-icon color="info" size="32" class="mb-2">mdi-alert-circle</v-icon>
                    <div class="text-h5">{{ formatNumber(dashboardData.qualityKpis?.failureAnalysis?.totalFailed || 0) }}</div>
                    <div class="text-caption">Total Failed</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Last Updated -->
      <v-row>
        <v-col cols="12" class="text-center">
          <v-chip color="grey" variant="outlined">
            Last updated: {{ formatDateTime(dashboardData.lastUpdated) }}
          </v-chip>
          <div class="text-caption text-medium-emphasis mt-2">
            Note: Data shown is from the previous day (available J+1 after collection)
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useKpiStore } from '@/stores/kpi'
import { formatNumber, formatCurrency, formatPercentage, getSuccessRateColor, formatDate, formatDateTime } from '@/utils/formatters'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import Header from '@/components/layout/Header.vue'

const kpiStore = useKpiStore()
const selectedDate = computed(() => kpiStore.selectedDate)
const dashboardData = computed(() => kpiStore.dashboardData)
const loading = computed(() => kpiStore.loading)
const error = computed(() => kpiStore.error)

// Business Type KPIs
const businessTypeHeaders = [
  { title: 'Business Type', key: 'businessType', align: 'start' },
  { title: 'Transactions', key: 'totalTrans', align: 'end' },
  { title: 'Success', key: 'totalSuccess', align: 'end' },
  { title: 'Amount', key: 'totalAmount', align: 'end' },
  { title: 'Revenue', key: 'totalRevenue', align: 'end' },
  { title: 'Success Rate', key: 'successRate', align: 'center' }
]

const businessTypeItems = computed(() => {
  if (!dashboardData.value?.businessTypeKpis) return []

  return Object.entries(dashboardData.value.businessTypeKpis).map(([type, data]) => ({
    businessType: type,
    totalTrans: data.totalTrans,
    totalSuccess: data.totalSuccess,
    totalAmount: data.totalAmount,
    totalRevenue: data.totalRevenue,
    successRate: data.successRate
  }))
})

// Hourly Trends Data
const hourlyTrendsData = computed(() => {
  if (!dashboardData.value?.charts?.hourlyTrends) return {}

  return {
    labels: dashboardData.value.charts.hourlyTrends.map(item => `${item.hour}:00`),
    datasets: [{
      label: 'Transactions',
      data: dashboardData.value.charts.hourlyTrends.map(item => item.transactions),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4
    }, {
      label: 'Amount',
      data: dashboardData.value.charts.hourlyTrends.map(item => item.amount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      yAxisID: 'y1'
    }]
  }
})

// IMT Data
const imtByCountryData = computed(() => {
  if (!dashboardData.value?.charts?.imtByCountry) return {}

  const countries = Object.keys(dashboardData.value.charts.imtByCountry)
  return {
    labels: countries,
    datasets: [{
      label: 'Transactions',
      data: countries.map(country => dashboardData.value.charts.imtByCountry[country].transactions),
      backgroundColor: '#2563eb'
    }, {
      label: 'Amount',
      data: countries.map(country => dashboardData.value.charts.imtByCountry[country].amount),
      backgroundColor: '#10b981'
    }]
  }
})

// IMT Flow Headers
const imtFlowHeaders = [
  { title: 'Flow Type', key: 'flow', align: 'start' },
  { title: 'Transactions', key: 'count', align: 'end' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Revenue', key: 'revenue', align: 'end' },
  { title: 'Success Rate', key: 'successRate', align: 'center' }
]

const imtFlowItems = computed(() => {
  if (!dashboardData.value?.imtKpis?.byFlow) return []

  return Object.entries(dashboardData.value.imtKpis.byFlow).map(([flow, data]) => ({
    flow,
    count: data.count,
    amount: data.amount,
    revenue: data.revenue,
    successRate: data.successRate
  }))
})

// Revenue by Channel Data
const revenueByChannelData = computed(() => {
  if (!dashboardData.value?.charts?.revenueByChannel) return {}

  return {
    labels: dashboardData.value.charts.revenueByChannel.map(item => item.channel),
    datasets: [{
      label: 'Revenue',
      data: dashboardData.value.charts.revenueByChannel.map(item => item.revenue),
      backgroundColor: '#2563eb'
    }, {
      label: 'Commission',
      data: dashboardData.value.charts.revenueByChannel.map(item => item.commission),
      backgroundColor: '#ef4444'
    }, {
      label: 'Tax',
      data: dashboardData.value.charts.revenueByChannel.map(item => item.tax),
      backgroundColor: '#f59e0b'
    }]
  }
})

// Chart Options
const hourlyChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Transactions'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Amount ($)'
      },
      grid: {
        drawOnChartArea: false,
      },
    }
  }
}

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

onMounted(async () => {
  await loadDashboardData()
})

watch(selectedDate, async (newDate) => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  await kpiStore.fetchDashboardData()
}

const handleDateChange = async (dates) => {
  if (dates && dates.length === 2) {
    await kpiStore.setDateRange(dates[0], dates[1])
  }
}

const refreshData = async () => {
  await loadDashboardData()
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>