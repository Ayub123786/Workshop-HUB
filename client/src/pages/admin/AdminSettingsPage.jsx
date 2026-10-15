import { useState, useEffect } from 'react';
import {
  Save,
  Check,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  Loader2,
  Layers,
  Globe,
  Sliders,
  Building2,
  MessageSquare,
  HelpCircle,
  BarChart3,
  RotateCcw,
  Film,
} from 'lucide-react';
import api from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_FIRMS = [
  'Blackstone',
  'KKR',
  'Carlyle Group',
  'EQT Partners',
  'Sequoia Capital',
  'Bain Capital',
  'General Atlantic',
  'Warburg Pincus',
  'Insight Partners',
  'Andreessen Horowitz',
  'TPG Capital',
  'CVC Capital Partners',
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Principal, Technology & Deal Sourcing',
    company: 'Blackstone',
    quote: 'The automation workflow collapsed our analyst memo drafting from 48 hours to under 35 minutes. An indispensable masterclass.',
    cohort: 'Fall 2026 Cohort',
  },
  {
    name: 'Elena Rostova',
    role: 'Partner, Valuation Lab',
    company: 'EQT Partners',
    quote: 'Ayub brings the exact bridge between real audited statements and multi-agent synthesis that standard tech demos completely miss.',
    cohort: 'Winter 2026 Cohort',
  },
  {
    name: 'David Chen',
    role: 'Vice President, Deal Diligence',
    company: 'Bain Capital',
    quote: 'Practical, high-yield frameworks tested on actual PE confidential documents. Highly recommended for any deal team looking to stay ahead.',
    cohort: 'Summer 2026 Cohort',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Managing Director, Growth Equity',
    company: 'Insight Partners',
    quote: 'The return on investment was immediate on our first portfolio intelligence rollout the following Monday.',
    cohort: 'Spring 2026 Cohort',
  },
  {
    name: 'Tariq Al-Mansoor',
    role: 'Head of Direct Investments',
    company: 'Gulf Family Office',
    quote: 'Clear, concise, and technically rigorous. The architecture templates alone paid for the seat ten times over.',
    cohort: 'Summer 2026 Cohort',
  },
  {
    name: 'Claire Dupont',
    role: 'Associate Director, LBO Execution',
    company: 'CVC Capital',
    quote: 'Not a generic lecture — this is an engineering workshop tailored for financial models and analyst speed.',
    cohort: 'Fall 2026 Cohort',
  },
];

const DEFAULT_FAQS = [
  {
    q: 'Who are these workshops designed for?',
    a: 'Our master classes are engineered specifically for private equity partners, venture capital deal teams, family office investment directors, and financial analysts who want to deploy multi-model agentic systems into due diligence, memo synthesis, and deal sourcing.',
  },
  {
    q: 'Are the sessions live or pre-recorded?',
    a: 'Every master class is delivered live and interactive by Ayub. You work through live stress-tests, model orchestration architectures, and proprietary tool stacks with real-time Q&A.',
  },
  {
    q: 'What materials and templates do attendees receive?',
    a: 'Attendees receive production-ready agent prompt architectures, pipeline orchestration blueprints, sample valuation data sets, and lifetime access to our alumni community and session slide decks.',
  },
  {
    q: 'Can my firm get an invoice for corporate reimbursement?',
    a: 'Yes. Automated corporate receipts and tax invoices with your fund or firm name are generated immediately upon registration. Contact team@morsebridge.com for bulk team booking passes.',
  },
  {
    q: 'What if I am unable to attend the live scheduled time?',
    a: 'All registered attendees receive full on-demand video access, transcript summaries, and key takeaway packages within 24 hours of session completion.',
  },
  {
    q: 'How does the waitlist work for sold-out workshops?',
    a: 'When an executive cohort reaches maximum capacity, you can join the verified waitlist for free. If an attendee reschedules or a seat opens, waitlisted professionals are notified immediately in first-come order.',
  },
];

export default function AdminSettingsPage() {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      const data = res.data.settings || {};

      // Ensure lists exist
      const firms = (data.firms && data.firms.length > 0)
        ? data.firms
        : (data.globalTrust?.firms && data.globalTrust.firms.length > 0)
          ? data.globalTrust.firms
          : DEFAULT_FIRMS;

      const testimonials = (data.testimonials && data.testimonials.length > 0)
        ? data.testimonials
        : (data.globalTrust?.testimonials && data.globalTrust.testimonials.length > 0)
          ? data.globalTrust.testimonials
          : DEFAULT_TESTIMONIALS;

      const faqs = (data.faqs && data.faqs.length > 0)
        ? data.faqs
        : (data.globalTrust?.faqs && data.globalTrust.faqs.length > 0)
          ? data.globalTrust.faqs
          : DEFAULT_FAQS;

      const heroStats = data.heroStats || data.globalTrust?.heroStats || {
        totalWorkshops: 18,
        totalAttendees: 1480,
        countries: 18,
        aumTrained: 246,
      };

      setSettings({
        ...data,
        firms,
        testimonials,
        faqs,
        heroStats,
      });
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        ...settings,
        globalTrust: {
          ...(settings.globalTrust || {}),
          firms: settings.firms,
          testimonials: settings.testimonials,
          faqs: settings.faqs,
          heroStats: settings.heroStats,
          heroVideoUrl: settings.heroVideoUrl,
          announcementBar: settings.announcementBar,
          pastEventsSettings: settings.pastEventsSettings,
        },
      };

      await api.put('/settings', payload);
      setSaveSuccess(true);
      if (refreshSettings) refreshSettings();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Nav Links
  const handleAddNavLink = () => {
    const updated = [
      ...(settings.navbarLinks || []),
      { label: 'New Link', href: '/workshops', order: (settings.navbarLinks || []).length },
    ];
    setSettings({ ...settings, navbarLinks: updated });
  };

  const handleUpdateNavLink = (index, key, val) => {
    const updated = [...(settings.navbarLinks || [])];
    updated[index] = { ...updated[index], [key]: val };
    setSettings({ ...settings, navbarLinks: updated });
  };

  const handleDeleteNavLink = (index) => {
    const updated = (settings.navbarLinks || []).filter((_, i) => i !== index);
    setSettings({ ...settings, navbarLinks: updated });
  };

  // Firms
  const handleAddFirm = () => {
    setSettings({ ...settings, firms: [...(settings.firms || []), ''] });
  };

  const handleUpdateFirm = (index, val) => {
    const list = [...(settings.firms || [])];
    list[index] = val;
    setSettings({ ...settings, firms: list });
  };

  const handleDeleteFirm = (index) => {
    setSettings({ ...settings, firms: (settings.firms || []).filter((_, i) => i !== index) });
  };

  // Testimonials
  const handleAddTestimonial = () => {
    setSettings({
      ...settings,
      testimonials: [
        ...(settings.testimonials || []),
        { name: '', role: '', company: '', quote: '', cohort: 'Recent Cohort' },
      ],
    });
  };

  const handleUpdateTestimonial = (index, key, val) => {
    const list = [...(settings.testimonials || [])];
    list[index] = { ...list[index], [key]: val };
    setSettings({ ...settings, testimonials: list });
  };

  const handleDeleteTestimonial = (index) => {
    setSettings({
      ...settings,
      testimonials: (settings.testimonials || []).filter((_, i) => i !== index),
    });
  };

  // FAQs
  const handleAddFaq = () => {
    setSettings({
      ...settings,
      faqs: [...(settings.faqs || []), { q: 'New Question', a: 'Detailed answer here...' }],
    });
  };

  const handleUpdateFaq = (index, key, val) => {
    const list = [...(settings.faqs || [])];
    list[index] = { ...list[index], [key]: val };
    setSettings({ ...settings, faqs: list });
  };

  const handleDeleteFaq = (index) => {
    setSettings({
      ...settings,
      faqs: (settings.faqs || []).filter((_, i) => i !== index),
    });
  };

  if (loading || !settings) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs text-muted font-semibold">Loading platform settings & content...</p>
      </div>
    );
  }

  const TABS = [
    { id: 'general', label: 'General & Branding', icon: Globe },
    { id: 'metrics', label: 'Live Hero Stats', icon: BarChart3 },
    { id: 'firms', label: `Firms & Logos (${(settings.firms || []).length})`, icon: Building2 },
    { id: 'testimonials', label: `Testimonials (${(settings.testimonials || []).length})`, icon: MessageSquare },
    { id: 'faqs', label: `Platform FAQs (${(settings.faqs || []).length})`, icon: HelpCircle },
    { id: 'past', label: 'Past Events 3D Showcase', icon: Film },
    { id: 'navigation', label: `Navbar Links (${(settings.navbarLinks || []).length})`, icon: Layers },
  ];

  return (
    <form onSubmit={handleSave} className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Platform & Site-Wide Content</h1>
          <p className="text-xs text-muted mt-1">
            Customize all public hub text, live hero stats, verified firm logos, testimonials, FAQs, and navigation.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs py-2 px-5 flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? 'Saving...' : saveSuccess ? 'Saved Changes!' : 'Save Platform Settings'}
        </button>
      </div>

      {/* Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap bg-white border border-[#E8E8E8] rounded-xl p-1.5 shadow-2xs scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-navy text-white shadow-2xs font-bold'
                  : 'text-muted hover:text-navy hover:bg-[#FAF9F6]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-gold' : 'text-muted'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: GENERAL & BRANDING ─── */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-gold" /> Hub Branding & Headlines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platformName || ''}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Logo Image or SVG Path
                </label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  placeholder="/Logo.png"
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Main Hub Hero Headline
              </label>
              <input
                type="text"
                value={settings.hubHeadline || ''}
                onChange={(e) => setSettings({ ...settings, hubHeadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Main Hub Hero Subtitle
              </label>
              <textarea
                rows={2}
                value={settings.hubSubtitle || ''}
                onChange={(e) => setSettings({ ...settings, hubSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs resize-none focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Global Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.footerText || ''}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" /> Hub Announcement Bar
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={settings.announcementBar?.enabled !== false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBar: {
                        ...(settings.announcementBar || {}),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-[#E8E8E8] text-gold focus:ring-gold"
                />
                <span>Enable Announcement Banner</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Badge Text</label>
                <input
                  type="text"
                  value={settings.announcementBar?.badge || ''}
                  placeholder="e.g. NEXT COHORT"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBar: {
                        ...(settings.announcementBar || {}),
                        badge: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy mb-1">Destination Link</label>
                <input
                  type="text"
                  value={settings.announcementBar?.link || ''}
                  placeholder="e.g. /workshops or /w/pe-deal-flow-automation"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBar: {
                        ...(settings.announcementBar || {}),
                        link: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Announcement Message</label>
              <input
                type="text"
                value={settings.announcementBar?.text || ''}
                placeholder="e.g. Next Live Cohort: Private Equity AI Due Diligence · Final seats remaining."
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBar: {
                      ...(settings.announcementBar || {}),
                      text: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs focus:outline-none focus:border-gold"
              />
              <p className="text-[10px] text-muted mt-1">
                Leave blank to automatically announce the next upcoming published master class.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: LIVE HERO METRICS / STATS ─── */}
      {activeTab === 'metrics' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-5">
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold" /> Live Hero Counters & AUM Metrics
            </h3>
            <p className="text-xs text-muted mt-1">
              Customize the 4 animated counter stats displayed in the hero section on the main page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl space-y-1.5">
              <label className="block text-[11px] font-bold text-navy uppercase">Workshops Hosted</label>
              <input
                type="number"
                value={settings.heroStats?.totalWorkshops ?? 18}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroStats: {
                      ...(settings.heroStats || {}),
                      totalWorkshops: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-sm font-bold text-navy"
              />
              <span className="text-[10px] text-muted block">Displays as "(N)+ Workshops Hosted"</span>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl space-y-1.5">
              <label className="block text-[11px] font-bold text-navy uppercase">Professionals Trained</label>
              <input
                type="number"
                value={settings.heroStats?.totalAttendees ?? 1480}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroStats: {
                      ...(settings.heroStats || {}),
                      totalAttendees: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-sm font-bold text-navy"
              />
              <span className="text-[10px] text-muted block">Displays as "(N)+ Professionals Trained"</span>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl space-y-1.5">
              <label className="block text-[11px] font-bold text-navy uppercase">Hubs / Countries</label>
              <input
                type="number"
                value={settings.heroStats?.countries ?? 18}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroStats: {
                      ...(settings.heroStats || {}),
                      countries: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-sm font-bold text-navy"
              />
              <span className="text-[10px] text-muted block">Displays as "(N) Financial Hubs / Countries"</span>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl space-y-1.5">
              <label className="block text-[11px] font-bold text-navy uppercase">AUM Across Funds ($B)</label>
              <input
                type="number"
                value={settings.heroStats?.aumTrained ?? 246}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroStats: {
                      ...(settings.heroStats || {}),
                      aumTrained: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-sm font-bold text-navy"
              />
              <span className="text-[10px] text-muted block">Displays as "$(N)B+ AUM Across Trained Funds"</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: INSTITUTIONAL FIRMS & LOGOS ─── */}
      {activeTab === 'firms' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold" /> Institutional Firms & Funds Marquee
              </h3>
              <p className="text-xs text-muted mt-0.5">
                These firms scroll continuously in the "Firms We've Trained" marquee strip on the homepage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, firms: DEFAULT_FIRMS })}
                className="text-xs text-muted hover:text-navy border border-[#E8E8E8] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Reset to Defaults
              </button>
              <button
                type="button"
                onClick={handleAddFirm}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Firm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {(settings.firms || []).map((firm, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl border border-[#E8E8E8] bg-[#FAF9F6] text-xs"
              >
                <span className="w-5 text-right font-mono text-muted text-[11px]">#{idx + 1}</span>
                <input
                  type="text"
                  value={firm}
                  onChange={(e) => handleUpdateFirm(idx, e.target.value)}
                  placeholder="Firm Name (e.g. Blackstone)"
                  className="flex-1 px-2.5 py-1 rounded-lg border border-[#E8E8E8] bg-white text-xs font-semibold text-navy focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteFirm(idx)}
                  className="p-1 text-muted hover:text-red-600 rounded-lg"
                  title="Remove firm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CLIENT & FUND TESTIMONIALS ─── */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold" /> Dealmaker & Alumni Testimonials
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Featured reviews and endorsements from private equity, VC, and family office attendees.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, testimonials: DEFAULT_TESTIMONIALS })}
                className="text-xs text-muted hover:text-navy border border-[#E8E8E8] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Review
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {(settings.testimonials || []).map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E8E8E8] bg-[#FAF9F6] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy font-mono">Testimonial #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(idx)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-navy mb-1">Author Name</label>
                    <input
                      type="text"
                      value={t.name || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'name', e.target.value)}
                      placeholder="Marcus Vance"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] bg-white font-semibold text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-navy mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={t.role || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'role', e.target.value)}
                      placeholder="Principal, Technology"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-navy mb-1">Company / Fund</label>
                    <input
                      type="text"
                      value={t.company || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'company', e.target.value)}
                      placeholder="Blackstone"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-navy mb-1">Cohort Tag</label>
                    <input
                      type="text"
                      value={t.cohort || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'cohort', e.target.value)}
                      placeholder="Fall 2026 Cohort"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Quote</label>
                  <textarea
                    rows={2}
                    value={t.quote || ''}
                    onChange={(e) => handleUpdateTestimonial(idx, 'quote', e.target.value)}
                    placeholder="The automation workflow collapsed our analyst memo drafting from 48 hours to under 35 minutes..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy text-xs resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: PLATFORM FAQS ─── */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gold" /> Frequently Asked Questions (FAQ)
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Questions and answers shown in the accordion on the homepage and workshop detail pages.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, faqs: DEFAULT_FAQS })}
                className="text-xs text-muted hover:text-navy border border-[#E8E8E8] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleAddFaq}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {(settings.faqs || []).map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E8E8E8] bg-[#FAF9F6] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy font-mono">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.q || ''}
                    onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                    placeholder="e.g. Who are these workshops designed for?"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white font-semibold text-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Answer</label>
                  <textarea
                    rows={3}
                    value={faq.a || ''}
                    onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                    placeholder="Detailed explanation..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy text-xs resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 6: PAST EVENTS 3D SHOWCASE ─── */}
      {activeTab === 'past' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-gold" /> Past Events 3D Coverflow Configuration
            </h3>
            <p className="text-xs text-muted mt-1">
              Customize section title, subtitle, and badge text for the past event replay coverflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Section Badge</label>
              <input
                type="text"
                value={settings.pastEventsSettings?.badge || 'LIVE EVENT PREVIEWS'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pastEventsSettings: {
                      ...(settings.pastEventsSettings || {}),
                      badge: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Section Main Title</label>
              <input
                type="text"
                value={settings.pastEventsSettings?.title || 'OUR PAST EVENTS'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pastEventsSettings: {
                      ...(settings.pastEventsSettings || {}),
                      title: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Section Subtitle</label>
            <textarea
              rows={2}
              value={
                settings.pastEventsSettings?.subtitle ||
                'Explore live keynote highlights, speed pitches, and investor roundtables from our global gatherings. Click any panel to view in full resolution.'
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pastEventsSettings: {
                    ...(settings.pastEventsSettings || {}),
                    subtitle: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs resize-none"
            />
          </div>
        </div>
      )}

      {/* ─── TAB 7: NAVIGATION BAR LINKS ─── */}
      {activeTab === 'navigation' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Navigation Bar Links
              </h3>
              <p className="text-[11px] text-muted">Top header menu links shown on the public site</p>
            </div>
            <button
              type="button"
              onClick={handleAddNavLink}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Link
            </button>
          </div>

          <div className="space-y-2">
            {(settings.navbarLinks || []).map((link, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8E8] bg-[#FAF9F6]"
              >
                <span className="font-mono text-muted text-xs">#{idx + 1}</span>
                <input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => handleUpdateNavLink(idx, 'label', e.target.value)}
                  placeholder="Link Label (e.g. Workshops)"
                  className="w-1/3 px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-xs font-semibold text-navy"
                />
                <input
                  type="text"
                  value={link.href || ''}
                  onChange={(e) => handleUpdateNavLink(idx, 'href', e.target.value)}
                  placeholder="Target URL (e.g. /workshops)"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteNavLink(idx)}
                  className="p-1.5 text-muted hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
