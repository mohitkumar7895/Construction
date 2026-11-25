# Sartaj Construction — Premium Full-Stack Construction Platform & Dynamic MySQL Admin CMS

A production-ready construction & infrastructure website with a complete dynamic MySQL Admin Dashboard, Section Page Builder, Media Library (Sharp WebP compression), Inquiry CRM, GSAP + Lenis animation engine, and Dynamic Local SEO system built for **Sartaj Hussain** (Haldwani, Nainital, Uttarakhand – 263139).

## Tech Stack
- **Frontend**: Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS v4, Lucide React Icons
- **Animations**: GSAP 3, ScrollTrigger, GSAP Flip, `@gsap/react`, Lenis Smooth Scroll (all admin-configurable & reduced-motion compliant)
- **Backend**: Next.js Route Handlers (REST API), `mysql2/promise` connection pooling with parameterized queries, Zod validation, `sanitize-html`, `sharp` WebP media optimization, `bcryptjs` password hashing, `nodemailer` optional SMTP
- **Database**: MySQL 8.x / MariaDB 10.4+ (`construction` database — 36 normalized tables, zero Prisma/MongoDB/Firebase)

---

## 1. Local Installation & Database Setup

### Prerequisites
- Node.js 20+ (tested on Node 24)
- MySQL 8.0+ or MariaDB 10.4+ (e.g., XAMPP, MySQL Community Server, or Managed Cloud MySQL)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```
Required variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=construction
AUTH_SECRET=generate-a-64-char-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=sartajkhan4284@gmail.com
ADMIN_INITIAL_PASSWORD=SetAStrongPassword@2026!
MEDIA_STORAGE=local
UPLOAD_DIR=./public/uploads
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

### Step 3: Create MySQL Schema, Seed Data & Initialize Super Admin
Run using the provided npm scripts:
```bash
npm run db:setup
npm run db:seed
npm run admin:init
```
Or import SQL manually via MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p construction < database/seed.sql
npm run admin:init
```

### Step 4: Run Development or Production Server
```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Admin Login URL: `http://localhost:3000/admin/login`

---

## 2. Quality & Verification Scripts
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## 3. Production Deployment Guide

> **Hosting Note**: Next.js App Router with Server Components, API Route Handlers, and `mysql2` requires a **Node.js runtime** (VPS, Hostinger Node.js / Cloud VPS plan, Railway, Render, or Vercel with external MySQL). Standard PHP-only shared hosting cannot run a full Next.js Node.js backend.

### Option A: Node.js VPS (Ubuntu / Hostinger VPS / DigitalOcean)
1. Install Node.js 20 LTS, MySQL 8, Nginx, and PM2 (`npm i -g pm2`).
2. Clone the repository to `/var/www/construction` and configure `.env.local` with strong `AUTH_SECRET`, MySQL user credentials, and `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`.
3. Import database and initialize Super Admin:
   ```bash
   npm ci
   npm run db:setup
   npm run db:seed
   npm run admin:init
   npm run build
   ```
4. Launch with PM2:
   ```bash
   pm2 start npm --name "construction-web" -- start
   pm2 save
   pm2 startup
   ```
5. Configure Nginx reverse proxy (`proxy_pass http://127.0.0.1:3000;`) with `client_max_body_size 55M;` for media uploads.
6. Enable free SSL via Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Option B: Vercel + External MySQL & Persistent Object Storage
1. Provision a managed MySQL database (e.g., DigitalOcean Managed MySQL, AWS RDS, PlanetScale/Aiven).
2. Run `npm run db:setup`, `npm run db:seed`, and `npm run admin:init` against the remote MySQL instance.
3. Configure all `.env.example` environment variables in Vercel Project Settings.
4. Because serverless platforms have ephemeral local filesystems, configure persistent S3/R2/Cloudinary object storage if uploading new media in serverless mode (local disk `./public/uploads` is ideal for VPS/Node.js hosting).

---

## 4. Database & Media Backup Instructions

### Automated Daily MySQL Backup (Cron)
```bash
0 2 * * * mysqldump -u db_user -p'DB_PASS' --single-transaction --routines construction | gzip > /backups/construction_$(date +\%F).sql.gz
```

### Media Uploads Backup
```bash
rsync -avz /var/www/construction/public/uploads/ /backups/uploads/
```

---

## 5. Admin Panel Notes
- **Company Name & Domain**: Configurable live from **Admin → Website & Header** and **About Us & Profile**.
- **Animated Statistics**: Hidden by default (`value = 0`, `is_visible = 0`) until verified real company numbers are entered in **Admin → Statistics**.
- **Testimonials**: Empty by default so zero fabricated reviews appear; publish real verified client reviews in **Admin → Testimonials**.
- **Architectural Concept Labels**: Seeded portfolio showcases carry an `"Architectural Concept"` label until replaced with real site photographs.
