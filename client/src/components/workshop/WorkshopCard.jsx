import { Calendar, Clock, Users, Bookmark, Sparkles, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
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

  // Trim description to max ~12 words as requested by rule
  const shortDesc = workshop.shortDescription
    ? workshop.shortDescription.split(' ').slice(0, 12).join(' ') +
      (workshop.shortDescription.split(' ').length > 12 ? '...' : '')
    : '';

  return (
    <TiltCard
      maxTilt={6}
      cursorText="View"
      className="h-full"
    >
      <div className="h-full flex flex-col bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-gold/70 transition-all duration-300 group shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(201,162,77,0.12)]">
        {/* Banner Image with Fixed 16:10 Ratio & Hover Zoom */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF9F6] shrink-0">
          {workshop.bannerImage ? (
            <img
              src={workshop.bannerImage}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center text-muted">
              <span className="text-xs font-mono tracking-widest text-[#9CA3AF] uppercase">
                {workshop.category || 'Workshop'}
              </span>
            </div>
          )}

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Category Chip (Top-Left) */}
          {workshop.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center bg-white/95 backdrop-blur-sm text-navy text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#E8E8E8] shadow-2xs">
                {workshop.category}
              </span>
            </div>
          )}

          {/* Status Badge & Bookmark (Top-Right) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                isFewSpots
                  ? 'bg-amber-500 text-white animate-pulse'
                  : badgeConfig.className
              }`}
            >
              {isFewSpots ? (
                <>
                  <Flame size={10} className="fill-current" />
                  Few Spots Left
                </>
              ) : isPast ? (
                <>
                  <CheckCircle2 size={10} />
                  Completed
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  {badgeConfig.label}
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
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
                saved
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white/95 backdrop-blur-sm text-navy/70 border-[#E8E8E8] hover:text-gold hover:border-gold'
              }`}
            >
              <Bookmark size={12} className={saved ? 'fill-current' : ''} />
            </motion.button>
          </div>
        </div>

        {/* Card Body - Flex Column with equal height */}
        <div className="p-5 flex-1 flex flex-col min-h-0">
          {/* Title */}
          <Link to={`/w/${workshop.slug}`}>
            <h3 className="font-bold text-navy text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-gold transition-colors duration-200">
              {workshop.title}
            </h3>
          </Link>

          {/* Max ~12 words Description */}
          {shortDesc && (
            <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
              {shortDesc}
            </p>
          )}

          {/* Date & Location / Time Chips */}
          <div className="flex items-center gap-2 mb-3.5 text-xs text-muted flex-wrap">
            {startDate && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#FAF9F6] border border-[#E8E8E8] px-2 py-0.5 rounded-md text-navy font-semibold">
                <Calendar size={11} className="text-gold" />
                {startDate}
              </span>
            )}
            {workshop.timezones?.[0] && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted truncate">
                <Clock size={11} className="text-navy/60" />
                {workshop.timezones[0].city} {workshop.timezones[0].time}
              </span>
            )}
          </div>

          {/* Animated Spots Bar */}
          {!isPast && (
            <div className="mb-4 pt-1">
              <div className="flex items-center justify-between text-[11px] text-muted mb-1 font-mono">
                <span className="flex items-center gap-1 font-semibold text-navy">
                  <Users size={11} className="text-gold" />
                  {isSoldOut ? 'Sold Out' : `${seatsLeft} spots left`}
                </span>
                <span className="text-[10px]">{seatsBooked}/{seatsTotal}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isSoldOut
                      ? 'bg-navy'
                      : fillPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-gold'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Card CTA Footer - Pinned to bottom with hover slide-up */}
          <div className="mt-auto pt-3.5 border-t border-[#E8E8E8] flex items-center justify-between gap-2">
            {isPast ? (
              <Link
                to={`/w/${workshop.slug}`}
                className="w-full text-center py-2 px-3 rounded-full border border-[#E8E8E8] text-xs font-semibold text-navy hover:border-gold hover:text-gold hover:bg-[#FAF9F6] transition-colors"
              >
                View Resources & Replay →
              </Link>
            ) : isSoldOut ? (
              <Link
                to={`/w/${workshop.slug}#waitlist`}
                className="w-full text-center py-2 px-3 rounded-full border border-navy bg-navy text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Join Waitlist →
              </Link>
            ) : (
              <div className="w-full flex items-center gap-2">
                {onQuickView && (
                  <button
                    type="button"
                    onClick={() => onQuickView(workshop)}
                    className="flex-1 py-2 px-2.5 rounded-full border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-[#FAF9F6] transition-colors"
                  >
                    Quick View
                  </button>
                )}
                <Link
                  to={`/w/${workshop.slug}?reserve=true`}
                  className="flex-1 btn-primary text-xs py-2 px-3 text-center justify-center font-semibold rounded-full group-hover:shadow-xs transition-shadow"
                >
                  Reserve Spot
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
