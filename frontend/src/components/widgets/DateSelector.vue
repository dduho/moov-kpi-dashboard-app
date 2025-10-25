<template>
  <div class="date-selector">
    <button
      v-for="option in dateOptions"
      :key="option.value"
      @click="selectDate(option.value)"
      :class="['date-btn', { 'date-btn-active': selectedValue === option.value }]"
    >
      {{ option.label }}
    </button>

    <div class="custom-date-wrapper">
      <input
        type="date"
        v-model="customDate"
        @change="selectCustomDate"
        class="custom-date-input"
        :max="maxDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['dateChange'])

const selectedValue = ref('today')
const customDate = ref('')

const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const dateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' }
]

const getDateString = (daysAgo = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const selectDate = (value) => {
  selectedValue.value = value

  let dateParam = {}

  switch(value) {
    case 'today':
      dateParam = { date: getDateString(0) }
      break
    case 'yesterday':
      dateParam = { date: getDateString(1) }
      break
    case '7days':
      dateParam = {
        start_date: getDateString(7),
        end_date: getDateString(0)
      }
      break
    case '30days':
      dateParam = {
        start_date: getDateString(30),
        end_date: getDateString(0)
      }
      break
  }

  emit('dateChange', dateParam)
}

const selectCustomDate = () => {
  if (customDate.value) {
    selectedValue.value = 'custom'
    const dateStr = customDate.value.replace(/-/g, '')
    emit('dateChange', { date: dateStr })
  }
}

// Initialize with today
selectDate('yesterday')
</script>

<style scoped>
.date-selector {
  @apply flex gap-2 items-center flex-wrap;
}

.date-btn {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(229, 231, 235, 0.5);
  color: #6B7280;
}

.date-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(91, 95, 237, 0.3);
}

.date-btn-active {
  background: linear-gradient(135deg, rgba(91, 95, 237, 0.9), rgba(74, 78, 217, 0.9)) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(91, 95, 237, 0.3);
}

.custom-date-wrapper {
  @apply relative;
}

.custom-date-input {
  @apply px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300;
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(229, 231, 235, 0.5);
  color: #374151;
}

.custom-date-input:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(91, 95, 237, 0.3);
}

.custom-date-input:focus {
  outline: none;
  border-color: rgba(91, 95, 237, 0.6);
  box-shadow: 0 0 0 3px rgba(91, 95, 237, 0.1);
}
</style>
