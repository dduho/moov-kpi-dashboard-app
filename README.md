# Moov KPI Dashboard

A comprehensive KPI dashboard application for Moov, providing real-time analytics, automated data ingestion, and interactive visualizations for business intelligence.

## Overview

This application consists of:
- **Backend API**: Node.js/Express server with PostgreSQL database and Redis caching
- **Frontend Dashboard**: Vue.js 3 application with interactive charts and KPI visualizations
- **Data Ingestion Pipeline**: Automated FTP-based Excel file processing and KPI calculations
- **Docker Deployment**: Containerized environment for easy deployment

## Features

### Core Functionality
- **Automated Data Ingestion**: Daily Excel file processing from FTP server
- **Real-time KPIs**: Live calculation and caching of key performance indicators
- **Interactive Dashboard**: Multiple chart types and date range filtering
- **User Authentication**: Secure login with JWT tokens
- **Export Capabilities**: Download reports in various formats
- **Responsive Design**: Mobile-friendly interface

### KPIs Tracked
- Daily and hourly transaction volumes
- Revenue by business type and channel
- IMT (International Money Transfer) transactions
- Active user metrics
- Performance comparisons and trends

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Excel Files   │───▶│  Data Ingestion │───▶│   PostgreSQL    │
│   (FTP Server)  │    │   Pipeline      │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │◀───│   Backend API   │───▶│   Vue.js        │
│     Cache       │    │   (Express)     │    │   Frontend      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **Redis** for caching and session management
- **ExcelJS** for Excel file processing
- **basic-ftp** for FTP file transfers
- **JWT** for authentication
- **Winston** for logging

### Frontend
- **Vue.js 3** with Composition API
- **Vuetify 3** for rich Material Design components
- **Tailwind CSS** for utility-first custom styling
- **Pinia** for state management
- **Chart.js** for data visualization
- **Axios** for HTTP requests
- **Vite** for build tooling

### Infrastructure
- **Docker** & Docker Compose for containerization
- **PostgreSQL** for data persistence
- **Redis** for caching
- **FTP** for data ingestion

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- PostgreSQL (if running locally)

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd moov-kpi-app
   ```

2. **Environment configuration**:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

3. **Start with Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Or run locally**:
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Database Setup

The application includes database initialization scripts. On first run, the database will be automatically created with the required tables and initial data.

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
```

### KPIs
```
GET /api/kpis/dashboard
GET /api/kpis/daily
GET /api/kpis/hourly
GET /api/kpis/revenue
GET /api/kpis/users
```

### Data Export
```
GET /api/export/kpis
GET /api/export/revenue
```

## Data Ingestion

The system automatically processes Excel files from the configured FTP server:
- **Schedule**: Daily at 6:00 AM
- **Format**: Excel files with predefined column structures
- **Processing**: Validation, transformation, and KPI calculation
- **Availability**: Data becomes available the day after collection (J+1)

### Important Business Rule
**Data Availability Delay**: At date J, only data from J-1 is available. For example:
- Today (October 23, 2025): Data from October 22, 2025 is available
- Tomorrow (October 24, 2025): Data from October 23, 2025 will be available

This delay is due to the time required for data collection, processing, and validation before making it available in the dashboard.

#### **Format Requis**
Les fichiers Excel doivent être **compressés en RAR** avec la nomenclature suivante :
```
YYYYMMDD.rar
```
**Exemple :** `20250801.rar`

#### **Structure sur le Serveur FTP**
```
/Huawei/Kaly/KPI/
├── 202508/           # Dossier du mois (YYYYMM)
│   ├── 20250801.rar
│   ├── 20250802.rar
│   └── ...
└── 202509/           # Dossier du mois suivant
    ├── 20250901.rar
    └── ...
```

#### **Chemin complet d'accès**
- **Racine :** `/Huawei/Kaly/KPI`
- **Fichier exemple :** `/Huawei/Kaly/KPI/202508/20250801.rar`

## Détails techniques : où sont stockés les fichiers FTP et comment ils sont traités

Ce qui suit décrit précisément où les archives téléchargées depuis le FTP sont stockées temporairement, quel code les traite et comment les KPIs finissent dans le dashboard.

- Emplacement temporaire (local au backend) : `backend/temp/`
   - Le job d'ingestion crée des sous-dossiers par date (ex. `backend/temp/20250801/`) pour l'extraction.
   - Après traitement, le pipeline supprime automatiquement l'archive et le dossier d'extraction (cleanup).

- Service FTP : `backend/src/services/ftpService.js`
   - Méthodes principales : `downloadFile(remoteFileName, localPath)`, `listFiles(remotePath)`, `fileExists(...)`.
   - Configuration via `backend/.env` (variables `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASSWORD`, `FTP_REMOTE_PATH`).

- Job d'ingestion : `backend/src/jobs/dailyDataIngestion.js`
   - Planifié (cron) pour s'exécuter quotidiennement (voir schedule dans le fichier, configuration actuelle dans le code).
   - Étapes :
      1. Cherche et télécharge l'archive (.rar ou .zip) depuis le FTP dans `backend/temp/<DATE>.rar`.
      2. Détection du type d'archive et extraction (`node-unrar-js` pour RAR, `adm-zip` pour ZIP) vers `backend/temp/<DATE>/`.
      3. Appelle `excelParserService.parseAllFiles(extractPath, date)` pour parser tous les fichiers Excel extraits.
      4. Appelle `kpiCalculatorService.calculateDailyAggregates(date)` pour agréger les données et calculer les KPIs.
      5. Vide le cache via `cacheService.clearAll()` et supprime les fichiers temporaires (cleanup).

- Parser Excel : `backend/src/services/excelParserService.js`
   - Utilise `exceljs` pour lire les fichiers Excel.
   - Noms attendus (exemples) : `_MMTG_Daily_KPI_<date>.xlsx`, `_MMTG-Tools_Hourly_KPI_<date>.xlsx`, `_MMTG_IMT_Hourly_new-<date>.xlsx`, `_MMTG-Tools_Revenue_Compare_<date>.xlsx`.
   - Pour chaque fichier, les données sont insérées dans les modèles Sequelize via `bulkCreate` :
      - `DailyKpi`, `HourlyKpi`, `ImtTransaction`, `RevenueByChannel`, `ActiveUsers`.

- Calcul des KPIs : `backend/src/services/kpiCalculatorService.js`
   - Agrège les enregistrements bruts (lignes Excel) et calcule les métriques utilisées par le dashboard.
   - Écrit certaines comparaisons via `KpiComparisons.bulkCreate` (si nécessaire).

- API Dashboard : `backend/src/controllers/dashboardController.js`
   - Assemble les différents jeux de données (DailyKpi, HourlyKpi, ImtTransaction, RevenueByChannel, ActiveUsers) et construit l'objet `dashboardData` renvoyé à `/api/dashboard`.
   - Met en cache le résultat (ex : 5 minutes) via `cacheService`.

### Commandes utiles pour vérifier et déboguer
Exécute ces commandes depuis la racine du projet (ou je peux les exécuter pour toi si tu veux) :

1. Lister le contenu du répertoire temporaire dans le conteneur backend :
```powershell
docker-compose exec backend ls -la /usr/src/app/temp || ls -la backend/temp
```

2. Lancer le test d'ingestion complet (simule pipeline complet) :
```powershell
docker-compose exec backend node test-data-ingestion.js
```
Remarque : si le FTP n'est pas accessible depuis ton environnement, l'étape de téléchargement échouera.

3. Tester la connexion FTP et la lecture Excel (script de test present) :
```powershell
docker-compose exec backend node test-ftp-excel-verification.js
```

4. Vérifier le nombre d'enregistrements en base (exemple pour `DailyKpi`) :
```powershell
docker-compose exec backend node -e "const DailyKpi=require('./src/models/DailyKpi'); DailyKpi.count().then(c=>console.log('DailyKpi count:',c)).catch(e=>console.error(e));"
```

5. Suivre les logs du backend (utile pour voir l'exécution du job) :
```powershell
docker-compose logs -f backend
```

### Astuces pour le débogage
- Si tu veux conserver les fichiers téléchargés pour inspection, commente ou désactive l'appel `this.cleanup(...)` dans `backend/src/jobs/dailyDataIngestion.js` avant d'exécuter un test.
- Vérifie le fichier `backend/.env` pour t'assurer que les variables FTP sont correctes et que le conteneur backend peut atteindre l'IP/port (VPN, firewall interne peuvent bloquer l'accès).
- Si la structure des fichiers Excel change, mets à jour `excelParserService.js` pour mapper correctement les colonnes/feuilles.

Si tu veux, je peux :
- lancer `test-ftp-excel-verification.js` maintenant pour diagnostiquer l'accès FTP (je l'ai déjà essayé auparavant et il a renvoyé un ECONNREFUSED depuis cet environnement),
- ou bien exécuter un parsing local si tu me fournis une archive `.rar`/`.zip` à placer dans `backend/temp/`.


## Deployment

### Production Deployment

1. **Build the application**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment variables**: Ensure all production environment variables are set

3. **Database migration**: Run database migrations if needed

### Monitoring

- Application logs are available in `backend/logs/`
- Use the health check endpoint: `GET /api/health`
- Monitor Redis cache hit rates and database performance

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Linting
cd backend && npm run lint
cd frontend && npm run lint

# Formatting
cd frontend && npm run format
```

## Contributing

1. Follow the established code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PRs

## Security

- JWT tokens with configurable expiration
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure password hashing with bcrypt
- Audit logging for sensitive operations

## License

This project is proprietary software owned by Moov.