import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function WorkshopTimeline({ workshops = [], onQuickView }) {
  // Group workshops by Month Year
  const grouped = useMemo(() => {
    const map = {};
    workshops.forEach((w) => {
      let groupKey = 'Undated Sessions';
      if (w.startDate) {
        const d = new Date(w.startDate);
        groupKey = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      if (!map[groupKey]) map[groupKey] = [];
      map[groupKey].push(w);
    });

    return Object.entries(map);
  }, [workshops]);

  if (workshops.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      {grouped.map(([monthTitle, items]) => (
        <div key={monthTitle} className="relative">
          {/* Month Marker Header */}
          <div className="sticky top-20 z-10 flex items-center gap-3 mb-6 bg-[#FAF9F6]/90 backdrop-blur-xs py-1">
            <span className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
              <Calendar size={12} className="text-gold" />
              {monthTitle}
            </span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-[11px] font-mono text-muted">
              {items.length} {items.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {/* Timeline Items with Connecting Line */}
          <div className="relative border-l-2 border-[#E8E8E8] ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8">
            {items.map((w) => {
              const status = getWorkshopStatus(w);
              const badge = getStatusBadgeConfig(status);
              const isPast = status === 'completed';
              const isSoldOut = status === 'sold-out';

              const dateFormatted = w.startDate
                ? new Date(w.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Date TBA';

              return (
                <div key={w._id || w.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 bg-white transition-all duration-200 group-hover:scale-125 ${
                      status === 'live'
                        ? 'border-red-500 bg-red-500 animate-ping'
                        : isPast
                        ? 'border-[#9CA3AF]'
                        : 'border-gold group-hover:bg-gold'
                    }`}
                  />
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 bg-white ${
                      status === 'live'
                        ? 'border-red-500'
                        : isPast
                        ? 'border-[#9CA3AF]'
                        : 'border-gold'
                    }`}
                  />

                  {/* Timeline Card */}
                  <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-gold/60 transition-all shadow-2xs hover:shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1 inline-block" />
                          )}
                          {badge.label}
                        </span>
                        {w.category && (
                          <span className="text-[10px] font-medium text-navy bg-cream border border-[#E8E8E8] px-2 py-0.5 rounded-full">
                            {w.category}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-gold flex items-center gap-1 font-mono">
                          <Calendar size={12} />
                          {dateFormatted}
                        </span>
                      </div>

                      {w.timezones?.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-muted shrink-0">
                          <Clock size={11} className="text-navy/60" />
                          <span>{w.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/w/${w.slug}`}>
                      <h4 className="text-base font-bold text-navy leading-snug hover:text-gold transition-colors mb-2">
                        {w.title}
                      </h4>
                    </Link>

                    {w.shortDescription && (
                      <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">
                        {w.shortDescription}
                      </p>
                    )}

                    <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-between gap-2">
                      <span className="text-xs text-muted">
                        Trainer: <strong className="text-navy font-semibold">Ayub</strong> (Due Diligence Lab)
                      </span>

                      <div className="flex items-center gap-2">
                        {onQuickView && (
                          <button
                            onClick={() => onQuickView(w)}
                            className="py-1.5 px-3 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream transition-colors"
                          >
                            Quick View
                          </button>
                        )}
                        {isPast ? (
                          <Link
                            to={`/w/${w.slug}`}
                            className="text-xs font-semibold text-navy hover:text-gold transition-colors"
                          >
                            Get Resources →
                          </Link>
                        ) : isSoldOut ? (
                          <Link
                            to={`/w/${w.slug}#waitlist`}
                            className="py-1.5 px-3 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-black transition-colors"
                          >
                            Join Waitlist
                          </Link>
                        ) : (
                          <Link
                            to={`/w/${w.slug}?reserve=true`}
                            className="btn-primary text-xs py-1.5 px-3 font-semibold flex items-center gap-1"
                          >
                            <span>Reserve</span>
                            <ArrowRight size={11} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
