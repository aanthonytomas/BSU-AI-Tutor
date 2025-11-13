# Production Deployment Guide

This guide covers deploying TISA Labs to production.

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Enable PostgreSQL SSL connections
- [ ] Setup firewall rules (UFW)
- [ ] Configure CORS for specific domains
- [ ] Enable rate limiting
- [ ] Setup HTTPS/SSL certificates
- [ ] Disable debug mode
- [ ] Remove development dependencies

### Database
- [ ] Setup automated backups
- [ ] Configure connection pooling
- [ ] Enable query logging
- [ ] Setup database monitoring
- [ ] Create read replicas (if needed)

### Application
- [ ] Build optimized production bundles
- [ ] Setup process manager (PM2)
- [ ] Configure logging (Winston/Morgan)
- [ ] Setup error tracking (Sentry)
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Setup health check endpoints
- [ ] Configure auto-restart on failure

### Infrastructure
- [ ] Setup reverse proxy (Nginx)
- [ ] Configure load balancer (if needed)
- [ ] Setup CDN for static assets
- [ ] Configure backup strategy
- [ ] Setup disaster recovery plan

## Installation Steps

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Configuration

```bash
# Secure PostgreSQL
sudo -u postgres psql << EOF
ALTER USER postgres WITH PASSWORD 'strong_postgres_password';
CREATE DATABASE tisa_labs_prod;
CREATE USER tisa_prod WITH ENCRYPTED PASSWORD 'strong_production_password';
GRANT ALL PRIVILEGES ON DATABASE tisa_labs_prod TO tisa_prod;
ALTER DATABASE tisa_labs_prod OWNER TO tisa_prod;
\q
EOF

# Configure PostgreSQL for production
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: max_connections = 100
# Set: shared_buffers = 256MB
# Set: effective_cache_size = 1GB

sudo systemctl restart postgresql
```

### 3. Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> tisa-labs
cd tisa-labs

# Install dependencies
npm run install:all

# Configure environment
cd server
cat > .env << 'EOF'
DATABASE_URL="postgresql://tisa_prod:strong_production_password@localhost:5432/tisa_labs_prod?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=5000
NODE_ENV=production
CORS_ORIGIN="https://yourdomain.com"
EOF

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Build application
cd ..
npm run build

# Setup PM2
cd server
pm2 start dist/index.js --name tisa-labs-api
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/tisa-labs
```

Add configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/tisa-labs/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/tisa-labs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 6. Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-tisa-labs.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/tisa-labs"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U tisa_prod tisa_labs_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-tisa-labs.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-tisa-labs.sh
```

### 7. Monitoring Setup

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs tisa-labs-api
pm2 monit
```

## Environment Variables (Production)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tisa_labs_prod?schema=public"

# Security
JWT_SECRET="<generate-with-openssl-rand-base64-32>"
NODE_ENV="production"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# Server
PORT=5000

# Optional: Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Optional: Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Performance Optimization

### Database Indexing

Add to `schema.prisma`:

```prisma
model Sample {
  // ... existing fields
  @@index([status])
  @@index([createdAt])
  @@index([sampleType])
}

model Test {
  // ... existing fields
  @@index([status])
  @@index([createdAt])
}
```

Run migration:

```bash
npx prisma migrate dev --name add_indexes
```

### Nginx Caching

Add to Nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Maintenance

### Update Application

```bash
cd /var/www/tisa-labs
git pull
npm run install:all
npm run build
cd server
npx prisma migrate deploy
pm2 restart tisa-labs-api
```

### Database Maintenance

```bash
# Vacuum database
sudo -u postgres psql -d tisa_labs_prod -c "VACUUM ANALYZE;"

# Check database size
sudo -u postgres psql -d tisa_labs_prod -c "SELECT pg_size_pretty(pg_database_size('tisa_labs_prod'));"
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql
```

## Troubleshooting

### Application won't start

```bash
pm2 logs tisa-labs-api --lines 100
pm2 restart tisa-labs-api
```

### Database connection issues

```bash
sudo -u postgres psql -d tisa_labs_prod
# Check connections: SELECT * FROM pg_stat_activity;
```

### High memory usage

```bash
pm2 restart tisa-labs-api
# Or increase Node.js memory:
pm2 delete tisa-labs-api
pm2 start dist/index.js --name tisa-labs-api --max-memory-restart 500M
```

## Security Best Practices

1. **Regular Updates**: Keep all packages updated
2. **Strong Passwords**: Use password manager
3. **Principle of Least Privilege**: Limit user permissions
4. **Regular Backups**: Test restore procedures
5. **Monitor Logs**: Check for suspicious activity
6. **Rate Limiting**: Prevent brute force attacks
7. **Input Validation**: Already implemented in API
8. **HTTPS Only**: Redirect HTTP to HTTPS
9. **Security Headers**: Already configured in Nginx
10. **Regular Security Audits**: Use `npm audit`

## Support

For production issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/error.log`
3. PostgreSQL logs: `/var/log/postgresql/`
4. System logs: `journalctl -xe`
