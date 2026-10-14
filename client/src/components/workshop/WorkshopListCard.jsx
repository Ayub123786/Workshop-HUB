import { Calendar, Clock, Users, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function WorkshopListCard({ workshop, onQuickView }) {
  if (!workshop) return null;

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
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 sm:p-5 hover:border-gold/60 transition-colors shadow-2xs hover:shadow-xs group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
        {/* Left: Date Block */}
        <div className="sm:w-20 sm:h-20 bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl flex flex-row sm:flex-col items-center justify-center p-2.5 shrink-0 text-center gap-2 sm:gap-0">
          <span className="text-[10px] font-bold text-gold tracking-widest font-mono">
            {monthStr}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-navy leading-none">
            {dayStr}
          </span>
          <span className="text-[10px] text-muted font-medium">
            {weekdayStr || yearStr}
          </span>
        </div>

        {/* Middle: Content details */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full ${badgeConfig.className}`}>
              {badgeConfig.isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />
              )}
              {badgeConfig.label}
            </span>
            {workshop.category && (
              <span className="text-[10px] font-medium text-navy bg-white border border-[#E8E8E8] px-2 py-0.5 rounded-full">
                {workshop.category}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/w/${workshop.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-navy leading-snug hover:text-gold transition-colors line-clamp-1 mb-1">
              {workshop.title}
            </h3>
          </Link>

          {/* Short Description */}
          {workshop.shortDescription && (
            <p className="text-xs text-muted leading-relaxed line-clamp-1 mb-2.5">
              {workshop.shortDescription}
            </p>
          )}

          {/* Meta Line: Speaker, Timezones, Seats */}
          <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
            <div className="flex items-center gap-1.5 text-navy font-medium">
              <User size={12} className="text-gold" />
              <span>Ayub</span>
            </div>

            {workshop.timezones?.length > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-navy/60" />
                <span className="truncate max-w-[200px]">
                  {workshop.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}
                </span>
              </div>
            )}

            {!isPast && (
              <div className="flex items-center gap-2">
                <Users size={12} className="text-navy/60" />
                <span>
                  {isSoldOut ? (
                    <strong className="text-navy">Sold Out</strong>
                  ) : (
                    <span>
                      <strong className="text-navy">{seatsLeft}</strong> spots left
                    </span>
                  )}
                </span>
                <div className="w-16 h-1 bg-[#F0F0F0] rounded-full overflow-hidden hidden md:block">
                  <div
                    className={`h-full rounded-full ${
                      isSoldOut ? 'bg-navy' : fillPercentage >= 80 ? 'bg-amber-500' : 'bg-gold'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: CTA Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E8E8]">
          {onQuickView && (
            <button
              onClick={() => onQuickView(workshop)}
              className="py-2 px-3 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream transition-colors"
            >
              Quick View
            </button>
          )}

          {isPast ? (
            <Link
              to={`/w/${workshop.slug}`}
              className="py-2 px-3 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:text-gold hover:border-gold transition-colors whitespace-nowrap"
            >
              Resources →
            </Link>
          ) : isSoldOut ? (
            <Link
              to={`/w/${workshop.slug}#waitlist`}
              className="py-2 px-3.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-black transition-colors whitespace-nowrap"
            >
              Waitlist →
            </Link>
          ) : (
            <Link
              to={`/w/${workshop.slug}`}
              className="btn-primary text-xs py-2 px-4 whitespace-nowrap font-semibold flex items-center gap-1"
            >
              <span>Reserve</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
