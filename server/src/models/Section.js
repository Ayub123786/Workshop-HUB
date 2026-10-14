import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(s) {
  if (!s) return null;
  const normalized = {
    ...s,
    _id: s.id,
    id: s.id,
    workshopId: s.workshop_id ?? s.workshopId,
    type: s.type,
    order: s.order ?? 0,
    visible: s.visible ?? true,
    content: s.content || {},
    animation: s.animation || { entrance: 'fade-up', speed: 'normal' },
    createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updated_at ?? s.updatedAt ?? new Date().toISOString(),
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

function denormalize(s) {
  const record = {};
  if (s.id) record.id = s.id;
  if (s.workshopId !== undefined || s.workshop_id !== undefined) {
    record.workshop_id = s.workshopId ?? s.workshop_id;
  }
  if (s.type !== undefined) record.type = s.type;
  if (s.order !== undefined) record.order = s.order;
  record.visible = s.visible !== undefined ? s.visible : true;
  if (s.content !== undefined) record.content = s.content;
  if (s.animation !== undefined) record.animation = s.animation;
  return record;
}

class SectionQueryBuilder {
  constructor(queryFn) {
    this.queryFn = queryFn;
    this._sort = null;
  }
  sort(s) {
    this._sort = s;
    return this;
  }
  then(resolve, reject) {
    return this.queryFn(this._sort).then(resolve, reject);
  }
}

export default {
  find(query = {}) {
    return new SectionQueryBuilder(async () => {
      const workshopId = query.workshopId || query.workshop_id;
      if (isSupabaseConfigured) {
        let req = supabase.from('sections').select('*');
        if (workshopId) req = req.eq('workshop_id', workshopId);
        if (query.visible !== undefined) req = req.eq('visible', query.visible);
        const { data, error } = await req.order('order', { ascending: true });
        if (error) throw error;
        return (data || []).map(normalize);
      } else {
        const store = readLocalStore();
        let list = (store.sections || []).filter((s) => {
          if (workshopId && (s.workshop_id !== workshopId && s.workshopId !== workshopId)) return false;
          if (query.visible !== undefined && s.visible !== query.visible) return false;
          return true;
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        return list.map(normalize);
      }
    });
  },

  async findOne(query = {}) {
    const list = await this.find(query);
    if (query.type) {
      return list.find((s) => s.type === query.type) || null;
    }
    return list[0] || null;
  },

  async create(data) {
    const record = {
      ...denormalize(data),
      id: data.id || randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('sections')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.sections.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async insertMany(items) {
    const records = items.map((item) => ({
      ...denormalize(item),
      id: item.id || randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('sections')
        .insert(records)
        .select();
      if (error) throw error;
      return (inserted || []).map(normalize);
    } else {
      const store = readLocalStore();
      store.sections.push(...records);
      writeLocalStore(store);
      return records.map(normalize);
    }
  },

  async findByIdAndUpdate(id, data) {
    const patch = {
      ...denormalize(data),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('sections')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalize(updated);
    } else {
      const store = readLocalStore();
      const idx = store.sections.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      store.sections[idx] = { ...store.sections[idx], ...patch };
      writeLocalStore(store);
      return normalize(store.sections[idx]);
    }
  },

  async findByIdAndDelete(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
      return { id };
    } else {
      const store = readLocalStore();
      store.sections = store.sections.filter((s) => s.id !== id);
      writeLocalStore(store);
      return { id };
    }
  },

  async deleteMany(query = {}) {
    const workshopId = query.workshopId || query.workshop_id;
    if (isSupabaseConfigured) {
      let req = supabase.from('sections').delete();
      if (workshopId) req = req.eq('workshop_id', workshopId);
      else req = req.neq('id', '00000000-0000-0000-0000-000000000000');
      const { error } = await req;
      if (error) throw error;
    } else {
      const store = readLocalStore();
      if (workshopId) {
        store.sections = store.sections.filter((s) => s.workshop_id !== workshopId && s.workshopId !== workshopId);
      } else {
        store.sections = [];
      }
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};
