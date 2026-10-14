import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(w) {
  if (!w) return null;
  const now = new Date();
  const seatsTotal = w.seats_total ?? w.seatsTotal ?? 100;
  const seatsBooked = w.seats_booked ?? w.seatsBooked ?? 0;
  const startDate = w.start_date ?? w.startDate;
  const endDate = w.end_date ?? w.endDate;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : (start ? new Date(start.getTime() + 4 * 60 * 60 * 1000) : null);

  let statusLabel = w.status || 'draft';
  if (w.status === 'published') {
    if (end && now > end) {
      statusLabel = 'completed';
    } else if (start && end && now >= start && now <= end) {
      statusLabel = 'live';
    } else if (seatsBooked >= seatsTotal) {
      statusLabel = 'sold-out';
    } else if (seatsTotal > 0 && (seatsTotal - seatsBooked) / seatsTotal <= 0.2) {
      statusLabel = 'few-spots';
    } else {
      statusLabel = 'upcoming';
    }
  }

  const ext = w.seo?.extended || {};

  const normalized = {
    ...w,
    _id: w.id,
    id: w.id,
    slug: w.slug,
    title: w.title,
    shortDescription: w.short_description ?? w.shortDescription ?? '',
    bannerImage: w.banner_image ?? w.bannerImage ?? '',
    category: w.category || 'Private Equity',
    tags: w.tags || [],
    status: w.status || 'draft',
    showOnHub: w.show_on_hub ?? w.showOnHub ?? true,
    featured: w.featured ?? false,
    displayOrder: w.display_order ?? w.displayOrder ?? 0,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    timezones: w.timezones || [],
    seatsTotal,
    seatsBooked,
    seatsLeft: Math.max(0, seatsTotal - seatsBooked),
    statusLabel,
    price: w.price !== undefined ? Number(w.price) : (ext.price !== undefined ? Number(ext.price) : 0),
    speakers: (w.speakers && w.speakers.length > 0) ? w.speakers : (ext.speakers || []),
    agenda: (w.agenda && w.agenda.length > 0) ? w.agenda : (ext.agenda || []),
    faqs: (w.faqs && w.faqs.length > 0) ? w.faqs : (ext.faqs || []),
    learningOutcomes: w.learning_outcomes ?? w.learningOutcomes ?? ext.learningOutcomes ?? ext.learning_outcomes ?? [],
    requirements: (w.requirements && w.requirements.length > 0) ? w.requirements : (ext.requirements || []),
    recordingUrl: w.recording_url ?? w.recordingUrl ?? ext.recordingUrl ?? ext.recording_url ?? '',
    resources: (w.resources && w.resources.length > 0) ? w.resources : (ext.resources || []),
    reminder24hSent: w.reminder_24h_sent ?? w.reminder24hSent ?? ext.reminder24hSent ?? false,
    reminder1hSent: w.reminder_1h_sent ?? w.reminder1hSent ?? ext.reminder1hSent ?? false,
    theme: w.theme || { gold: '#C8A24F', cream: '#FAFAFA', navy: '#0A0A0A' },
    animationPreset: w.animation_preset ?? w.animationPreset ?? 'smooth',
    seo: w.seo || {},
    createdAt: w.created_at ?? w.createdAt ?? new Date().toISOString(),
    updatedAt: w.updated_at ?? w.updatedAt ?? new Date().toISOString(),
  };

  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

function denormalize(data) {
  const record = {};
  if (data.id) record.id = data.id;
  if (data.slug !== undefined) record.slug = data.slug;
  if (data.title !== undefined) record.title = data.title;
  if (data.shortDescription !== undefined || data.short_description !== undefined) {
    record.short_description = data.shortDescription ?? data.short_description;
  }
  if (data.bannerImage !== undefined || data.banner_image !== undefined) {
    record.banner_image = data.bannerImage ?? data.banner_image;
  }
  if (data.category !== undefined) record.category = data.category;
  if (data.tags !== undefined) record.tags = data.tags;
  if (data.status !== undefined) record.status = data.status;
  if (data.showOnHub !== undefined || data.show_on_hub !== undefined) {
    record.show_on_hub = data.showOnHub ?? data.show_on_hub;
  }
  if (data.featured !== undefined) record.featured = data.featured;
  if (data.displayOrder !== undefined || data.display_order !== undefined) {
    record.display_order = data.displayOrder ?? data.display_order;
  }
  if (data.startDate !== undefined || data.start_date !== undefined) {
    record.start_date = data.startDate ?? data.start_date;
  }
  if (data.endDate !== undefined || data.end_date !== undefined) {
    record.end_date = data.endDate ?? data.end_date;
  }
  if (data.timezones !== undefined) record.timezones = data.timezones;
  if (data.seatsTotal !== undefined || data.seats_total !== undefined) {
    record.seats_total = data.seatsTotal ?? data.seats_total;
  }
  if (data.seatsBooked !== undefined || data.seats_booked !== undefined) {
    record.seats_booked = data.seatsBooked ?? data.seats_booked;
  }
  if (data.theme !== undefined) record.theme = data.theme;
  if (data.animationPreset !== undefined || data.animation_preset !== undefined) {
    record.animation_preset = data.animationPreset ?? data.animation_preset;
  }

  // Pack extended fields inside JSONB seo.extended
  const baseSeo = (data.seo && typeof data.seo === 'object') ? { ...data.seo } : {};
  const prevExt = baseSeo.extended || {};

  const ext = {
    ...prevExt,
    price: data.price !== undefined ? Number(data.price) : (prevExt.price ?? 0),
    speakers: data.speakers !== undefined ? data.speakers : (prevExt.speakers || []),
    agenda: data.agenda !== undefined ? data.agenda : (prevExt.agenda || []),
    faqs: data.faqs !== undefined ? data.faqs : (prevExt.faqs || []),
    learningOutcomes: (data.learningOutcomes !== undefined || data.learning_outcomes !== undefined)
      ? (data.learningOutcomes ?? data.learning_outcomes)
      : (prevExt.learningOutcomes || []),
    requirements: data.requirements !== undefined ? data.requirements : (prevExt.requirements || []),
    recordingUrl: (data.recordingUrl !== undefined || data.recording_url !== undefined)
      ? (data.recordingUrl ?? data.recording_url)
      : (prevExt.recordingUrl || ''),
    resources: data.resources !== undefined ? data.resources : (prevExt.resources || []),
    reminder24hSent: (data.reminder24hSent !== undefined || data.reminder_24h_sent !== undefined)
      ? (data.reminder24hSent ?? data.reminder_24h_sent)
      : (prevExt.reminder24hSent ?? false),
    reminder1hSent: (data.reminder1hSent !== undefined || data.reminder_1h_sent !== undefined)
      ? (data.reminder1hSent ?? data.reminder_1h_sent)
      : (prevExt.reminder1hSent ?? false),
  };

  record.seo = {
    ...baseSeo,
    extended: ext,
  };

  return record;
}

class QueryBuilder {
  constructor(queryFn) {
    this.queryFn = queryFn;
    this._sort = null;
    this._skip = 0;
    this._limit = 100;
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
  select() {
    return this;
  }
  then(resolve, reject) {
    return this.queryFn(this._sort, this._skip, this._limit).then(resolve, reject);
  }
}

export default {
  find(query = {}) {
    return new QueryBuilder(async (sortOpts, skip = 0, limit = 100) => {
      if (isSupabaseConfigured) {
        let req = supabase.from('workshops').select('*');
        if (query.status && query.status !== 'all') req = req.eq('status', query.status);
        if (query.category && query.category !== 'all') req = req.eq('category', query.category);
        if (query.showOnHub !== undefined) req = req.eq('show_on_hub', query.showOnHub);
        if (query.featured !== undefined) req = req.eq('featured', query.featured);

        const { data, error } = await req;
        if (error) throw error;
        let list = (data || []).map(normalize);

        // Apply in-memory search/date filters
        const now = new Date();
        if (query.startDate?.$gt) list = list.filter((w) => w.startDate && new Date(w.startDate) > query.startDate.$gt);
        if (query.endDate?.$lt) list = list.filter((w) => w.endDate && new Date(w.endDate) < query.endDate.$lt);
        if (query.$or) {
          list = list.filter((w) => {
            return query.$or.some((cond) => {
              if (cond.title?.$regex) return new RegExp(cond.title.$regex, cond.title.$options).test(w.title);
              if (cond.shortDescription?.$regex) return new RegExp(cond.shortDescription.$regex, cond.shortDescription.$options).test(w.shortDescription);
              return false;
            });
          });
        }

        // Sort
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return list.slice(skip, skip + limit);
      } else {
        const store = readLocalStore();
        let list = (store.workshops || []).map(normalize);

        if (query.status && query.status !== 'all') list = list.filter((w) => w.status === query.status);
        if (query.category && query.category !== 'all') list = list.filter((w) => w.category === query.category);
        if (query.showOnHub !== undefined) list = list.filter((w) => w.showOnHub === query.showOnHub);
        if (query.featured !== undefined) list = list.filter((w) => w.featured === query.featured);
        if (query.startDate?.$gt) list = list.filter((w) => w.startDate && new Date(w.startDate) > query.startDate.$gt);
        if (query.endDate?.$lt) list = list.filter((w) => w.endDate && new Date(w.endDate) < query.endDate.$lt);
        if (query.$or) {
          list = list.filter((w) => {
            return query.$or.some((cond) => {
              if (cond.title?.$regex) return new RegExp(cond.title.$regex, cond.title.$options).test(w.title);
              if (cond.shortDescription?.$regex) return new RegExp(cond.shortDescription.$regex, cond.shortDescription.$options).test(w.shortDescription);
              return false;
            });
          });
        }

        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return list.slice(skip, skip + limit);
      }
    });
  },

  async findOne(query = {}) {
    if (isSupabaseConfigured) {
      let req = supabase.from('workshops').select('*');
      if (query.slug) req = req.eq('slug', query.slug);
      if (query.id) req = req.eq('id', query.id);
      if (query._id) req = req.eq('id', query._id);
      const { data, error } = await req.maybeSingle();
      if (error) throw error;
      return normalize(data);
    } else {
      const store = readLocalStore();
      const found = (store.workshops || []).find((w) => {
        if (query.slug && w.slug !== query.slug) return false;
        if (query.id && w.id !== query.id) return false;
        if (query._id && w.id !== query._id) return false;
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
        .from('workshops')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.workshops.push(record);
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async findByIdAndUpdate(id, data, options = {}) {
    const patch = {
      ...denormalize(data),
      updated_at: new Date().toISOString(),
    };

    if (data.$inc?.seatsBooked) {
      const current = await this.findById(id);
      patch.seats_booked = Math.max(0, (current?.seatsBooked || 0) + data.$inc.seatsBooked);
    }

    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('workshops')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalize(updated);
    } else {
      const store = readLocalStore();
      const idx = store.workshops.findIndex((w) => w.id === id);
      if (idx === -1) return null;
      store.workshops[idx] = { ...store.workshops[idx], ...patch };
      writeLocalStore(store);
      return normalize(store.workshops[idx]);
    }
  },

  async findByIdAndDelete(id) {
    if (isSupabaseConfigured) {
      const current = await this.findById(id);
      const { error } = await supabase.from('workshops').delete().eq('id', id);
      if (error) throw error;
      return current;
    } else {
      const store = readLocalStore();
      const found = store.workshops.find((w) => w.id === id);
      store.workshops = store.workshops.filter((w) => w.id !== id);
      writeLocalStore(store);
      return normalize(found);
    }
  },

  async countDocuments(query = {}) {
    if (isSupabaseConfigured) {
      let req = supabase.from('workshops').select('id', { count: 'exact', head: true });
      if (query.status && query.status !== 'all') req = req.eq('status', query.status);
      if (query.category && query.category !== 'all') req = req.eq('category', query.category);
      if (query.showOnHub !== undefined) req = req.eq('show_on_hub', query.showOnHub);
      const { count, error } = await req;
      if (error) throw error;
      return count || 0;
    } else {
      const store = readLocalStore();
      return (store.workshops || []).length;
    }
  },

  async deleteMany() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('workshops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } else {
      const store = readLocalStore();
      store.workshops = [];
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};
