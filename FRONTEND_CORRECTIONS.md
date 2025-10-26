# Plan de Correction du Frontend - Vues KPI Dashboard

## 🎯 Objectif
Remplacer toutes les données mockées/hardcodées par des vraies données provenant de l'API backend, et ajouter des filtres de dates pertinents pour l'analyse Mobile Money.

---

## 📅 Filtres de Dates Standards (à implémenter sur toutes les vues)

### Composant DateFilter à créer
**Fichier**: `frontend/src/components/filters/DateFilter.vue`

**Options de filtre**:
- **J-1** (Hier)
- **J-7** (7 derniers jours)
- **J-30** (30 derniers jours)
- **Mois en cours**
- **Mois dernier**
- **3 derniers mois**
- **Année en cours**
- **Plage personnalisée** (date picker)

**Émission**: `@change="(startDate, endDate) => handleDateChange(startDate, endDate)"`

---

## 🔄 État des Corrections

### ✅ ImtView - TERMINÉ
**Fichier**: `frontend/src/views/ImtView.vue`
- ✅ Connecté à `/api/imt`
- ✅ Affiche les vraies données IMT (pays, partenaires, transactions)
- ❌ Filtres de dates manquants

---

## 📊 Vues à Corriger (par ordre de priorité)

### 1. 🏠 DashboardView - PRIORITÉ HAUTE
**Fichier**: `frontend/src/views/DashboardView.vue`

**Problèmes actuels**:
- Lignes 713-746: Données mockées pour retention cohorts, transaction frequency, ATV, etc.
- Aucun appel API pour les KPIs principaux

**API à utiliser**:
- `GET /api/dashboard?startDate=YYYYMMDD&endDate=YYYYMMDD`

**KPIs pertinents à afficher**:
1. **Volume Total des Transactions** (XOF)
   - Source: Sum de `amount` sur toutes les transactions
   - Trend: Comparaison avec période précédente

2. **Nombre Total de Transactions**
   - Source: Sum de `success_trx` de DailyKpi
   - Trend: Comparaison avec période précédente

3. **Revenus Totaux** (XOF)
   - Source: Sum de `revenue` de toutes les tables
   - Trend: Comparaison avec période précédente

4. **Taux de Succès Moyen** (%)
   - Source: Moyenne de `success_rate` de DailyKpi
   - Trend: Comparaison avec période précédente

5. **Commission Totale** (XOF)
   - Source: Sum de `commission` de DailyKpi
   - Trend: Comparaison avec période précédente

6. **Taxes Totales** (XOF)
   - Source: Sum de `tax` de DailyKpi
   - Trend: Comparaison avec période précédente

**Graphiques à implémenter**:
1. **Évolution Journalière des Transactions** (LineChart)
   - X: Dates
   - Y: Nombre de transactions réussies

2. **Répartition par Type de Service** (PieChart/DonutChart)
   - Source: Agrégation de `business_type` de DailyKpi
   - Segments: Bill Payment, Cash In, Cash Out, IMT, P2P

3. **Évolution des Revenus** (LineChart multi-lignes)
   - X: Dates
   - Y1: Revenus (bleu)
   - Y2: Commissions (vert)
   - Y3: Taxes (orange)

4. **Performance par Période de la Journée** (BarChart)
   - Source: HourlyKpi agrégé par période
   - Périodes: 00-06h, 06-12h, 12-18h, 18-24h

5. **Top 5 Canaux par Revenus** (BarChart horizontal)
   - Source: RevenueByChannel
   - Afficher les 5 meilleurs canaux

**Filtres à ajouter**:
- ✅ Sélecteur de période (J-1, J-7, Mois, etc.)
- ✅ Comparaison avec période précédente automatique

---

### 2. 📈 DailyKpiView - PRIORITÉ HAUTE
**Fichier**: `frontend/src/views/DailyKpiView.vue`

**Problèmes actuels**:
- Données mockées hardcodées
- Pas d'appel API

**API à utiliser**:
- `GET /api/kpis/daily?date=YYYYMMDD`
- `GET /api/kpis/daily/range?start_date=YYYYMMDD&end_date=YYYYMMDD`

**KPIs à afficher**:
1. **Transactions Réussies du Jour**
   - Par business_type
   - Tendance vs jour précédent

2. **Volume Financier du Jour** (XOF)
   - Sum des montants par business_type

3. **Revenus du Jour** (XOF)
   - Sum des revenus par business_type

4. **Taux de Succès du Jour** (%)
   - Moyenne pondérée par business_type

5. **Transactions Échouées**
   - Count + raisons si disponible

6. **Transactions Expirées**
   - Count par business_type

**Graphiques**:
1. **Évolution sur la Période** (LineChart)
   - Multi-lignes par business_type

2. **Répartition par Service** (PieChart)
   - Bill Payment, Cash In/Out, P2P, IMT

3. **Comparaison Revenus vs Commission** (BarChart groupé)
   - Par business_type

4. **Taux de Succès par Service** (BarChart horizontal)
   - Avec seuils de couleur (>95% vert, >90% orange, <90% rouge)

**Table détaillée**:
- Date | Business Type | Period | Success | Failed | Expired | Amount | Revenue | Success Rate
- Tri par défaut: Date DESC, Success DESC
- Export Excel/CSV

**Filtres**:
- ✅ Période (J-1, J-7, Mois, etc.)
- ✅ Filtre par business_type (dropdown)
- ✅ Filtre par period (00-06, 06-12, 12-18, 18-24)

---

### 3. ⏰ HourlyKpiView - PRIORITÉ MOYENNE
**Fichier**: `frontend/src/views/HourlyKpiView.vue`

**Problèmes actuels**:
- Données mockées

**API à utiliser**:
- `GET /api/kpis/hourly?date=YYYYMMDD`

**KPIs à afficher**:
1. **Heure de Pic de Transactions**
   - Heure avec le plus de transactions

2. **Volume Horaire Moyen** (XOF)

3. **Transactions par Heure** (moyenne sur période)

4. **Revenus par Heure** (moyenne sur période)

**Graphiques**:
1. **Heatmap des Transactions** (si possible)
   - X: Heures (0-23h)
   - Y: Jours de la semaine
   - Couleur: Intensité des transactions

2. **Courbe Horaire** (LineChart)
   - X: Heures
   - Y: Nombre de transactions
   - Avec moyenne mobile

3. **Répartition par Business Type** (Stacked AreaChart)
   - X: Heures
   - Y: Transactions empilées par type

**Table**:
- Date | Heure | Business Type | Transactions | Amount | Revenue | Commission

**Filtres**:
- ✅ Période (J-1, J-7, etc.)
- ✅ Jour de la semaine
- ✅ Business Type

---

### 4. 💰 RevenueView - PRIORITÉ HAUTE
**Fichier**: `frontend/src/views/RevenueView.vue`

**Problèmes actuels**:
- Données mockées

**API à utiliser**:
- `GET /api/revenue/by-channel?start_date=YYYYMMDD&end_date=YYYYMMDD`

**KPIs à afficher**:
1. **Revenus Totaux** (XOF)
   - Sum de tous les canaux
   - Trend vs période précédente

2. **Top Canal par Revenus**
   - Canal #1 avec sa contribution %

3. **Nombre de Canaux Actifs**

4. **Revenu Moyen par Transaction** (XOF)
   - Total revenus / Total transactions

5. **Marge Moyenne** (%)
   - Si commission disponible: (Revenue / Amount) * 100

**Graphiques**:
1. **Évolution des Revenus par Canal** (LineChart multi-lignes)
   - X: Dates
   - Y: Revenus
   - Une ligne par canal (top 5)

2. **Part de Marché par Canal** (DonutChart)
   - % de revenus par canal

3. **Transactions vs Revenus** (Scatter Chart)
   - X: Nombre de transactions
   - Y: Revenus
   - Bulles: Canaux
   - Taille: Volume moyen

4. **Top 10 Canaux** (BarChart horizontal)
   - Revenus descendants

**Table**:
- Canal | Transactions | Volume (XOF) | Revenus (XOF) | Rev/Trx | % Total

**Filtres**:
- ✅ Période
- ✅ Tri par: Revenus | Transactions | Rev/Trx
- ✅ Recherche par nom de canal

---

### 5. 🌍 ImtView - AMÉLIORATIONS
**Fichier**: `frontend/src/views/ImtView.vue` (déjà corrigé, ajouts)

**À ajouter**:

**Filtres manquants**:
- ✅ Période (J-1, J-7, Mois, etc.)
- ✅ Filtre par pays (dropdown multi-select)
- ✅ Filtre par partenaire IMT (MoneyGram, Western Union, RIA)

**KPIs supplémentaires**:
1. **Balance Totale** (XOF)
   - Afficher le solde cumulé

2. **Taux d'Échec Moyen** (%)
   - Failed / (Success + Failed)

3. **Commissions IMT** (XOF)
   - Sum des commissions sur période

**Graphiques supplémentaires**:
1. **Évolution Mensuelle par Partenaire** (LineChart)
   - X: Mois
   - Y: Nombre de transactions
   - Une ligne par partenaire IMT

2. **Comparaison Pays** (BarChart groupé)
   - X: Pays
   - Y: Success (vert) vs Failed (rouge)

---

### 6. 👥 UsersView - CORRECTION CRITIQUE
**Fichier**: `frontend/src/views/UsersView.vue`

**Problèmes MAJEURS**:
- ❌ Affiche des noms fictifs (John Doe, Jane Smith) au lieu de MSISDN
- ❌ Toutes les données sont mockées
- ❌ Pas de table ActiveUsers dans la base de données

**Solutions**:

#### Option A: Utiliser les données de transactions pour simuler les utilisateurs
**Logique**:
- Identifier les "utilisateurs" par pattern MSISDN fictif
- Générer des MSISDN au format Mobile Money: `+223 XX XX XX XX` (Mali), `+221 XX XX XX XX` (Sénégal)
- Agréger les transactions par "utilisateur simulé"

**KPIs à afficher**:
1. **Utilisateurs Actifs sur la Période**
   - Count distinct des transactions par jour

2. **Nouveaux Utilisateurs** (première transaction)
   - Estimation basée sur croissance

3. **Taux d'Engagement**
   - (Utilisateurs actifs / Total utilisateurs estimé) * 100

4. **Transactions Moyennes par Utilisateur**

#### Option B: Message informatif (RECOMMANDÉ pour l'instant)
**Afficher**:
```
⚠️ Données Utilisateurs Non Disponibles

Les données détaillées des utilisateurs Mobile Money ne sont pas encore
configurées dans ce tableau de bord.

Les métriques disponibles sont :
- Transactions quotidiennes (voir DailyKpiView)
- Analyse des canaux (voir RevenueView)
- Transferts internationaux (voir ImtView)
```

**Action recommandée**:
- Désactiver/masquer le menu "Utilisateurs" jusqu'à ce que les vraies données soient disponibles
- OU afficher des métriques agrégées basiques sans détails individuels

**Si on garde la vue, afficher**:
- **Top Pays par Activité** (basé sur DailyKpi)
- **Segmentation par Type de Transaction** (business_type)
- **Activité par Période de Journée**

**PAS de noms**, JAMAIS de "John Doe" !

---

## 🎨 Composants Communs à Créer

### 1. DateRangeFilter.vue
**Emplacement**: `frontend/src/components/filters/DateRangeFilter.vue`

**Props**:
- `defaultRange`: 'J-7' | 'month' | 'year'
- `showComparison`: boolean (pour afficher option "vs période précédente")

**Émissions**:
- `@change`: { startDate, endDate, previousStartDate, previousEndDate }

**Presets**:
```javascript
const presets = [
  { label: 'Hier', value: 'J-1', days: 1 },
  { label: '7 derniers jours', value: 'J-7', days: 7 },
  { label: '30 derniers jours', value: 'J-30', days: 30 },
  { label: 'Mois en cours', value: 'current-month' },
  { label: 'Mois dernier', value: 'last-month' },
  { label: '3 derniers mois', value: '3-months' },
  { label: 'Année en cours', value: 'current-year' },
  { label: 'Personnalisé', value: 'custom' }
]
```

### 2. KpiCardWithTrend.vue (amélioration existant)
**Ajouts**:
- Indicateur de comparaison visuel (flèche ↑↓)
- Couleur dynamique (vert si positif, rouge si négatif)
- Tooltip avec détails de la période de comparaison

### 3. ExportButton.vue
**Emplacement**: `frontend/src/components/widgets/ExportButton.vue`

**Props**:
- `exportType`: 'excel' | 'pdf' | 'csv'
- `apiEndpoint`: string
- `params`: object

**Fonctionnalités**:
- Appel API `/api/export/excel` ou `/api/export/pdf`
- Download automatique du fichier
- Loading state pendant l'export

### 4. DataTable.vue (réutilisable)
**Features**:
- Tri par colonnes
- Pagination
- Recherche/filtre
- Export intégré
- États de loading/erreur

---

## 🔧 Modifications Backend Nécessaires

### Controllers à vérifier/améliorer

#### 1. dashboardController.js
**Endpoint**: `GET /api/dashboard`

**Doit retourner**:
```javascript
{
  kpis: {
    totalTransactions: number,
    totalVolume: number,
    totalRevenue: number,
    avgSuccessRate: number,
    totalCommission: number,
    totalTax: number,
    trends: {
      transactions: number, // % change
      volume: number,
      revenue: number,
      successRate: number
    }
  },
  chartData: {
    dailyTransactions: [{ date, count }],
    revenueEvolution: [{ date, revenue, commission, tax }],
    businessTypeDistribution: [{ type, count, revenue }],
    topChannels: [{ channel, revenue, transactions }]
  },
  period: {
    startDate: string,
    endDate: string,
    previousStartDate: string,
    previousEndDate: string
  }
}
```

#### 2. kpiController.js
**Vérifier les endpoints**:
- ✅ `/api/kpis/daily`
- ✅ `/api/kpis/daily/range`
- ✅ `/api/kpis/hourly`
- ⚠️ Ajouter support pour agrégation par business_type

#### 3. revenueController.js
**Endpoint**: `/api/revenue/by-channel`

**Améliorer pour retourner**:
```javascript
{
  summary: {
    totalRevenue: number,
    totalTransactions: number,
    avgRevenuePerTransaction: number,
    activeChannels: number
  },
  channels: [
    {
      channel: string,
      transactions: number,
      volume: number,
      revenue: number,
      percentage: number,
      trend: number
    }
  ],
  evolution: [
    { date: string, channelRevenues: { [channel]: revenue } }
  ]
}
```

---

## 📝 Ordre d'Implémentation Recommandé

### Phase 1: Composants de Base (1-2h)
1. ✅ Créer `DateRangeFilter.vue`
2. ✅ Créer helper functions de date dans `utils/dateHelpers.js`
3. ✅ Améliorer `KpiCard.vue` avec trends

### Phase 2: Vues Principales (3-4h)
1. ✅ Corriger **DashboardView** (vue d'ensemble)
2. ✅ Corriger **RevenueView** (revenus par canal)
3. ✅ Corriger **DailyKpiView** (KPIs quotidiens)

### Phase 3: Vues Secondaires (2-3h)
1. ✅ Améliorer **ImtView** (ajouter filtres)
2. ✅ Corriger **HourlyKpiView** (analyse horaire)
3. ✅ Corriger **UsersView** (remplacer ou masquer)

### Phase 4: Améliorations UX (1-2h)
1. ✅ Ajouter états de loading sur toutes les vues
2. ✅ Ajouter gestion d'erreurs
3. ✅ Ajouter exports Excel/PDF
4. ✅ Tests de navigation et cohérence

---

## 🎯 Priorités Immédiates

### 🔴 CRITIQUE (à faire maintenant)
1. ✅ **UsersView**: Retirer les noms fictifs (John Doe, etc.)
2. ✅ **DashboardView**: Connecter aux vraies données
3. ✅ **DateFilter**: Créer le composant de filtre de dates

### 🟠 IMPORTANT (à faire ensuite)
1. ✅ **DailyKpiView**: Implémenter avec filtres
2. ✅ **RevenueView**: Connecter à l'API
3. ✅ **ImtView**: Ajouter les filtres manquants

### 🟡 SOUHAITABLE (si temps disponible)
1. ✅ **HourlyKpiView**: Analyse horaire complète
2. ✅ **Export**: Boutons d'export fonctionnels
3. ✅ **Responsive**: Optimisation mobile

---

## 📊 Métriques de Qualité

### Critères d'Acceptation
- ✅ Aucune donnée mockée/hardcodée visible
- ✅ Tous les graphiques alimentés par l'API
- ✅ Filtres de dates fonctionnels sur toutes les vues
- ✅ États de loading/erreur gérés
- ✅ Format MSISDN pour utilisateurs (pas de noms)
- ✅ Performance: <3s pour charger une vue

### Tests à Effectuer
1. ✅ Navigation entre toutes les vues
2. ✅ Changement de période sur chaque vue
3. ✅ Vérification des calculs de KPIs
4. ✅ Test avec données vides
5. ✅ Test avec erreur API (backend down)

---

## 📚 Documentation Additionnelle

### Format de Date API
- Backend attend: `YYYYMMDD` (ex: `20250101`)
- Frontend affiche: `DD/MM/YYYY` (ex: `01/01/2025`)

### Devises
- Tout en **XOF** (Franc CFA)
- Format: `1 234 567 XOF` (espaces pour milliers)

### Couleurs de Statut
- **Vert** (#10B981): Succès, >95%
- **Orange** (#F59E0B): Attention, 90-95%
- **Rouge** (#EF4444): Erreur, <90%
- **Bleu** (#0EA5E9): Info
- **Violet** (#A855F7): Premium/IMT

---

**Créé le**: 26 Octobre 2025
**Dernière mise à jour**: 26 Octobre 2025
**Status**: 📝 Spécifications complètes - Prêt pour implémentation
