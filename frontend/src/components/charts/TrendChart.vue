<template>
  <div class="trend-chart-container" :style="{ height: height + 'px' }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.labels && value.datasets && Array.isArray(value.datasets)
    }
  },
  type: {
    type: String,
    default: 'line',
    validator: (value) => {
      return ['line', 'bar', 'area'].includes(value)
    }
  },
  height: {
    type: Number,
    default: 300
  },
  options: {
    type: Object,
    default: () => ({})
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  smooth: {
    type: Boolean,
    default: true
  }
})

const chartCanvas = ref(null)
let chart = null

const getChartType = () => {
  if (props.type === 'area') return 'line'
  return props.type
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        color: '#6B7280',
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: 12,
      borderRadius: 8,
      titleColor: '#fff',
      titleFont: {
        size: 13,
        weight: '600'
      },
      bodyColor: '#E5E7EB',
      bodyFont: {
        size: 12
      },
      displayColors: true,
      boxPadding: 4,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            // Format numbers with French locale
            label += new Intl.NumberFormat('fr-FR').format(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: props.showGrid,
        color: '#F3F4F6',
        borderDash: [5, 5],
        drawBorder: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        }
      }
    },
    y: {
      grid: {
        display: props.showGrid,
        color: '#F3F4F6',
        borderDash: [5, 5],
        drawBorder: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        callback: function(value) {
          // Format large numbers
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M'
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K'
          }
          return value
        }
      },
      beginAtZero: true
    }
  },
  elements: {
    line: {
      tension: props.smooth ? 0.4 : 0,
      borderWidth: 2.5
    },
    point: {
      radius: 3,
      hoverRadius: 6,
      hitRadius: 10,
      borderWidth: 2,
      backgroundColor: '#fff'
    },
    bar: {
      borderRadius: 6,
      borderSkipped: false
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
}

const prepareChartData = () => {
  const chartData = JSON.parse(JSON.stringify(props.data))

  // If type is 'area', add fill property to datasets
  if (props.type === 'area') {
    chartData.datasets = chartData.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)'
    }))
  }

  return chartData
}

const createChart = () => {
  if (!chartCanvas.value || !props.data) return

  const ctx = chartCanvas.value.getContext('2d')
  const mergedOptions = {
    ...defaultOptions,
    ...props.options,
    plugins: {
      ...defaultOptions.plugins,
      ...(props.options.plugins || {}),
      legend: {
        ...defaultOptions.plugins.legend,
        display: props.showLegend
      }
    },
    scales: {
      x: {
        ...defaultOptions.scales.x,
        grid: {
          ...defaultOptions.scales.x.grid,
          display: props.showGrid
        }
      },
      y: {
        ...defaultOptions.scales.y,
        grid: {
          ...defaultOptions.scales.y.grid,
          display: props.showGrid
        }
      }
    }
  }

  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(ctx, {
    type: getChartType(),
    data: prepareChartData(),
    options: mergedOptions
  })
}

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

watch([() => props.type, () => props.options, () => props.showLegend, () => props.showGrid], () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.trend-chart-container {
  position: relative;
  width: 100%;
}
</style>
