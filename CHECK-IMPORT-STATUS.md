# 🔍 Commandes de vérification de l'import

## Vérifier la progression de l'import

### 1. Vérification rapide du nombre de dates importées

```bash
docker-compose exec backend node -e "
const {DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel} = require('./src/models');
(async () => {
  const dailyDates = await DailyKpi.findAll({
    attributes: ['date'],
    group: ['date'],
    order: [['date', 'ASC']],
    raw: true
  });

  console.log('╔════════════════════════════════════════╗');
  console.log('║     ÉTAT DE L\'IMPORT DES DONNÉES      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Progression : ' + dailyDates.length + ' / 114 dates importées');

  if (dailyDates.length > 0) {
    console.log('📅 Première date : ' + dailyDates[0].date);
    console.log('📅 Dernière date : ' + dailyDates[dailyDates.length - 1].date);
  }

  const percentage = Math.round((dailyDates.length / 114) * 100);
  console.log('📈 Avancement : ' + percentage + '%');
  console.log('');

  if (dailyDates.length === 114) {
    console.log('✅ ✅ ✅ IMPORT TERMINÉ ! ✅ ✅ ✅');
  } else {
    console.log('⏳ Import en cours... (' + (114 - dailyDates.length) + ' dates restantes)');
  }

  process.exit(0);
})();
"
```

### 2. Vérification détaillée de toutes les tables

```bash
docker-compose exec backend node -e "
const {DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel} = require('./src/models');
(async () => {
  const [daily, hourly, imt, revenue] = await Promise.all([
    DailyKpi.count(),
    HourlyKpi.count(),
    ImtTransaction.count(),
    RevenueByChannel.count()
  ]);

  console.log('╔════════════════════════════════════════╗');
  console.log('║    STATISTIQUES DE LA BASE DE DONNÉES ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📊 DailyKpi records       : ' + daily.toLocaleString());
  console.log('📊 HourlyKpi records      : ' + hourly.toLocaleString());
  console.log('📊 ImtTransaction records : ' + imt.toLocaleString());
  console.log('📊 RevenueByChannel records: ' + revenue.toLocaleString());
  console.log('');
  console.log('📈 Total records          : ' + (daily + hourly + imt + revenue).toLocaleString());

  process.exit(0);
})();
"
```

### 3. Vérification de la plage de dates complète

```bash
docker-compose exec backend node -e "
const {DailyKpi} = require('./src/models');
(async () => {
  const dates = await DailyKpi.findAll({
    attributes: ['date'],
    group: ['date'],
    order: [['date', 'ASC']],
    raw: true
  });

  console.log('╔════════════════════════════════════════╗');
  console.log('║       PLAGE DE DATES IMPORTÉES        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📅 Dates importées : ' + dates.length + ' / 114');
  console.log('');

  if (dates.length > 0) {
    const firstDate = dates[0].date;
    const lastDate = dates[dates.length - 1].date;

    console.log('📌 Première date : ' + firstDate);
    console.log('📌 Dernière date : ' + lastDate);
    console.log('');

    // Vérifier les dates manquantes
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-10-22');
    const expectedDates = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      expectedDates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    const importedDates = dates.map(d => d.date);
    const missingDates = expectedDates.filter(d => !importedDates.includes(d));

    if (missingDates.length === 0) {
      console.log('✅ Toutes les dates sont présentes !');
    } else {
      console.log('⚠️  Dates manquantes : ' + missingDates.length);
      console.log('');
      console.log('📋 Dates manquantes :');
      missingDates.slice(0, 10).forEach(d => console.log('   - ' + d));
      if (missingDates.length > 10) {
        console.log('   ... et ' + (missingDates.length - 10) + ' autres');
      }
    }
  }

  process.exit(0);
})();
"
```

### 4. Tester un appel API avec les nouvelles données

```bash
# Générer un nouveau token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"p@ssw0rd"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Tester l'API dashboard avec une plage de dates
curl -s "http://localhost:3000/api/dashboard?startDate=20250701&endDate=20251022" \
  -H "Authorization: Bearer $TOKEN" | head -c 500

echo ""
echo ""
echo "Si vous voyez des données JSON ci-dessus, l'API fonctionne ! ✅"
```

### 5. Vérifier que le script d'import est toujours en cours

```bash
# Vérifier les processus Node.js dans le conteneur
docker-compose exec backend ps aux | grep node

# Si vous voyez "node scripts/import-all-dates.js", l'import est toujours en cours
```

### 6. Voir les logs en temps réel de l'import (si toujours en cours)

```bash
docker-compose logs -f backend | grep -E "Importing|imported|✅|❌|SUMMARY"
```

---

## 🎯 Critères de succès

L'import est **TERMINÉ et RÉUSSI** si :

- ✅ 114 dates importées (du 2025-07-01 au 2025-10-22)
- ✅ DailyKpi records ≥ 2,000 (environ 20-30 par jour × 114 jours)
- ✅ HourlyKpi records ≥ 2,500 (environ 24-96 par jour × 114 jours)
- ✅ Aucune date manquante dans la plage
- ✅ L'API `/api/dashboard` retourne des données sans erreur

---

## 🔄 Si l'import n'est pas terminé

**Vérifier la progression :**
```bash
# Commande simple
docker-compose exec backend node -e "
const {DailyKpi} = require('./src/models');
DailyKpi.findAll({
  attributes: ['date'],
  group: ['date']
}).then(rows => {
  console.log('Progression : ' + rows.length + ' / 114 dates');
  process.exit(0);
});
"
```

**Relancer l'import si nécessaire :**
```bash
# Arrêter le script en cours (si bloqué)
docker-compose restart backend

# Attendre 10 secondes
sleep 10

# Relancer l'import
docker-compose exec backend node scripts/import-all-dates.js
```

---

## 🚀 Une fois l'import terminé

### Tester le dashboard

1. Ouvrir le navigateur : http://localhost:5173
2. Se connecter avec : admin / p@ssw0rd
3. Sélectionner une plage de dates (par exemple 01/07/2025 - 31/07/2025)
4. Vérifier que les graphiques affichent des données
5. Tester différentes pages : Daily KPI, Hourly KPI, IMT, Revenue

### Commandes de vérification finale

```bash
# Vérifier que toutes les APIs fonctionnent
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"p@ssw0rd"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Testing dashboard API..."
curl -s "http://localhost:3000/api/dashboard?startDate=20250701&endDate=20250710" \
  -H "Authorization: Bearer $TOKEN" | head -c 200

echo -e "\n\nTesting daily KPI API..."
curl -s "http://localhost:3000/api/kpis/daily?date=20250705" \
  -H "Authorization: Bearer $TOKEN" | head -c 200

echo -e "\n\nTesting hourly KPI API..."
curl -s "http://localhost:3000/api/kpis/hourly?date=20250705" \
  -H "Authorization: Bearer $TOKEN" | head -c 200

echo -e "\n\n✅ Si vous voyez du JSON ci-dessus, tout fonctionne !"
```

---

## 📞 Besoin d'aide ?

Si l'import échoue ou si vous voyez des erreurs :

1. **Vérifier les logs :**
   ```bash
   docker-compose logs backend --tail 100
   ```

2. **Vérifier l'espace disque :**
   ```bash
   df -h
   ```

3. **Vérifier la connexion à PostgreSQL :**
   ```bash
   docker-compose exec backend node -e "
   const {sequelize} = require('./src/models');
   sequelize.authenticate().then(() => {
     console.log('✅ PostgreSQL connecté');
     process.exit(0);
   }).catch(err => {
     console.error('❌ Erreur PostgreSQL:', err.message);
     process.exit(1);
   });
   "
   ```

4. **Redémarrer les services si nécessaire :**
   ```bash
   docker-compose restart
   ```
