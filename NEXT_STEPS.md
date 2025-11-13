# Next Steps to Complete TISA Labs Setup

## Current Status

✅ **Completed:**
- Full-stack application code created
- Backend API with Express + TypeScript
- Frontend React application with modern UI
- Database schema with Prisma ORM
- Authentication system
- All CRUD operations
- Dashboard and analytics
- Dependencies installed

## Remaining Steps to Make Production Ready

### 1. Database Setup (Required)

```bash
# Install PostgreSQL (if not installed)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE tisa_labs;
CREATE USER tisa_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tisa_labs TO tisa_user;
ALTER DATABASE tisa_labs OWNER TO tisa_user;
\q
EOF
```

### 2. Environment Configuration (Required)

```bash
# Create .env file in server directory
cd server
cat > .env << 'EOF'
DATABASE_URL="postgresql://tisa_user:your_secure_password@localhost:5432/tisa_labs?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=5000
NODE_ENV=development
EOF
```

### 3. Run Database Migrations (Required)

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

This will:
- Generate Prisma Client
- Create database tables
- Seed initial data (admin user + test templates)

### 4. Start the Application (Required)

```bash
# From root directory
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Default Login:**
- Email: admin@tisalabs.com
- Password: admin123

## Production Deployment Checklist

### Security Hardening

- [ ] **Change Default Passwords**
  - Update admin password after first login
  - Change database password from default
  
- [ ] **Generate Strong JWT Secret**
  ```bash
  openssl rand -base64 32
  ```
  
- [ ] **Enable HTTPS**
  - Install SSL certificate (Let's Encrypt)
  - Configure Nginx reverse proxy
  
- [ ] **Setup Firewall**
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw enable
  ```

- [ ] **Configure CORS**
  - Update CORS_ORIGIN in .env to your domain
  - Remove wildcard (*) CORS in production

- [ ] **Enable Rate Limiting**
  - Add express-rate-limit middleware
  - Protect login and API endpoints

### Database Optimization

- [ ] **Enable Connection Pooling**
  - Configure Prisma connection pool
  - Set appropriate pool size

- [ ] **Add Database Indexes**
  - Already defined in schema.prisma
  - Run migrations to apply

- [ ] **Setup Automated Backups**
  ```bash
  # Daily backup script
  0 2 * * * pg_dump -U tisa_user tisa_labs | gzip > /backups/tisa_labs_$(date +\%Y\%m\%d).sql.gz
  ```

- [ ] **Configure PostgreSQL for Production**
  - Tune shared_buffers, effective_cache_size
  - Enable query logging
  - Setup monitoring

### Application Deployment

- [ ] **Build for Production**
  ```bash
  npm run build
  ```

- [ ] **Setup Process Manager (PM2)**
  ```bash
  sudo npm install -g pm2
  cd server
  pm2 start dist/index.js --name tisa-labs-api
  pm2 save
  pm2 startup
  ```

- [ ] **Configure Nginx**
  - Reverse proxy for API
  - Serve frontend static files
  - Enable gzip compression
  - Add security headers

- [ ] **Setup Monitoring**
  - PM2 monitoring: `pm2 monit`
  - Application logs
  - Database performance
  - Server resources

### Additional Production Features

- [ ] **Email Notifications**
  - Configure SMTP settings
  - Send test result notifications
  - Password reset emails

- [ ] **Logging System**
  - Winston for structured logging
  - Log rotation
  - Error tracking (Sentry)

- [ ] **API Documentation**
  - Swagger/OpenAPI docs
  - Postman collection

- [ ] **Testing**
  - Unit tests
  - Integration tests
  - E2E tests

- [ ] **CI/CD Pipeline**
  - GitHub Actions / GitLab CI
  - Automated testing
  - Automated deployment

## Quick Start Script

Use the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Check prerequisites
2. Install dependencies
3. Setup database
4. Run migrations
5. Seed data
6. Provide next steps

## Troubleshooting

### TypeScript Errors

All TypeScript errors will resolve once dependencies are installed. If you still see errors:

```bash
# Regenerate Prisma Client
cd server
npx prisma generate

# Restart TypeScript server in your IDE
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U tisa_user -d tisa_labs -h localhost
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :5000

# Kill process
kill -9 <PID>
```

## Documentation

- **README.md** - General overview and quick start
- **PRODUCTION.md** - Detailed production deployment guide
- **SETUP.md** - Step-by-step setup instructions
- **NEXT_STEPS.md** - This file

## Support

For issues:
1. Check logs: `pm2 logs` or `npm run dev`
2. Verify database connection
3. Check environment variables
4. Review error messages

## Estimated Time to Production

- **Minimal Setup** (Development): 15-30 minutes
- **Full Production Setup**: 2-4 hours
- **With Security Hardening**: 4-8 hours

## What's Already Done

✅ Complete full-stack application
✅ Modern React UI with TailwindCSS
✅ RESTful API with Express
✅ Database schema with Prisma
✅ Authentication & authorization
✅ Role-based access control
✅ Sample management
✅ Test management
✅ Results tracking
✅ Dashboard analytics
✅ User management
✅ Responsive design
✅ Type-safe TypeScript
✅ Production-ready architecture

## What You Need to Do

1. **Setup PostgreSQL database** (5 min)
2. **Configure .env file** (2 min)
3. **Run migrations** (2 min)
4. **Start application** (1 min)
5. **Test and verify** (10 min)

**Total: ~20 minutes to get running!**

For production deployment, follow PRODUCTION.md for complete guide.
