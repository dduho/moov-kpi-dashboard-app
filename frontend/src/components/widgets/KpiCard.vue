<template>
  <div class="kpi-card" :class="`bg-pastel-${variant}`">
    <!-- Icon Circle -->
    <div :class="`icon-circle icon-${variant}`">
      <component :is="iconComponent" class="w-6 h-6 text-white" />
    </div>

    <!-- Main Value -->
    <div class="main-value">{{ value }}</div>

    <!-- Title -->
    <div class="title">{{ title }}</div>

    <!-- Trend Indicator -->
    <div class="trend-indicator" :class="trendClass">
      <span class="trend-value">{{ trendIcon }}{{ Math.abs(trendPercentage) }}% from yesterday</span>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  previousValue: [String, Number],
  trend: [String, Number],
  variant: {
    type: String,
    default: 'pink', // pink, orange, green, purple, blue, yellow
    validator: (value) => ['pink', 'orange', 'green', 'purple', 'blue', 'yellow'].includes(value)
  },
  iconType: {
    type: String,
    default: 'sales' // sales, orders, products, customers
  }
})

const trendPercentage = computed(() => {
  return parseFloat(props.trend || 0).toFixed(0)
})

const trendClass = computed(() => {
  const trend = parseFloat(props.trend || 0)
  return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'
})

const trendIcon = computed(() => {
  const trend = parseFloat(props.trend || 0)
  return trend > 0 ? '↗' : trend < 0 ? '↘' : '→'
})

// Icon components based on iconType
const iconComponent = computed(() => {
  const icons = {
    sales: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z' })
    ]),
    orders: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z' })
    ]),
    products: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
    ]),
    customers: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' })
    ])
  }

  return icons[props.iconType] || icons.sales
})
</script>

<style scoped>
.kpi-card {
  @apply rounded-2xl p-6 transition-all duration-300 relative overflow-hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.kpi-card:hover::before {
  opacity: 1;
}

/* Pastel background colors with gradient */
.bg-pastel-pink {
  background: linear-gradient(135deg, #FFE2E5 0%, #FFD1D7 100%);
}

.bg-pastel-orange {
  background: linear-gradient(135deg, #FFF4DE 0%, #FFE9C5 100%);
}

.bg-pastel-green {
  background: linear-gradient(135deg, #DCFCE7 0%, #C6F6D5 100%);
}

.bg-pastel-purple {
  background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
}

.bg-pastel-blue {
  background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
}

.bg-pastel-yellow {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

/* Icon Circle with glass effect */
.icon-circle {
  @apply w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg relative;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

.icon-pink {
  background: linear-gradient(135deg, #FA5A7D, #FF7096);
  box-shadow: 0 4px 15px rgba(250, 90, 125, 0.3);
}

.icon-orange {
  background: linear-gradient(135deg, #FF947A, #FFA88F);
  box-shadow: 0 4px 15px rgba(255, 148, 122, 0.3);
}

.icon-green {
  background: linear-gradient(135deg, #3CD856, #4FE066);
  box-shadow: 0 4px 15px rgba(60, 216, 86, 0.3);
}

.icon-purple {
  background: linear-gradient(135deg, #BF83FF, #D09FFF);
  box-shadow: 0 4px 15px rgba(191, 131, 255, 0.3);
}

.icon-blue {
  background: linear-gradient(135deg, #0EA5E9, #38BDF8);
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
}

.icon-yellow {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

/* Main Value */
.main-value {
  @apply text-3xl font-bold text-gray-900 mb-1;
  background: linear-gradient(135deg, #1F2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Title */
.title {
  @apply text-sm font-medium text-gray-600 mb-2;
}

/* Trend Indicator */
.trend-indicator {
  @apply text-xs font-medium;
}

.trend-indicator.positive {
  @apply text-success-600;
}

.trend-indicator.negative {
  @apply text-error-600;
}

.trend-indicator.neutral {
  @apply text-gray-600;
}

.trend-value {
  @apply font-normal;
}

@media (max-width: 768px) {
  .kpi-card {
    @apply p-4;
  }

  .main-value {
    @apply text-2xl;
  }

  .icon-circle {
    @apply w-10 h-10;
  }
}
</style>