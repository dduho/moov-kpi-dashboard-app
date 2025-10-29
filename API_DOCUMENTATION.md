# 📚 Documentation API - KPI Dashboard

**Base URL**: `http://localhost:8000/api`

**Authentication**: Toutes les routes nécessitent un token JWT Bearer dans le header `Authorization`

```bash
Authorization: Bearer <your_jwt_token>
```

## 🔐 Authentication

### POST /auth/login
Authentification utilisateur

**Request Body**:
```json
{
  "username": "admin",
  "password": "p@ssw0rd"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@moov.com"
  }
}
```

---

## 👥 Users / Active Users

### GET /users/active
Récupère les statistiques des utilisateurs actifs

**Query Parameters**:
- `start_date` (optional): Date de début au format YYYYMMDD
- `end_date` (optional): Date de fin au format YYYYMMDD

**Example**:
```bash
GET /users/active?start_date=20250701&end_date=20250731
```

**Response**:
```json
{
  "total": {
    "clients": 5184359,
    "agents": 737,
    "merchants": 769,
    "new_registrations": 1234,
    "app_users": 98765
  },
  "average": {
    "clients": 1036872,
    "agents": 148,
    "merchants": 154,
    "new_registrations": 247,
    "app_users": 19753
  },
  "latest": {
    "date": "20250731",
    "clients": 1194834,
    "agents": 156,
    "merchants": 167,
    "new_registrations": 289,
    "app_users": 21456,
    "mom_evolution": 0.055593
  }
}
```

---

## 📊 KPIs

### GET /kpis/daily
Récupère les KPIs journaliers pour une date spécifique

**Query Parameters**:
- `date` (optional): Date au format YYYYMMDD

**Example**:
```bash
GET /kpis/daily?date=20250715
```

**Response**:
```json
[
  {
    "id": 1,
    "date": "20250715",
    "business_type": "P2P",
    "period": "J",
    "cnt": 25000,
    "amt": 5000000,
    "rev": 125000,
    "success_rate": 98.5
  }
]
```

### GET /kpis/daily-range
Récupère les KPIs journaliers pour une plage de dates

**Query Parameters**:
- `start_date` (required): Date de début au format YYYYMMDD
- `end_date` (required): Date de fin au format YYYYMMDD

**Example**:
```bash
GET /kpis/daily-range?start_date=20250701&end_date=20250731
```

### GET /kpis/hourly
Récupère les KPIs horaires pour une date spécifique

**Query Parameters**:
- `date` (required): Date au format YYYYMMDD

**Example**:
```bash
GET /kpis/hourly?date=20250715
```

**Response**:
```json
[
  {
    "id": 1,
    "date": "20250715",
    "hour": 14,
    "txn_type_name": "P2P",
    "cnt": 2500,
    "amt": 500000,
    "rev": 12500
  }
]
```

### GET /kpis/hourly-performance
Récupère les performances horaires

**Query Parameters**:
- `date` (required): Date au format YYYYMMDD
- `businessType` (optional): Type de business

**Example**:
```bash
GET /kpis/hourly-performance?date=20250715&businessType=P2P
```

### GET /kpis/weekly
Récupère les KPIs hebdomadaires

**Example**:
```bash
GET /kpis/weekly
```

---

## 💰 Revenue

### GET /revenue/by-channel
Récupère les revenus par canal

**Query Parameters**:
- `start_date` (required): Date de début au format YYYYMMDD
- `end_date` (required): Date de fin au format YYYYMMDD

**Example**:
```bash
GET /revenue/by-channel?start_date=20250701&end_date=20250731
```

**Response**:
```json
[
  {
    "id": 1,
    "date": "2025-07-15",
    "channel": "MFS_SEND",
    "revenue": 125000.50,
    "transactions": 2500,
    "amount": 5000000
  }
]
```

---

## 🌍 IMT (International Money Transfer)

### GET /imt
Récupère les données IMT

**Query Parameters**:
- `date` (optional): Date unique au format YYYYMMDD
- `start_date` (optional): Date de début au format YYYYMMDD
- `end_date` (optional): Date de fin au format YYYYMMDD

**Example**:
```bash
GET /imt?start_date=20250701&end_date=20250731
```

**Response**:
```json
[
  {
    "id": 1,
    "date": "20250715",
    "country": "Senegal",
    "imt_business": "SEND",
    "cnt": 1500,
    "amt": 3000000,
    "rev": 45000,
    "success_rate": 97.5
  }
]
```

### GET /imt/country/:country
Récupère les données IMT par pays

**Path Parameters**:
- `country`: Nom du pays

**Query Parameters**:
- `start_date` (required): Date de début
- `end_date` (required): Date de fin

**Example**:
```bash
GET /imt/country/Senegal?start_date=20250701&end_date=20250731
```

### GET /imt/countries
Récupère les statistiques IMT par pays

**Query Parameters**:
- `start_date` (required): Date de début
- `end_date` (required): Date de fin

**Example**:
```bash
GET /imt/countries?start_date=20250701&end_date=20250731
```

---

## 📈 Comparisons

### GET /comparisons/daily
Récupère les comparaisons journalières

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /comparisons/daily?start_date=20250701&end_date=20250731
```

**Response**:
```json
[
  {
    "date": "20250715",
    "business_type": "P2P",
    "current_cnt": 25000,
    "previous_cnt": 23000,
    "cnt_diff": 2000,
    "cnt_percent": 8.7
  }
]
```

### GET /comparisons/hourly
Récupère les comparaisons horaires

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /comparisons/hourly?start_date=20250701&end_date=20250731
```

### GET /comparisons/yearly
Récupère les comparaisons annuelles

**Query Parameters**:
- `year` (optional): Année (format YYYY)

**Example**:
```bash
GET /comparisons/yearly?year=2025
```

---

## 📡 Channels

### GET /channels/metrics
Récupère les métriques par canal

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /channels/metrics?start_date=20250701&end_date=20250731
```

**Response**:
```json
[
  {
    "date": "2025-07-15",
    "channel": "ETHUB_SEND",
    "users_count": 1500,
    "transactions_count": 25000,
    "revenue": 125000,
    "amount": 5000000,
    "mom_revenue_percent": 12.5,
    "mom_transactions_percent": 8.3
  }
]
```

---

## 🎯 Advanced Analytics

### GET /analytics/performance-dashboard
Tableau de bord de performance global

**Query Parameters**:
- `date` (required): Date au format YYYYMMDD

**Example**:
```bash
GET /analytics/performance-dashboard?date=20250715
```

### GET /analytics/trend-analysis
Analyse des tendances

**Query Parameters**:
- `start_date` (required): Date de début
- `end_date` (required): Date de fin
- `metric` (optional): Métrique (revenue, transactions, users)

**Example**:
```bash
GET /analytics/trend-analysis?start_date=20250701&end_date=20250731&metric=revenue
```

### GET /analytics/cohort-analysis
Analyse de cohortes

**Query Parameters**:
- `start_date` (required): Date de début
- `end_date` (required): Date de fin
- `cohort_size` (optional): Taille de la cohorte (daily, weekly, monthly)

**Example**:
```bash
GET /analytics/cohort-analysis?start_date=20250701&end_date=20250731&cohort_size=weekly
```

### GET /analytics/segmentation
Segmentation des utilisateurs

**Query Parameters**:
- `date` (required): Date
- `segment_type` (optional): Type de segment (channel, business_type, country)

**Example**:
```bash
GET /analytics/segmentation?date=20250715&segment_type=channel
```

### GET /analytics/comparative
Analyses comparatives

**Query Parameters**:
- `date` (required): Date
- `compare_with` (optional): Date de comparaison

**Example**:
```bash
GET /analytics/comparative?date=20250715&compare_with=20250708
```

---

## 📥 Export

### GET /export/excel
Exporte les données en Excel

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /export/excel?start_date=20250701&end_date=20250731
```

**Response**: Fichier Excel en téléchargement

### GET /export/csv
Exporte les données en CSV

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin
- `type` (optional): Type de données (kpis, revenue, imt, users)

**Example**:
```bash
GET /export/csv?start_date=20250701&end_date=20250731&type=kpis
```

---

## 🏪 Merchants

### GET /merchants/performance
Performance des marchands

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /merchants/performance?start_date=20250701&end_date=20250731
```

---

## 🏬 Agents

### GET /agents/performance
Performance des agents

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /agents/performance?start_date=20250701&end_date=20250731
```

---

## 📌 Dashboard

### GET /dashboard
Données complètes du tableau de bord

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /dashboard?start_date=20250701&end_date=20250731
```

**Response**:
```json
{
  "overview": {
    "totalRevenue": 5000000,
    "totalTransactions": 125000,
    "totalUsers": 1500000,
    "averageTransactionValue": 40
  },
  "daily": [...],
  "hourly": [...],
  "channels": [...],
  "imt": [...]
}
```

---

## 🎓 Acquisition

### GET /acquisition/metrics
Métriques d'acquisition

**Query Parameters**:
- `start_date` (optional): Date de début
- `end_date` (optional): Date de fin

**Example**:
```bash
GET /acquisition/metrics?start_date=20250701&end_date=20250731
```

---

## ⚠️ Error Responses

Toutes les routes peuvent retourner les codes d'erreur suivants:

### 400 Bad Request
```json
{
  "error": "Missing date parameter. Please provide either 'date' or 'start_date' and 'end_date'"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## 📝 Notes

### Format de Date
- Toutes les dates doivent être au format `YYYYMMDD` (ex: `20250715`)
- Les dates ISO-8601 ne sont **pas** supportées

### Pagination
Actuellement, aucune pagination n'est implémentée. Les endpoints retournent toutes les données correspondant aux critères.

### Cache
Le système utilise un cache en mémoire avec un TTL de 300 secondes (5 minutes) pour les requêtes fréquentes.

### Rate Limiting
Aucune limitation de débit n'est actuellement implémentée.

---

## 🔧 Exemples avec cURL

### Authentification
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"p@ssw0rd"}'
```

### Récupérer les KPIs journaliers
```bash
TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:8000/api/kpis/daily?date=20250715" \
  -H "Authorization: Bearer $TOKEN"
```

### Récupérer les utilisateurs actifs
```bash
curl -X GET "http://localhost:8000/api/users/active?start_date=20250701&end_date=20250731" \
  -H "Authorization: Bearer $TOKEN"
```

### Exporter en Excel
```bash
curl -X GET "http://localhost:8000/api/export/excel?start_date=20250701&end_date=20250731" \
  -H "Authorization: Bearer $TOKEN" \
  -O -J
```

---

## 📚 Ressources Additionnelles

- **Base de données**: SQLite (`backend/database/dev.sqlite`)
- **Logs**: Console output avec Winston logger
- **Architecture**: REST API avec Express.js + Sequelize ORM
- **Authentication**: JWT avec jsonwebtoken
- **Cache**: In-memory avec option Redis (désactivé par défaut)

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-10-29
