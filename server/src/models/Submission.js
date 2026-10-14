import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import Workshop from './Workshop.js';
import { randomUUID } from 'crypto';

function normalize(s) {
  if (!s) return null;
  const normalized = {
    ...s,
    _id: s.id,
    id: s.id,
    formId: s.form_id ?? s.formId,
    workshopId: s.workshopId || s.workshop_id,
    email: s.email,
    data: s.data || {},
    ip: s.ip || '',
    createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

class SubmissionQueryBuilder {
  constructor(queryFn) {
    this.queryFn = queryFn;
    this._sort = null;
    this._skip = 0;
    this._limit = 100;
    this._populate = false;
  }
  sort(s) {
    this._sort = s;
    return this;
  }
  skip(n) {
    this._skip = n;
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  populate(field) {
    this._populate = true;
    return this;
  }
  then(resolve, reject) {
    return this.queryFn(this._sort, this._skip, this._limit, this._populate).then(resolve, reject);
  }
}

export default {
  find(query = {}) {
    return new SubmissionQueryBuilder(async (sortOpts, skip = 0, limit = 100, doPopulate = false) => {
      const workshopId = query.workshopId || query.workshop_id;
      const formId = query.formId || query.form_id;

      let list = [];
      if (isSupabaseConfigured) {
        let req = supabase.from('submissions').select('*');
        if (workshopId) req = req.eq('workshop_id', workshopId);
        if (formId) req = req.eq('form_id', formId);
        const { data, error } = await req.order('created_at', { ascending: false });
        if (error) throw error;
        list = (data || []).map(normalize);
      } else {
        const store = readLocalStore();
        list = (store.submissions || []).filter((s) => {
          if (workshopId && (s.workshop_id !== workshopId && s.workshopId !== workshopId)) return false;
          if (formId && (s.form_id !== formId && s.formId !== formId)) return false;
          return true;
        }).map(normalize);
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Search filter
      if (query.$or) {
        list = list.filter((s) => {
          return query.$or.some((cond) => {
            if (cond.email?.$regex) return new RegExp(cond.email.$regex, cond.email.$options).test(s.email);
            if (cond['data.name']?.$regex) return new RegExp(cond['data.name'].$regex, cond['data.name'].$options).test(s.data?.name || '');
            if (cond['data.company']?.$regex) return new RegExp(cond['data.company'].$regex, cond['data.company'].$options).test(s.data?.company || '');
            return false;
          });
        });
      }

      // Populate workshopId if requested
      if (doPopulate) {
        list = await Promise.all(
          list.map(async (sub) => {
            const rawWId = typeof sub.workshopId === 'string' ? sub.workshopId : sub.workshop_id;
            const w = await Workshop.findById(rawWId);
            return {
              ...sub,
              workshopId: w ? { _id: w.id, id: w.id, title: w.title, slug: w.slug } : null,
            };
          })
        );
      }

      return list.slice(skip, skip + limit);
    });
  },

  async findOne(query = {}) {
    const workshopId = query.workshopId || query.workshop_id;
    if (isSupabaseConfigured) {
      let req = supabase.from('submissions').select('*');
      if (workshopId) req = req.eq('workshop_id', workshopId);
      if (query.email) req = req.eq('email', query.email.toLowerCase());
      if (query.id) req = req.eq('id', query.id);
      if (query._id) req = req.eq('id', query._id);
      const { data, error } = await req.maybeSingle();
      if (error) throw error;
      return normalize(data);
    } else {
      const store = readLocalStore();
      const found = (store.submissions || []).find((s) => {
        if (workshopId && (s.workshop_id !== workshopId && s.workshopId !== workshopId)) return false;
        if (query.email && s.email.toLowerCase() !== query.email.toLowerCase()) return false;
        if (query.id && s.id !== query.id) return false;
        if (query._id && s.id !== query._id) return false;
        return true;
      });
      return normalize(found);
    }
  },

  async findById(id) {
    return this.findOne({ id });
  },

  async create(data) {
    const record = {
      id: data.id || randomUUID(),
      form_id: data.formId || data.form_id || null,
      workshop_id: data.workshopId || data.workshop_id,
      email: data.email.toLowerCase(),
      data: data.data || {},
      ip: data.ip || '',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('submissions')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.submissions.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async findByIdAndDelete(id) {
    if (isSupabaseConfigured) {
      const current = await this.findById(id);
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) throw error;
      return current;
    } else {
      const store = readLocalStore();
      const found = store.submissions.find((s) => s.id === id);
      store.submissions = store.submissions.filter((s) => s.id !== id);
      writeLocalStore(store);
      return normalize(found);
    }
  },

  async countDocuments(query = {}) {
    const workshopId = query.workshopId || query.workshop_id;
    const formId = query.formId || query.form_id;

    if (isSupabaseConfigured) {
      let req = supabase.from('submissions').select('id', { count: 'exact', head: true });
      if (workshopId) req = req.eq('workshop_id', workshopId);
      if (formId) req = req.eq('form_id', formId);
      const { count, error } = await req;
      if (error) throw error;
      return count || 0;
    } else {
      const store = readLocalStore();
      let list = store.submissions || [];
      if (workshopId) list = list.filter((s) => s.workshop_id === workshopId || s.workshopId === workshopId);
      if (formId) list = list.filter((s) => s.form_id === formId || s.formId === formId);
      return list.length;
    }
  },

  async deleteMany() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } else {
      const store = readLocalStore();
      store.submissions = [];
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};
