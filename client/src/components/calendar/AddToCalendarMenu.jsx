import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadIcsFile } from '../../lib/calendarExport';

export default function AddToCalendarMenu({ workshop, buttonClassName, buttonText = 'Add to Calendar' }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!workshop?.startDate) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          buttonClassName ||
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-xs font-semibold text-navy hover:bg-cream hover:border-gold transition-colors shadow-2xs'
        }
        aria-expanded={open}
      >
        <CalendarIcon size={13} className="text-navy/70" />
        <span>{buttonText}</span>
        <ChevronDown size={11} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-[#E8E8E8] shadow-card-hover z-50 py-1 text-xs">
          <a
            href={getGoogleCalendarUrl(workshop)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-navy hover:bg-cream hover:text-gold transition-colors"
          >
            <span className="font-medium">Google Calendar</span>
            <ExternalLink size={12} className="text-muted" />
          </a>
          <a
            href={getOutlookCalendarUrl(workshop)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-navy hover:bg-cream hover:text-gold transition-colors"
          >
            <span className="font-medium">Outlook Web</span>
            <ExternalLink size={12} className="text-muted" />
          </a>
          <div className="border-t border-[#E8E8E8] my-1" />
          <button
            type="button"
            onClick={() => {
              downloadIcsFile(workshop);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-navy hover:bg-cream hover:text-gold transition-colors text-left"
          >
            <span className="font-medium">Apple / iCal (.ics)</span>
            <Download size={12} className="text-muted" />
          </button>
        </div>
      )}
    </div>
  );
}
