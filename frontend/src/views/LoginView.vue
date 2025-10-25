<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-circle">
          <svg class="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V2.05c-5.05.5-9 4.76-9 9.95s3.95 9.45 9 9.95v-2.02z"/>
          </svg>
        </div>
        <h1 class="app-title">Moov Pulse</h1>
        <p class="app-subtitle">KPI Dashboard</p>
      </div>

      <!-- Login Form -->
      <form v-if="formReady" @submit.prevent="handleLogin" class="login-form" autocomplete="on">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            v-model="form.username"
            name="username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            autocomplete="username"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            autocomplete="current-password"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="login-btn"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Demo Credentials -->
      <div class="demo-info">
        <p class="demo-title">Demo Credentials:</p>
        <p class="demo-cred">Username: <strong>admin</strong></p>
        <p class="demo-cred">Password: <strong>p@ssw0rd</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const formReady = ref(false)

// Initialize form after component mount to ensure proper autofill compatibility
onMounted(() => {
  // Small delay to ensure DOM is fully ready for autofill extensions
  setTimeout(() => {
    formReady.value = true
  }, 100)
})

// NOTE: Redirection for authenticated users is handled centrally in the router guard.

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value)

    if (result.success) {
      // Redirect to dashboard - the store handles the state update
      router.push('/')
    } else {
      error.value = result.error || 'Login failed. Please try again.'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  @apply min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4;
}

.login-card {
  @apply bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-section {
  @apply text-center mb-8;
}

.logo-circle {
  @apply w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.app-title {
  @apply text-2xl font-bold text-gray-800 mb-1;
}

.app-subtitle {
  @apply text-sm text-gray-600;
}

.login-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200;
  background: rgba(255, 255, 255, 0.8);
}

.form-input:focus {
  @apply shadow-lg;
}

.login-btn {
  @apply w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg;
  background: linear-gradient(135deg, #5B5FE7 0%, #4A4ED9 100%);
}

.login-btn:hover:not(:disabled) {
  @apply shadow-xl;
  transform: translateY(-2px);
}

.login-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2;
}

.error-message {
  @apply mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm;
}

.demo-info {
  @apply mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.demo-title {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.demo-cred {
  @apply text-sm text-gray-600 mb-1;
}
</style>