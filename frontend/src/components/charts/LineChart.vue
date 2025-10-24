<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const chartCanvas = ref(null)
let chart = null

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')

  // Transform data for Chart.js
  const labels = props.data.map(item => `${item.hour}:00`)
  const transactions = props.data.map(item => item.transactions)
  const amounts = props.data.map(item => item.amount / 1000000) // Convert to millions
  const revenues = props.data.map(item => item.revenue / 1000) // Convert to thousands

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Transactions',
        data: transactions,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        yAxisID: 'y',
      },
      {
        label: 'Amount (M XOF)',
        data: amounts,
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        yAxisID: 'y1',
      },
      {
        label: 'Revenue (K XOF)',
        data: revenues,
        borderColor: '#ca8a04',
        backgroundColor: '#ca8a04',
        yAxisID: 'y1',
      }
    ]
  }

  const defaultOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Hourly Trends'
      },
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
          text: 'Amount/Revenue'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const mergedOptions = { ...defaultOptions, ...props.options }

  chart = new ChartJS(ctx, {
    type: 'line',
    data: chartData,
    options: mergedOptions
  })
}

const destroyChart = () => {
  if (chart) {
    chart.destroy()
    chart = null
  }
}

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

watch(() => props.data, () => {
  destroyChart()
  nextTick(() => {
    createChart()
  })
}, { deep: true })

watch(() => props.options, () => {
  if (chart) {
    chart.options = { ...chart.options, ...props.options }
    chart.update()
  }
}, { deep: true })
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>