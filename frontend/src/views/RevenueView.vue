<template>
  <div class="revenue">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Revenue Analysis</h2>
        <p class="section-subtitle">Revenue breakdown by channel and source</p>
      </div>
      <button class="export-btn">
        <IconDownload :size="18" />
        <span class="text-sm font-medium">Export</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Total Revenue"
        :value="formatCurrency(revenueKpis.totalRevenue)"
        :trend="revenueKpis.revenueTrend"
        variant="green"
        iconType="sales"
      />
      <KpiCard
        title="Mobile Money"
        :value="formatCurrency(revenueKpis.mobileMoney)"
        :trend="revenueKpis.mobileMoneyTrend"
        variant="blue"
        iconType="orders"
      />
      <KpiCard
        title="Merchant"
        :value="formatCurrency(revenueKpis.merchant)"
        :trend="revenueKpis.merchantTrend"
        variant="purple"
        iconType="products"
      />
      <KpiCard
        title="Others"
        :value="formatCurrency(revenueKpis.others)"
        :trend="revenueKpis.othersTrend"
        variant="orange"
        iconType="customers"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="chart-card">
        <h3 class="chart-title">Revenue by Channel</h3>
        <BarChart :data="revenueByChannelData" :height="300" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Monthly Revenue Trend</h3>
        <LineChart :data="monthlyRevenueData" :height="300" />
      </div>
    </div>

    <div class="chart-card">
      <h3 class="chart-title mb-4">Channel Performance</h3>
      <div class="space-y-4">
        <div v-for="channel in channelPerformance" :key="channel.name" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: channel.color }"></div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ channel.name }}</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="h-2 rounded-full transition-all" :style="{ width: channel.percentage + '%', backgroundColor: channel.color }"></div>
              </div>
            </div>
          </div>
          <div class="text-right ml-4">
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(channel.revenue) }}</p>
            <p class="text-sm" :class="channel.growth >= 0 ? 'text-success-600' : 'text-error-600'">
              {{ channel.growth >= 0 ? '↗' : '↘' }} {{ Math.abs(channel.growth) }}%
            </p>
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

const revenueKpis = ref({
  totalRevenue: 450000000,
  revenueTrend: 15.3,
  mobileMoney: 280000000,
  mobileMoneyTrend: 18.2,
  merchant: 125000000,
  merchantTrend: 11.5,
  others: 45000000,
  othersTrend: 8.7
})

const revenueByChannelData = ref({
  labels: ['Mobile Money', 'Merchant', 'Bill Payment', 'IMT', 'Others'],
  datasets: [{
    label: 'Revenue (M XOF)',
    data: [280, 125, 68, 52, 45],
    backgroundColor: ['#10B981', '#A855F7', '#F59E0B', '#0EA5E9', '#EC4899']
  }]
})

const monthlyRevenueData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue (M XOF)',
    data: [380, 420, 410, 445, 430, 450],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.4,
    fill: true
  }]
})

const channelPerformance = ref([
  { name: 'Mobile Money', revenue: 280000000, percentage: 62, growth: 18.2, color: '#10B981' },
  { name: 'Merchant', revenue: 125000000, percentage: 28, growth: 11.5, color: '#A855F7' },
  { name: 'Bill Payment', revenue: 68000000, percentage: 15, growth: 9.3, color: '#F59E0B' },
  { name: 'IMT', revenue: 52000000, percentage: 12, growth: 14.1, color: '#0EA5E9' },
  { name: 'Others', revenue: 45000000, percentage: 10, growth: -2.5, color: '#EC4899' }
])

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0
}).format(value)
</script>

<style scoped>
@import './views-styles.css';
</style>
