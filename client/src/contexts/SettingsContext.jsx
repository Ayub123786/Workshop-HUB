import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  platformName: 'Workshop Hub',
  logo: '/Logo.png',
  hubHeadline: 'Build What the Best Funds Already Run',
  hubSubtitle: 'Live, expert-led master classes for finance and investment professionals.',
  navbarLinks: [],
  footerText: '© 2026 Workshop Hub. All rights reserved.',
  globalTrust: { aumNumber: '246', aumLabel: 'Billion AUM+', aumPrefix: '$', testimonials: [] },
  animationsEnabled: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem('hub_settings_cache');
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          try {
            sessionStorage.setItem('hub_settings_cache', JSON.stringify(data.settings));
          } catch {}
        }
      })
      .catch(() => {}) // use defaults on error
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
};
