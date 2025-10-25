<template>
  <div class="hourly-kpis">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Hourly KPIs</h2>
        <p class="section-subtitle">Hourly performance breakdown</p>
      </div>
      <button class="export-btn">
        <IconDownload :size="18" />
        <span class="text-sm font-medium">Export</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Peak Hour"
        value="14:00"
        :trend="0"
        variant="pink"
        iconType="sales"
      />
      <KpiCard
        title="Avg/Hour"
        :value="formatNumber(hourlyKpis.avgPerHour)"
        :trend="hourlyKpis.avgTrend"
        variant="orange"
        iconType="orders"
      />
      <KpiCard
        title="Total Today"
        :value="formatNumber(hourlyKpis.totalToday)"
        :trend="hourlyKpis.totalTrend"
        variant="green"
        iconType="products"
      />
      <KpiCard
        title="Current Hour"
        :value="formatNumber(hourlyKpis.currentHour)"
        :trend="hourlyKpis.currentTrend"
        variant="blue"
        iconType="customers"
      />
    </div>

    <div class="chart-card mb-6">
      <h3 class="chart-title">Hourly Distribution (Today)</h3>
      <LineChart :data="hourlyDistributionData" :height="350" />
    </div>

    <div class="chart-card">
      <h3 class="chart-title">Hourly Comparison (This Week)</h3>
      <BarChart :data="hourlyComparisonData" :height="300" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import LineChart from '@/components/charts/LineChart.simple.vue'
import BarChart from '@/components/charts/BarChart.simple.vue'
import { IconDownload } from '@/components/icons/Icons.vue'

const hourlyKpis = ref({
  avgPerHour: 1900,
  avgTrend: 8.5,
  totalToday: 42500,
  totalTrend: 11.3,
  currentHour: 2150,
  currentTrend: 6.2
})

const hourlyDistributionData = ref({
  labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
  datasets: [{
    label: 'Transactions',
    data: [150, 120, 100, 90, 110, 200, 450, 800, 1200, 1500, 1800, 2100, 2300, 2500, 2400, 2200, 2000, 1800, 1500, 1200, 900, 600, 400, 250],
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    tension: 0.4,
    fill: true
  }]
})

const hourlyComparisonData = ref({
  labels: ['00-03', '03-06', '06-09', '09-12', '12-15', '15-18', '18-21', '21-24'],
  datasets: [{
    label: 'Avg This Week',
    data: [250, 350, 1500, 5800, 7200, 6500, 3800, 1100],
    backgroundColor: '#22D3EE'
  }]
})

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)
</script>

<style scoped>
@import './views-styles.css';
</style>
