<template>
  <div class="reports">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Rapports & Export</h2>
        <p class="section-subtitle">Générer et télécharger des rapports personnalisés</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Rapports Totaux"
        :value="String(reportKpis.totalReports)"
        :trend="0"
        variant="blue"
        iconType="sales"
      />
      <KpiCard
        title="30 Derniers Jours"
        :value="String(reportKpis.lastMonthReports)"
        :trend="reportKpis.monthTrend"
        variant="green"
        iconType="orders"
      />
      <KpiCard
        title="Programmés"
        :value="String(reportKpis.scheduledReports)"
        :trend="0"
        variant="purple"
        iconType="products"
      />
      <KpiCard
        title="Automatisés"
        :value="String(reportKpis.automatedReports)"
        :trend="reportKpis.automatedTrend"
        variant="orange"
        iconType="customers"
      />
    </div>

    <!-- Report Templates -->
    <div class="chart-card mb-6">
      <h3 class="chart-title mb-4">Modèles de Rapport</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="template in reportTemplates" :key="template.id" class="report-template-card">
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :style="{ backgroundColor: template.color + '20' }">
              {{ template.icon }}
            </div>
            <span class="status-badge status-info">{{ template.frequency }}</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">{{ template.name }}</h4>
          <p class="text-sm text-gray-500 mb-4">{{ template.description }}</p>
          <button class="generate-btn">
            <IconDownload :size="16" />
            <span>Générer le Rapport</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="chart-title">Rapports Récents</h3>
        <div class="search-container-sm">
          <IconSearch :size="16" class="search-icon-sm" />
          <input type="text" placeholder="Rechercher..." class="search-input-sm" v-model="searchQuery" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom du Rapport</th>
              <th>Type</th>
              <th>Généré</th>
              <th>Taille</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in filteredReports" :key="report.id">
              <td class="font-medium">{{ report.name }}</td>
              <td>{{ report.type }}</td>
              <td>{{ report.date }}</td>
              <td>{{ report.size }}</td>
              <td>
                <span class="status-badge" :class="'status-' + report.status">
                  {{ report.status }}
                </span>
              </td>
              <td>
                <button class="download-btn-sm">
                  <IconDownload :size="14" />
                  Télécharger
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import KpiCard from '@/components/widgets/KpiCard.vue'
import { IconDownload, IconSearch } from '@/components/icons/Icons.vue'

const searchQuery = ref('')

const reportKpis = ref({
  totalReports: 1248,
  lastMonthReports: 156,
  monthTrend: 12.4,
  scheduledReports: 24,
  automatedReports: 8,
  automatedTrend: 33.3
})

const reportTemplates = ref([
  {
    id: 1,
    name: 'Résumé KPI Journalier',
    description: 'Métriques de performance quotidiennes et KPI',
    icon: '📊',
    color: '#0EA5E9',
    frequency: 'Quotidien'
  },
  {
    id: 2,
    name: 'Rapport de Transactions',
    description: 'Répartition détaillée des transactions',
    icon: '💳',
    color: '#10B981',
    frequency: 'Hebdomadaire'
  },
  {
    id: 3,
    name: 'Analyse des Revenus',
    description: 'Revenus par canal et source',
    icon: '💰',
    color: '#F59E0B',
    frequency: 'Mensuel'
  },
  {
    id: 4,
    name: 'Analyses Utilisateurs',
    description: 'Engagement et activité des utilisateurs',
    icon: '👥',
    color: '#A855F7',
    frequency: 'Hebdomadaire'
  },
  {
    id: 5,
    name: 'Résumé IMT',
    description: 'Statistiques des transferts d\'argent internationaux',
    icon: '🌍',
    color: '#EC4899',
    frequency: 'Mensuel'
  },
  {
    id: 6,
    name: 'Rapport Personnalisé',
    description: 'Créez votre propre rapport personnalisé',
    icon: '⚙️',
    color: '#6366F1',
    frequency: 'À la demande'
  }
])

const recentReports = ref([
  { id: 1, name: 'Daily KPI - Oct 25', type: 'KPI', date: '2025-10-25 10:30', size: '2.4 MB', status: 'success' },
  { id: 2, name: 'Weekly Transactions', type: 'Transactions', date: '2025-10-24 09:15', size: '5.8 MB', status: 'success' },
  { id: 3, name: 'Monthly Revenue', type: 'Revenue', date: '2025-10-23 14:20', size: '3.2 MB', status: 'success' },
  { id: 4, name: 'User Analytics', type: 'Users', date: '2025-10-22 16:45', size: '4.1 MB', status: 'success' },
  { id: 5, name: 'IMT Summary', type: 'IMT', date: '2025-10-21 11:00', size: '1.9 MB', status: 'success' }
])

const filteredReports = computed(() => {
  if (!searchQuery.value) return recentReports.value
  return recentReports.value.filter(report =>
    report.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    report.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<style scoped>
@import './views-styles.css';

.report-template-card {
  @apply p-5 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 cursor-pointer;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9));
}

.generate-btn {
  @apply w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300;
  background: linear-gradient(135deg, rgba(91, 95, 237, 0.9), rgba(74, 78, 217, 0.9));
  color: white;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 95, 237, 0.3);
}

.download-btn-sm {
  @apply flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200;
  background: rgba(91, 95, 237, 0.1);
  color: #5B5FED;
}

.download-btn-sm:hover {
  background: rgba(91, 95, 237, 0.2);
}
</style>
