# Guide d'import des données sur VPS en production

## 🚀 Prérequis

- Serveur VPS avec Docker et Docker Compose installés
- Application déployée et conteneurs démarrés
- Accès SSH au serveur
- Fichiers Excel KPI disponibles sur le serveur

---

## 📊 Option 1 : Import Manuel (Premier déploiement)

### Étape 1 : Se connecter au serveur

```bash
ssh user@votre-serveur-vps.com
cd /chemin/vers/moov-kpi-dashboard-app
```

### Étape 2 : Vérifier que les conteneurs sont démarrés

```bash
docker-compose ps
```

Tous les services (postgres, redis, backend) doivent être "Up" et "healthy".

### Étape 3 : Préparer les données

**A. Si vous avez des fichiers RAR :**

```bash
# Placer les fichiers RAR dans kpi_data/processed/YYYYMM/
# Structure attendue : kpi_data/processed/202507/20250701.rar

# Exemple :
mkdir -p kpi_data/processed/202507
# Transférer vos fichiers RAR via scp :
# scp /local/path/202507/*.rar user@vps:/path/to/app/kpi_data/processed/202507/
```

**B. Si vous avez directement les fichiers Excel :**

```bash
# Placer les Excel dans kpi_data/YYYYMM/YYYYMMDD/
# Structure attendue : kpi_data/202507/20250701/【MMTG-Tools】*.xlsx

mkdir -p kpi_data/202507/20250701
# Transférer vos fichiers Excel
```

### Étape 4 : Lancer l'import

**A. Import pour une plage de dates spécifique :**

Créer un fichier `import-custom-range.js` :

```javascript
const dailyDataIngestionJob = require('./src/jobs/dailyDataIngestion')
const { sequelize } = require('./src/models')

async function importDateRange() {
  const startDate = process.argv[2] || '20250701'
  const endDate = process.argv[3] || '20251022'

  console.log(`Importing from ${startDate} to ${endDate}...`)

  await sequelize.authenticate()
  await sequelize.sync()

  const start = new Date(
    startDate.substring(0, 4),
    parseInt(startDate.substring(4, 6)) - 1,
    startDate.substring(6, 8)
  )
  const end = new Date(
    endDate.substring(0, 4),
    parseInt(endDate.substring(4, 6)) - 1,
    endDate.substring(6, 8)
  )

  let success = 0, errors = 0
  const current = new Date(start)

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10).replace(/-/g, '')
    try {
      console.log(`Importing ${dateStr}...`)
      await dailyDataIngestionJob.runForDate(dateStr)
      success++
      console.log(`✅ ${dateStr} OK`)
    } catch (error) {
      errors++
      console.error(`❌ ${dateStr} failed:`, error.message)
    }
    current.setDate(current.getDate() + 1)
  }

  console.log(`\n✅ Success: ${success} | ❌ Errors: ${errors}`)
  process.exit(0)
}

importDateRange().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

Puis lancer :

```bash
# Copier le script dans le conteneur
docker cp import-custom-range.js kpi-backend-prod:/app/

# Exécuter l'import
docker exec -it kpi-backend-prod node import-custom-range.js 20250701 20251022
```

**B. Utiliser le script existant :**

```bash
# Importer toutes les dates du 1er juillet au 22 octobre
docker exec -it kpi-backend-prod node scripts/import-all-dates.js
```

### Étape 5 : Vérifier l'import

```bash
# Vérifier le nombre de jours importés
docker exec -it kpi-backend-prod node -e "
const {DailyKpi} = require('./src/models');
DailyKpi.findAll({
  attributes: ['date'],
  group: ['date'],
  order: [['date', 'ASC']]
}).then(rows => {
  console.log('Total days:', rows.length);
  if (rows.length > 0) {
    console.log('First date:', rows[0].date);
    console.log('Last date:', rows[rows.length - 1].date);
  }
  process.exit(0);
});
"
```

---

## 🔄 Option 2 : Import Automatique (Job quotidien)

Le job d'import automatique s'exécute déjà tous les jours à 9h00 du matin via le cron configuré dans `dailyDataIngestion.js`.

### Configuration du job automatique

Le job est automatiquement démarré au lancement du backend (voir `src/app.js`).

**Pour vérifier que le job tourne :**

```bash
docker logs kpi-backend-prod | grep "Daily data ingestion job"
```

Vous devriez voir :
```
Daily data ingestion job started (runs daily at 9:00 AM)
```

**Pour forcer une exécution manuelle du job pour une date :**

```bash
docker exec -it kpi-backend-prod node -e "
const job = require('./src/jobs/dailyDataIngestion');
job.runForDate('20251026').then(() => {
  console.log('Import completed');
  process.exit(0);
}).catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
"
```

---

## 📁 Option 3 : Import en masse via API (Pour automatisation)

Créer un endpoint admin pour déclencher l'import via API :

**Ajouter dans `src/routes/admin.js` :**

```javascript
const express = require('express')
const router = express.Router()
const dailyDataIngestionJob = require('../jobs/dailyDataIngestion')
const { authenticateToken, requireRole } = require('../middleware/auth')

router.post('/import-date', authenticateToken, requireRole('Administrator'), async (req, res) => {
  try {
    const { date } = req.body // Format: YYYYMMDD

    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD' })
    }

    await dailyDataIngestionJob.runForDate(date)
    res.json({ success: true, message: `Data imported for ${date}` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/import-range', authenticateToken, requireRole('Administrator'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    // Validation...
    const results = []
    // Loop through dates and import...

    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

Puis dans `src/app.js` :
```javascript
app.use('/api/admin', require('./routes/admin'))
```

**Utilisation :**

```bash
# Importer une date spécifique
curl -X POST https://votre-domaine.com/api/admin/import-date \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "20251026"}'
```

---

## 🔍 Vérification et monitoring

### Vérifier l'état de la base de données

```bash
# Se connecter à PostgreSQL
docker exec -it kpi-postgres-prod psql -U dashboard_user -d mmtg_dashboard

# Vérifier les counts
SELECT
  (SELECT COUNT(*) FROM daily_kpi) as daily_kpi_count,
  (SELECT COUNT(*) FROM hourly_kpi) as hourly_kpi_count,
  (SELECT COUNT(*) FROM imt_transactions) as imt_count,
  (SELECT COUNT(*) FROM revenue_by_channel) as revenue_count;

# Vérifier les dates disponibles
SELECT DISTINCT date FROM daily_kpi ORDER BY date;

# Quitter psql
\q
```

### Logs d'import

```bash
# Voir les logs du backend
docker logs -f kpi-backend-prod

# Filtrer les logs d'import
docker logs kpi-backend-prod | grep -i "import\|ingestion"
```

---

## 🎯 Checklist de déploiement initial

- [ ] Serveur VPS configuré avec Docker et Docker Compose
- [ ] Application déployée (docker-compose up -d)
- [ ] Base de données PostgreSQL initialisée
- [ ] Seed des utilisateurs/rôles exécuté (`node src/seeders/seedDatabase.js`)
- [ ] Fichiers Excel KPI transférés sur le serveur
- [ ] Import des données historiques exécuté
- [ ] Vérification que les données sont bien en base
- [ ] Job quotidien d'import configuré et actif
- [ ] Frontend peut afficher les données du dashboard

---

## ⚠️ Troubleshooting

### "Cannot find module" errors
```bash
# Réinstaller les dépendances dans le conteneur
docker exec -it kpi-backend-prod npm install
```

### "Connection refused" à PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Vérifier les variables d'environnement
docker exec kpi-backend-prod env | grep DB_
```

### Import échoue sur certaines dates
```bash
# Vérifier que les fichiers Excel existent
docker exec kpi-backend-prod ls -la /app/kpi_data/202507/20250701/

# Vérifier les logs détaillés
docker exec kpi-backend-prod node -e "
const job = require('./src/jobs/dailyDataIngestion');
job.runForDate('20250701').catch(console.error);
"
```

---

## 📞 Support

En cas de problème, vérifier :
1. Les logs Docker : `docker logs kpi-backend-prod`
2. L'état des services : `docker-compose ps`
3. La connexion à la base : `docker exec kpi-backend-prod node -e "require('./src/models').sequelize.authenticate().then(() => console.log('OK'))"`
