# Manual Setup Required
## AI for Inclusive Learning Platform

These are tasks that require manual setup by you. Follow these steps to complete the production setup.

---

## 🔐 1. API Keys & External Services

### OpenAI API (for AI Tutor)

**What it's for:** Real AI responses in the AI Tutor feature

**Steps:**
1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `server/.env`:
   ```
   OPENAI_API_KEY="sk-your-key-here"
   ```

**Cost:** ~$0.03 per 1K tokens (GPT-4), ~$0.002 per 1K tokens (GPT-3.5-turbo)

**Alternative:** Anthropic Claude
- Go to https://console.anthropic.com/
- Similar process
- Add `ANTHROPIC_API_KEY` instead

---

## 📧 2. Email Service (for Notifications)

**What it's for:** Send emails for password reset, notifications, etc.

### Option A: Gmail (Easiest for testing)

**Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Create an "App Password" for "Mail"
4. Copy the 16-character password
5. Add to `server/.env`:
   ```
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-16-char-app-password"
   ```

### Option B: SendGrid (Better for production)

**Steps:**
1. Sign up at https://sendgrid.com/
2. Create an API key
3. Verify your sender email
4. Add to `server/.env`:
   ```
   SENDGRID_API_KEY="SG.your-key-here"
   ```

---

## 🗣️ 3. Azure Speech Services (Optional - for TTS/STT)

**What it's for:** Text-to-Speech and Speech-to-Text features

**Steps:**
1. Create Azure account: https://azure.microsoft.com/
2. Create a "Speech Service" resource
3. Get the key and region
4. Add to `server/.env`:
   ```
   AZURE_SPEECH_KEY="your-key-here"
   AZURE_SPEECH_REGION="eastus"
   ```

**Cost:** 5 hours free per month, then ~$1 per hour

**Note:** Web Speech API works in browsers without this, but Azure provides better quality

---

## 🌍 4. Google Translate API (Optional - for Multi-language)

**What it's for:** Automatic translation of content

**Steps:**
1. Go to https://console.cloud.google.com/
2. Enable "Cloud Translation API"
3. Create credentials (API key)
4. Add to `server/.env`:
   ```
   GOOGLE_TRANSLATE_API_KEY="your-key-here"
   ```

**Cost:** $20 per 1M characters

---

## 🔒 5. SSL Certificate (for HTTPS in Production)

**What it's for:** Secure HTTPS connection

### Option A: Let's Encrypt (Free)

**Steps:**
1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Get certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. Auto-renewal is set up automatically

### Option B: Cloudflare (Free + CDN)

**Steps:**
1. Sign up at https://cloudflare.com/
2. Add your domain
3. Update nameservers at your domain registrar
4. Enable "Full (strict)" SSL mode
5. Cloudflare handles SSL automatically

---

## 🌐 6. Domain Name & DNS Setup

**What it's for:** Access your site via a custom domain

**Steps:**
1. Buy a domain from:
   - Namecheap: https://www.namecheap.com/
   - Google Domains: https://domains.google/
   - GoDaddy: https://www.godaddy.com/

2. Point DNS to your server:
   ```
   A Record: @ -> Your Server IP
   A Record: www -> Your Server IP
   ```

3. Wait 24-48 hours for DNS propagation

---

## 🖥️ 7. Production Server Setup

**What it's for:** Host the application

### Option A: VPS (DigitalOcean, Linode, AWS EC2)

**Recommended:** DigitalOcean Droplet ($12/month)

**Steps:**
1. Create account at https://www.digitalocean.com/
2. Create a Droplet (Ubuntu 22.04, 2GB RAM minimum)
3. SSH into server:
   ```bash
   ssh root@your-server-ip
   ```

4. Run setup:
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   
   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib
   
   # Install PM2
   npm install -g pm2
   
   # Install Nginx
   apt install -y nginx
   ```

5. Upload your code:
   ```bash
   # On your local machine
   rsync -avz --exclude node_modules ./ root@your-server-ip:/var/www/tisa-labs/
   ```

6. Setup database:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE tisa_labs;
   CREATE USER tisa_admin WITH PASSWORD 'TisaLabs2025!Secure';
   GRANT ALL PRIVILEGES ON DATABASE tisa_labs TO tisa_admin;
   \q
   ```

7. Deploy:
   ```bash
   cd /var/www/tisa-labs
   ./deploy.sh
   ```

### Option B: Platform as a Service (Easier)

**Vercel (Frontend):**
1. Sign up at https://vercel.com/
2. Connect GitHub repo
3. Deploy with one click
4. Free for hobby projects

**Railway (Backend + Database):**
1. Sign up at https://railway.app/
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. $5/month for starter

**Render (Full Stack):**
1. Sign up at https://render.com/
2. Create Web Service for backend
3. Create Static Site for frontend
4. Add PostgreSQL database
5. Free tier available

---

## 📊 8. Monitoring & Analytics (Optional)

### Sentry (Error Tracking)

**Steps:**
1. Sign up at https://sentry.io/
2. Create new project
3. Get DSN
4. Add to `.env`:
   ```
   SENTRY_DSN="your-dsn-here"
   ```

### Google Analytics

**Steps:**
1. Go to https://analytics.google.com/
2. Create property
3. Get Measurement ID
4. Add to `client/.env.production`:
   ```
   VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

---

## 🔐 9. Security Hardening

### Firewall Setup

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Fail2Ban (Prevent brute force)

```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Regular Updates

```bash
# Add to crontab
crontab -e

# Add this line:
0 2 * * * apt update && apt upgrade -y
```

---

## 💾 10. Backup Setup

### Database Backups

Create backup script:

```bash
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/tisa-labs"
mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump tisa_labs | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-db.sh
```

### File Backups

Use rsync or cloud storage:

```bash
# Backup to another server
rsync -avz /var/www/tisa-labs/ user@backup-server:/backups/tisa-labs/

# Or use AWS S3
aws s3 sync /var/www/tisa-labs/ s3://your-bucket/tisa-labs/
```

---

## 📱 11. Mobile App Setup (Future)

### React Native (if you want mobile apps)

**Steps:**
1. Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```

2. Create new project:
   ```bash
   expo init tisa-labs-mobile
   ```

3. Reuse API endpoints from backend
4. Publish to App Store / Play Store

**Cost:** $99/year (Apple), $25 one-time (Google)

---

## 🧪 12. Testing Setup

### End-to-End Testing

```bash
# Install Playwright
npm install -D @playwright/test

# Create test
cat > tests/e2e/login.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'student1@ailearning.com');
  await page.fill('[name="password"]', 'student123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
EOF

# Run tests
npx playwright test
```

---

## ✅ Setup Checklist

Copy this checklist and mark items as you complete them:

### Essential (Required for Production)
- [ ] Get OpenAI or Anthropic API key
- [ ] Setup email service (Gmail or SendGrid)
- [ ] Get domain name
- [ ] Setup production server (VPS or PaaS)
- [ ] Configure SSL certificate
- [ ] Setup database backups
- [ ] Configure firewall
- [ ] Test all features end-to-end

### Optional (Nice to Have)
- [ ] Azure Speech Services for TTS/STT
- [ ] Google Translate API
- [ ] Sentry for error tracking
- [ ] Google Analytics
- [ ] Fail2Ban for security
- [ ] CDN (Cloudflare)
- [ ] Mobile apps

### Post-Launch
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Plan feature updates
- [ ] Regular security updates

---

## 📞 Need Help?

**Documentation:**
- Backend API: See `CREDENTIALS.md`
- AI Integration: See `AI_INTEGRATION_GUIDE.md`
- Deployment: See `PRODUCTION.md`

**Common Issues:**
- Port already in use: Run `./stop.sh` first
- Database connection error: Check PostgreSQL is running
- API key not working: Check `.env` file format
- SSL certificate error: Wait 24h for DNS propagation

---

**Once you complete these steps, your platform will be 100% production-ready!** 🚀
