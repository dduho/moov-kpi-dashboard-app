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
        <p class="app-subtitle">Tableau de Bord KPI</p>
      </div>

      <!-- Login Form -->
      <form v-if="formReady" @submit.prevent="handleLogin" class="login-form" autocomplete="on">
        <div class="form-group">
          <label for="username" class="form-label">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="form.username"
            name="username"
            type="text"
            class="form-input"
            placeholder="Entrez votre nom d'utilisateur"
            autocomplete="username"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            class="form-input"
            placeholder="Entrez votre mot de passe"
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
          @click="console.log('Button clicked, loading value:', loading)"
          @mousedown.prevent
          @touchstart.prevent
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Demo Credentials -->
      <div class="demo-info">
        <p class="demo-title">Identifiants de démonstration :</p>
        <p class="demo-cred">Nom d'utilisateur : <strong>admin</strong></p>
        <p class="demo-cred">Mot de passe : <strong>p@ssw0rd</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
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

// Watch loading value changes
watch(loading, (newValue, oldValue) => {
  console.log('Loading value changed from', oldValue, 'to', newValue)
})

// Initialize form after component mount to ensure proper autofill compatibility
onMounted(() => {
  // Small delay to ensure DOM is fully ready for autofill extensions
  setTimeout(() => {
    formReady.value = true
  }, 100)
})

// NOTE: Redirection for authenticated users is handled centrally in the router guard.

const handleLogin = async (event) => {
  console.log('handleLogin called with form:', form.value, 'event:', event)

  // Prevent default form submission if event is provided
  if (event) {
    event.preventDefault()
  }

  if (!form.value.username || !form.value.password) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = ''
  console.log('Starting login process...')

  try {
    // Add a small delay to let extensions finish their checks
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('Delay completed, proceeding with login')

    // Add timeout to prevent infinite loading
    const loginPromise = authStore.login(form.value)
    console.log('Login promise created')

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        console.log('Login timeout reached')
        reject(new Error('Login request timed out'))
      }, 30000)
    )

    console.log('Starting Promise.race...')
    const result = await Promise.race([loginPromise, timeoutPromise])
    console.log('Promise.race resolved with result:', result)

    if (result.success) {
      console.log('Login successful, redirecting to dashboard')
      console.log('Current route before redirect:', router.currentRoute.value.path)
      console.log('Auth store isAuthenticated:', authStore.isAuthenticated)
      console.log('Auth store user:', authStore.user)

      try {
        // Redirect to dashboard - the store handles the state update
        await router.push('/')
        console.log('Router.push completed successfully')
        console.log('Current route after redirect:', router.currentRoute.value.path)
      } catch (routerError) {
        console.error('Router.push failed:', routerError)
      }
    } else {
      console.log('Login failed with error:', result.error)
      error.value = result.error || 'Échec de la connexion. Veuillez réessayer.'
    }
  } catch (err) {
    console.error('Login error caught:', err)
    if (err.message === 'Login request timed out') {
      error.value = 'Délai d\'attente de la requête de connexion dépassé. Veuillez vérifier votre connexion et réessayer.'
    } else {
      error.value = err.response?.data?.message || err.message || 'Échec de la connexion. Veuillez réessayer.'
    }
  } finally {
    console.log('Login process finished, setting loading to false')
    console.log('Loading value before setting to false:', loading.value)
    loading.value = false
    console.log('Loading value after setting to false:', loading.value)
    console.log('Auth store loading value:', authStore.loading)

    // Force reactivity update with multiple approaches
    nextTick(() => {
      console.log('After nextTick, loading value:', loading.value)
      // Additional force update
      loading.value = false
      console.log('After force update, loading value:', loading.value)
    })
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