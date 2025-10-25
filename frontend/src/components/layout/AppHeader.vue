<template>
  <header class="header-glass sticky top-0 z-30">
    <div class="flex items-center justify-between w-full">
      <!-- Page Title (Dynamic) -->
      <div class="flex items-center gap-4">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <!-- Right Section: Search, Language, Notifications, Profile -->
      <div class="flex items-center gap-4">
        <!-- Search Bar -->
        <div class="search-container hidden md:block">
          <IconSearch :size="20" class="search-icon" />
          <input
            type="text"
            placeholder="Search here..."
            class="search-input"
          />
        </div>

        <!-- Language Selector -->
        <button class="glass-btn hidden sm:flex">
          <img src="https://flagcdn.com/w20/us.png" alt="US Flag" class="w-5 h-5 rounded-sm" />
          <span class="text-sm font-medium text-gray-700">Eng (US)</span>
          <IconChevronDown :size="16" class="text-gray-500" />
        </button>

        <!-- Notifications -->
        <button class="icon-btn relative">
          <IconBell :size="22" class="text-gray-600" />
          <span class="notification-badge"></span>
        </button>

        <!-- User Profile -->
        <div class="profile-container" @click="toggleProfileMenu">
          <img
            :src="userAvatar"
            alt="User Avatar"
            class="profile-avatar"
          />
          <div class="profile-info hidden lg:flex">
            <span class="text-sm font-semibold text-gray-800">{{ user?.username || 'User' }}</span>
            <span class="text-xs text-gray-500 capitalize">{{ user?.role?.name || 'User' }}</span>
          </div>
          <IconChevronDown :size="16" class="text-gray-500 hidden lg:block" />
        </div>

        <!-- Profile Dropdown Menu -->
        <div v-if="showProfileMenu" class="profile-menu">
          <div class="profile-menu-item" @click="viewProfile">
            <IconUser :size="16" />
            <span>Profile</span>
          </div>
          <div class="profile-menu-item" @click="viewSettings">
            <IconSettings :size="16" />
            <span>Settings</span>
          </div>
          <div class="profile-menu-divider"></div>
          <div class="profile-menu-item text-red-600" @click="handleLogout">
            <IconLogout :size="16" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { IconSearch, IconBell, IconChevronDown, IconUser, IconSettings, IconLogout } from '@/components/icons/Icons.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showProfileMenu = ref(false)

// Get user from auth store
const user = computed(() => authStore.user)

// Generate avatar URL based on user ID or use default
const userAvatar = computed(() => {
  if (user.value?.id) {
    return `https://i.pravatar.cc/150?img=${user.value.id % 50 + 1}`
  }
  return 'https://i.pravatar.cc/150?img=12'
})

// Map routes to titles
const pageTitles = {
  '/': 'Dashboard',
  '/daily-kpis': 'Daily KPIs',
  '/hourly-kpis': 'Hourly KPIs',
  '/imt': 'IMT Transactions',
  '/revenue': 'Revenue',
  '/users': 'Users',
  '/reports': 'Reports'
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'Dashboard'
})

// Profile menu functions
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const viewProfile = () => {
  showProfileMenu.value = false
  // TODO: Navigate to profile page
  console.log('View profile')
}

const viewSettings = () => {
  showProfileMenu.value = false
  // TODO: Navigate to settings page
  console.log('View settings')
}

const handleLogout = async () => {
  showProfileMenu.value = false
  await authStore.logout()
}

// Close profile menu when clicking outside
const handleClickOutside = (event) => {
  const profileContainer = event.target.closest('.profile-container')
  const profileMenu = event.target.closest('.profile-menu')

  if (!profileContainer && !profileMenu) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Header with glassmorphism */
.header-glass {
  @apply h-16 flex items-center px-8 border-b;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(229, 231, 235, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

/* Page title */
.page-title {
  @apply text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent;
}

/* Search container with glass effect */
.search-container {
  @apply relative;
}

.search-input {
  @apply w-80 pl-11 pr-4 py-2.5 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.search-input:focus {
  @apply outline-none ring-2 ring-primary-500/30 border-primary-500/50;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 95, 237, 0.1);
}

.search-icon {
  @apply absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400;
}

/* Glass button */
.glass-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Icon button */
.icon-btn {
  @apply p-2.5 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Notification badge */
.notification-badge {
  @apply absolute top-1.5 right-1.5 w-2 h-2 bg-warning-500 rounded-full;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Profile container */
.profile-container {
  @apply flex items-center gap-3 ml-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 relative;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.profile-container:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-avatar {
  @apply w-10 h-10 rounded-full border-2 border-white shadow-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-info {
  @apply flex flex-col;
}

/* Profile dropdown menu */
.profile-menu {
  @apply absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50;
}

.profile-menu-item {
  @apply flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors;
}

.profile-menu-item:hover {
  @apply bg-gray-50;
}

.profile-menu-divider {
  @apply border-t border-gray-200 my-1;
}

/* Responsive */
@media (max-width: 768px) {
  .header-glass {
    @apply px-4;
  }

  .page-title {
    @apply text-xl;
  }
}
</style>

<style scoped>
/* Header with glassmorphism */
.header-glass {
  @apply h-16 flex items-center px-8 border-b;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(229, 231, 235, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

/* Page title */
.page-title {
  @apply text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent;
}

/* Search container with glass effect */
.search-container {
  @apply relative;
}

.search-input {
  @apply w-80 pl-11 pr-4 py-2.5 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.search-input:focus {
  @apply outline-none ring-2 ring-primary-500/30 border-primary-500/50;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 95, 237, 0.1);
}

.search-icon {
  @apply absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400;
}

/* Glass button */
.glass-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Icon button */
.icon-btn {
  @apply p-2.5 rounded-xl transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Notification badge */
.notification-badge {
  @apply absolute top-1.5 right-1.5 w-2 h-2 bg-warning-500 rounded-full;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Profile container */
.profile-container {
  @apply flex items-center gap-3 ml-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.profile-container:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-avatar {
  @apply w-10 h-10 rounded-full border-2 border-white shadow-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-info {
  @apply flex flex-col;
}

/* Responsive */
@media (max-width: 768px) {
  .header-glass {
    @apply px-4;
  }

  .page-title {
    @apply text-xl;
  }
}
</style>
