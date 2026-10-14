import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(img) {
  if (!img) return null;
  const normalized = {
    ...img,
    _id: img.id,
    id: img.id,
    workshopId: img.workshop_id ?? img.workshopId,
    url: img.url,
    publicId: img.public_id ?? img.publicId ?? '',
    slot: img.slot || 'general',
    width: img.width,
    height: img.height,
    aspectRatio: img.aspect_ratio ?? img.aspectRatio ?? '16:9',
    alt: img.alt || '',
    size: img.size || 0,
    createdAt: img.created_at ?? img.createdAt ?? new Date().toISOString(),
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

class ImageQueryBuilder {
  constructor(queryFn) {
    this.queryFn = queryFn;
  }
  sort() {
    return this;
  }
  then(resolve, reject) {
    return this.queryFn().then(resolve, reject);
  }
}

export default {
  find(query = {}) {
    return new ImageQueryBuilder(async () => {
      const workshopId = query.workshopId || query.workshop_id;
      if (isSupabaseConfigured) {
        let req = supabase.from('image_assets').select('*');
        if (workshopId) req = req.eq('workshop_id', workshopId);
        if (query.slot && query.slot !== 'all') req = req.eq('slot', query.slot);
        const { data, error } = await req.order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(normalize);
      } else {
        const store = readLocalStore();
        let list = (store.image_assets || []).filter((img) => {
          if (workshopId && (img.workshop_id !== workshopId && img.workshopId !== workshopId)) return false;
          if (query.slot && query.slot !== 'all' && img.slot !== query.slot) return false;
          return true;
        }).map(normalize);
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list;
      }
    });
  },

  async create(data) {
    const record = {
      id: data.id || randomUUID(),
      workshop_id: data.workshopId || data.workshop_id || null,
      url: data.url,
      public_id: data.publicId || data.public_id || '',
      slot: data.slot || 'general',
      width: data.width ? parseInt(data.width) : null,
      height: data.height ? parseInt(data.height) : null,
      aspect_ratio: data.aspectRatio || data.aspect_ratio || '16:9',
      alt: data.alt || '',
      size: data.size || 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('image_assets')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.image_assets.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async findByIdAndDelete(id) {
    if (isSupabaseConfigured) {
      const { data, error: fetchErr } = await supabase.from('image_assets').select('*').eq('id', id).maybeSingle();
      if (fetchErr) throw fetchErr;
      const { error } = await supabase.from('image_assets').delete().eq('id', id);
      if (error) throw error;
      return normalize(data);
    } else {
      const store = readLocalStore();
      const found = store.image_assets.find((img) => img.id === id);
      store.image_assets = store.image_assets.filter((img) => img.id !== id);
      writeLocalStore(store);
      return normalize(found);
    }
  },
};
