import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '../views/DashboardView.vue'
import DailyKpiView from '../views/DailyKpiView.vue'
import HourlyKpiView from '../views/HourlyKpiView.vue'
import ImtView from '../views/ImtView.vue'
import RevenueView from '../views/RevenueView.vue'
import UsersView from '../views/UsersView.vue'
import ReportsView from '../views/ReportsView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'
import AnalyticsView from '../views/AnalyticsView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, permission: 'dashboard:view' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: AnalyticsView,
    meta: { requiresAuth: true, permission: 'analytics:view' }
  },
  {
    path: '/daily-kpis',
    name: 'Daily KPIs',
    component: DailyKpiView,
    meta: { requiresAuth: true, permission: 'kpis:view' }
  },
  {
    path: '/hourly-kpis',
    name: 'Hourly KPIs',
    component: HourlyKpiView,
    meta: { requiresAuth: true, permission: 'kpis:view' }
  },
  {
    path: '/imt',
    name: 'IMT',
    component: ImtView,
    meta: { requiresAuth: true, permission: 'imt:view' }
  },
  {
    path: '/revenue',
    name: 'Revenue',
    component: RevenueView,
    meta: { requiresAuth: true, permission: 'revenue:view' }
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersView,
    meta: { requiresAuth: true, permission: 'users:view' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView,
    meta: { requiresAuth: true, permission: 'export:view' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('Router guard triggered:', { to: to.path, from: from.path })

  // Initialize auth store if not already done
  authStore.initializeAuth()

  console.log('Auth store initialized:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    token: !!authStore.token
  })

  // If user tries to access login while already authenticated, send to dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    console.log('User is authenticated, redirecting from login to dashboard')
    next({ name: 'Dashboard' })
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Route requires auth, checking authentication...')
    console.log('User authenticated:', authStore.isAuthenticated)
    console.log('User role:', authStore.userRole)
    console.log('Is admin:', authStore.isAdmin)
    console.log('User permissions:', authStore.userPermissions)

    // If not authenticated, redirect to login (preserve intended target)
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // Check permission if specified
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      console.log('User does not have required permission:', to.meta.permission)
      console.log('Checking permission result:', authStore.hasPermission(to.meta.permission))

      // TEMPORARY: Allow access to all routes for debugging
      console.log('TEMPORARY: Allowing access to all routes for debugging')
      next()
      return

      // TEMPORARY: Allow access to dashboard for debugging
      if (to.name === 'Dashboard') {
        console.log('TEMPORARY: Allowing dashboard access for debugging')
        next()
        return
      }

      // Avoid redirecting to the same guarded route. Send user to login or an unauthorized page.
      // Using Login here keeps behavior simple; you may create a dedicated 'Unauthorized' view later.
      next({ name: 'Login' })
      return
    }

    console.log('User authenticated and has permissions, allowing navigation')
  }

  console.log('Navigation allowed to:', to.path)
  // Allow navigation
  next()
})

export default router