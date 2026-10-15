# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide walks you through deploying **Workshop Hub** to **Vercel** (Vite/React frontend) and **Render** (Node.js/Express backend) connected to **Supabase** (PostgreSQL database).

---

## 🏛️ Architecture Overview: Is this a good way to deploy?

**Yes, this is an industry-standard, high-performance architecture.**

| Component | Platform | Why It's Ideal |
|---|---|---|
| **Frontend** (`client/`) | **Vercel** | • Global Edge CDN (sub-50ms latency worldwide)<br>• Instant asset optimization and Brotli compression<br>• Automatic preview deployments for pull requests<br>• Free automatic HTTPS & custom domains |
| **Backend** (`server/`) | **Render** | • Persistent Node.js container (essential for the `node-cron` 24h & 1h reminder scheduler)<br>• Express REST API with health check support (`/health`)<br>• Environment variable encryption & zero-downtime deploys |
| **Database** | **Supabase** | • Cloud-hosted PostgreSQL with built-in connection pooling<br>• Real-time backups and row-level security |

---

## 📋 Pre-Deployment Checklist

Before deploying:
- [x] All `.env` files and local secrets are excluded in `.gitignore`
- [x] Single Page Application (SPA) rewrite rules are defined in `client/vercel.json` and root `vercel.json`
- [x] CORS middleware supports Vercel domains (`*.vercel.app`) and custom production URLs
- [x] API client timeout is set to 60s to accommodate Render's initial cold-start wake-up
- [x] `render.yaml` Blueprint specification is created for 1-click Render setup

---

## 🚀 Step 1: Push the Code to GitHub

1. Ensure your local git status is clean:
   ```bash
   git status
   ```
2. Create a new repository on GitHub (e.g. `workshop-hub` or `crm-like-zite`). Keep it **Private** or **Public**.
3. Link your local repo and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

*(Your `.env` files will NOT be pushed because `.gitignore` is strictly configured.)*

---

## 🌐 Step 2: Deploy Backend to Render

### Option A: Using the 1-Click Blueprint (`render.yaml`)
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
5. Fill in the prompted environment variables (see table below).
6. Click **Apply**.

---

### Option B: Manual Web Service Setup
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Configure the settings:
   - **Name**: `workshop-hub-api`
   - **Region**: Closest to you (e.g. `Frankfurt`, `Oregon`, `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:

| Variable Name | Example / Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render (automatically handled) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase service role secret key |
| `JWT_SECRET` | `generate-a-strong-random-string` | Secret for admin JWT tokens |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (or leave blank initially, then update once Vercel is deployed) |
| `EMAIL_HOST` | `smtp.gmail.com` | (Optional) SMTP Host for reminders |
| `EMAIL_PORT` | `587` | (Optional) SMTP Port |
| `EMAIL_USER` | `your-email@gmail.com` | (Optional) SMTP Email user |
| `EMAIL_PASS` | `your-app-password` | (Optional) Gmail App Password |
| `EMAIL_FROM` | `Workshop Hub <noreply@workshophub.com>` | (Optional) Sender signature |

6. Under **Advanced Settings**:
   - **Health Check Path**: `/health`
7. Click **Create Web Service**.
8. Once deployment finishes, copy your Render Web Service URL (e.g. `https://workshop-hub-api.onrender.com`).

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`** (Recommended)
   *(If you leave it at `./`, root `vercel.json` will build `client/` automatically).*
5. Expand the **Environment Variables** section and add:

| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://workshop-hub-api.onrender.com/api` | Your Render backend URL ending in `/api` |

6. Click **Deploy**.
7. In ~45 seconds, your frontend is live at `https://<your-project>.vercel.app`!

---

## 🔗 Step 4: Connect & Finalize CORS

1. Copy your live Vercel production URL (e.g. `https://workshop-hub.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com/) → **workshop-hub-api** → **Environment**.
3. Set or update `CLIENT_URL` to your Vercel URL:
   ```env
   CLIENT_URL=https://workshop-hub.vercel.app
   ```
   *(Multiple URLs can be comma-separated, e.g. `https://workshop-hub.vercel.app,https://yourdomain.com`).*
4. Render will automatically redeploy the backend with the new allowed origin.

---

## 💡 Important Tips for Free Tier Hosting

1. **Render Free Tier Spin-Down**:
   - Render's free tier puts web services to sleep after 15 minutes of inactivity.
   - When someone visits your website after idle time, the very first API request may take **30–50 seconds** while the container boots up.
   - Subsequent requests are instant.
   - Our frontend `api.js` has a **60-second timeout** configured specifically to prevent cold-start failures.
   - *Pro Tip*: You can set up a free monitor (like [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org/)) pinging `https://workshop-hub-api.onrender.com/health` every 10 minutes to keep your Render instance awake 24/7!

2. **Custom Domains**:
   - Both Vercel and Render allow adding custom domains (e.g. `workshophub.com` on Vercel and `api.workshophub.com` on Render) with free automated SSL certificates via DNS CNAME records.
