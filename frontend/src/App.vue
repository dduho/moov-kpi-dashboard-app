<template>
  <div class="app-container">
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
  </div>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.app-container {
  @apply flex min-h-screen relative;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%);
  position: relative;
}

/* Animated background patterns */
.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: radial-gradient(circle at 20% 50%, rgba(91, 95, 237, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
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