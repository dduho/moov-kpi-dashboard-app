<template>
  <div :class="isAuthenticated && $route.name !== 'Login' ? 'app-container' : 'login-page'">
    <!-- Show login view if not authenticated OR if on login route -->
    <router-view v-if="!isAuthenticated || $route.name === 'Login'" />

    <!-- Show main app if authenticated and not on login route -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Header -->
        <AppHeader />

        <!-- Page Content -->
        <main class="content-wrapper">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/layout/Sidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Initialize auth store on app mount
onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.app-container {
  @apply flex min-h-screen relative;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%);
  position: relative;
}

/* Login page styles - no flex layout */
.login-page {
  @apply min-h-screen;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%);
}

/* Animated background patterns */
.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, rgba(234, 88, 12, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.main-content {
  @apply flex-1 ml-64 transition-all duration-300 flex flex-col relative z-10;
}

.content-wrapper {
  @apply p-8 flex-1;
}

@media (max-width: 1024px) {
  .main-content {
    @apply ml-20;
  }
}

@media (max-width: 768px) {
  .main-content {
    @apply ml-0;
  }

  .content-wrapper {
    @apply p-4;
  }
}
</style>