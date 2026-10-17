import { Calendar, Clock, Users, ArrowUpRight, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';
import { useBookmarks } from '../../lib/bookmarks';

export default function WorkshopListCard({ workshop, onQuickView }) {
  if (!workshop) return null;

  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(workshop.slug);

  const status = getWorkshopStatus(workshop);
  const badgeConfig = getStatusBadgeConfig(status);

  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercentage = seatsTotal > 0 ? Math.min(100, Math.round((seatsBooked / seatsTotal) * 100)) : 0;

  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';

  const d = workshop.startDate ? new Date(workshop.startDate) : null;
  const monthStr = d ? d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD';
  const dayStr = d ? d.getDate() : '--';
  const yearStr = d ? d.getFullYear() : '';
  const weekdayStr = d ? d.toLocaleDateString('en-US', { weekday: 'short' }) : '';

  return (
    <div className="bg-[#141418] border border-white/[0.08] rounded-3xl p-4 sm:p-5 hover:border-gold/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
        {/* Left: Date Block */}
        <div className="sm:w-20 sm:h-20 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-row sm:flex-col items-center justify-center p-2.5 shrink-0 text-center gap-2 sm:gap-0">
          <span className="text-[10px] font-bold text-gold tracking-widest font-mono">
            {monthStr}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono leading-none">
            {dayStr}
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {weekdayStr || yearStr}
          </span>
        </div>

        {/* Middle: Content details */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="sticker sticker-gold text-[9px]">
              {badgeConfig.label}
            </span>
            {workshop.category && (
              <span className="sticker sticker-muted text-[9px]">
                {workshop.category}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/w/${workshop.slug}`}>
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug hover:text-gold transition-colors line-clamp-1 mb-1">
              {workshop.title}
            </h3>
          </Link>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs font-mono text-white/40 flex-wrap">
            {workshop.timezones?.[0] && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} className="text-gold" />
                <span>{workshop.timezones[0].city} · {workshop.timezones[0].time}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users size={11} className="text-gold" />
              <span>{isSoldOut ? 'Sold Out' : `${seatsLeft} spots left`}</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <button
            onClick={() => toggle(workshop.slug)}
            className={`p-2.5 rounded-full border transition-colors ${
              saved
                ? 'bg-gold text-[#0a0a0a] border-gold shadow-gold-glow'
                : 'border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <Bookmark size={13} className={saved ? 'fill-current' : ''} />
          </button>

          {onQuickView && (
            <button
              onClick={() => onQuickView(workshop)}
              className="px-3.5 py-2 rounded-full border border-white/10 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Quick View
            </button>
          )}

          <Link
            to={`/w/${workshop.slug}?reserve=true`}
            className="btn-primary text-xs py-2 px-4 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-gold-glow"
          >
            <span>Reserve</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
