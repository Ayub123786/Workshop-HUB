import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(s) {
  if (!s) return null;
  const normalized = {
    ...s,
    _id: s.id,
    id: s.id,
    email: s.email,
    source: s.source || 'hub_newsletter',
    workshopSlug: s.workshop_slug ?? s.workshopSlug ?? null,
    createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

export default {
  async find(query = {}) {
    if (isSupabaseConfigured) {
      let req = supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      if (query.email) req = req.eq('email', query.email);
      const { data, error } = await req;
      if (error) {
        // Table may not exist yet in Supabase, fallback to local store
        const store = readLocalStore();
        return (store.subscribers || []).map(normalize);
      }
      return (data || []).map(normalize);
    } else {
      const store = readLocalStore();
      let list = (store.subscribers || []).map(normalize);
      if (query.email) list = list.filter((s) => s.email === query.email);
      return list;
    }
  },

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  },

  async create(data) {
    const record = {
      id: data.id || randomUUID(),
      email: data.email?.toLowerCase().trim(),
      source: data.source || 'hub_newsletter',
      workshop_slug: data.workshopSlug || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('subscribers')
        .insert(record)
        .select()
        .maybeSingle();

      if (error) {
        // Fallback to local store if table doesn't exist
        const store = readLocalStore();
        if (!store.subscribers) store.subscribers = [];
        store.subscribers.push(record);
        writeLocalStore(store);
        return normalize(record);
      }
      return normalize(inserted || record);
    } else {
      const store = readLocalStore();
      if (!store.subscribers) store.subscribers = [];
      store.subscribers.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async countDocuments() {
    const list = await this.find({});
    return list.length;
  },
};
