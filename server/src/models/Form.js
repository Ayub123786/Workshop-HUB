import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(f) {
  if (!f) return null;
  const normalized = {
    ...f,
    _id: f.id,
    id: f.id,
    workshopId: f.workshop_id ?? f.workshopId,
    fields: f.fields || [],
    capacity: f.capacity,
    deadline: f.deadline ? new Date(f.deadline).toISOString() : null,
    successMessage: f.success_message ?? f.successMessage ?? 'Thank you for registering! We have reserved your seat.',
    emailTemplate: f.email_template ?? f.emailTemplate ?? {},
    isActive: f.is_active ?? f.isActive ?? true,
    createdAt: f.created_at ?? f.createdAt ?? new Date().toISOString(),
    updatedAt: f.updated_at ?? f.updatedAt ?? new Date().toISOString(),
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

function denormalize(f) {
  const record = {};
  if (f.id) record.id = f.id;
  if (f.workshopId !== undefined || f.workshop_id !== undefined) {
    record.workshop_id = f.workshopId ?? f.workshop_id;
  }
  if (f.fields !== undefined) record.fields = f.fields;
  if (f.capacity !== undefined) record.capacity = f.capacity;
  if (f.deadline !== undefined) record.deadline = f.deadline;
  if (f.successMessage !== undefined || f.success_message !== undefined) {
    record.success_message = f.successMessage ?? f.success_message;
  }
  if (f.emailTemplate !== undefined || f.email_template !== undefined) {
    record.email_template = f.emailTemplate ?? f.email_template;
  }
  if (f.isActive !== undefined || f.is_active !== undefined) {
    record.is_active = f.isActive ?? f.is_active;
  }
  return record;
}

export default {
  async findOne(query = {}) {
    const workshopId = query.workshopId || query.workshop_id;
    if (isSupabaseConfigured) {
      let req = supabase.from('forms').select('*');
      if (workshopId) req = req.eq('workshop_id', workshopId);
      if (query.id) req = req.eq('id', query.id);
      if (query._id) req = req.eq('id', query._id);
      if (query.isActive !== undefined) req = req.eq('is_active', query.isActive);
      const { data, error } = await req.maybeSingle();
      if (error) throw error;
      return normalize(data);
    } else {
      const store = readLocalStore();
      const found = (store.forms || []).find((f) => {
        if (workshopId && (f.workshop_id !== workshopId && f.workshopId !== workshopId)) return false;
        if (query.id && f.id !== query.id) return false;
        if (query._id && f.id !== query._id) return false;
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
      ...denormalize(data),
      id: data.id || randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('forms')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.forms.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async findByIdAndUpdate(id, data) {
    const patch = {
      ...denormalize(data),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('forms')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalize(updated);
    } else {
      const store = readLocalStore();
      const idx = store.forms.findIndex((f) => f.id === id);
      if (idx === -1) return null;
      store.forms[idx] = { ...store.forms[idx], ...patch };
      writeLocalStore(store);
      return normalize(store.forms[idx]);
    }
  },

  async deleteOne(query = {}) {
    const workshopId = query.workshopId || query.workshop_id;
    if (isSupabaseConfigured) {
      let req = supabase.from('forms').delete();
      if (workshopId) req = req.eq('workshop_id', workshopId);
      if (query.id) req = req.eq('id', query.id);
      const { error } = await req;
      if (error) throw error;
    } else {
      const store = readLocalStore();
      if (workshopId) {
        store.forms = store.forms.filter((f) => f.workshop_id !== workshopId && f.workshopId !== workshopId);
      }
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },

  async deleteMany() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('forms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } else {
      const store = readLocalStore();
      store.forms = [];
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};
