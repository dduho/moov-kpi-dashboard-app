<template>
  <div class="profile-view">
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Profil Utilisateur</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Informations personnelles -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Informations Personnelles</h2>

            <div class="flex items-center space-x-4">
              <img
                :src="userAvatar"
                alt="Avatar"
                class="w-20 h-20 rounded-full border-4 border-primary-200"
              />
              <div>
                <h3 class="text-lg font-medium text-gray-800">{{ user?.username || 'Utilisateur' }}</h3>
                <p class="text-gray-600 capitalize">{{ user?.role?.name || 'Utilisateur' }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ user?.username || 'N/A' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ user?.email || 'N/A' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded capitalize">{{ user?.role?.name || 'Utilisateur' }}</p>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Statistiques</h2>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-primary-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">{{ userStats.loginCount || 0 }}</div>
                <div class="text-sm text-gray-600">Connexions</div>
              </div>

              <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ userStats.lastLogin || 'Jamais' }}</div>
                <div class="text-sm text-gray-600">Dernière connexion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const user = computed(() => authStore.user)

const userAvatar = computed(() => {
  if (user.value?.id) {
    return `https://i.pravatar.cc/150?img=${user.value.id % 50 + 1}`
  }
  return 'https://i.pravatar.cc/150?img=12'
})

const userStats = computed(() => ({
  loginCount: user.value?.loginCount || 0,
  lastLogin: user.value?.lastLogin ? new Date(user.value.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'
}))
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 2rem 0;
}
</style>