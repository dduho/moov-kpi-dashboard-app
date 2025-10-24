<template>
  <div class="heat-map">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, MatrixController, MatrixElement)

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const chartCanvas = ref(null)
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(chartCanvas.value, {
    type: 'matrix',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.heat-map {
  height: 400px;
  width: 100%;
}
</style>