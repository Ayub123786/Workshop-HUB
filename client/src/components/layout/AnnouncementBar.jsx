import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const DISMISSED_KEY = 'workshophub_announcement_dismissed_v1';

export default function AnnouncementBar({ nextWorkshop }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(true); // default hidden until checked

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';
      setDismissed(isDismissed);
    } catch (e) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  // Do not show announcement bar when opening any workshop / event page
  if (location.pathname.startsWith('/w/')) return null;

  // If explicitly disabled in settings
  const config = settings?.announcementBar || {};
  if (config.enabled === false) return null;
  if (dismissed) return null;

  const message = config.text || (
    nextWorkshop
      ? `Next Live Cohort: ${nextWorkshop.title} · Final seats remaining.`
      : 'Institutional Due Diligence Masterclasses · Q4 Executive Cohorts Now Open.'
  );

  const targetLink = config.link || (nextWorkshop ? `/w/${nextWorkshop.slug}?reserve=true` : '/workshops');
  const badgeText = config.badge || 'NEXT COHORT';

  return (
    <aside
      aria-label="Announcement"
      className="bg-white border-b border-[#E8E8E8] relative z-50 text-xs py-2 px-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-cream border border-[#E8E8E8] text-gold px-2 py-0.5 rounded-full shrink-0">
            <Sparkles size={10} className="text-gold" />
            <span>{badgeText}</span>
          </span>

          <p className="text-navy font-medium truncate text-xs">
            {message}
          </p>

          <Link
            to={targetLink}
            className="hidden sm:inline-flex items-center gap-1 text-gold font-semibold hover:underline shrink-0 text-xs ml-1"
          >
            <span>Reserve spot</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="text-muted hover:text-navy p-1 rounded-md transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
