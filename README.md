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