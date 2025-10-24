<template>
  <div class="dashboard">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-700">Today's Sales</h2>
        <p class="text-sm text-gray-500">Sales Summary</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm font-medium">Export</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
      <p class="text-error-700 mb-2">{{ error }}</p>
      <button @click="refreshData" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
        Retry
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Sales"
          :value="`$${formatNumber(kpiData.totalSales)}`"
          :trend="kpiData.salesTrend"
          variant="pink"
          iconType="sales"
        />
        <KpiCard
          title="Total Order"
          :value="formatNumber(kpiData.totalOrders)"
          :trend="kpiData.ordersTrend"
          variant="orange"
          iconType="orders"
        />
        <KpiCard
          title="Product Sold"
          :value="formatNumber(kpiData.productsSold)"
          :trend="kpiData.productsTrend"
          variant="green"
          iconType="products"
        />
        <KpiCard
          title="New Customers"
          :value="formatNumber(kpiData.newCustomers)"
          :trend="kpiData.customersTrend"
          variant="purple"
          iconType="customers"
        />
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Total Revenue Chart -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800">Total Revenue</h3>
            <div class="flex gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-chart-cyan"></span>
                <span class="text-gray-600">Online Sales</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-chart-teal"></span>
                <span class="text-gray-600">Offline Sales</span>
              </div>
            </div>
          </div>
          <BarChart :data="revenueChartData" :height="250" />
        </div>

        <!-- Visitor Insights Chart -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Visitor Insights</h3>
          <LineChart :data="visitorChartData" :height="250" />
          <div class="flex justify-center gap-6 mt-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-chart-purple"></span>
              <span class="text-gray-600">Loyal Customers</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-chart-pink"></span>
              <span class="text-gray-600">New Customers</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-chart-green"></span>
              <span class="text-gray-600">Unique Customers</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Customer Satisfaction -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Customer Satisfaction</h3>
          <LineChart :data="satisfactionChartData" :height="200" />
          <div class="flex justify-around mt-4">
            <div class="text-center">
              <p class="text-sm text-gray-500">Last Month</p>
              <p class="text-lg font-bold text-gray-900">$3,004</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">This Month</p>
              <p class="text-lg font-bold text-gray-900">$4,504</p>
            </div>
          </div>
        </div>

        <!-- Target vs Reality -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Target vs Reality</h3>
          <BarChart :data="targetChartData" :height="200" />
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 bg-chart-teal rounded-lg flex items-center justify-center text-white text-xs">📊</span>
                <div>
                  <p class="text-sm font-medium text-gray-700">Reality Sales</p>
                  <p class="text-xs text-gray-500">Global</p>
                </div>
              </div>
              <p class="font-bold text-gray-900">8,823</p>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 bg-chart-yellow rounded-lg flex items-center justify-center text-white text-xs">🎯</span>
                <div>
                  <p class="text-sm font-medium text-gray-700">Target Sales</p>
                  <p class="text-xs text-gray-500">Commercial</p>
                </div>
              </div>
              <p class="font-bold text-gray-900">12,122</p>
            </div>
          </div>
        </div>

        <!-- Volume vs Service Level -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Volume vs Service Level</h3>
          <BarChart :data="volumeChartData" :height="200" />
          <div class="flex justify-center gap-6 mt-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-chart-cyan"></span>
              <span class="text-gray-600">Volume (1,135)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-chart-teal"></span>
              <span class="text-gray-600">Services (635)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Products -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Top Products</h3>
          <div class="space-y-4">
            <div v-for="(product, index) in topProducts" :key="index" class="flex items-center gap-4">
              <span class="text-gray-500 font-medium w-8">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700 mb-1">{{ product.name }}</p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="`bg-chart-${product.color}`"
                    :style="{ width: product.popularity + '%' }"
                  ></div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ product.sales }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Mapping by Country -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-6">Sales Mapping by Country</h3>
          <div class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <p class="text-gray-500">World Map Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'

// State
const loading = ref(false)
const error = ref(null)

// KPI Data
const kpiData = ref({
  totalSales: 1000,
  salesTrend: 8,
  totalOrders: 300,
  ordersTrend: 5,
  productsSold: 5,
  productsTrend: 12,
  newCustomers: 8,
  customersTrend: 3
})

// Chart Data
const revenueChartData = ref({
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  datasets: [
    {
      label: 'Online Sales',
      data: [15, 25, 35, 30, 45, 35, 50],
      backgroundColor: '#22D3EE'
    },
    {
      label: 'Offline Sales',
      data: [10, 15, 20, 25, 15, 20, 25],
      backgroundColor: '#14B8A6'
    }
  ]
})

const visitorChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Loyal Customers',
      data: [300, 350, 400, 380, 450, 420, 500, 480, 520, 490, 550, 510],
      borderColor: '#A855F7',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      tension: 0.4
    },
    {
      label: 'New Customers',
      data: [200, 250, 280, 260, 320, 300, 350, 330, 380, 360, 400, 380],
      borderColor: '#EC4899',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      tension: 0.4
    },
    {
      label: 'Unique Customers',
      data: [250, 300, 350, 320, 380, 360, 420, 400, 450, 430, 480, 460],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    }
  ]
})

const satisfactionChartData = ref({
  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  datasets: [
    {
      label: 'Last Month',
      data: [120, 180, 150, 200, 170, 190, 160, 210, 180, 220, 190, 240],
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4
    },
    {
      label: 'This Month',
      data: [150, 200, 180, 230, 200, 250, 220, 280, 250, 300, 270, 320],
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      tension: 0.4
    }
  ]
})

const targetChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Target',
      data: [50, 45, 55, 48, 60, 52, 58, 55, 62, 57, 65, 60],
      backgroundColor: '#FBBF24'
    },
    {
      label: 'Reality',
      data: [45, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75],
      backgroundColor: '#14B8A6'
    }
  ]
})

const volumeChartData = ref({
  labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct'],
  datasets: [
    {
      label: 'Volume',
      data: [80, 90, 85, 75, 70, 90, 95, 85, 100],
      backgroundColor: '#22D3EE'
    },
    {
      label: 'Services',
      data: [60, 70, 65, 55, 50, 70, 75, 65, 80],
      backgroundColor: '#14B8A6'
    }
  ]
})

const topProducts = ref([
  { name: 'Home Decor Range', popularity: 85, sales: 45, color: 'cyan' },
  { name: 'Disney Princess Pink Bag 18', popularity: 70, sales: 29, color: 'teal' },
  { name: 'Bathroom Essentials', popularity: 55, sales: 18, color: 'purple' },
  { name: 'Apple Smartwatches', popularity: 40, sales: 25, color: 'orange' }
])

// Methods
const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const refreshData = () => {
  loading.value = true
  error.value = null

  // Simulate API call
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

onMounted(() => {
  // Load initial data
  refreshData()
})
</script>

<style scoped>
.dashboard {
  @apply max-w-full;
}
</style>
