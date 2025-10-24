import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import DailyKpiView from '../views/DailyKpiView.vue'
import HourlyKpiView from '../views/HourlyKpiView.vue'
import ImtView from '../views/ImtView.vue'
import RevenueView from '../views/RevenueView.vue'
import UsersView from '../views/UsersView.vue'
import ReportsView from '../views/ReportsView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/daily-kpis',
    name: 'Daily KPIs',
    component: DailyKpiView
  },
  {
    path: '/hourly-kpis',
    name: 'Hourly KPIs',
    component: HourlyKpiView
  },
  {
    path: '/imt',
    name: 'IMT',
    component: ImtView
  },
  {
    path: '/revenue',
    name: 'Revenue',
    component: RevenueView
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersView
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router