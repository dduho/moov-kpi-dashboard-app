<template>
  <div class="date-range-filter">
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
        placeholder="Date personnalisée"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['dateChange', 'update:startDate', 'update:endDate'])

const props = defineProps({
  defaultRange: {
    type: String,
    default: '7days'
  }
})

const selectedValue = ref(props.defaultRange)
const customDate = ref('')

const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const dateOptions = [
  { label: 'Aujourd\'hui', value: 'today' },
  { label: 'J-1', value: 'yesterday' },
  { label: 'J-7', value: '7days' },
  { label: 'Mois', value: 'month' },
  { label: '3 Mois', value: '3months' },
  { label: 'Année', value: 'year' }
]

const getDateString = (daysAgo = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const getDateStringFromDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const selectDate = (value) => {
  selectedValue.value = value

  let startDate = ''
  let endDate = getDateString(0)
  let dateParam = {}

  const today = new Date()

  switch(value) {
    case 'today':
      startDate = getDateString(0)
      endDate = getDateString(0)
      dateParam = { date: startDate }
      break

    case 'yesterday':
      startDate = getDateString(1)
      endDate = getDateString(1)
      dateParam = { date: startDate }
      break

    case '7days':
      startDate = getDateString(6)
      endDate = getDateString(0)
      dateParam = {
        start_date: startDate,
        end_date: endDate
      }
      break

    case 'month':
      // Premier jour du mois en cours
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      startDate = getDateStringFromDate(firstDayOfMonth)
      endDate = getDateString(0)
      dateParam = {
        start_date: startDate,
        end_date: endDate
      }
      break

    case '3months':
      // Il y a 3 mois
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(today.getMonth() - 3)
      startDate = getDateStringFromDate(threeMonthsAgo)
      endDate = getDateString(0)
      dateParam = {
        start_date: startDate,
        end_date: endDate
      }
      break

    case 'year':
      // Premier jour de l'année en cours
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
      startDate = getDateStringFromDate(firstDayOfYear)
      endDate = getDateString(0)
      dateParam = {
        start_date: startDate,
        end_date: endDate
      }
      break
  }

  emit('dateChange', dateParam)
  emit('update:startDate', startDate)
  emit('update:endDate', endDate)
}

const selectCustomDate = () => {
  if (customDate.value) {
    selectedValue.value = 'custom'
    const dateStr = customDate.value.replace(/-/g, '')
    const dateParam = { date: dateStr }

    emit('dateChange', dateParam)
    emit('update:startDate', dateStr)
    emit('update:endDate', dateStr)
  }
}

// Initialize with default range
onMounted(() => {
  selectDate(selectedValue.value)
})
</script>

<style scoped>
.date-range-filter {
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
  border-color: rgba(249, 115, 22, 0.3);
}

.date-btn-active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(234, 88, 12, 0.9)) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
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
  border-color: rgba(249, 115, 22, 0.3);
}

.custom-date-input:focus {
  outline: none;
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
</style>
