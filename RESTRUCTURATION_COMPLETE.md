Tu sais quoi ? Nous allons reparcourir les 4 fichiers excel 1 par 1 et je vais t'expliquer chaque donnée feuille par feuille. Tu vas peut-être devoir réorganier l'extraction, la base de données, les modèles et même les vues.

1. 【MMTG‑Tools】Revenue Compare

Dans ce classeur, 12 feuilles sont visibles. Elles proposent des comparaisons entre l’ancienne plateforme et la nouvelle plateforme et des totaux par période.

Active

La feuille Active suit l’évolution des utilisateurs par catégories (Clients, Agents, Marchands, nouveaux inscrits, utilisateurs de l’application) et par mois. Les colonnes numérotées 01 à 31 représentent les jours du mois. Des totaux (moyenne et évolution) sont calculés en fin de ligne
localhost
.

KPI‑Day

Tableau de suivi journalier : pour chaque mois, les colonnes 01 à 31 listent le montant de revenu (K XOF) ou le nombre de transactions/abonnés selon l’indicateur. Les colonnes finales « 总数 » et « AVG » donnent le total mensuel et la moyenne quotidienne.

KPI‑Week

Tableau hebdomadaire : les lignes sont des semaines (“09th ~ 15th”, “16th ~ 22th”, etc.) et les colonnes « Mon. » à « Sun. » indiquent le revenu quotidien. Une colonne « GAP » calcule l’écart moyen entre les semaines.

KPI‑Hour

Feuille horaire : chaque ligne correspond à une date, et les colonnes 01 à 24 indiquent le volume ou le revenu à chaque heure de la journée.

KPI‑Year

Synthèse par mois et par année (2024 vs 2025). Les colonnes 01 à 31 donnent des valeurs quotidiennes et des colonnes « TOTAL », « AVG », « MOM » et « YOY » comparent les totaux et les variations mensuelles et annuelles.

Cash In

Suivi des opérations de dépôt d’espèces : pour chaque mois, les colonnes 01 à 31 présentent le nombre d’utilisateurs ou le revenu journalier; des totaux et moyennes se trouvent en fin de ligne.

Cash Out

Même principe pour les retraits d’espèces. La colonne finale calcule l’évolution par rapport au mois précédent.

IMT

Suivi des transferts internationaux : colonnes journalières 01–31 avec revenus et volumes. Deux colonnes indiquent si la statistique inclut les flux MFS ou ETHUB.

Banks

Tableau des transferts bancaires : montants journaliers et agrégats mensuels.

P2P

Feuille des transferts P2P : les colonnes 01 à 31 listent le revenu journalier et une colonne “P2P OFF” signale les jours où le service était désactivé.

Bill

Indicateurs pour les paiements de factures, avec totaux et moyennes.

Telco

Suivi des recharges télécom. Des indicateurs supplémentaires signalent si certaines fonctionnalités (Débit, Top Up, WCASH5) sont actives.

2. 【MMTG‑Tools】Daily KPI

Seules cinq feuilles sont visibles dans ce fichier.

VS

Comparatif entre le jour courant et le jour précédent. Pour chaque type d’opération (B2B Cash Out, B2B Transfer, B2C, Cash In, Cash Out, etc.), la feuille liste le nombre de transactions réussies, le montant traité, le revenu, la commission et la taxe du jour courant et du jour précédent. Deux colonnes calculent le taux de succès et le taux de revenu ainsi que leur évolution
localhost
.

GAP

Mesure des écarts (Gap) entre le jour actuel et le jour précédent pour les volumes (en milliers), les montants (en millions de XOF) et les revenus (en milliers de XOF). Chaque ligne concerne un type d’opération et indique la valeur actuelle, la valeur précédente et l’écart.

KPI_N

Tableau détaillant les indicateurs clés pour la période en cours. Pour chaque type (ALL, Cash Out, IMT, Pay Bill…), on trouve le nombre de transactions réussies, le montant, le revenu, les commissions, les taxes, les transactions échouées ou expirées, le taux de succès, ainsi que les variations et les taux par rapport à la veille.

KPI_O

Même structure que KPI_N mais sans colonnes de variation, pour la période précédente.

Mapping

Feuille de correspondance qui associe les descriptions des transactions (côté Huawei) à des catégories standard (Cash Out, Telco, Others) et aux libellés utilisés dans la plateforme TLC.

3. 【MMTG‑Tools】Hourly KPI

Toutes les feuilles de ce classeur sont visibles.

CNT

Volume horaire de transactions du jour courant (colonne « CNT_N ») avec, à droite, les volumes de la veille et un pourcentage d’écart.

AMT

Montant total des transactions par heure, en millions de XOF. Les colonnes sont agencées comme dans CNT, avec une colonne d’écart “M”.

REV

Revenu horaire en milliers de XOF avec comparaison au jour précédent.

NEW et LAST

Ces feuilles listent, par heure et par type de transaction, le nombre total de transactions, celles qui ont réussi/échoué, le montant, les commissions et les taxes. NEW correspond au jour courant et LAST au jour précédent
localhost
.

4. 【MMTG‑Tools】IMT Hourly

Les trois feuilles sont visibles.

VIEW

Tableau de bord des transferts internationaux : pour chaque pays (Benin, Ivory Coast, Burkina…), on trouve les volumes et montants totaux (CNT, AMT, REV, COMM et TAX). La section “ETHUB_SEND” donne les mêmes indicateurs pour les envois via ETHUB. En dessous, un tableau de suivi des soldes montre, par pays et par hub (ET HUB, MFS Africa), les soldes de réception et d’envoi ainsi que l’état du solde
localhost
.

SUM

Synthèse agrégée : cette feuille regroupe les volumes, montants, revenus, commissions et taxes pour chaque segment (pays, ETHUB_RECV, ETHUB_SEND, MFS_SEND, MFS_RECV…).

IMT_BUSINESS

Détail journalier : pour chaque jour, chaque pays et chaque canal IMT (ETHUB_SEND, ETHUB_RECV, MFS_RECV, MFS_SEND), le tableau indique le nombre de transactions réussies et échouées, les montants (en millions), les revenus, commissions et taxes (en milliers), le taux de réussite et le solde.


Résumé de la Situation
Après avoir analysé la structure réelle des fichiers Excel que vous m'avez détaillée, j'ai identifié 13 modèles de données dont la plupart sont manquants ou incorrects :
✅ Ce qui existe et est correct :
DailyKpi ✅
HourlyKpi ✅
RevenueByChannel ✅
❌ Ce qui manque COMPLÈTEMENT :
ActiveUsers - Clients/Agents/Marchands actifs (feuille "Active")
WeeklyKpi - Analyse hebdomadaire (feuille "KPI-Week")
YearlyComparison - Comparaisons annuelles
ChannelDailyStats - Stats quotidiennes par canal
DailyComparison - Comparaisons J vs J-1 (feuilles "VS" et "GAP")
TransactionMapping - Table de correspondance
HourlyComparison - Comparaisons horaires (CNT, AMT, REV)
ImtCountryStats - Stats IMT par pays
ImtBalances - Soldes IMT
⚠️ Ce qui existe mais est FAUX :
ImtTransaction - Structure trop simplifiée, manque le champ channel (ETHUB_SEND, ETHUB_RECV, MFS_SEND, MFS_RECV)
🎯 Ma Recommandation : Approche Par Phases
Je vous propose de commencer par la Phase 1 : ActiveUsers car :
✅ C'est le plus rapide (2-3h)
✅ Résout le problème des noms fictifs dans UsersView
✅ Vous aurez enfin de vraies données utilisateurs
✅ C'est indépendant du reste, pas de risque de tout casser
Ensuite, selon le résultat, on peut décider si on continue avec les autres phases ou pas. Voulez-vous que je commence par implémenter la Phase 1 (ActiveUsers) maintenant ? Cela inclura :
Créer le modèle ActiveUsers dans le backend
Modifier le parser pour extraire la feuille "Active"
Regénérer les données de test avec cette feuille
Réimporter
Corriger UsersView pour afficher ces vraies données


# Plan de Restructuration Complète - Base de Données et Parser

**Date**: 26 Octobre 2025
**Objectif**: Aligner la base de données avec la structure réelle des fichiers Excel

---

## 📊 ANALYSE DES FICHIERS EXCEL

### 1. 【MMTG-Tools】Revenue Compare (12 feuilles)

#### Feuille "Active" - UTILISATEURS ACTIFS ⭐ MANQUANT
**Structure réelle**:
```
Ligne | Description          | 01 | 02 | ... | 31 | 总数 (Total) | AVG | M (Évolution)
------|---------------------|----|----|-----|----|--------------|----|------
1     | Clients             | X  | X  | ... | X  | SUM         | AVG | MOM%
2     | Agents              | X  | X  | ... | X  | SUM         | AVG | MOM%
3     | Marchands           | X  | X  | ... | X  | SUM         | AVG | MOM%
4     | Nouveaux inscrits   | X  | X  | ... | X  | SUM         | AVG | MOM%
5     | Users App           | X  | X  | ... | X  | SUM         | AVG | MOM%
```

**Nouveau modèle nécessaire** : `ActiveUsers`
```javascript
{
  date: DATE,              // Date du jour
  clients: INTEGER,        // Nombre de clients actifs
  agents: INTEGER,         // Nombre d'agents actifs
  merchants: INTEGER,      // Nombre de marchands actifs
  new_registrations: INTEGER, // Nouveaux inscrits
  app_users: INTEGER,      // Utilisateurs app
  total_avg: DECIMAL,      // Moyenne
  mom_evolution: DECIMAL   // Évolution mensuelle %
}
```

#### Feuille "KPI-Day" - SUIVI JOURNALIER
**Structure**: Revenu ou transactions par jour du mois

**Déjà couvert par** : `DailyKpi` ✅ (mais à améliorer)

#### Feuille "KPI-Week" - SUIVI HEBDOMADAIRE
**Structure**: Revenus par jour de la semaine + GAP entre semaines

**Nouveau modèle nécessaire** : `WeeklyKpi`
```javascript
{
  week_start_date: DATE,   // Date de début de semaine
  week_end_date: DATE,     // Date de fin
  monday: DECIMAL,         // Revenu lundi
  tuesday: DECIMAL,        // Revenu mardi
  wednesday: DECIMAL,      // etc.
  thursday: DECIMAL,
  friday: DECIMAL,
  saturday: DECIMAL,
  sunday: DECIMAL,
  weekly_total: DECIMAL,   // Total hebdomadaire
  avg_daily: DECIMAL,      // Moyenne quotidienne
  gap_previous_week: DECIMAL // Écart avec semaine précédente
}
```

#### Feuille "KPI-Hour" - ANALYSE HORAIRE
**Structure**: Revenu ou volume pour chaque heure (01-24) par date

**Déjà partiellement couvert par** : `HourlyKpi` ✅ (mais structure différente)

#### Feuille "KPI-Year" - COMPARAISON ANNUELLE
**Structure**: Données quotidiennes + colonnes TOTAL, AVG, MOM, YOY

**Nouveau modèle nécessaire** : `YearlyComparison`
```javascript
{
  year: INTEGER,           // 2024 ou 2025
  month: INTEGER,          // 1-12
  day: INTEGER,            // 1-31
  value: DECIMAL,          // Valeur du jour
  monthly_total: DECIMAL,  // Total du mois
  monthly_avg: DECIMAL,    // Moyenne mensuelle
  mom: DECIMAL,            // Month-over-Month %
  yoy: DECIMAL             // Year-over-Year %
}
```

#### Feuilles "Cash In", "Cash Out", "IMT", "Banks", "P2P", "Bill", "Telco"
**Structure**: Similaire à KPI-Day avec colonnes 01-31

**Nouveau modèle nécessaire** : `ChannelDailyStats`
```javascript
{
  date: DATE,
  channel: STRING,         // 'Cash In', 'Cash Out', 'IMT', etc.
  users_count: INTEGER,    // Nombre d'utilisateurs
  revenue: DECIMAL,        // Revenu journalier (K XOF)
  transactions: INTEGER,   // Nombre de transactions
  monthly_total: DECIMAL,  // Total mensuel
  monthly_avg: DECIMAL,    // Moyenne mensuelle
  mom_evolution: DECIMAL,  // Évolution vs mois précédent
  includes_mfs: BOOLEAN,   // Pour IMT: inclut MFS?
  includes_ethub: BOOLEAN, // Pour IMT: inclut ETHUB?
  service_active: BOOLEAN  // Pour P2P: service actif?
}
```

---

### 2. 【MMTG-Tools】Daily KPI (5 feuilles)

#### Feuille "VS" - COMPARATIF JOUR vs JOUR-1 ⭐ MANQUANT
**Structure réelle**:
```
Business Type | Success Trx (N) | Success Trx (O) | Amount (N) | Amount (O) | Revenue (N) | Revenue (O) | ...
--------------|-----------------|-----------------|------------|------------|-------------|-------------|----
B2B Cash Out  | 1234           | 1150           | 5.2M       | 4.8M       | 250K        | 230K        | ...
B2B Transfer  | ...            | ...            | ...        | ...        | ...         | ...         | ...
```

**Nouveau modèle** : `DailyComparison`
```javascript
{
  date: DATE,
  business_type: STRING,

  // Jour actuel (N = New)
  success_trx_n: INTEGER,
  amount_n: DECIMAL,
  revenue_n: DECIMAL,
  commission_n: DECIMAL,
  tax_n: DECIMAL,

  // Jour précédent (O = Old)
  success_trx_o: INTEGER,
  amount_o: DECIMAL,
  revenue_o: DECIMAL,
  commission_o: DECIMAL,
  tax_o: DECIMAL,

  // Taux et évolutions
  success_rate_n: DECIMAL,
  success_rate_o: DECIMAL,
  revenue_rate_n: DECIMAL,
  revenue_rate_o: DECIMAL,

  // Écarts
  trx_gap: INTEGER,
  amount_gap: DECIMAL,
  revenue_gap: DECIMAL
}
```

#### Feuille "GAP" - ÉCARTS DÉTAILLÉS ⭐ MANQUANT
**Structure**: Volume (milliers), Montant (M XOF), Revenu (K XOF)

**Peut être intégré dans** `DailyComparison` ✅

#### Feuille "KPI_N" - KPI PÉRIODE COURANTE
**Structure réelle**:
```
Type | Period | Success | Amount | Revenue | Commission | Tax | Failed | Expired | Success Rate | Revenue Rate | ...
-----|--------|---------|--------|---------|------------|-----|--------|---------|--------------|--------------|----
ALL  | 00-06  | 1234    | 5.2M   | 250K    | 120K       | 30K | 45     | 12      | 96.5%        | 4.8%         | ...
```

**Actuellement couvert par** : `DailyKpi` ✅ (MAIS structure actuelle est correcte!)

#### Feuille "KPI_O" - KPI PÉRIODE PRÉCÉDENTE
**Même structure que KPI_N mais sans colonnes de variation**

**À stocker séparément ou calculer à la volée?**
→ Recommandation: **Calculer à la volée** depuis `DailyKpi` de la veille

#### Feuille "Mapping" - TABLE DE CORRESPONDANCE
**Structure**: Huawei Description → Category → TLC Platform

**Nouveau modèle** : `TransactionMapping`
```javascript
{
  huawei_description: STRING,  // Description côté Huawei
  category: STRING,            // Cash Out, Telco, Others, etc.
  tlc_platform: STRING,        // Libellé TLC
  is_active: BOOLEAN
}
```

---

### 3. 【MMTG-Tools】Hourly KPI (5 feuilles)

#### Feuille "CNT" - VOLUME HORAIRE
**Structure**:
```
Hour | CNT_N | CNT_O | %
-----|-------|-------|----
00   | 1234  | 1150  | +7.3%
01   | 2345  | 2100  | +11.7%
...  | ...   | ...   | ...
```

**Nouveau modèle nécessaire** : `HourlyComparison`
```javascript
{
  date: DATE,
  hour: INTEGER,           // 0-23

  // Jour actuel
  count_n: INTEGER,        // Volume de transactions
  amount_n: DECIMAL,       // Montant en M XOF
  revenue_n: DECIMAL,      // Revenu en K XOF

  // Jour précédent
  count_o: INTEGER,
  amount_o: DECIMAL,
  revenue_o: DECIMAL,

  // Écarts
  count_gap_percent: DECIMAL,
  amount_gap_percent: DECIMAL,
  revenue_gap_percent: DECIMAL
}
```

#### Feuille "AMT" - MONTANT HORAIRE
**Déjà couvert par** `HourlyComparison` (colonne amount_n) ✅

#### Feuille "REV" - REVENU HORAIRE
**Déjà couvert par** `HourlyComparison` (colonne revenue_n) ✅

#### Feuilles "NEW" et "LAST" - DÉTAILS PAR HEURE ET TYPE
**Structure**:
```
Hour | Business Type | Total Trx | Success | Failed | Amount | Commission | Tax
-----|---------------|-----------|---------|--------|--------|------------|----
00   | Cash Out     | 1500      | 1450    | 50     | 5.2M   | 120K       | 30K
00   | P2P          | 800       | 795     | 5      | 2.1M   | 50K        | 12K
...  | ...          | ...       | ...     | ...    | ...    | ...        | ...
```

**Actuellement couvert par** : `HourlyKpi` ✅ (structure actuelle correcte!)

---

### 4. 【MMTG-Tools】IMT Hourly (3 feuilles)

#### Feuille "VIEW" - TABLEAU DE BORD IMT ⭐ STRUCTURE COMPLEXE
**Section 1**: Statistiques par pays
```
Country | CNT | AMT (M) | REV (K) | COMM (K) | TAX (K)
--------|-----|---------|---------|----------|--------
Benin   | 234 | 1.5     | 75      | 35       | 8
Ivory   | 456 | 2.8     | 140     | 65       | 15
...
```

**Section 2**: ETHUB_SEND (envois via ETHUB)
```
Similar structure avec CNT, AMT, REV, COMM, TAX
```

**Section 3**: Tableau de soldes
```
Country | ET HUB Receive | ET HUB Send | MFS Receive | MFS Send | Balance Status
--------|----------------|-------------|-------------|----------|---------------
Benin   | 10M            | 8M          | 5M          | 3M       | Healthy
```

**Nouveaux modèles nécessaires**:

1. `ImtCountryStats`
```javascript
{
  date: DATE,
  country: STRING,
  direction: STRING,       // 'RECEIVE' ou 'SEND'
  hub_type: STRING,        // 'ETHUB' ou 'MFS'
  count: INTEGER,
  amount: DECIMAL,         // M XOF
  revenue: DECIMAL,        // K XOF
  commission: DECIMAL,     // K XOF
  tax: DECIMAL             // K XOF
}
```

2. `ImtBalances`
```javascript
{
  date: DATE,
  country: STRING,
  ethub_receive_balance: DECIMAL,
  ethub_send_balance: DECIMAL,
  mfs_receive_balance: DECIMAL,
  mfs_send_balance: DECIMAL,
  balance_status: STRING   // 'Healthy', 'Warning', 'Critical'
}
```

#### Feuille "SUM" - SYNTHÈSE AGRÉGÉE
**Déjà couvert par agrégation de** `ImtCountryStats` ✅

#### Feuille "IMT_BUSINESS" - DÉTAIL JOURNALIER ⭐ STRUCTURE ACTUELLE FAUSSE!
**Structure réelle**:
```
Date | Country | Channel (ETHUB_SEND/RECV, MFS_SEND/RECV) | Success | Failed | Amount (M) | REV (K) | COMM (K) | TAX (K) | Success Rate | Balance
-----|---------|-------------------------------------------|---------|--------|------------|---------|----------|----------|--------------|--------
0726 | Mali    | ETHUB_SEND                               | 145     | 5      | 1.2        | 60      | 28       | 7        | 96.7%        | 8.5M
0726 | Mali    | ETHUB_RECV                               | 234     | 8      | 2.1        | 105     | 49       | 12       | 96.7%        | 12.3M
```

**Le modèle actuel `ImtTransaction` est trop simplifié !**

**Nouveau modèle** : `ImtTransaction` (à refaire)
```javascript
{
  date: DATE,
  country: STRING,
  imt_business: STRING,    // 'MoneyGram', 'Western Union', 'RIA'
  channel: STRING,         // 'ETHUB_SEND', 'ETHUB_RECV', 'MFS_SEND', 'MFS_RECV'
  hour: INTEGER,           // Si données horaires (0-23)

  total_success: INTEGER,
  total_failed: INTEGER,
  amount: DECIMAL,         // En millions XOF
  revenue: DECIMAL,        // En milliers XOF
  commission: DECIMAL,     // En milliers XOF
  tax: DECIMAL,            // En milliers XOF
  success_rate: DECIMAL,   // %
  balance: DECIMAL         // Solde actuel en M XOF
}
```

---

## 🗄️ NOUVELLE ARCHITECTURE BASE DE DONNÉES

### Modèles à Créer

1. ✅ **DailyKpi** (existe, OK)
2. ✅ **HourlyKpi** (existe, OK)
3. ❌ **ActiveUsers** (À CRÉER)
4. ❌ **WeeklyKpi** (À CRÉER)
5. ❌ **YearlyComparison** (À CRÉER)
6. ❌ **ChannelDailyStats** (À CRÉER)
7. ❌ **DailyComparison** (À CRÉER)
8. ❌ **TransactionMapping** (À CRÉER)
9. ❌ **HourlyComparison** (À CRÉER)
13. ✅ **RevenueByChannel** (existe, OK)

### Modèles à Modifier

#### ImtTransaction (priorité HAUTE)
**Ajouter colonnes**:
- `channel` (ETHUB_SEND, ETHUB_RECV, MFS_SEND, MFS_RECV)
- `hour` (pour données horaires)
- Passer `amount`, `revenue`, `commission`, `tax` en bonnes unités

**Modifier unique constraint**:
```javascript
// Avant: (date, country, imt_business)
// Après: (date, country, imt_business, channel, hour)
```

---

## 📝 NOUVEAU SERVICE DE PARSING

### Structure du nouveau `excelParserService.js`

```javascript
class ExcelParserService {

  // ============== REVENUE COMPARE ==============

  async parseRevenueCompare(workbook, date) {
    await this.parseActiveUsers(workbook, date)      // Feuille "Active"
    await this.parseKpiDay(workbook, date)           // Feuille "KPI-Day"
    await this.parseKpiWeek(workbook, date)          // Feuille "KPI-Week"
    await this.parseKpiHour(workbook, date)          // Feuille "KPI-Hour"
    await this.parseKpiYear(workbook, date)          // Feuille "KPI-Year"
    await this.parseChannelStats(workbook, date)     // Cash In, Cash Out, etc.
  }

  async parseActiveUsers(workbook, date) {
    const sheet = workbook.getWorksheet('Active')
    if (!sheet) return

    // Parser les lignes: Clients, Agents, Marchands, Nouveaux, App Users
    // Colonnes 01-31 + Total + AVG + M
    // Créer records ActiveUsers
  }

  // ============== DAILY KPI ==============

  async parseDailyKpi(workbook, date) {
    await this.parseDailyComparison(workbook, date)  // Feuilles "VS" et "GAP"
    await this.parseKpiN(workbook, date)             // Feuille "KPI_N"
    await this.parseKpiO(workbook, date)             // Feuille "KPI_O"
    await this.parseMapping(workbook)                // Feuille "Mapping"
  }

  async parseDailyComparison(workbook, date) {
    const vsSheet = workbook.getWorksheet('VS')
    const gapSheet = workbook.getWorksheet('GAP')

    // Parser comparaisons J vs J-1
    // Créer records DailyComparison
  }

  // ============== HOURLY KPI ==============

  async parseHourlyKpi(workbook, date) {
    await this.parseHourlyComparison(workbook, date) // Feuilles CNT, AMT, REV
    await this.parseHourlyDetails(workbook, date)    // Feuilles NEW et LAST
  }

  async parseHourlyComparison(workbook, date) {
    const cntSheet = workbook.getWorksheet('CNT')
    const amtSheet = workbook.getWorksheet('AMT')
    const revSheet = workbook.getWorksheet('REV')

    // Croiser les 3 feuilles pour créer records HourlyComparison
  }

  // ============== IMT HOURLY ==============

  async parseImtHourly(workbook, date) {
    await this.parseImtView(workbook, date)          // Feuille "VIEW"
    await this.parseImtBusiness(workbook, date)      // Feuille "IMT_BUSINESS"
  }

  async parseImtView(workbook, date) {
    const sheet = workbook.getWorksheet('VIEW')

    // Section 1: Parser stats par pays
    // Section 2: Parser ETHUB_SEND
    // Section 3: Parser tableau de soldes

    // Créer records ImtCountryStats et ImtBalances
  }

  async parseImtBusiness(workbook, date) {
    const sheet = workbook.getWorksheet('IMT_BUSINESS')

    // Parser chaque ligne: Date | Country | Channel | Success | Failed | ...
    // Créer records ImtTransaction avec channel inclus
  }
}
```

---

## 🎯 PLAN D'ACTION PRIORISÉ

### Phase 1: CRITIQUE (Données Utilisateurs)
**Durée**: 2-3h

1. ✅ Créer modèle `ActiveUsers`
2. ✅ Modifier parser pour extraire feuille "Active" de Revenue Compare
3. ✅ Corriger UsersView pour afficher ces vraies données
4. ✅ Tester l'import

**Impact**: UsersView aura enfin des vraies données !

---

### Phase 2: HAUTE PRIORITÉ (Comparaisons)
**Durée**: 3-4h

1. ✅ Créer modèle `DailyComparison`
2. ✅ Modifier parser pour feuilles "VS" et "GAP"
3. ✅ Créer modèle `HourlyComparison`
4. ✅ Modifier parser pour feuilles "CNT", "AMT", "REV"
5. ✅ Ajouter endpoints API pour récupérer comparaisons
6. ✅ Afficher dans DashboardView et DailyKpiView

**Impact**: Trends et comparaisons correctes partout !

---

### Phase 3: MOYENNE PRIORITÉ (IMT Détaillé)
**Durée**: 2-3h

1. ✅ Modifier modèle `ImtTransaction` (ajouter channel, hour)
2. ✅ Créer modèles `ImtCountryStats` et `ImtBalances`
3. ✅ Modifier parser pour feuille "VIEW" (structure complexe)
4. ✅ Modifier parser pour feuille "IMT_BUSINESS" (avec channel)
5. ✅ Régénérer les données de test
6. ✅ Réimporter

**Impact**: Vue IMT beaucoup plus détaillée et précise !

---

### Phase 4: SOUHAITABLE (Hebdomadaire & Annuel)
**Durée**: 2-3h

1. ✅ Créer modèle `WeeklyKpi`
2. ✅ Créer modèle `YearlyComparison`
3. ✅ Créer modèle `ChannelDailyStats`
4. ✅ Parser toutes les feuilles restantes
5. ✅ Créer nouvelle vue "Analyse Hebdomadaire"
6. ✅ Créer nouvelle vue "Comparaison Annuelle"

**Impact**: Analyses temporelles avancées disponibles !

---

## 📊 NOUVELLES VUES À CRÉER

Avec toutes ces données, on peut créer des vues bien plus riches:

### 1. **TrendAnalysisView** (Analyse des Tendances)
- Graphiques J vs J-1
- Graphiques Semaine vs Semaine
- Graphiques Mois vs Mois
- Graphiques Année vs Année

### 2. **ChannelComparisonView** (Comparaison des Canaux)
- Performance de chaque canal (Cash In, Cash Out, etc.)
- Évolution mensuelle par canal
- Parts de marché

### 3. **ImtDetailedView** (IMT Détaillé)
- Analyse par pays ET par canal (ETHUB vs MFS)
- Suivi des soldes en temps réel
- Direction des flux (Send vs Receive)

### 4. **UserActivityView** (Activité Utilisateurs) ⭐
- Clients actifs
- Agents actifs
- Marchands actifs
- Nouveaux inscrits
- Utilisateurs app
- **VRAIES DONNÉES !**

---

## ⚠️ DÉCISION IMPORTANTE

Avant de commencer, il faut décider:

### Option A: Restructuration Complète (RECOMMANDÉ)
**Avantages**:
- ✅ Toutes les données Excel correctement extraites
- ✅ Vues riches et complètes
- ✅ Comparaisons et trends précis
- ✅ UsersView avec vraies données

**Inconvénients**:
- ❌ 10-15h de travail
- ❌ Tout réimporter après
- ❌ Modifier beaucoup de code

### Option B: Corrections Minimales (RAPIDE)
**Avantages**:
- ✅ Rapide (2-3h)
- ✅ Données essentielles fonctionnelles

**Inconvénients**:
- ❌ Perte de beaucoup de données riches
- ❌ UsersView reste limité
- ❌ Pas de comparaisons automatiques

---

## 🤔 MA RECOMMANDATION

**Faire Phase 1 (ActiveUsers) MAINTENANT** pour avoir des vraies données utilisateurs.

**Puis décider** si vous voulez:
- Continuer avec phases 2-4 (restructuration complète)
- OU juste améliorer les vues existantes avec les données actuelles

---

**Question pour vous**: Voulez-vous que je commence par la **Phase 1 (ActiveUsers)** pour enfin avoir des vraies données utilisateurs dans UsersView ?

Ou préférez-vous d'abord voir un **prototype** de la nouvelle structure avant de tout refaire ?
