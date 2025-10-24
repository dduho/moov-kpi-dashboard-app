<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-screen bg-gradient-to-b from-primary-500 to-primary-700 text-white transition-all duration-300 z-40',
      isOpen ? 'w-64' : 'w-20'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center py-6 px-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V2.05c-5.05.5-9 4.76-9 9.95s3.95 9.45 9 9.95v-2.02z"/>
          </svg>
        </div>
        <span v-if="isOpen" class="text-xl font-bold">Dabang</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="mt-8">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'active': isActive(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="isOpen" class="ml-3 font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Pro Section (Bottom) -->
    <div v-if="isOpen" class="absolute bottom-6 left-4 right-4">
      <div class="bg-primary-800 rounded-2xl p-4 text-center">
        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 class="text-sm font-bold mb-1">Dabang Pro</h3>
        <p class="text-xs opacity-80 mb-3">Get access to all features on tetumbas</p>
        <button class="w-full bg-white text-primary-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition">
          Get Pro
        </button>
      </div>
    </div>

    <!-- Settings & Sign Out (Above Pro) -->
    <div class="absolute bottom-48 left-0 right-0 px-2 space-y-1">
      <router-link to="/settings" class="nav-item">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span v-if="isOpen" class="ml-3 font-medium">Settings</span>
      </router-link>
      <button class="nav-item w-full">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span v-if="isOpen" class="ml-3 font-medium">Sign Out</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(true)

const menuItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: 'IconDashboard'
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: 'IconLeaderboard'
  },
  {
    path: '/orders',
    label: 'Order',
    icon: 'IconOrders'
  },
  {
    path: '/daily',
    label: 'Products',
    icon: 'IconProducts'
  },
  {
    path: '/revenue',
    label: 'Sales Report',
    icon: 'IconSalesReport'
  },
  {
    path: '/reports',
    label: 'Messages',
    icon: 'IconMessages'
  }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-4 py-3 mx-2 rounded-xl text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 hover:text-opacity-100 transition-all cursor-pointer;
}

.nav-item.active {
  @apply bg-white bg-opacity-20 text-opacity-100 font-semibold;
}

/* Icons as functional components */
</style>

<!-- Icon Components -->
<script>
export const IconDashboard = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  `
}

export const IconLeaderboard = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  `
}

export const IconOrders = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  `
}

export const IconProducts = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  `
}

export const IconSalesReport = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  `
}

export const IconMessages = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
    </svg>
  `
}
</script>
