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
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
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
  const labels = Object.keys(props.data)
  const revenues = Object.values(props.data).map(item => item.revenue / 1000) // Convert to thousands

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue (K XOF)',
        data: revenues,
        backgroundColor: labels.map(label => getBusinessTypeColor(label)),
        borderColor: labels.map(label => getBusinessTypeColor(label)),
        borderWidth: 1
      }
    ]
  }

  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue by Business Type'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (K XOF)'
        }
      }
    }
  }

  const mergedOptions = { ...defaultOptions, ...props.options }

  chart = new ChartJS(ctx, {
    type: 'bar',
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

const getBusinessTypeColor = (businessType) => {
  const colors = {
    'B2B': '#FF6B6B',
    'B2C': '#4ECDC4',
    'AIRD': '#45B7D1',
    'MERCH': '#96CEB4',
    'P2P': '#FFEAA7',
    'BILL': '#DDA0DD',
    'TELCO': '#98D8C8',
    'BANK': '#F7DC6F',
    'IMT': '#BB8FCE'
  }
  return colors[businessType] || '#BDC3C7'
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