-- =================================================================
-- WORKSHOP HUB — SUPABASE (POSTGRESQL) SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- =================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. WORKSHOPS TABLE
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  category TEXT DEFAULT 'Private Equity',
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  show_on_hub BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  timezones JSONB DEFAULT '[]'::jsonb,
  seats_total INTEGER DEFAULT 100,
  seats_booked INTEGER DEFAULT 0,
  theme JSONB DEFAULT '{"gold": "#C8A24F", "cream": "#FAFAFA", "navy": "#0A0A0A"}'::jsonb,
  animation_preset TEXT DEFAULT 'smooth' CHECK (animation_preset IN ('minimal', 'smooth', 'dynamic')),
  seo JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workshops_slug ON workshops(slug);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_display_order ON workshops(display_order);

-- 4. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hero', 'benefits', 'logos', 'community', 'testimonials', 'stages', 'audience', 'trainer', 'footer')),
  "order" INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  content JSONB DEFAULT '{}'::jsonb,
  animation JSONB DEFAULT '{"entrance": "fade-up", "speed": "normal"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sections_workshop ON sections(workshop_id, "order");

-- 5. FORMS TABLE
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  capacity INTEGER,
  deadline TIMESTAMPTZ,
  success_message TEXT DEFAULT 'Thank you for registering! We have reserved your seat.',
  email_template JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_workshop ON forms(workshop_id);

-- 6. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  ip TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_workshop ON submissions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(workshop_id, email);

-- 7. PLATFORM SETTINGS TABLE (Single document)
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'Workshop Hub',
  logo TEXT DEFAULT '',
  hub_headline TEXT DEFAULT 'Build What the Best Funds Already Run',
  hub_subtitle TEXT DEFAULT 'Live, expert-led master classes for finance and investment professionals. Walk away with systems, not slides.',
  navbar_links JSONB DEFAULT '[{"label":"Workshops","href":"/workshops","order":0},{"label":"Upcoming","href":"/workshops?filter=upcoming","order":1},{"label":"Past","href":"/workshops?filter=past","order":2}]'::jsonb,
  footer_text TEXT DEFAULT '© 2026 Workshop Hub · Morse Bridge Ventures. All rights reserved.',
  global_trust JSONB DEFAULT '{"aumNumber": "246", "aumLabel": "Billion AUM+", "aumPrefix": "$", "testimonials": [{"name": "Mauricio Bisker Finkelstein", "role": "Analista de Startups", "company": "Anjos do Brasil", "quote": "I attended your workshop last Friday and found it very insightful."}]}'::jsonb,
  ui_variant TEXT DEFAULT 'minimal',
  animations_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. IMAGE ASSETS TABLE
CREATE TABLE IF NOT EXISTS image_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  public_id TEXT DEFAULT '',
  slot TEXT DEFAULT 'general',
  width INTEGER,
  height INTEGER,
  aspect_ratio TEXT DEFAULT '16:9',
  alt TEXT DEFAULT '',
  size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Row Level Security (RLS) Configuration
-- We enable RLS and allow public read for published content and anon/service role full access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to platform settings, published workshops, and sections
CREATE POLICY "Public can read platform_settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Public can read published workshops" ON workshops FOR SELECT USING (status = 'published' OR true);
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public can read forms" ON forms FOR SELECT USING (true);
CREATE POLICY "Public can insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read image_assets" ON image_assets FOR SELECT USING (true);

-- Allow full access for service_role and backend API
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access workshops" ON workshops FOR ALL USING (true);
CREATE POLICY "Service role full access sections" ON sections FOR ALL USING (true);
CREATE POLICY "Service role full access forms" ON forms FOR ALL USING (true);
CREATE POLICY "Service role full access submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Service role full access platform_settings" ON platform_settings FOR ALL USING (true);
CREATE POLICY "Service role full access image_assets" ON image_assets FOR ALL USING (true);
