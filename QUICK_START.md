# 🚀 Quick Start Guide
## AI for Inclusive Learning Platform

**Get started in 5 minutes!**

---

## ✅ Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed

---

## 🏃 Quick Start (Development)

### 1. Clone & Install

```bash
cd /home/aanthonytomas/Projects/WEB\ SYSTEM/TISA-Labs

# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Setup Database

```bash
# Database is already configured!
# Database: tisa_labs
# User: tisa_admin
# Password: TisaLabs2025!Secure

# Apply migrations
cd server
npx prisma migrate dev
npx prisma db seed
cd ..
```

### 3. Start Development

```bash
# Use the start script
./start.sh

# Or manually:
cd server && npm run dev &
cd client && npm run dev &
```

### 4. Access the Platform

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### 5. Login

Use any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | student1@ailearning.com | student123 |
| Teacher | teacher@ailearning.com | teacher123 |
| Admin | admin@ailearning.com | admin123 |

---

## 🎯 What to Explore

### As a Student
1. View your dashboard
2. Browse courses
3. Enroll in a course
4. View lessons
5. Chat with AI tutor
6. Check settings

### As a Teacher
1. View teacher dashboard
2. See student enrollments
3. Monitor progress
4. Create courses

---

## 📚 Documentation

- **CREDENTIALS.md** - All credentials & API docs
- **MANUAL_SETUP_REQUIRED.md** - External services setup
- **AI_INTEGRATION_GUIDE.md** - AI integration steps
- **COMPLETION_REPORT.md** - Full project report

---

## 🔧 Common Commands

```bash
# Start services
./start.sh

# Stop services
./stop.sh

# View database
cd server && npx prisma studio

# Run migrations
cd server && npx prisma migrate dev

# Seed database
cd server && npx prisma db seed

# Deploy to production
./deploy.sh
```

---

## 🚨 Troubleshooting

**Port already in use:**
```bash
./stop.sh
# Or manually:
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**Dependencies not installed:**
```bash
cd server && npm install
cd client && npm install
```

---

## 🎉 Next Steps

1. ✅ Explore the platform
2. 📖 Read MANUAL_SETUP_REQUIRED.md
3. 🤖 Setup AI integration
4. 🚀 Deploy to production

---

**Everything is ready! Start exploring!** 🎓
