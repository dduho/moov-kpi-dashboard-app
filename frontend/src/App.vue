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
  @apply flex min-h-screen bg-gray-50;
}

.main-content {
  @apply flex-1 ml-64 transition-all duration-300;
}

.content-wrapper {
  @apply p-8;
}

@media (max-width: 768px) {
  .main-content {
    @apply ml-20;
  }

  .content-wrapper {
    @apply p-4;
  }
}
</style>