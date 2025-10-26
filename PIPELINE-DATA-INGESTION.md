# Pipeline d'ingestion des données KPI

## Vue d'ensemble

Ce document décrit le fonctionnement complet du pipeline d'ingestion des données KPI Mobile Money, de la récupération des fichiers jusqu'à l'affichage sur le dashboard.

## Architecture du pipeline

```
┌─────────────────────┐
│  Serveur FTP        │
│  /Huawei/Kaly/KPI/  │
│  ├── 202507/        │
│  │   ├── 20250701.rar
│  │   ├── 20250702.rar
│  │   └── ...        │
│  └── 202508/        │
│      └── ...        │
└─────────────────────┘
         │
         ▼ (Téléchargement quotidien)
┌─────────────────────┐
│  kpi_data/          │
│  ├── 202507/        │
│  │   ├── 20250701/  │
│  │   │   ├── 【MMTG-Tools】Daily KPI - 20250701.xlsx
│  │   │   ├── 【MMTG-Tools】Hourly KPI - 20250701.xlsx
│  │   │   ├── 【MMTG-Tools】IMT Hourly - 20250701.xlsx
│  │   │   └── 【MMTG-Tools】Revenue Compare - 20250701.xlsx
│  │   └── 20250702/  │
│  └── 202508/        │
└─────────────────────┘
         │
         ▼ (Extraction + Parsing)
┌─────────────────────┐
│  PostgreSQL/SQLite  │
│  ├── daily_kpi      │
│  ├── hourly_kpi     │
│  ├── imt_transaction│
│  ├── revenue_by_channel
│  └── ...            │
└─────────────────────┘
         │
         ▼ (Agrégation)
┌─────────────────────┐
│  KPI Aggregates     │
│  ├── Par business   │
│  ├── Par canal      │
│  ├── Par pays       │
│  └── Comparaisons   │
└─────────────────────┘
         │
         ▼ (API REST)
┌─────────────────────┐
│  Frontend Vue.js    │
│  Dashboard KPI      │
└─────────────────────┘
```

## Structure des fichiers

### Hiérarchie des dossiers

```
kpi_data/
├── 202507/                        # Dossier mensuel (YYYYMM)
│   ├── 20250701/                 # Dossier journalier (YYYYMMDD)
│   │   ├── 【MMTG-Tools】Daily KPI - 20250701.xlsx
│   │   ├── 【MMTG-Tools】Hourly KPI - 20250701.xlsx
│   │   ├── 【MMTG-Tools】IMT Hourly - 20250701.xlsx
│   │   └── 【MMTG-Tools】Revenue Compare - 20250701.xlsx
│   ├── 20250702/
│   └── ...
├── 202508/
└── ...
```

### Fichiers Excel attendus

| Fichier | Contenu | Modèle DB |
|---------|---------|-----------|
| `【MMTG-Tools】Daily KPI - YYYYMMDD.xlsx` | KPIs quotidiens par type d'activité | `DailyKpi` |
| `【MMTG-Tools】Hourly KPI - YYYYMMDD.xlsx` | KPIs horaires par type de transaction | `HourlyKpi` |
| `【MMTG-Tools】IMT Hourly - YYYYMMDD.xlsx` | Transactions IMT (International Money Transfer) | `ImtTransaction` |
| `【MMTG-Tools】Revenue Compare - YYYYMMDD.xlsx` | Revenus par canal (10 feuilles) | `RevenueByChannel` |

## Flux de traitement

### 1. Planification (Cron Job)

**Fichier**: `backend/src/jobs/dailyDataIngestion.js`

- **Fréquence**: Quotidienne à 9h00
- **Configuration**: `cron.schedule('0 9 * * *', ...)`
- **Déclenchement**: Au démarrage du serveur dans `backend/src/app.js`

```javascript
dailyDataIngestionJob.start()
// Runs daily at 9:00 AM
```

### 2. Scan des dossiers

Le job parcourt la structure du dossier `kpi_data/`:

```javascript
kpi_data/
├── 202507/   ← Scan des dossiers mensuels (format YYYYMM)
│   ├── 20250701/  ← Scan des dossiers journaliers (format YYYYMMDD)
│   ├── 20250702/
│   └── ...
```

**Logique**:
1. Liste tous les dossiers mensuels (ex: 202507, 202508)
2. Pour chaque mois, liste tous les dossiers journaliers
3. Vérifie si la date a déjà été traitée (évite les doublons)
4. Traite uniquement les nouvelles dates

### 3. Extraction RAR (si nécessaire)

**Fichier**: `backend/src/services/dailyDataIngestionService.js`

Si des fichiers `.rar` sont trouvés dans le dossier mensuel:

```javascript
// Exemple: kpi_data/202507/20250701.rar
// ↓ Extraction vers
// kpi_data/202507/20250701/
//   ├── 【MMTG-Tools】Daily KPI - 20250701.xlsx
//   └── ...
```

**Méthodes d'extraction** (par ordre de priorité):
1. `7z` (si disponible sur le système)
2. `node-unrar-js` (fallback JavaScript)

### 4. Parsing des fichiers Excel

**Fichier**: `backend/src/services/excelParserService.js`

Pour chaque fichier Excel trouvé:

#### a) Daily KPI
- **Feuille**: `KPI_N`
- **Colonnes**: Business Type, Period, Success Trx, Amount, Revenue, Commission, Tax, Failed Trx, Expired Trx, Success Rate, Revenue Rate
- **Insertion**: `DailyKpi.bulkCreate()` avec `updateOnDuplicate`

#### b) Hourly KPI
- **Feuille**: `NEW`
- **Colonnes**: Hour, Txn Type Name, Total Trans, Total Success, Total Failed, Total Pending, Total Amount, Total Fee, Total Commission, Total Tax
- **Insertion**: `HourlyKpi.bulkCreate()`

#### c) IMT Hourly
- **Feuille**: `IMT_BUSINESS`
- **Colonnes**: Country, IMT Business, Total Success, Total Failed, Amount, Revenue, Commission, Tax, Success Rate, Balance
- **Insertion**: `ImtTransaction.bulkCreate()`

#### d) Revenue Compare
- **Feuilles multiples**: App, Active, KPI-Day, Cash In, Cash Out, IMT, Banks, P2P, Bill, Telco
- **Agrégation**: Somme par canal des transactions, montants, revenus
- **Insertion**: `RevenueByChannel.bulkCreate()`

### 5. Calcul des agrégats

**Fichier**: `backend/src/services/kpiCalculatorService.js`

Après parsing, le système calcule:

#### Agrégats par Business Type
```javascript
// Exemple: Total Cash In, Total Cash Out, etc.
KpiAggregates.bulkCreate([
  { date, business_type: 'Cash In', total_transactions, total_amount, total_revenue }
])
```

#### Agrégats par Canal
```javascript
// Exemple: Total App, Total P2P, etc.
```

#### Agrégats par Pays (IMT)
```javascript
// Exemple: Total Senegal, Total Mali, etc.
```

#### Comparaisons jour-à-jour
```javascript
ComparativeAnalytics.bulkCreate([
  {
    date,
    business_type,
    current_day_transaction_count,
    last_day_transaction_count,
    transaction_count_gap,
    trend
  }
])
```

#### KPIs hebdomadaires
```javascript
WeeklyKpis.bulkCreate([
  {
    week_start_date,
    monday_revenue,
    tuesday_revenue,
    ...,
    weekly_total_revenue,
    weekly_growth_rate
  }
])
```

#### Performance horaire
```javascript
HourlyPerformance.bulkCreate([
  {
    date,
    hour,
    business_type,
    transaction_count,
    transaction_amount,
    revenue,
    peak_hour_indicator
  }
])
```

### 6. Cache Redis (optionnel)

**Fichier**: `backend/src/services/cacheService.js`

- Si Redis est disponible: cache des résultats (TTL: 5 minutes)
- Sinon: in-memory cache basique
- **Invalidation**: `cacheService.clearAll()` après chaque ingestion

### 7. API REST

Les données sont accessibles via les endpoints:

```
GET /api/dashboard          # Vue d'ensemble
GET /api/kpis/daily         # KPIs quotidiens
GET /api/kpis/hourly        # KPIs horaires
GET /api/kpis/revenue       # Revenus par canal
GET /api/imt                # Transactions IMT
GET /api/comparisons        # Comparaisons jour-à-jour
GET /api/export/kpis        # Export Excel/CSV
```

### 8. Frontend Dashboard

**Fichiers**: `frontend/src/views/Dashboard.vue`, `frontend/src/stores/kpi.js`

- Fetch des données via l'API
- Graphiques interactifs (Chart.js)
- Filtres par date
- Export de rapports

## Règles métier importantes

### Délai J+1

**Les données du jour J sont disponibles le jour J+1.**

Exemple:
- Aujourd'hui: 23 octobre 2025
- Données disponibles: jusqu'au 22 octobre 2025
- Les données du 23 octobre seront disponibles le 24 octobre

Raison: temps nécessaire pour la collecte, la validation et le transfert FTP.

### Contraintes d'unicité

Les données sont identifiées de manière unique par:

| Table | Clé composite unique |
|-------|---------------------|
| `daily_kpi` | `(date, business_type, period)` |
| `hourly_kpi` | `(date, hour, txn_type_name)` |
| `imt_transaction` | `(date, country, imt_business)` |
| `revenue_by_channel` | `(date, channel)` |

Si un fichier est retraité, les données existantes sont mises à jour (`ON CONFLICT ... DO UPDATE`).

## Configuration

### Variables d'environnement

#### En local (développement)
```bash
# backend/.env
API_PORT=3000
NODE_ENV=development

# Base de données (SQLite par défaut en dev)
# Pas de configuration nécessaire

# Redis (optionnel)
REDIS_AVAILABLE=false

# Chemin vers kpi_data (optionnel, détecté automatiquement)
# KPI_DATA_PATH=/path/to/kpi_data
```

#### En Docker (production)
```bash
# docker-compose.yml
services:
  backend:
    environment:
      - KPI_DATA_PATH=/backend/kpi_data
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
      - REDIS_AVAILABLE=true
    volumes:
      - ./kpi_data:/backend/kpi_data
```

### Chemins importants

| Environnement | Chemin kpi_data |
|---------------|----------------|
| Local | `C:/Users/.../moov-kpi-dashboard-app/kpi_data` |
| Docker | `/backend/kpi_data` (volume monté) |

Le code détecte automatiquement l'environnement:
```javascript
this.tempDir = process.env.KPI_DATA_PATH || path.join(__dirname, '../../../kpi_data')
```

## Scripts utiles

### Générer des données de test
```bash
cd backend
node scripts/generate-test-data.js
```

Génère des fichiers Excel de test dans `kpi_data/202507/` et `kpi_data/202508/`.

### Tester le pipeline complet
```bash
cd backend
node scripts/test-ingestion-pipeline.js
```

Teste:
1. ✅ Connexion à la base de données
2. ✅ Synchronisation des modèles
3. ✅ Scan de la structure kpi_data
4. ✅ Ingestion pour une date spécifique
5. ✅ Statistiques globales
6. ✅ Dates disponibles

### Forcer l'ingestion pour une date
```bash
cd backend
node -e "require('./src/jobs/dailyDataIngestion').runForDate('20250704')"
```

### Vérifier les données en base
```bash
cd backend
node -e "const {DailyKpi} = require('./src/models'); DailyKpi.count().then(c => console.log('Total:', c))"
```

## Dépannage

### Problème: Aucune donnée ingérée

**Vérifications**:
1. Les fichiers Excel existent-ils dans `kpi_data/YYYYMM/YYYYMMDD/` ?
   ```bash
   ls kpi_data/202507/20250704/
   ```

2. Les noms de fichiers correspondent-ils aux patterns ?
   ```
   ✅ 【MMTG-Tools】Daily KPI - 20250704.xlsx
   ❌ MMTG_Daily_KPI_20250704.xlsx
   ```

3. La base de données est-elle initialisée ?
   ```bash
   cd backend && node sync-db.js
   ```

### Problème: Erreur "UNIQUE constraint failed"

**Cause**: La base de données SQLite existante a des contraintes incorrectes.

**Solution**:
```bash
cd backend
rm database/dev.sqlite
node scripts/test-ingestion-pipeline.js
```

### Problème: Le job quotidien ne s'exécute pas

**Vérifications**:
1. Le serveur est-il démarré ?
   ```bash
   cd backend && npm start
   ```

2. Le job est-il activé dans les logs ?
   ```
   ✅ Daily data ingestion job started (runs daily at 9:00 AM)
   ```

3. Pour tester sans attendre 9h:
   ```bash
   node -e "require('./src/jobs/dailyDataIngestion').runDailyCheck()"
   ```

### Problème: Fichiers RAR non extraits

**Solution**: Installer 7-Zip
- Windows: https://www.7-zip.org/
- Linux: `sudo apt install p7zip-full`
- Docker: Ajouter dans le Dockerfile:
  ```dockerfile
  RUN apk add --no-cache p7zip
  ```

## Performance

### Temps de traitement estimés

| Opération | Temps moyen |
|-----------|-------------|
| Extraction RAR (1 jour) | ~2-5 secondes |
| Parsing Excel (4 fichiers) | ~1-3 secondes |
| Insertion DB (200 lignes) | ~0.5-1 seconde |
| Calcul agrégats | ~0.5-1 seconde |
| **Total par jour** | **~5-10 secondes** |

### Optimisations possibles

1. **Traitement parallèle**: Traiter plusieurs dates en parallèle
2. **Batch insert**: Augmenter la taille des bulkCreate
3. **Index DB**: Optimiser les index sur les colonnes fréquemment requêtées
4. **Cache**: Activer Redis pour les requêtes API fréquentes

## Monitoring

### Logs

Les logs sont disponibles dans:
- Console: Sortie standard
- Fichier: `backend/logs/` (si configuré avec Winston)

### Métriques à surveiller

- Nombre de dates traitées par jour
- Temps de traitement moyen
- Erreurs de parsing Excel
- Taux de succès des insertions DB
- Utilisation mémoire/CPU

### Alertes recommandées

1. ⚠️ Aucune nouvelle donnée depuis 48h
2. ⚠️ Erreurs répétées lors du parsing
3. ⚠️ Temps de traitement > 60 secondes
4. ⚠️ Base de données pleine (> 90%)

## Contact et Support

Pour toute question ou problème:
1. Consulter les logs: `backend/logs/`
2. Vérifier les scripts de test
3. Consulter la documentation du code source

---

**Dernière mise à jour**: 26 octobre 2025
