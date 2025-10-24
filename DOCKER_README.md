# Docker Setup for Moov KPI Dashboard

This project is fully configured for Docker containerization with the following services:

- **PostgreSQL**: Database server
- **Redis**: Caching and session storage
- **Backend**: Node.js/Express API server
- **Frontend**: Vue.js application served by Nginx
- **Ingestion**: Python data processing service

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Internet connection for initial image downloads

## Quick Start

1. **Clone the repository and navigate to the project root**

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your secure passwords and keys.

3. **Start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Services Details

### Backend (Port 8000)
- Node.js 18 Alpine
- Express.js API
- Health check endpoint: `/health`
- Auto-starts data ingestion job

### Frontend (Port 8080)
- Vue.js 3 with Vite
- Nginx for serving static files
- Proxies API calls to backend

### Database (Port 5432)
- PostgreSQL 15 Alpine
- Auto-initializes with `database/init.sql`

### Redis (Port 6379)
- Redis 7 Alpine
- Used for caching and sessions

### Ingestion Service
- Python 3.11 slim
- Processes FTP data files
- Runs data transformation jobs

## Development

For development with hot reloading:

```bash
# Start only database and redis
docker-compose up postgres redis

# Run backend locally
cd backend && npm run dev

# Run frontend locally
cd frontend && npm run dev
```

## Troubleshooting

### Build Issues
- Ensure Docker has sufficient resources (4GB+ RAM)
- Check internet connection for image downloads
- Clear Docker cache: `docker system prune -a`

### Port Conflicts
- Change ports in `docker-compose.yml` if needed
- Update frontend API calls accordingly

### Database Connection
- Verify `.env` file has correct `DB_PASSWORD`
- Check PostgreSQL logs: `docker-compose logs postgres`

### Health Checks
All services include health checks. Monitor with:
```bash
docker-compose ps
```

## Production Deployment

For production, use `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## File Structure

```
docker/
├── Dockerfile.backend      # Backend container
├── Dockerfile.frontend     # Frontend container
├── Dockerfile.ingestion    # Data ingestion container
├── nginx.conf             # Nginx configuration
└── crontab               # Cron jobs for ingestion

database/
└── init.sql              # Database initialization

backend/                  # Node.js API
frontend/                 # Vue.js app
ingestion/                # Python data processor
```