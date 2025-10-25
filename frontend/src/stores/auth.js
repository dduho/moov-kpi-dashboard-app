import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role?.name || null)
  const userPermissions = computed(() => user.value?.role?.permissions || [])
  const isAdmin = computed(() => userRole.value === 'admin')
  const isManager = computed(() => userRole.value === 'manager')

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    if (initialized.value) return // Already initialized

    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    initialized.value = true
  }

  // Login function
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/auth/login', credentials)

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data

        // Store in state
        token.value = newToken
        user.value = userData

        // Store in localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        return { success: true }
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    loading.value = true

    try {
      // Call logout endpoint if needed
      await axios.post('/api/auth/logout')
    } catch (err) {
      // Ignore logout errors
      console.warn('Logout API call failed:', err)
    } finally {
      // Clear local state
      token.value = null
      user.value = null

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Remove axios default header
      delete axios.defaults.headers.common['Authorization']

      loading.value = false

      // Note: Router navigation should be handled by the component calling logout
    }
  }

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user.value || !user.value.role) return false

    // Admin has all permissions
    if (isAdmin.value) return true

    return userPermissions.value.some(p => p.name === permission)
  }

  // Check if user has any of the permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  // Check if user has all permissions
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!token.value) return

    try {
      const response = await axios.get('/api/auth/profile')
      if (response.data.success) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      // If refresh fails, logout
      await logout()
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,

    // Computed
    isAuthenticated,
    userRole,
    userPermissions,
    isAdmin,
    isManager,

    // Actions
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshUser,
    initializeAuth
  }
})