import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function normalize(s) {
  if (!s) return null;
  const gt = (s.global_trust ?? s.globalTrust ?? {});
  const normalized = {
    ...s,
    _id: s.id,
    id: s.id,
    platformName: s.platform_name ?? s.platformName ?? 'Workshop Hub',
    logo: s.logo || '/Logo.png',
    hubHeadline: s.hub_headline ?? s.hubHeadline ?? 'Build What the Best Funds Already Run',
    hubSubtitle: s.hub_subtitle ?? s.hubSubtitle ?? 'Live, expert-led master classes for finance and investment professionals. Walk away with systems, not slides.',
    heroVideoUrl: s.hero_video_url ?? s.heroVideoUrl ?? gt.heroVideoUrl ?? '',
    announcementBar: s.announcement_bar ?? s.announcementBar ?? gt.announcementBar ?? {
      enabled: true,
      badge: 'NEXT COHORT',
      text: '',
      link: '/workshops',
    },
    heroStats: s.hero_stats ?? s.heroStats ?? gt.heroStats ?? {
      totalWorkshops: 18,
      totalAttendees: 1480,
      countries: 18,
      aumTrained: 246,
    },
    faqs: s.faqs ?? gt.faqs ?? [],
    firms: s.firms ?? gt.firms ?? [],
    testimonials: s.testimonials ?? gt.testimonials ?? [],
    pastEventsSettings: s.past_events_settings ?? s.pastEventsSettings ?? gt.pastEventsSettings ?? null,
    navbarLinks: s.navbar_links ?? s.navbarLinks ?? [
      { label: 'Workshops', href: '/workshops', order: 0 },
      { label: 'Upcoming', href: '/workshops?filter=upcoming', order: 1 },
      { label: 'Past', href: '/workshops?filter=past', order: 2 },
    ],
    footerText: s.footer_text ?? s.footerText ?? '© 2026 Workshop Hub · Morse Bridge Ventures. All rights reserved.',
    globalTrust: {
      aumNumber: '246',
      aumLabel: 'Billion AUM+',
      aumPrefix: '$',
      testimonials: [],
      firms: [],
      faqs: [],
      heroStats: { totalWorkshops: 18, totalAttendees: 1480, countries: 18, aumTrained: 246 },
      ...gt,
    },
    uiVariant: s.ui_variant ?? s.uiVariant ?? 'minimal',
    animationsEnabled: s.animations_enabled ?? s.animationsEnabled ?? true,
    createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updated_at ?? s.updatedAt ?? new Date().toISOString(),
  };

  normalized.save = async function () {
    return PlatformSettings.update(normalized);
  };
  normalized.toObject = () => ({ ...normalized });
  return normalized;
}

function denormalize(s) {
  const record = {};
  if (s.id) record.id = s.id;
  if (s.platformName !== undefined || s.platform_name !== undefined) {
    record.platform_name = s.platformName ?? s.platform_name;
  }
  if (s.logo !== undefined) record.logo = s.logo;
  if (s.hubHeadline !== undefined || s.hub_headline !== undefined) {
    record.hub_headline = s.hubHeadline ?? s.hub_headline;
  }
  if (s.hubSubtitle !== undefined || s.hub_subtitle !== undefined) {
    record.hub_subtitle = s.hubSubtitle ?? s.hub_subtitle;
  }
  if (s.navbarLinks !== undefined || s.navbar_links !== undefined) {
    record.navbar_links = s.navbarLinks ?? s.navbar_links;
  }
  if (s.footerText !== undefined || s.footer_text !== undefined) {
    record.footer_text = s.footerText ?? s.footer_text;
  }

  // Pack structured settings into JSONB global_trust
  const baseGt = (s.globalTrust && typeof s.globalTrust === 'object')
    ? { ...s.globalTrust }
    : (s.global_trust && typeof s.global_trust === 'object')
      ? { ...s.global_trust }
      : {};

  if (s.faqs !== undefined) baseGt.faqs = s.faqs;
  if (s.firms !== undefined) baseGt.firms = s.firms;
  if (s.testimonials !== undefined) baseGt.testimonials = s.testimonials;
  if (s.heroStats !== undefined) baseGt.heroStats = s.heroStats;
  if (s.announcementBar !== undefined) baseGt.announcementBar = s.announcementBar;
  if (s.heroVideoUrl !== undefined) baseGt.heroVideoUrl = s.heroVideoUrl;
  if (s.pastEventsSettings !== undefined) baseGt.pastEventsSettings = s.pastEventsSettings;

  record.global_trust = baseGt;

  if (s.uiVariant !== undefined || s.ui_variant !== undefined) {
    record.ui_variant = s.uiVariant ?? s.ui_variant;
  }
  if (s.animationsEnabled !== undefined || s.animations_enabled !== undefined) {
    record.animations_enabled = s.animationsEnabled ?? s.animations_enabled;
  }
  return record;
}

const PlatformSettings = {
  findOne() {
    return {
      populate() {
        return this;
      },
      then(resolve, reject) {
        return PlatformSettings.get().then(resolve, reject);
      },
    };
  },

  async get() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return normalize(data);
    } else {
      const store = readLocalStore();
      const current = (store.platform_settings || [])[0];
      return normalize(current);
    }
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
        .from('platform_settings')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return normalize(inserted);
    } else {
      const store = readLocalStore();
      store.platform_settings = [record];
      writeLocalStore(store);
      return normalize(record);
    }
  },

  async findById(id) {
    return this.get();
  },

  async findByIdAndUpdate(id, data) {
    return this.update(data);
  },

  async update(data) {
    const patch = {
      ...denormalize(data),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const existing = await this.get();
      if (existing) {
        const { data: updated, error } = await supabase
          .from('platform_settings')
          .update(patch)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return normalize(updated);
      } else {
        return this.create(data);
      }
    } else {
      const store = readLocalStore();
      const current = (store.platform_settings || [])[0] || { id: randomUUID() };
      const updated = { ...current, ...patch };
      store.platform_settings = [updated];
      writeLocalStore(store);
      return normalize(updated);
    }
  },

  async deleteMany() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('platform_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } else {
      const store = readLocalStore();
      store.platform_settings = [];
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};

export default PlatformSettings;
