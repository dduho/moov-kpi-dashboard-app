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
  const isAdmin = computed(() => {
    const role = userRole.value?.toLowerCase()
    return role === 'admin' || role === 'administrator' || role === 'superadmin'
  })
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
    console.log('Auth store login called with credentials:', credentials)
    loading.value = true
    error.value = null

    try {
      console.log('Making axios POST request to /api/auth/login')
      const response = await axios.post('/api/auth/login', credentials)
      console.log('Axios response received:', response)

      if (response.data.success) {
        console.log('Login successful, processing response data')
        const { token: newToken, user: userData } = response.data.data

        // Store in state
        token.value = newToken
        user.value = userData

        // Store in localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        console.log('Login process completed successfully')
        return { success: true }
      } else {
        console.log('Login failed with response:', response.data)
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Auth store login error:', err)
      error.value = err.response?.data?.message || err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      console.log('Auth store login finally block executed')
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
    console.log('Checking permission:', permission)
    console.log('User:', user.value)
    console.log('User role:', userRole.value)
    console.log('Is admin:', isAdmin.value)
    console.log('User permissions:', userPermissions.value)

    if (!user.value || !user.value.role) {
      console.log('No user or role found, returning false')
      return false
    }

    // Admin has all permissions
    if (isAdmin.value) {
      console.log('User is admin, granting permission')
      return true
    }

    const hasPerm = userPermissions.value.some(p => p.name === permission)
    console.log('Permission check result:', hasPerm)
    return hasPerm
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