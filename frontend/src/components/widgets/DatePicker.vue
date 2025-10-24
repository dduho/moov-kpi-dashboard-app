<template>
  <div class="date-picker">
    <label for="date-input" class="date-label">Select Date:</label>
    <input
      id="date-input"
      type="date"
      :value="formattedDate"
      @input="handleDateChange"
      class="date-input"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateForAPI } from '@/utils/formatters'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['update:modelValue'])

const formattedDate = computed(() => {
  const date = props.modelValue
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const handleDateChange = (event) => {
  const selectedDate = new Date(event.target.value)
  emit('update:modelValue', selectedDate)
}
</script>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.date-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

@media (max-width: 768px) {
  .date-picker {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>