<template>
  <div class="kpi-card" :class="cardColorClass">
    <div class="card-header">
      <div class="icon">
        {{ icon }}
      </div>
      <h4>{{ title }}</h4>
    </div>

    <div class="card-body">
      <div class="main-value">{{ value }}</div>

      <div class="trend-indicator" :class="trendClass">
        <span class="trend-icon">{{ trendIcon }}</span>
        <span class="trend-value">{{ trendPercentage }}%</span>
        <span class="trend-label">vs précédent</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="previous-value">Précédent: {{ previousValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getChangeIndicator } from '@/utils/formatters'

const props = defineProps({
  title: String,
  value: [String, Number],
  previousValue: [String, Number],
  trend: [String, Number],
  icon: String,
  color: String
})

const trendPercentage = computed(() => {
  return parseFloat(props.trend || 0).toFixed(2)
})

const trendClass = computed(() => {
  const trend = parseFloat(trendPercentage.value)
  return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'
})

const trendIcon = computed(() => {
  const trend = parseFloat(trendPercentage.value)
  return getChangeIndicator(trend)
})

const cardColorClass = computed(() => {
  if (props.color) return props.color
  return ''
})
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.icon {
  font-size: 1.5rem;
}

.card-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body {
  margin-bottom: 1rem;
}

.main-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.trend-indicator.positive {
  color: #16a34a;
}

.trend-indicator.negative {
  color: #dc2626;
}

.trend-indicator.neutral {
  color: #6b7280;
}

.trend-label {
  color: #9ca3af;
  font-weight: 400;
}

.card-footer {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.previous-value {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Color variants */
.kpi-card.success {
  border-left: 4px solid #16a34a;
}

.kpi-card.warning {
  border-left: 4px solid #ca8a04;
}

.kpi-card.error {
  border-left: 4px solid #dc2626;
}

@media (max-width: 768px) {
  .kpi-card {
    padding: 1rem;
  }

  .main-value {
    font-size: 1.5rem;
  }
}
</style>