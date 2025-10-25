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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already done
  authStore.initializeAuth()

  // If user tries to access login while already authenticated, send to dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // If not authenticated, redirect to login (preserve intended target)
    if (!authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // Check permission if specified
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      // Avoid redirecting to the same guarded route. Send user to login or an unauthorized page.
      // Using Login here keeps behavior simple; you may create a dedicated 'Unauthorized' view later.
      next({ name: 'Login' })
      return
    }
  }

  // Allow navigation
  next()
})

export default router