import { Calendar, Clock, Users, Bookmark, Sparkles, Flame, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';
import { useBookmarks } from '../../lib/bookmarks';
import TiltCard from '../animations/TiltCard';

export default function WorkshopCard({ workshop, onQuickView }) {
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
  const isFewSpots = seatsLeft > 0 && seatsLeft <= 15 && !isPast;

  const startDate = workshop.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <TiltCard maxTilt={5} cursorText="VIEW" className="h-full">
      <div className="h-full flex flex-col rounded-3xl bg-[#141418] border border-white/[0.08] overflow-hidden hover:border-gold/50 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_25px_rgba(201,162,77,0.12)]">
        {/* Banner Image with 16:10 Ratio & Hover Zoom */}
        <div className="relative aspect-[16/10] overflow-hidden bg-black shrink-0">
          {workshop.bannerImage ? (
            <img
              src={workshop.bannerImage}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#18181e] flex items-center justify-center text-white/30 font-mono text-xs uppercase tracking-widest">
              {workshop.category || 'WORKSHOP'}
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-black/40 pointer-events-none" />

          {/* Category Chip (Top-Left) */}
          {workshop.category && (
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="sticker sticker-gold text-[10px] backdrop-blur-md">
                {workshop.category}
              </span>
            </div>
          )}

          {/* Status Badge & Bookmark (Top-Right) */}
          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
            <span
              className={`sticker text-[10px] ${
                isFewSpots
                  ? 'sticker-live animate-pulse'
                  : isPast
                  ? 'sticker-muted'
                  : 'sticker-gold'
              }`}
            >
              {isFewSpots ? (
                <>
                  <Flame size={10} className="fill-current text-red-400" />
                  <span>FEW LEFT</span>
                </>
              ) : isPast ? (
                <>
                  <CheckCircle2 size={10} />
                  <span>ARCHIVED</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span>LIVE</span>
                </>
              )}
            </span>

            {/* Spring Pop Bookmark Button */}
            <motion.button
              whileTap={{ scale: 0.75 }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(workshop.slug);
              }}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark workshop'}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors shadow-md ${
                saved
                  ? 'bg-gold text-[#0a0a0a] border-gold shadow-gold-glow'
                  : 'bg-black/60 backdrop-blur-md text-white/70 border-white/15 hover:text-gold hover:border-gold/50'
              }`}
            >
              <Bookmark size={11} className={saved ? 'fill-current' : ''} />
            </motion.button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <Link to={`/w/${workshop.slug}`}>
              <h3 className="font-sans font-extrabold text-white text-base sm:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-200">
                {workshop.title}
              </h3>
            </Link>

            {/* Monospace Metadata Row */}
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-white/50 flex-wrap">
              {startDate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80">
                  <Calendar size={11} className="text-gold" />
                  <span>{startDate}</span>
                </span>
              )}
              {workshop.timezones?.[0] && (
                <span className="inline-flex items-center gap-1 truncate text-white/40">
                  <Clock size={11} className="text-gold/70" />
                  <span>{workshop.timezones[0].city} · {workshop.timezones[0].time}</span>
                </span>
              )}
            </div>

            {/* Spots Left Progress Bar */}
            {!isPast && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-white/80">
                    <Users size={11} className="text-gold" />
                    <span>{isSoldOut ? 'CAPACITY REACHED' : `${seatsLeft} SPOTS LEFT`}</span>
                  </span>
                  <span>{seatsBooked}/{seatsTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isSoldOut
                        ? 'bg-white/40'
                        : fillPercentage >= 80
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-gold to-amber-300'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card CTA Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2.5">
            {isPast ? (
              <Link
                to={`/w/${workshop.slug}`}
                className="w-full text-center py-2.5 px-4 rounded-full border border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-white/70 hover:text-white hover:border-gold/50 hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Recording & Lab</span>
                <ArrowUpRight size={13} />
              </Link>
            ) : isSoldOut ? (
              <Link
                to={`/w/${workshop.slug}#waitlist`}
                className="w-full text-center py-2.5 px-4 rounded-full border border-white/20 bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                Join Waitlist →
              </Link>
            ) : (
              <div className="w-full flex items-center gap-2">
                {onQuickView && (
                  <button
                    type="button"
                    onClick={() => onQuickView(workshop)}
                    className="flex-1 py-2.5 px-3 rounded-full border border-white/10 text-xs font-mono uppercase tracking-wider font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    Quick View
                  </button>
                )}
                <Link
                  to={`/w/${workshop.slug}?reserve=true`}
                  className="flex-1 btn-primary text-xs py-2.5 px-4 text-center justify-center font-mono font-bold uppercase tracking-wider rounded-full shadow-gold-glow flex items-center gap-1 group-hover:scale-[1.02] transition-transform"
                >
                  <span>Reserve</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
