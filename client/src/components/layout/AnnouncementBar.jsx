import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const DISMISSED_KEY = 'workshophub_announcement_dismissed_v1';

export default function AnnouncementBar({ nextWorkshop, onVisibilityChange }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const config = settings?.announcementBar || {};
  const isHiddenByPath = location.pathname.startsWith('/w/');
  const isEnabled = config.enabled !== false;
  const isVisible = !isHiddenByPath && isEnabled && !dismissed;

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  const handleDismiss = () => {
    setDismissed(true);
    onVisibilityChange?.(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  if (!isVisible) return null;

  const message = config.text || (
    nextWorkshop
      ? `Next Cohort: ${nextWorkshop.title} · Final seats available.`
      : 'Institutional Due Diligence Masterclasses · Q4 Cohorts Open.'
  );

  const targetLink = config.link || (nextWorkshop ? `/w/${nextWorkshop.slug}?reserve=true` : '/workshops');
  const badgeText = config.badge || 'LIVE ✦ Q4';

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#0a0a0a] border-b border-white/[0.08] relative z-40 text-xs py-2 px-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden flex-1 justify-center sm:justify-start">
          <span className="sticker sticker-gold text-[9px] py-0.5 px-2.5 shrink-0">
            <Sparkles size={10} className="text-gold" />
            <span>{badgeText}</span>
          </span>

          <p className="text-white/80 font-mono text-[11px] uppercase tracking-wider truncate">
            {message}
          </p>

          <Link
            to={targetLink}
            className="hidden sm:inline-flex items-center gap-1 text-gold font-mono text-[11px] font-bold uppercase tracking-wider hover:text-gold-light shrink-0 ml-1 transition-colors"
          >
            <span>Reserve spot</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="text-white/40 hover:text-white p-1 rounded-md transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
