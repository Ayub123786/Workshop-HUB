import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseKey &&
  supabaseKey !== 'your-supabase-anon-or-service-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

// Local persistent store path (fallback when remote Supabase credentials are not yet entered)
const LOCAL_DB_PATH = path.resolve(__dirname, '../../data/supabase_local_store.json');

function ensureLocalDir() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readLocalStore() {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initial = {
      users: [],
      workshops: [],
      sections: [],
      forms: [],
      submissions: [],
      platform_settings: [],
      image_assets: [],
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {
      users: [],
      workshops: [],
      sections: [],
      forms: [],
      submissions: [],
      platform_settings: [],
      image_assets: [],
    };
  }
}

export function writeLocalStore(data) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

if (isSupabaseConfigured) {
  console.log(`⚡ Connected to Supabase Database at: ${supabaseUrl}`);
} else {
  console.log(`ℹ️  SUPABASE_URL not configured in server/.env. Using local fallback adapter until credentials are set.`);
}
