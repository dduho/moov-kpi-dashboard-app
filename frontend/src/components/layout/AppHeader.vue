<template>
  <header class="bg-white border-b border-gray-200 h-16 flex items-center px-8 sticky top-0 z-30">
    <div class="flex items-center justify-between w-full">
      <!-- Page Title (Dynamic) -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
      </div>

      <!-- Right Section: Search, Language, Notifications, Profile -->
      <div class="flex items-center gap-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search here..."
            class="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Language Selector -->
        <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition">
          <img src="https://flagcdn.com/w20/us.png" alt="US Flag" class="w-5 h-5 rounded-sm" />
          <span class="text-sm font-medium text-gray-700">Eng (US)</span>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Notifications -->
        <button class="relative p-2 hover:bg-gray-50 rounded-lg transition">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <!-- Notification Badge -->
          <span class="absolute top-1 right-1 w-2 h-2 bg-warning-500 rounded-full"></span>
        </button>

        <!-- User Profile -->
        <div class="flex items-center gap-3 ml-2">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="User Avatar"
            class="w-10 h-10 rounded-full border-2 border-gray-200"
          />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-800">Musfiq</span>
            <span class="text-xs text-gray-500">Admin</span>
          </div>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Map routes to titles
const pageTitles = {
  '/': 'Dashboard',
  '/leaderboard': 'Leaderboard',
  '/orders': 'Orders',
  '/daily': 'Daily KPIs',
  '/hourly': 'Hourly KPIs',
  '/imt': 'IMT Transactions',
  '/revenue': 'Revenue',
  '/users': 'Active Users',
  '/reports': 'Reports',
  '/settings': 'Settings'
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'Dashboard'
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
