import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { isSupabaseConfigured } from './utils/supabase.js';

// Routes
import authRoutes from './routes/auth.js';
import workshopRoutes from './routes/workshops.js';
import sectionRoutes from './routes/sections.js';
import formRoutes from './routes/forms.js';
import settingsRoutes from './routes/settings.js';
import imageRoutes from './routes/images.js';
import subscriberRoutes from './routes/subscribers.js';
import { startReminderScheduler } from './services/reminderScheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ─── Static uploaded files ─── */
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

/* ─── Security middleware ─── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const configuredClients = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // server-to-server, curl, cron, postman
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (configuredClients.includes(cleanOrigin) || configuredClients.includes('*')) {
    return true;
  }
  // Allow localhost
  if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) {
    return true;
  }
  // Automatically allow any Vercel production or preview deployment (*.vercel.app)
  if (cleanOrigin.endsWith('.vercel.app')) {
    return true;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

/* ─── Body parsing ─── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ─── Health check ─── */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ─── Root & API Welcome endpoints ─── */
app.get('/', (req, res) => {
  res.json({
    name: 'Workshop Hub API',
    status: 'online',
    version: '1.0.0',
    health: '/health',
    endpoints: {
      workshops: '/api/workshops',
      stats: '/api/workshops/stats/hub',
      subscribers: '/api/subscribers',
      calendar: '/api/calendar.ics',
    },
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'Workshop Hub API is operational',
    endpoints: {
      workshops: '/api/workshops',
      stats: '/api/workshops/stats/hub',
      subscribers: '/api/subscribers',
      auth: '/api/auth',
      settings: '/api/settings',
      calendar: '/api/calendar.ics',
    },
  });
});

/* ─── API Routes ─── */
app.use('/api/auth', authRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.get('/api/calendar.ics', (req, res) => res.redirect('/api/workshops/calendar.ics'));

/* ─── Sitemap (generated from DB) ─── */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { default: Workshop } = await import('./models/Workshop.js');
    const workshops = await Workshop.find({ status: 'published' }).select('slug updatedAt');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const urls = [
      `<url><loc>${clientUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${clientUrl}/workshops</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      ...workshops.map(w => `<url><loc>${clientUrl}/w/${w.slug}</loc><lastmod>${new Date(w.updatedAt).toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ];
    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

/* ─── 404 for unknown API routes ─── */
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

/* ─── Error handler (must be last) ─── */
app.use(errorHandler);

/* ─── Server start ─── */
app.listen(PORT, () => {
  console.log(`🚀 Workshop Hub API running on http://localhost:${PORT}`);
  if (isSupabaseConfigured) {
    console.log(`⚡ Connected to Supabase Database`);
  } else {
    console.log(`ℹ️  Running with Supabase database adapter (ready for SUPABASE_URL in .env)`);
  }
  startReminderScheduler();
});

export default app;
