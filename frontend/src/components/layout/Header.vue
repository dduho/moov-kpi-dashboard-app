<template>
  <div class="page-header">
    <div class="page-title">
      <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
      <p class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
    </div>

    <div class="page-actions">
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            v-bind="props"
            :model-value="formattedDate"
            label="Select Date Range"
            prepend-icon="mdi-calendar"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="selectedDate"
          range
          @update:model-value="handleDateChange"
          :max="maxSelectableDate"
        >
          <template v-slot:default>
            <v-spacer />
            <v-btn variant="text" @click="dateMenu = false">Cancel</v-btn>
            <v-btn color="primary" variant="text" @click="dateMenu = false">OK</v-btn>
          </template>
          <template v-slot:header>
            <div class="pa-2 text-caption text-medium-emphasis">
              Note: Data is available from the next day after collection
            </div>
          </template>
        </v-date-picker>
      </v-menu>

      <v-btn
        color="primary"
        @click="refreshData"
        :loading="loading"
        prepend-icon="mdi-refresh"
        class="ml-3"
      >
        Refresh Data
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, subDays } from 'date-fns'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  subtitle: {
    type: String,
    default: 'Key Performance Indicators'
  }
})

const emit = defineEmits(['date-change', 'refresh'])

const dateMenu = ref(false)
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const selectedDate = ref([yesterday, yesterday])
const loading = ref(false)

const maxSelectableDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - 1) // Yesterday is the maximum selectable date
  return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
})

const formattedDate = computed(() => {
  if (!selectedDate.value || selectedDate.value.length !== 2) return ''
  const [start, end] = selectedDate.value
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
})

const handleDateChange = (dates) => {
  emit('date-change', dates)
  dateMenu.value = false
}

const refreshData = async () => {
  loading.value = true
  try {
    await emit('refresh')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-title h1 {
  margin-bottom: 0.25rem;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-actions {
    justify-content: center;
  }
}
</style>