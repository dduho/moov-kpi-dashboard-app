# Deployment Guide

This guide covers deployment procedures for the Moov KPI Dashboard application.

## Environment Requirements

### Production Server Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: 2+ cores
- **RAM**: 4GB+ minimum, 8GB recommended
- **Storage**: 50GB+ SSD storage
- **Network**: Stable internet connection

### Software Dependencies
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (if not using Docker)
- Redis 6+ (if not using Docker)
- Nginx (for reverse proxy)

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Prepare the server**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose-plugin
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd moov-kpi-app
   ```

3. **Configure environment**:
   ```bash
   # Copy and edit environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env

   # Edit with production values
   nano backend/.env
   nano frontend/.env
   ```

4. **Build and deploy**:
   ```bash
   # Build the application
   docker-compose -f docker-compose.prod.yml build

   # Start services
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Verify deployment**:
   ```bash
   # Check service status
   docker-compose -f docker-compose.prod.yml ps

   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Option 2: Manual Deployment

1. **Setup PostgreSQL**:
   ```bash
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib

   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE mmtg_dashboard;
   CREATE USER dashboard_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE mmtg_dashboard TO dashboard_user;
   \q
   ```

2. **Setup Redis**:
   ```bash
   # Install Redis
   sudo apt install redis-server

   # Configure Redis (optional)
   sudo nano /etc/redis/redis.conf
   ```

3. **Deploy Backend**:
   ```bash
   cd backend

   # Install dependencies
   npm ci --production

   # Build the application
   npm run build

   # Start with PM2
   npm install -g pm2
   pm2 start dist/app.js --name "kpi-backend"
   ```

4. **Deploy Frontend**:
   ```bash
   cd frontend

   # Install dependencies
   npm ci

   # Build for production
   npm run build

   # Serve with Nginx
   sudo cp -r dist/* /var/www/html/
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mmtg_dashboard
DB_USER=dashboard_user
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# FTP
FTP_HOST=ftp.moov.com
FTP_PORT=21
FTP_USER=production_user
FTP_PASSWORD=secure_ftp_password
FTP_REMOTE_PATH=/production/data

# API
API_PORT=3000
API_BASE_URL=https://api.moov.com
JWT_SECRET=your_secure_jwt_secret

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/kpi-dashboard/app.log

# Email
SMTP_HOST=smtp.moov.com
SMTP_PORT=587
SMTP_USER=alerts@moov.com
SMTP_PASSWORD=secure_smtp_password
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=https://api.moov.com/api
VITE_API_TIMEOUT=15000
VITE_APP_TITLE=Moov KPI Dashboard
VITE_APP_VERSION=1.0.0
```

### Nginx Configuration

Create `/etc/nginx/sites-available/kpi-dashboard`:

```nginx
server {
    listen 80;
    server_name kpi.moov.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kpi-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Configuration

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d kpi.moov.com

# Configure auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### Health Checks
- Application health: `GET /api/health`
- Database connectivity: Monitor PostgreSQL logs
- Cache performance: Monitor Redis hit rates

### Log Management
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Log rotation (logrotate)
sudo nano /etc/logrotate.d/kpi-dashboard
```

### Backup Strategy
```bash
# Database backup
pg_dump -U dashboard_user -h localhost mmtg_dashboard > backup_$(date +%Y%m%d).sql

# File backup
tar -czf frontend_backup_$(date +%Y%m%d).tar.gz /var/www/html/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify connection credentials
   - Check firewall settings

2. **Redis Connection Failed**
   - Verify Redis service is running
   - Check Redis configuration
   - Test connectivity with `redis-cli ping`

3. **FTP Connection Failed**
   - Verify FTP server credentials
   - Check network connectivity
   - Review FTP server logs

4. **Application Not Starting**
   - Check Docker logs: `docker-compose logs`
   - Verify environment variables
   - Check port availability

### Performance Tuning

1. **Database Optimization**
   - Create appropriate indexes
   - Monitor query performance
   - Configure connection pooling

2. **Cache Optimization**
   - Adjust Redis memory limits
   - Configure cache TTL values
   - Monitor cache hit rates

3. **Application Scaling**
   - Use PM2 clustering for Node.js
   - Implement load balancing
   - Consider CDN for static assets

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Disable unnecessary services
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement rate limiting
- [ ] Secure API endpoints
- [ ] Encrypt sensitive data
- [ ] Regular backups

## Support

For deployment issues, check:
1. Application logs
2. Docker container status
3. System resource usage
4. Network connectivity
5. Database and cache status