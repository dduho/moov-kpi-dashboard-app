<template>
  <div class="date-range-filter">
    <select v-model="selectedPreset" @change="handlePresetChange" class="form-select">
      <option v-for="preset in presets" :key="preset.value" :value="preset.value">
        {{ preset.label }}
      </option>
    </select>

    <div v-if="selectedPreset === 'custom'" class="flex gap-2 mt-2">
      <input
        type="date"
        v-model="customStartDate"
        @change="handleCustomDateChange"
        class="form-input"
      />
      <input
        type="date"
        v-model="customEndDate"
        @change="handleCustomDateChange"
        class="form-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getDatePresets, getDateRangePreset, formatDateForAPI } from '@/utils/dateHelpers'

const emit = defineEmits(['change'])

const props = defineProps({
  defaultPreset: {
    type: String,
    default: 'J-7'
  }
})

const presets = getDatePresets()
const selectedPreset = ref(props.defaultPreset)
const customStartDate = ref('')
const customEndDate = ref('')

const handlePresetChange = () => {
  if (selectedPreset.value !== 'custom') {
    const { startDate, endDate } = getDateRangePreset(selectedPreset.value)
    emit('change', { startDate, endDate })
  }
}

const handleCustomDateChange = () => {
  if (customStartDate.value && customEndDate.value) {
    emit('change', {
      startDate: formatDateForAPI(customStartDate.value),
      endDate: formatDateForAPI(customEndDate.value)
    })
  }
}

// Initial emit
handlePresetChange()
</script>

<style scoped>
.form-select,
.form-input {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
