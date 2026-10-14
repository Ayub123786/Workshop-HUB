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
} from 'lucide-react';
import api from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminSettingsPage() {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setSettings(res.data.settings || {});
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.put('/settings', settings);
      setSaveSuccess(true);
      if (refreshSettings) refreshSettings();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs text-muted">Loading platform settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Platform Configuration</h1>
          <p className="text-xs text-muted mt-1">
            Global hub headline, navbar navigation links, AUM trust indicators, and branding.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs py-2 px-5 flex items-center gap-2 self-start sm:self-auto"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Platform Settings'}
        </button>
      </div>

      {/* General Platform Branding */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-gold" /> Hub Branding & Content
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
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Logo Text or URL
            </label>
            <input
              type="text"
              value={settings.logo || ''}
              placeholder="e.g. Workshop Hub or image URL"
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Hub Hero Headline
          </label>
          <input
            type="text"
            value={settings.hubHeadline || ''}
            onChange={(e) => setSettings({ ...settings, hubHeadline: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Hub Hero Subtitle
          </label>
          <textarea
            rows={2}
            value={settings.hubSubtitle || ''}
            onChange={(e) => setSettings({ ...settings, hubSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none"
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
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
          />
        </div>
      </div>

      {/* Global Trust / AUM Banner */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-gold" /> Global Trust & AUM Metric
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Currency Prefix</label>
            <input
              type="text"
              value={settings.globalTrust?.aumPrefix || '$'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  globalTrust: { ...settings.globalTrust, aumPrefix: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">AUM Number (Counter)</label>
            <input
              type="text"
              value={settings.globalTrust?.aumNumber || '246'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  globalTrust: { ...settings.globalTrust, aumNumber: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">AUM Label</label>
            <input
              type="text"
              value={settings.globalTrust?.aumLabel || 'Billion AUM+'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  globalTrust: { ...settings.globalTrust, aumLabel: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Navbar Links Manager */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
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
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-cream"
            >
              <span className="font-mono text-muted text-xs">#{idx + 1}</span>
              <input
                type="text"
                value={link.label || ''}
                onChange={(e) => handleUpdateNavLink(idx, 'label', e.target.value)}
                placeholder="Link Label (e.g. Workshops)"
                className="w-1/3 px-3 py-1.5 rounded-lg border border-border bg-white text-xs"
              />
              <input
                type="text"
                value={link.href || ''}
                onChange={(e) => handleUpdateNavLink(idx, 'href', e.target.value)}
                placeholder="Target URL (e.g. /workshops)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono"
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
    </form>
  );
}
