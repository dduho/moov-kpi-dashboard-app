<template>
  <div class="settings-view">
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Paramètres</h1>

        <div class="space-y-8">
          <!-- Préférences d'affichage -->
          <div>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Préférences d'Affichage</h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Thème</h3>
                  <p class="text-sm text-gray-600">Choisissez votre thème préféré</p>
                </div>
                <select class="border border-gray-300 rounded px-3 py-2">
                  <option>Clair</option>
                  <option>Sombre</option>
                  <option>Système</option>
                </select>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Langue</h3>
                  <p class="text-sm text-gray-600">Langue de l'interface</p>
                </div>
                <select class="border border-gray-300 rounded px-3 py-2">
                  <option>Français</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Notifications</h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Notifications par email</h3>
                  <p class="text-sm text-gray-600">Recevoir des notifications par email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Notifications push</h3>
                  <p class="text-sm text-gray-600">Recevoir des notifications push</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Sécurité -->
          <div>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Sécurité</h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Changer le mot de passe</h3>
                  <p class="text-sm text-gray-600">Mettre à jour votre mot de passe</p>
                </div>
                <button class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors">
                  Changer
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">Authentification à deux facteurs</h3>
                  <p class="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
                </div>
                <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                  Configurer
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t border-gray-200">
            <div class="flex justify-end space-x-4">
              <button class="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button class="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Logique des paramètres peut être ajoutée ici plus tard
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 2rem 0;
}
</style>