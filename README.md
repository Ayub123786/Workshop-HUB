# Workshop Hub — Multi-Workshop Event Platform

> **ONE website, ONE link.** An executive multi-workshop event hub built with the MERN stack (`React + Vite + Tailwind CSS + Node.js + Express + MongoDB`). 
> Designed with an executive **Minimal Light** editorial aesthetic, real-time admin management, dynamic section reordering, custom form builder, and instant landing page generation at `/w/:slug`.

---

## 🌟 Key Features

### 1. Unified Public Platform
- **Hub Home (`/`)**: Dynamic hub featuring the next featured master class, real-time upcoming workshop grid, global trust metrics ($246B+ AUM counter), logos wall, alumni reflections, and post-workshop testimonials.
- **Browse & Filter (`/workshops`)**: Instant filtering by category (Private Equity, Venture Capital, Family Office, AI Pipelines), live search, status tabs (Upcoming, Past & Resources), and date sorting without full-page reloads.
- **Dynamic Workshop Landing Page (`/w/:slug`)**: Dynamically constructed from database `Section` records in exact order:
  1. **Hero**: High-impact badge, bold display typography, subtitle, dynamic date card with multiple timezones (Dubai, NY, London), magnetic CTA.
  2. **Benefits**: 3-column value grid with icons and 3D hover effects.
  3. **Logos**: Infinite marquee partner & attendee firm ticker.
  4. **Community**: Alumni reflection photos with smooth zoom entrance.
  5. **Testimonials**: Verified executive feedback cards with LinkedIn-style avatars.
  6. **Stages ("8 Stages. Live Results")**: Multi-column breakdown with duration chips and gold "Time Saved" tags.
  7. **Audience**: Interactive chip pills and target qualification CTA.
  8. **Trainer**: Bio, high-resolution portrait, and key-value track record rows.
  9. **Footer**: Clean copyright and firm credentials.
- **One-Click Sharing**: Copy link, LinkedIn, WhatsApp, and Email share modal.
- **Live Registration Modal**: Dynamic form generator, capacity controls, duplicate registration prevention, and honeypot spam protection.

### 2. Powerful Admin Suite (`/admin`)
- **Dashboard (`/admin`)**: Real-time stats, seats booked progress bars, active workshops overview, and recent registrations stream.
- **Workshop Management (`/admin/workshops`)**: Full CRUD, status toggle (`draft`, `published`, `archived`), "Featured" flag, reorder display hierarchy, and one-click duplication.
- **Instant Section Editor (`/admin/workshops/:id/edit`)**:
  - Drag-and-drop or up/down section ordering.
  - Show/hide section toggles.
  - In-place form editing of all content (including repeatable stages, benefits, testimonials, and key-value rows).
  - Per-section animation controls (entrance type and motion speed).
  - Workshop color palette overrides (`gold`, `cream`, `navy`) and animation presets (`minimal`, `smooth`, `dynamic`).
  - **Live Preview Split Screen**: See public landing page changes update in real time as you type!
  - **Hub Card Preview**: Verify card appearance on the hub before publishing.
- **Form Builder (`/admin/workshops/:id/form`)**: Add, delete, and reorder custom questions (text, email, phone, dropdown, checkbox, textarea) with live registration modal preview.
- **Submissions & CSV Export (`/admin/submissions`)**: View all registrants, filter by workshop, search by name/email/company, and download complete CSV exports.
- **Image Asset Manager (`/admin/images`)**: Configure slots with preset aspect ratios (`16:9`, `3:4`, `21:9`, `1:1`), crop interactively with `react-easy-crop`, auto-convert to WebP, and copy direct CDN URLs.
- **Platform Settings (`/admin/settings`)**: Configure global hub headline, subtitle, navbar navigation links, and AUM trust metrics.

---

## 🛠️ Tech Stack

- **Client (`/client`)**:
  - React 19 + Vite 6
  - Tailwind CSS 3 with custom Minimal Light design tokens
  - Framer Motion + Lenis Smooth Scrolling + GSAP
  - React Router v7
  - React Helmet Async (Dynamic SEO & Open Graph tags)
  - react-easy-crop (interactive image cropper)
  - react-countup (AUM number animation)
  - Lucide React (editorial line iconography)
- **Server (`/server`)**:
  - Node.js + Express
  - Supabase Database (PostgreSQL) via `@supabase/supabase-js`
  - JSON Web Tokens (JWT) & bcryptjs authentication
  - Helmet & CORS security middleware
  - Express Rate Limit
  - Multer + Cloudinary SDK (with local dev fallback)
  - Nodemailer email notifications

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- A [Supabase](https://supabase.com/) project (Free tier) or local development environment
- Run `server/supabase_schema.sql` in the Supabase Dashboard SQL Editor to initialize all tables and policies.

### 1. Clone & Setup Monorepo
```bash
# Clone the repository
git clone <repo-url>
cd "CRM Like Zite"
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
# Server environment
cp .env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### 3. Install Dependencies
```bash
# Install server packages
cd server
npm install

# Install client packages
cd ../client
npm install
```

### 4. Seed Database
Seed initial platform settings, the admin account, and 3 realistic workshops:
```bash
cd ../server
node src/seed.js
```

**Default Admin Credentials:**
- **Email:** `admin@workshophub.com`
- **Password:** `Admin@123456`
- **Console URL:** `http://localhost:5173/admin`

### 5. Start Development Servers
Run the backend and frontend in separate terminals:

**Terminal 1 — Server:**
```bash
cd server
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Client:**
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```

---

## ⏱️ How to Create a New Workshop in 5 Minutes

1. **Log in to Admin**: Go to `http://localhost:5173/admin/login` and log in with your admin credentials.
2. **One-Click from Template**: On the Dashboard, click **"New From Template"** (or click **"Create Workshop"** to start fresh).
3. **Customize Details**:
   - Go to **Sections** tab to tweak titles, stages, trainer bio, and dates.
   - Watch the **Live Preview** side-panel update in real time.
4. **Configure Registration**: Click the **Form Builder** icon to add or customize any qualification questions (e.g., years in deal execution, fund size).
5. **Publish**: In the header status dropdown, switch from `Draft` to `Published`.
6. **Done!** The workshop will instantly appear on the public hub (`/`), in search filters (`/workshops`), and has its own dedicated landing page at `/w/:slug` with automatic SEO tags!

---

## 📡 API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/workshops` | Public | List published workshops with search/category/status filters |
| `GET` | `/api/workshops/:slug` | Public | Workshop landing page details with sections and form schema |
| `POST` | `/api/forms/:id/submit` | Public | Register for a workshop with honeypot & duplicate prevention |
| `GET` | `/api/settings` | Public | Platform branding, navbar links, and trust metrics |
| `GET` | `/sitemap.xml` | Public | Dynamically generated SEO XML sitemap |
| `POST` | `/api/auth/login` | Public | Admin & Editor JWT authentication |
| `GET` | `/api/auth/me` | Protected | Authenticated user profile |
| `GET` | `/api/workshops/admin/all` | Admin | All workshops including drafts and archives |
| `POST` | `/api/workshops` | Admin | Create new workshop with default sections & form |
| `PUT` | `/api/workshops/:id` | Admin | Update workshop metadata |
| `DELETE` | `/api/workshops/:id` | Admin | Delete workshop, sections, and form |
| `POST` | `/api/workshops/:id/duplicate` | Admin | Server-side complete copy of a workshop |
| `GET` | `/api/sections/:workshopId` | Admin | All section records for a workshop |
| `PUT` | `/api/sections/:id` | Admin | Update section content or animation settings |
| `PUT` | `/api/forms/:id` | Admin | Update form fields, capacity, and deadline |
| `GET` | `/api/forms/admin/submissions` | Admin | Filterable registration submissions table |
| `GET` | `/api/forms/admin/submissions/export` | Admin | Download all submissions as CSV |
| `POST` | `/api/images/upload` | Admin | Upload and crop images with aspect ratios |
| `PUT` | `/api/settings` | Admin | Update global platform settings |

---

## 🚢 Production Deployment

- **Server**: Pre-configured `Dockerfile` ready for Docker, Railway, AWS ECS, or Render.
- **Client**: Pre-configured `vercel.json` with SPA routing rules for Vercel, Netlify, or Cloudflare Pages.

---

## 📄 License
MIT © 2026 Workshop Hub · Morse Bridge Ventures.
