import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Eye, Users } from 'lucide-react';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function WorkshopTimeline({ workshops = [], onQuickView }) {
  // Group workshops by Month Year
  const grouped = useMemo(() => {
    const map = {};
    workshops.forEach((w) => {
      let groupKey = 'Upcoming Cohorts';
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
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {grouped.map(([monthTitle, items]) => (
        <div key={monthTitle} className="relative">
          {/* Month Marker Header */}
          <div className="sticky top-20 z-10 flex items-center gap-3 mb-6 bg-[#0a0a0a]/90 backdrop-blur-md py-2">
            <span className="inline-flex items-center gap-2 bg-[#16161a] border border-white/15 text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              <Calendar size={13} className="text-gold" />
              <span>{monthTitle}</span>
            </span>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
              {items.length} {items.length === 1 ? 'SESSION' : 'SESSIONS'}
            </span>
          </div>

          {/* Timeline Items with Connecting Line */}
          <div className="relative border-l border-white/10 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8">
            {items.map((w, idx) => {
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
                    className={`absolute -left-[31px] sm:-left-[39px] top-5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 group-hover:scale-125 ${
                      status === 'live'
                        ? 'border-red-500 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                        : isPast
                        ? 'border-white/20 bg-black'
                        : 'border-gold bg-[#0a0a0a] group-hover:bg-gold shadow-[0_0_12px_rgba(201,162,77,0.5)]'
                    }`}
                  />

                  {/* Timeline Card */}
                  <div className="glass-strong rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge.className}`}>
                          {badge.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1 inline-block" />
                          )}
                          {badge.label}
                        </span>

                        {w.category && (
                          <span className="text-[10px] font-mono text-white/70 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                            {w.category}
                          </span>
                        )}

                        <span className="text-xs font-mono font-bold text-gold flex items-center gap-1.5">
                          <Calendar size={12} />
                          {dateFormatted}
                        </span>
                      </div>

                      {w.duration && (
                        <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                          <Clock size={12} />
                          {w.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                      <div className="flex-1">
                        <Link
                          to={`/w/${w.slug}`}
                          className="font-bold text-base sm:text-lg text-white hover:text-gold transition-colors line-clamp-1"
                        >
                          {w.title}
                        </Link>
                        {w.shortDescription && (
                          <p className="text-xs sm:text-sm text-white/50 line-clamp-2 mt-1 font-sans">
                            {w.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {onQuickView && (
                          <button
                            onClick={() => onQuickView(w)}
                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <Eye size={15} />
                          </button>
                        )}

                        <Link
                          to={`/w/${w.slug}`}
                          className="bg-gold hover:bg-gold-light text-black text-xs font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-gold/20"
                        >
                          <span>{isSoldOut ? 'Join Waitlist' : isPast ? 'Replay' : 'Reserve'}</span>
                          <ArrowRight size={13} />
                        </Link>
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
