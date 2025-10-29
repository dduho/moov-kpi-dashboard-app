<template>
  <aside
    :class="[
      'sidebar-glass fixed top-0 left-0 h-screen text-white transition-all duration-300 z-40 border-r border-white/10',
      isOpen ? 'w-64' : 'w-20'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between py-6 px-4">
      <div class="flex items-center gap-3">
        <div class="logo-circle">
          <svg class="w-6 h-6 text-secondary-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V2.05c-5.05.5-9 4.76-9 9.95s3.95 9.45 9 9.95v-2.02z"/>
          </svg>
        </div>
        <span v-if="isOpen" class="text-xl font-bold">Moov Pulse</span>
      </div>

      <!-- Burger Menu Button (Mobile) -->
      <button
        @click="toggleSidebar"
        class="lg:hidden burger-btn"
      >
        <IconX v-if="isOpen" :size="24" />
        <IconMenu v-else :size="24" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="mt-8 px-2">
      <router-link
        v-for="item in filteredMenuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'active': isActive(item.path) }"
      >
        <component :is="item.icon" :size="20" class="flex-shrink-0" />
        <span v-if="isOpen" class="ml-3 font-medium transition-all">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Settings & Sign Out -->
    <div class="absolute bottom-5 left-0 right-0 px-2 space-y-1">
      <router-link to="/settings" class="nav-item" v-if="hasPermission('system:settings')">
        <IconSettings :size="20" class="flex-shrink-0" />
        <span v-if="isOpen" class="ml-3 font-medium">Paramètres</span>
      </router-link>
      <button @click="handleLogout" class="nav-item w-full text-left">
        <IconLogout :size="20" class="flex-shrink-0" />
        <span v-if="isOpen" class="ml-3 font-medium">Déconnexion</span>
      </button>
    </div>

   

    <!-- Mobile Overlay -->
    <div
      v-if="isOpen"
      @click="toggleSidebar"
      class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
    ></div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  IconDashboard,
  IconLeaderboard,
  IconOrders,
  IconProducts,
  IconSalesReport,
  IconMessages,
  IconSettings,
  IconLogout,
  IconMenu,
  IconX,
  IconBadgeCheck
} from '@/components/icons/Icons.vue'

const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref(window.innerWidth >= 1024) // Closed on mobile by default

const menuItems = [
  {
    path: '/',
    label: 'Tableau de Bord',
    icon: IconDashboard,
    permission: 'dashboard:view'
  },
  {
    path: '/analytics',
    label: 'Analytics Avancés',
    icon: IconBadgeCheck,
    permission: 'analytics:view'
  },
  {
    path: '/daily-kpis',
    label: 'KPI Journaliers',
    icon: IconLeaderboard,
    permission: 'kpis:view'
  },
  {
    path: '/hourly-kpis',
    label: 'KPI Horaires',
    icon: IconSalesReport,
    permission: 'kpis:view'
  },
  {
    path: '/imt',
    label: 'IMT',
    icon: IconOrders,
    permission: 'imt:view'
  },
  {
    path: '/revenue',
    label: 'Revenus',
    icon: IconSalesReport,
    permission: 'revenue:view'
  },
  {
    path: '/users',
    label: 'Utilisateurs',
    icon: IconProducts,
    permission: 'users:view'
  },
  {
    path: '/reports',
    label: 'Rapports',
    icon: IconMessages,
    permission: 'export:view'
  }
]

// Filter menu items based on permissions
const filteredMenuItems = computed(() => {
  // TEMPORARILY DISABLE PERMISSION CHECKS FOR DEBUGGING
  console.log('🔍 SIDEBAR DEBUG: All menu items (permissions disabled)');
  console.log('Current user permissions:', authStore.permissions);
  console.log('Is admin:', authStore.isAdmin);
  return menuItems; // Return all items temporarily
})

// Helper function for permission checking
const hasPermission = (permission) => {
  return authStore.hasPermission(permission)
}

const isActive = (path) => {
  return route.path === path
}

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
}

// Handle window resize
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

onMounted(() => {
  console.log('🔍 SIDEBAR: Component mounted');
  console.log('🔍 SIDEBAR: isOpen initial value:', isOpen.value);
  console.log('🔍 SIDEBAR: filteredMenuItems:', filteredMenuItems.value);
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Glassmorphism effect for sidebar */
.sidebar-glass {
  background: linear-gradient(135deg,
    rgba(30, 64, 175, 0.95) 0%,
    rgba(37, 99, 235, 0.95) 50%,
    rgba(59, 130, 246, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Logo circle */
.logo-circle {
  @apply w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Burger button */
.burger-btn {
  @apply p-2 rounded-lg hover:bg-white/10 transition-all duration-300;
}

/* Navigation items */
.nav-item {
  @apply flex items-center px-4 py-3 mx-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer relative overflow-hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), transparent);
  transition: width 0.3s ease;
}

.nav-item:hover::before {
  width: 100%;
}

.nav-item.active {
  @apply bg-white/20 text-white font-semibold shadow-lg;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-left: 3px solid #1E40AF;
}

/* Pro Card with glass effect */
.pro-card {
  @apply rounded-2xl p-4 text-center relative overflow-hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.pro-icon-circle {
  @apply w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(5px);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pro-btn {
  @apply w-full bg-white text-secondary-600 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.pro-btn:hover {
  @apply bg-opacity-90 shadow-xl;
  transform: translateY(-2px);
}

.pro-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar-glass {
    @apply shadow-2xl;
  }
}
</style>
