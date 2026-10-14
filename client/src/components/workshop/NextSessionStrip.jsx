import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NextSessionStrip({ workshop, onReserve }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!workshop?.startDate) return;
    const calc = () => {
      const diff = Math.max(0, new Date(workshop.startDate).getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [workshop?.startDate]);

  if (!workshop) return null;

  const dateStr = workshop.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const timeStr = workshop.timezones?.[0]
    ? `${workshop.timezones[0].city} ${workshop.timezones[0].time}`
    : '';

  return (
    <div className="bg-[#FAF9F6] border-y border-[#E8E8E8] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Next Session Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-navy text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Next Session
            </span>
            <div className="min-w-0">
              <Link
                to={`/w/${workshop.slug}`}
                className="font-bold text-navy text-xs sm:text-sm hover:text-gold transition-colors truncate block"
              >
                {workshop.title}
              </Link>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                {dateStr && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-navy/60" />
                    {dateStr}
                  </span>
                )}
                {timeStr && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-navy/60" />
                    {timeStr}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Countdown & Reserve Button */}
          <div className="flex items-center gap-4 shrink-0 flex-wrap justify-between lg:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider hidden sm:inline">
                Starts in:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { l: 'd', v: timeLeft.days },
                  { l: 'h', v: timeLeft.hours },
                  { l: 'm', v: timeLeft.minutes },
                  { l: 's', v: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline gap-0.5 bg-white border border-[#E8E8E8] px-2 py-0.5 rounded text-xs font-mono font-bold text-navy shadow-2xs"
                  >
                    <span>{String(item.v).padStart(2, '0')}</span>
                    <span className="text-[9px] text-muted font-sans font-normal">{item.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/w/${workshop.slug}`}
              className="btn-primary text-xs py-1.5 px-3.5 shadow-2xs font-semibold flex items-center gap-1"
            >
              <span>Reserve</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
