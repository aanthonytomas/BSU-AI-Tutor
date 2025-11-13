# TISA Labs - Quick Setup Guide

This guide will help you get TISA Labs up and running quickly on Ubuntu.

## Quick Start (Ubuntu)

### 1. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Setup Database

```bash
# Switch to postgres user and create database
sudo -u postgres psql << EOF
CREATE DATABASE tisa_labs;
CREATE USER tisa_user WITH ENCRYPTED PASSWORD 'tisa_password_123';
GRANT ALL PRIVILEGES ON DATABASE tisa_labs TO tisa_user;
ALTER DATABASE tisa_labs OWNER TO tisa_user;
\q
EOF
```

### 3. Clone and Setup Project

```bash
# Navigate to project directory
cd /home/aanthonytomas/Projects/WEB\ SYSTEM/TISA-Labs

# Install all dependencies
npm run install:all
```

### 4. Configure Environment

```bash
# Create server .env file
cd server
cat > .env << 'EOF'
DATABASE_URL="postgresql://tisa_user:tisa_password_123@localhost:5432/tisa_labs?schema=public"
JWT_SECRET="tisa-labs-secret-key-change-in-production"
PORT=5000
NODE_ENV=development
EOF
cd ..
```

### 5. Initialize Database

```bash
# Generate Prisma client and run migrations
cd server
npx prisma generate
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed

cd ..
```

### 6. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 7. Login

Open http://localhost:3000 in your browser and login with:
- **Email**: admin@tisalabs.com
- **Password**: admin123

## One-Line Setup (After PostgreSQL is installed)

```bash
cd /home/aanthonytomas/Projects/WEB\ SYSTEM/TISA-Labs && \
npm run install:all && \
cd server && \
echo 'DATABASE_URL="postgresql://tisa_user:tisa_password_123@localhost:5432/tisa_labs?schema=public"
JWT_SECRET="tisa-labs-secret-key-change-in-production"
PORT=5000
NODE_ENV=development' > .env && \
npx prisma generate && \
npx prisma migrate dev --name init && \
npx prisma db seed && \
cd .. && \
npm run dev
```

## Useful Commands

### Database Management

```bash
# View database in Prisma Studio
cd server && npx prisma studio

# Reset database (WARNING: Deletes all data)
cd server && npx prisma migrate reset

# Create new migration
cd server && npx prisma migrate dev --name your_migration_name
```

### Development

```bash
# Run only backend
cd server && npm run dev

# Run only frontend
cd client && npm run dev

# Build for production
npm run build

# Start production server
cd server && npm start
```

### Troubleshooting

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check if ports are available
sudo lsof -i :3000
sudo lsof -i :5000

# View server logs
cd server && npm run dev

# Clear node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

## Production Deployment

For production deployment:

1. Update `.env` with production database credentials
2. Change `JWT_SECRET` to a strong random string
3. Set `NODE_ENV=production`
4. Build the application: `npm run build`
5. Use a process manager like PM2:

```bash
# Install PM2
sudo npm install -g pm2

# Start server
cd server
pm2 start dist/index.js --name tisa-labs-api

# Save PM2 configuration
pm2 save
pm2 startup
```

6. Serve the frontend build with Nginx or Apache
7. Setup SSL certificates with Let's Encrypt

## Security Checklist

- [ ] Change default database password
- [ ] Update JWT_SECRET to a strong random value
- [ ] Enable PostgreSQL authentication
- [ ] Setup firewall rules
- [ ] Enable HTTPS
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Implement rate limiting
- [ ] Setup monitoring and logging

---

For detailed documentation, see [README.md](README.md)
